import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { Loan } from './domain/entities/Loan';
import { LoanFactory } from './domain/factory/LoanFactory';
import { LaptopLoanFactory } from './domain/factory/LaptopLoanFactory';
import { ChargerLoanFactory } from './domain/factory/ChargerLoanFactory';
import { KitLoanFactory } from './domain/factory/KitLoanFactory';
import { LoanRepository } from './infrastructure/prisma/loan.repository';
import { DevicesRepository } from '../devices/devices.repository';
import { randomUUID } from 'crypto';

@Injectable()
export class LoansService {

  constructor(
    private readonly loanRepository: LoanRepository,
    private readonly devicesRepository: DevicesRepository,
  ) {}

  // The mapping is no longer needed for persistent operations but kept for backwards compatibility
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

  /**
   * Creates a new loan record. Validates device availability and date logic.
   */
  async createLoan(userId: string, deviceId: string, type: string, startDate: Date, endDate: Date): Promise<{ id: string; state: string }> {
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      throw new BadRequestException('Fechas inválidas');
    }
    if (endDate <= startDate) {
      throw new BadRequestException('La fecha de fin debe ser posterior a la de inicio');
    }

    const device = await this.devicesRepository.findDeviceById(deviceId);
    if (!device) {
      throw new NotFoundException('Dispositivo no encontrado');
    }
    if (device.status !== 'AVAILABLE') {
      throw new BadRequestException('El dispositivo no está disponible');
    }

    const factory = this.getFactory(type);
    const id = randomUUID();
    const loan = factory.createLoan(id);

    // persist loan
    await this.loanRepository.createLoan({
      id,
      userId,
      deviceId,
      type,
      status: loan.getState(),
      startDate,
      endDate,
    });

    // mark device as loaned
    await this.devicesRepository.updateDevice(deviceId, { status: 'LOANED' });

    // keep in memory for quick lookups (optional)
    this.loans.set(id, loan);

    return {
      id: loan.id,
      state: loan.getState(),
    };
  }

  private getLoan(id: string): Loan {
    const loan = this.loans.get(id);

    if (!loan) {
      throw new NotFoundException('Préstamo no encontrado');
    }

    return loan;
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
    // free device
    const record = await this.loanRepository.findLoanById(id);
    if (record) {
      await this.devicesRepository.updateDevice(record.deviceId, { status: 'AVAILABLE' });
    }
    return { id: loan.id, state: loan.getState() };
  }

  async expireLoan(id: string) {
    const loan = await this.reloadLoan(id);
    loan.expire();
    await this.loanRepository.updateStatus(id, loan.getState());
    // expire also returns device to available if not already returned
    const record = await this.loanRepository.findLoanById(id);
    if (record) {
      await this.devicesRepository.updateDevice(record.deviceId, { status: 'AVAILABLE' });
    }
    return { id: loan.id, state: loan.getState() };
  }

  async listLoans(filters?: { status?: string; startDate?: Date; endDate?: Date }) {
    return this.loanRepository.getAllLoans(filters);
  }

  // Public method used by controller to get loan info by id
  async getLoanById(id: string) {
    const record = await this.loanRepository.findLoanById(id);
    if (record) return record;
    throw new NotFoundException('Préstamo no encontrado');
  }

  /**
   * Rebuild a Loan aggregate from a persisted record in the database.
   */
  private async reloadLoan(id: string): Promise<Loan> {
    const record = await this.loanRepository.findLoanById(id);
    if (!record) throw new NotFoundException('Préstamo no encontrado');
    const loan = new Loan(record.id);
    const stateKey = record.status.toLowerCase();
    if (loan.states[stateKey]) {
      loan.setState(loan.states[stateKey]);
    }
    // keep in memory for faster access
    this.loans.set(id, loan);
    return loan;
  }

  /**
   * Generic method to change status by name.
   */
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
