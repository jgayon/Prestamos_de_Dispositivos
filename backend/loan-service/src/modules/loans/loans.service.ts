import { Injectable, NotFoundException, BadRequestException, Inject, GatewayTimeoutException } from '@nestjs/common';
import { Loan } from './domain/entities/Loan';
import { LoanFactory } from './domain/factory/LoanFactory';
import { LaptopLoanFactory } from './domain/factory/LaptopLoanFactory';
import { ChargerLoanFactory } from './domain/factory/ChargerLoanFactory';
import { KitLoanFactory } from './domain/factory/KitLoanFactory';
import { LoanRepository } from './infrastructure/prisma/loan.repository';
import { randomUUID } from 'crypto';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom, timeout } from 'rxjs';

@Injectable()
export class LoansService {

  constructor(
    private readonly loanRepository: LoanRepository,
    @Inject('DEVICE_SERVICE') private readonly deviceClient: ClientProxy,
  ) {}

  private loans: Map<string, Loan> = new Map();

  private getFactory(type: string): LoanFactory {
    switch (type) {
      case 'LAPTOP':
        return new LaptopLoanFactory();
      case 'CHARGER':
        return new ChargerLoanFactory();
      case 'KIT':
        return new KitLoanFactory();
      default:
        throw new Error('Tipo de préstamo no válido');
    }
  }

 async createLoan(data: {
  userId: string;
  deviceId: string;
  type: string;
  startDate: string;
  endDate: string;
}): Promise<{ id: string; state: string }> {

  const { userId, deviceId, type } = data;
  
  // VALIDACIÓN 1: Validar userId
  if (!userId || userId.trim() === '') {
    throw new BadRequestException('Usuario es requerido');
  }

  // VALIDACIÓN 2: Validar tipo de préstamo
  const validTypes = ['LAPTOP', 'CHARGER', 'KIT'];
  if (!validTypes.includes(type.toUpperCase())) {
    throw new BadRequestException(`Tipo de préstamo no válido. Válidos: ${validTypes.join(', ')}`);
  }

  // VALIDACIÓN 3: Validar fechas
  const startDate = new Date(data.startDate);
  const endDate = new Date(data.endDate);

  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    throw new BadRequestException('Fechas inválidas');
  }

  if (endDate <= startDate) {
    throw new BadRequestException('La fecha de fin debe ser posterior a la fecha de inicio');
  }

  // VALIDACIÓN 4: No permitir fechas pasadas
  const now = new Date();
  if (startDate < now) {
    throw new BadRequestException('La fecha de inicio no puede ser en el pasado');
  }

  // VALIDACIÓN 5: No permitir préstamos muy largos (más de 1 año)
  const maxDuration = 365 * 24 * 60 * 60 * 1000; // 1 año en ms
  if (endDate.getTime() - startDate.getTime() > maxDuration) {
    throw new BadRequestException('La duración del préstamo no puede superar 1 año');
  }

  let loanCreated = false;
  const id = randomUUID();

  try {
    // PASO 1: Validar que el dispositivo existe y está disponible
    let device;
    try {
      device = await firstValueFrom(
        this.deviceClient.send('get_device', { id: deviceId }).pipe(
          timeout(5000) // 5 segundos de timeout
        )
      );
    } catch (err) {
      throw new GatewayTimeoutException('Device Service no respondió. Intente nuevamente');
    }

    if (!device) {
      throw new NotFoundException('Dispositivo no encontrado');
    }

    if (device.status !== 'AVAILABLE') {
      throw new BadRequestException(`Dispositivo no disponible (Estado: ${device.status})`);
    }

    // PASO 2: Crear préstamo en el dominio
    const factory = this.getFactory(type);
    const loan = factory.createLoan(id);

    // PASO 3: Guardar en BD
    await this.loanRepository.createLoan({
      id,
      userId,
      deviceId,
      type: type.toUpperCase(),
      status: loan.getState(),
      startDate,
      endDate,
    });

    loanCreated = true;

    // PASO 4: Actualizar estado del dispositivo
    try {
      await firstValueFrom(
        this.deviceClient.send('update_device_status', {
          id: deviceId,
          status: 'LOANED'
        }).pipe(
          timeout(5000)
        )
      );
    } catch (err) {
      // ROLLBACK: Si falla la actualización del dispositivo, eliminar el préstamo creado
      await this.loanRepository.deleteLoan(id);
      throw new GatewayTimeoutException('Error actualizando dispositivo. Préstamo cancelado');
    }

    this.loans.set(id, loan);

    console.log(`✅ Préstamo creado: ID=${id}, Usuario=${userId}, Dispositivo=${deviceId}, Tipo=${type}`);

    return {
      id: loan.id,
      state: loan.getState(),
    };

  } catch (error) {
    console.error(`❌ Error en createLoan: ${error.message}`);

    // ROLLBACK AUTOMÁTICO
    if (loanCreated) {
      try {
        await this.loanRepository.deleteLoan(id);
        console.log(`🔄 Rollback: Préstamo ${id} eliminado de BD`);
      } catch (rbError) {
        console.error(`⚠️ Error en rollback de préstamo: ${rbError.message}`);
      }
    }

    // Intentar restaurar dispositivo (best-effort)
    try {
      await firstValueFrom(
        this.deviceClient.send('update_device_status', {
          id: deviceId,
          status: 'AVAILABLE'
        }).pipe(
          timeout(5000)
        )
      );
      console.log(`🔄 Rollback: Dispositivo ${deviceId} restaurado a AVAILABLE`);
    } catch (deviceError) {
      console.error(`⚠️ Error restaurando dispositivo: ${deviceError.message}`);
    }

    throw error;
  }
}

  async approveLoan(id: string) {
    const loan = await this.reloadLoan(id);
    loan.approve();
    await this.loanRepository.updateStatus(id, loan.getState());
    return { id: loan.id, state: loan.getState() };
  }

  async deliverLoan(id: string) {
    const loan = await this.reloadLoan(id);
    loan.deliver();
    await this.loanRepository.updateStatus(id, loan.getState());
    return { id: loan.id, state: loan.getState() };
  }

  async returnLoan(id: string) {
    const loan = await this.reloadLoan(id);
    loan.return();
    await this.loanRepository.updateStatus(id, loan.getState());

    const record = await this.loanRepository.findLoanById(id);

    if (record) {
      try {
        // MICRO: liberar dispositivo
        await firstValueFrom(
          this.deviceClient.send('update_device_status', {
            id: record.deviceId,
            status: 'AVAILABLE'
          }).pipe(
            timeout(5000)
          )
        );
      } catch (err) {
        console.error(`⚠️ Error restaurando dispositivo ${record.deviceId}: ${err.message}`);
        // No fallar, el préstamo ya está marcado como devuelto
      }
    }

    return { id: loan.id, state: loan.getState() };
  }

  async expireLoan(id: string) {
    const loan = await this.reloadLoan(id);
    loan.expire();
    await this.loanRepository.updateStatus(id, loan.getState());

    const record = await this.loanRepository.findLoanById(id);

    if (record) {
      try {
        await firstValueFrom(
          this.deviceClient.send('update_device_status', {
            id: record.deviceId,
            status: 'AVAILABLE'
          }).pipe(
            timeout(5000)
          )
        );
      } catch (err) {
        console.error(`⚠️ Error restaurando dispositivo ${record.deviceId}: ${err.message}`);
        // No fallar, el préstamo ya está marcado como expirado
      }
    }

    return { id: loan.id, state: loan.getState() };
  }

  async listLoans(filters?: { status?: string; startDate?: Date; endDate?: Date }) {
    return this.loanRepository.getAllLoans(filters);
  }

  async getLoanById(id: string) {
    const record = await this.loanRepository.findLoanById(id);
    if (record) return record;
    throw new NotFoundException('Préstamo no encontrado');
  }

  private async reloadLoan(id: string): Promise<Loan> {
    const record = await this.loanRepository.findLoanById(id);
    if (!record) throw new NotFoundException('Préstamo no encontrado');

    const loan = new Loan(record.id);
    const stateKey = record.status.toLowerCase();

    if (loan.states[stateKey]) {
      loan.setState(loan.states[stateKey]);
    }

    this.loans.set(id, loan);

    return loan;
  }

  async changeStatus(id: string, newStatus: string) {
    const loan = await this.reloadLoan(id);

    switch (newStatus.toUpperCase()) {
      case 'APPROVED':
        loan.approve();
        break;
      case 'DELIVERED':
        loan.deliver();
        break;
      case 'RETURNED':
        loan.return();
        break;
      case 'EXPIRED':
        loan.expire();
        break;
      default:
        throw new BadRequestException('Estado de préstamo no válido');
    }

    await this.loanRepository.updateStatus(id, loan.getState());

    return { id: loan.id, state: loan.getState() };
  }
}