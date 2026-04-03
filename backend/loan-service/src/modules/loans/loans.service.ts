import { Injectable, NotFoundException, BadRequestException, Inject } from '@nestjs/common';
import { Loan } from './domain/entities/Loan';
import { LoanFactory } from './domain/factory/LoanFactory';
import { LaptopLoanFactory } from './domain/factory/LaptopLoanFactory';
import { ChargerLoanFactory } from './domain/factory/ChargerLoanFactory';
import { KitLoanFactory } from './domain/factory/KitLoanFactory';
import { LoanRepository } from './infrastructure/prisma/loan.repository';
import { randomUUID } from 'crypto';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

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
  const startDate = new Date(data.startDate);
  const endDate = new Date(data.endDate);

  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    throw new BadRequestException('Fechas inválidas');
  }

  if (endDate <= startDate) {
    throw new BadRequestException('La fecha de fin debe ser posterior');
  }

  let loanCreated = false;
  const id = randomUUID();

  try {
    // 1. Consultar device (MICROSERVICIO)
    const device = await firstValueFrom(
      this.deviceClient.send(
        'get_device',
        { id: deviceId }
      )
    );

    if (!device) {
      throw new NotFoundException('Dispositivo no encontrado');
    }

    if (device.status !== 'AVAILABLE') {
      throw new BadRequestException('Dispositivo no disponible');
    }

    // 2. Crear loan (DOMINIO)
    const factory = this.getFactory(type);
    const loan = factory.createLoan(id);

    // 3. Guardar en DB
    await this.loanRepository.createLoan({
      id,
      userId,
      deviceId,
      type,
      status: loan.getState(),
      startDate,
      endDate,
    });

    loanCreated = true;

    // 4. Cambiar estado del device
    await firstValueFrom(
      this.deviceClient.send(
        'update_device_status',
        { id: deviceId, status: 'LOANED' }
      )
    );

    this.loans.set(id, loan);

    return {
      id: loan.id,
      state: loan.getState(),
    };

  } catch (error) {
    console.log('------ERROR REAL:', error);
    console.log('Error en Saga, ejecutando rollback...');

    // ROLLBACK LOAN
    if (loanCreated) {
      try {
        await this.loanRepository.deleteLoan(id);
      } catch {
        console.error('Error eliminando loan');
      }
    }

    // ROLLBACK DEVICE
    try {
      await firstValueFrom(
        this.deviceClient.send(
          'update_device_status',
          { id: deviceId, status: 'AVAILABLE' }
        )
      );
    } catch {
      console.error('Error restaurando device');
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
      // MICRO: liberar dispositivo
      await firstValueFrom(
        this.deviceClient.send('update_device_status', {
          id: record.deviceId,
          status: 'AVAILABLE'
        })
      );
    }

    return { id: loan.id, state: loan.getState() };
  }

  async expireLoan(id: string) {
    const loan = await this.reloadLoan(id);
    loan.expire();
    await this.loanRepository.updateStatus(id, loan.getState());

    const record = await this.loanRepository.findLoanById(id);

    if (record) {
      await firstValueFrom(
        this.deviceClient.send('update_device_status', {
          id: record.deviceId,
          status: 'AVAILABLE'
        })
      );
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