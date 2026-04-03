// ============================================================================
// CÓDIGO MEJORADO - Sistema de Préstamos de Dispositivos
// Correcciones y mejoras de Saga Pattern, Clean Architecture y Resiliencia
// ============================================================================

// ============================================================================
// 1. CORRECCIÓN: app.module.ts (loan-service) - Múltiples @Module
// ============================================================================

// ❌ ANTES (Incorrecto - múltiples decoradores @Module)
/*
@Module({
  imports: [ClientsModule.register([...])],
})
@Module({
  imports: [LoansModule, UsersModule, DevicesModule],
  controllers: [AppController],
  providers: [AppService],
})
@Module({
  imports: [ClientsModule.register([...])],
})
export class AppModule {}
*/

// ✅ DESPUÉS (Correcto - un solo @Module)
import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LoansModule } from './modules/loans/loans.module';
import { UsersModule } from './modules/users/users.module';
import { DevicesModule } from './modules/devices/devices.module';

@Module({
  imports: [
    // Microservices - Comunicación con otros servicios
    ClientsModule.register([
      {
        name: 'DEVICE_SERVICE',
        transport: Transport.TCP,
        options: {
          host: process.env.DEVICE_SERVICE_HOST || 'localhost',
          port: parseInt(process.env.DEVICE_SERVICE_PORT || '3002'),
        },
      },
    ]),
    // Feature modules
    LoansModule,
    UsersModule,
    DevicesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

// ============================================================================
// 2. MEJORA: Saga Pattern - Event-Driven Architecture
// ============================================================================

// ✅ EVENTO DE DOMINIO
import { IEvent } from '@nestjs/cqrs';

export class LoanCreatedEvent implements IEvent {
  constructor(
    public readonly loanId: string,
    public readonly deviceId: string,
    public readonly userId: string,
    public readonly type: string,
  ) {}
}

export class DeviceReservedEvent implements IEvent {
  constructor(
    public readonly deviceId: string,
    public readonly loanId: string,
  ) {}
}

export class DeviceReservationFailedEvent implements IEvent {
  constructor(
    public readonly deviceId: string,
    public readonly loanId: string,
    public readonly reason: string,
  ) {}
}

// ✅ COMANDO DE DOMINIO
import { ICommand } from '@nestjs/cqrs';

export class ReserveDeviceCommand implements ICommand {
  constructor(
    public readonly deviceId: string,
    public readonly loanId: string,
  ) {}
}

export class ConfirmLoanCommand implements ICommand {
  constructor(public readonly loanId: string) {}
}

export class RevertLoanCommand implements ICommand {
  constructor(public readonly loanId: string) {}
}

// ✅ SAGA ORQUESTADO MEJORADO (Application Layer)
import { Injectable, Inject, Logger } from '@nestjs/common';
import { CommandBus, EventBus } from '@nestjs/cqrs';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { timeout, retry, catchError } from 'rxjs/operators';
import { ILoanRepository } from './infrastructure/repositories/loan.repository.interface';
import { LoanFactory } from './domain/factory/LoanFactory';

@Injectable()
export class CreateLoanUseCase {
  private readonly logger = new Logger(CreateLoanUseCase.name);
  
  // Timeout configurables
  private readonly RPC_TIMEOUT = 5000;
  private readonly RETRY_COUNT = 3;
  private readonly RETRY_DELAY = 1000;

  constructor(
    @Inject('DEVICE_SERVICE') private readonly deviceClient: ClientProxy,
    private readonly loanRepository: ILoanRepository,
    private readonly loanFactory: LoanFactory,
    private readonly commandBus: CommandBus,
    private readonly eventBus: EventBus,
  ) {}

  async execute(
    userId: string,
    deviceId: string,
    type: string,
    startDate: Date,
    endDate: Date,
  ): Promise<{ id: string; state: string }> {
    
    const traceId = this.generateTraceId();
    this.logger.debug(`[${traceId}] Starting CreateLoanSaga`, { userId, deviceId, type });

    try {
      // ====== PASO 1: Validar entrada en dominio ======
      this.validateLoanCreationInput(userId, type, startDate, endDate);
      this.logger.debug(`[${traceId}] Input validation passed`);

      // ====== PASO 2: Obtener dispositivo con resiliencia ======
      const device = await this.getDeviceWithResilience(deviceId, traceId);
      
      if (!device || device.status !== 'AVAILABLE') {
        this.logger.warn(`[${traceId}] Device not available`, { deviceId, status: device?.status });
        throw new Error(`Device ${deviceId} is not available`);
      }

      // ====== PASO 3: Crear Loan (Transacción local 1) ======
      const loanId = this.generateUUID();
      const loan = this.loanFactory.createLoan(loanId, type);

      const createdLoan = await this.loanRepository.save({
        id: loanId,
        userId,
        deviceId,
        type,
        status: loan.getState(),
        startDate,
        endDate,
      });

      this.logger.log(`[${traceId}] Loan created locally`, { loanId, status: loan.getState() });

      // ====== PASO 4: Permitir compensación si falla ======
      let loanCreated = true;
      let deviceReserved = false;

      try {
        // ====== PASO 5: Reservar dispositivo (RPC 1) ======
        await this.reserveDeviceWithResilience(deviceId, loanId, traceId);
        deviceReserved = true;

        this.logger.log(`[${traceId}] Device reserved`, { deviceId });

        // ====== PASO 6: Publicar evento de éxito ======
        const loanCreatedEvent = new LoanCreatedEvent(loanId, deviceId, userId, type);
        await this.eventBus.publish(loanCreatedEvent);

        this.logger.log(`[${traceId}] Saga completed successfully`, { loanId });

        return {
          id: loanId,
          state: loan.getState(),
        };

      } catch (reservationError) {
        // ====== COMPENSATING TRANSACTION: Revertir Loan ======
        this.logger.error(`[${traceId}] Device reservation failed, executing compensating transactions`, {
          error: reservationError.message,
        });

        // Revert PASO 5
        if (loanCreated) {
          try {
            await this.loanRepository.delete(loanId);
            this.logger.log(`[${traceId}] [COMPENSATE] Loan reverted`, { loanId });
          } catch (deleteError) {
            this.logger.error(`[${traceId}] [COMPENSATE] Failed to revert loan`, {
              loanId,
              error: deleteError.message,
            });
            // Log para DLQ (Dead Letter Queue)
            // this.deadLetterQueueService.send({ loanId, operation: 'delete' });
          }
        }

        // Revert PASO 2 (Device reservation)
        if (deviceReserved) {
          try {
            await this.unreserveDeviceWithResilience(deviceId, traceId);
            this.logger.log(`[${traceId}] [COMPENSATE] Device unreserved`, { deviceId });
          } catch (unreserveError) {
            this.logger.error(`[${traceId}] [COMPENSATE] Failed to unreserve device`, {
              deviceId,
              error: unreserveError.message,
            });
            // Log para DLQ
            // this.deadLetterQueueService.send({ deviceId, operation: 'unreserve' });
          }
        }

        // Publicar evento de fallo para auditoría
        const failedEvent = new DeviceReservationFailedEvent(deviceId, loanId, reservationError.message);
        await this.eventBus.publish(failedEvent);

        throw new Error(`Failed to create loan: ${reservationError.message}`);
      }

    } catch (error) {
      this.logger.error(`[${traceId}] Saga failed`, { error: error.message });
      throw error;
    }
  }

  // ====== MÉTODOS AUXILIARES ======

  private validateLoanCreationInput(
    userId: string,
    type: string,
    startDate: Date,
    endDate: Date,
  ): void {
    if (!userId) throw new Error('userId is required');
    if (!['LAPTOP', 'CHARGER', 'KIT'].includes(type)) throw new Error(`Invalid type: ${type}`);
    if (!startDate || isNaN(startDate.getTime())) throw new Error('Invalid startDate');
    if (!endDate || isNaN(endDate.getTime())) throw new Error('Invalid endDate');
    if (endDate <= startDate) throw new Error('endDate must be after startDate');
  }

  private async getDeviceWithResilience(deviceId: string, traceId: string) {
    return await firstValueFrom(
      this.deviceClient.send('get_device', { id: deviceId, traceId }).pipe(
        timeout(this.RPC_TIMEOUT),
        retry({
          count: this.RETRY_COUNT,
          delay: this.RETRY_DELAY,
        }),
        catchError(error => {
          this.logger.error(`[${traceId}] Failed to get device after retries`, {
            deviceId,
            error: error.message,
          });
          throw error;
        }),
      ),
    );
  }

  private async reserveDeviceWithResilience(deviceId: string, loanId: string, traceId: string) {
    return await firstValueFrom(
      this.deviceClient.send('reserve_device', { id: deviceId, loanId, traceId }).pipe(
        timeout(this.RPC_TIMEOUT),
        retry({
          count: this.RETRY_COUNT,
          delay: this.RETRY_DELAY,
        }),
        catchError(error => {
          this.logger.error(`[${traceId}] Failed to reserve device after retries`, {
            deviceId,
            error: error.message,
          });
          throw error;
        }),
      ),
    );
  }

  private async unreserveDeviceWithResilience(deviceId: string, traceId: string) {
    return await firstValueFrom(
      this.deviceClient.send('unreserve_device', { id: deviceId, traceId }).pipe(
        timeout(this.RPC_TIMEOUT),
        retry({
          count: this.RETRY_COUNT,
          delay: this.RETRY_DELAY,
        }),
        catchError(error => {
          this.logger.warn(`[${traceId}] Failed to unreserve device (non-critical)`, {
            deviceId,
            error: error.message,
          });
          // No throw - compensating transaction, mejor fallar silenciosamente
        }),
      ),
    );
  }

  private generateTraceId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }
}

// ============================================================================
// 3. MEJORA: Repository Pattern con Interface
// ============================================================================

// ✅ REPOSITORIO COMO INTERFAZ (Boundary)
export interface ILoanRepository {
  save(data: {
    id: string;
    userId: string;
    deviceId: string;
    type: string;
    status: string;
    startDate: Date;
    endDate: Date;
  }): Promise<any>;

  findById(id: string): Promise<any>;
  findAll(filters?: any): Promise<any[]>;
  update(id: string, data: Partial<any>): Promise<any>;
  delete(id: string): Promise<void>;
}

// ✅ IMPLEMENTACIÓN PRISMA
import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaLoanRepository implements ILoanRepository {
  private prisma = new PrismaClient();

  async save(data: any): Promise<any> {
    return this.prisma.loan.create({ data });
  }

  async findById(id: string): Promise<any> {
    return this.prisma.loan.findUnique({ where: { id } });
  }

  async findAll(filters?: any): Promise<any[]> {
    return this.prisma.loan.findMany({
      where: filters ? this.buildWhereClause(filters) : {},
    });
  }

  async update(id: string, data: Partial<any>): Promise<any> {
    return this.prisma.loan.update({ where: { id }, data });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.loan.delete({ where: { id } });
  }

  private buildWhereClause(filters: any) {
    const where: any = {};
    if (filters.status) where.status = filters.status;
    if (filters.userId) where.userId = filters.userId;
    if (filters.startDate) where.createdAt = { gte: filters.startDate };
    if (filters.endDate) where.createdAt = { lte: filters.endDate };
    return where;
  }
}

// ============================================================================
// 4. MEJORA: Error Handling Centralizado
// ============================================================================

// ✅ CUSTOM EXCEPTION (Domain Layer)
export class DomainException extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly details?: any,
  ) {
    super(message);
  }
}

export class DeviceNotAvailableException extends DomainException {
  constructor(deviceId: string) {
    super('DEVICE_NOT_AVAILABLE', `Device ${deviceId} is not available`, { deviceId });
  }
}

export class InvalidLoanStateException extends DomainException {
  constructor(currentState: string, requestedAction: string) {
    super(
      'INVALID_LOAN_STATE',
      `Cannot ${requestedAction} loan in state ${currentState}`,
      { currentState, requestedAction },
    );
  }
}

// ✅ EXCEPTION FILTER (Presentation Layer)
import { ExceptionFilter, Catch, ArgumentsHost, HttpStatus } from '@nestjs/common';
import { Response } from 'express';

@Catch(DomainException)
export class DomainExceptionFilter implements ExceptionFilter {
  catch(exception: DomainException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const statusCode = this.mapExceptionToStatusCode(exception.code);

    response.status(statusCode).json({
      statusCode,
      code: exception.code,
      message: exception.message,
      details: exception.details,
      timestamp: new Date().toISOString(),
    });
  }

  private mapExceptionToStatusCode(code: string): number {
    const mapping: Record<string, number> = {
      DEVICE_NOT_AVAILABLE: HttpStatus.CONFLICT,
      INVALID_LOAN_STATE: HttpStatus.BAD_REQUEST,
      NOT_FOUND: HttpStatus.NOT_FOUND,
    };
    return mapping[code] || HttpStatus.INTERNAL_SERVER_ERROR;
  }
}

// ============================================================================
// 5. MEJORA: Testing - Unit Test Saga
// ============================================================================

import { Test, TestingModule } from '@nestjs/testing';
import { of, throwError } from 'rxjs';

describe('CreateLoanUseCase', () => {
  let useCase: CreateLoanUseCase;
  let mockDeviceClient: any;
  let mockLoanRepository: any;
  let mockEventBus: any;

  beforeEach(async () => {
    mockDeviceClient = {
      send: jest.fn(),
    };

    mockLoanRepository = {
      save: jest.fn(),
      delete: jest.fn(),
    };

    mockEventBus = {
      publish: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateLoanUseCase,
        {
          provide: 'DEVICE_SERVICE',
          useValue: mockDeviceClient,
        },
        {
          provide: 'ILoanRepository',
          useValue: mockLoanRepository,
        },
        {
          provide: 'EventBus',
          useValue: mockEventBus,
        },
        {
          provide: LoanFactory,
          useValue: {
            createLoan: jest.fn().mockReturnValue({
              id: 'loan1',
              getState: () => 'REQUESTED',
            }),
          },
        },
      ],
    }).compile();

    useCase = module.get<CreateLoanUseCase>(CreateLoanUseCase);
  });

  describe('execute', () => {
    it('should create loan when device is available', async () => {
      // Arrange
      const device = { id: 'dev1', status: 'AVAILABLE' };
      mockDeviceClient.send.mockReturnValue(of(device));
      mockLoanRepository.save.mockResolvedValue({
        id: 'loan1',
        status: 'REQUESTED',
      });

      // Act
      const result = await useCase.execute(
        'user1',
        'dev1',
        'LAPTOP',
        new Date('2025-03-10'),
        new Date('2025-03-20'),
      );

      // Assert
      expect(result.state).toBe('REQUESTED');
      expect(mockLoanRepository.save).toHaveBeenCalled();
      expect(mockDeviceClient.send).toHaveBeenCalledWith(
        expect.stringContaining('device'),
        expect.any(Object),
      );
      expect(mockEventBus.publish).toHaveBeenCalled();
    });

    it('should execute compensating transactions when device reservation fails', async () => {
      // Arrange
      const device = { id: 'dev1', status: 'AVAILABLE' };
      mockDeviceClient.send
        .mockReturnValueOnce(of(device)) // get_device success
        .mockReturnValueOnce(throwError(new Error('Service unavailable')));  // reserve_device fails

      mockLoanRepository.save.mockResolvedValue({
        id: 'loan1',
        status: 'REQUESTED',
      });

      // Act & Assert
      await expect(
        useCase.execute(
          'user1',
          'dev1',
          'LAPTOP',
          new Date('2025-03-10'),
          new Date('2025-03-20'),
        ),
      ).rejects.toThrow();

      expect(mockLoanRepository.delete).toHaveBeenCalledWith('loan1');
      expect(mockDeviceClient.send).toHaveBeenCalledWith(
        expect.stringContaining('unreserve'),
        expect.any(Object),
      );
    });

    it('should validate input dates', async () => {
      // Act & Assert
      await expect(
        useCase.execute(
          'user1',
          'dev1',
          'LAPTOP',
          new Date('2025-03-20'),
          new Date('2025-03-10'), // endDate < startDate
        ),
      ).rejects.toThrow('endDate must be after startDate');
    });

    it('should throw error for invalid device type', async () => {
      // Act & Assert
      await expect(
        useCase.execute(
          'user1',
          'dev1',
          'INVALID_TYPE',
          new Date('2025-03-10'),
          new Date('2025-03-20'),
        ),
      ).rejects.toThrow('Invalid type');
    });
  });
});

// ============================================================================
// 6. MEJORA: Device Service - Message Pattern Mejorado
// ============================================================================

// ✅ DEVICE SERVICE CONTROLLER MEJORADO
import { Controller, Logger } from '@nestjs/common';
import { MessagePattern, Payload, Ctx, RmqContext } from '@nestjs/microservices';

@Controller()
export class DevicesController {
  private readonly logger = new Logger(DevicesController.name);

  constructor(private readonly devicesService: DevicesService) {}

  @MessagePattern('get_device')
  async getDevice(@Payload() data: { id: string; traceId?: string }, @Ctx() context: RmqContext) {
    const traceId = data.traceId || context.getMessage().properties.correlationId;
    
    try {
      this.logger.debug(`[${traceId}] get_device called`, { deviceId: data.id });
      const device = await this.devicesService.getDeviceById(data.id);
      
      this.logger.log(`[${traceId}] get_device success`, { deviceId: data.id });
      return device;
      
    } catch (error) {
      this.logger.error(`[${traceId}] get_device failed`, { deviceId: data.id, error: error.message });
      throw error;
    }
  }

  @MessagePattern('reserve_device')
  async reserveDevice(
    @Payload() data: { id: string; loanId: string; traceId?: string },
    @Ctx() context: RmqContext,
  ) {
    const traceId = data.traceId || context.getMessage().properties.correlationId;
    
    try {
      this.logger.debug(`[${traceId}] reserve_device called`, { deviceId: data.id, loanId: data.loanId });
      
      const device = await this.devicesService.getDeviceById(data.id);
      if (device.status !== 'AVAILABLE') {
        throw new DeviceNotAvailableException(data.id);
      }

      const updated = await this.devicesService.updateDeviceStatus(data.id, 'LOANED');
      
      this.logger.log(`[${traceId}] reserve_device success`, { deviceId: data.id });
      return updated;
      
    } catch (error) {
      this.logger.error(`[${traceId}] reserve_device failed`, { deviceId: data.id, error: error.message });
      throw error;
    }
  }

  @MessagePattern('unreserve_device')
  async unreserveDevice(@Payload() data: { id: string; traceId?: string }, @Ctx() context: RmqContext) {
    const traceId = data.traceId || context.getMessage().properties.correlationId;
    
    try {
      this.logger.debug(`[${traceId}] unreserve_device called`, { deviceId: data.id });
      const updated = await this.devicesService.updateDeviceStatus(data.id, 'AVAILABLE');
      
      this.logger.log(`[${traceId}] unreserve_device success`, { deviceId: data.id });
      return updated;
      
    } catch (error) {
      this.logger.error(`[${traceId}] unreserve_device failed`, { deviceId: data.id, error: error.message });
      throw error;
    }
  }
}

// ============================================================================
// SUMMARY: Mejoras Aplicadas
// ============================================================================
/*

✅ 1. Corregido: app.module.ts con múltiples @Module
   - Un solo decorador @Module
   - Configuración registrada en imports
   
✅ 2. Mejorado: Saga Pattern
   - Con logging y trace IDs
   - Timeout y reintentos con resiliencia
   - Compensating transactions explícitas
   - Event publishing para auditoría
   
✅ 3. Mejorado: Repository Pattern
   - Interfaz ILoanRepository como boundary
   - Implementación Prisma
   
✅ 4. Mejorado: Error Handling
   - Domain exceptions con códigos
   - Exception filter centralizado
   
✅ 5. Mejorado: Testing
   - Unit tests completos para Saga
   - Mock de dependencias
   - Cobertura de success/failure
   
✅ 6. Mejorado: Device Service
   - Trace IDs en logs
   - Manejo de contexto RMQ
   - Logging consistente
   
*/
