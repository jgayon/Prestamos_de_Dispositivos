# INFORME DE REVISIÓN PROFESIONAL
## Sistema de Préstamos de Dispositivos - Grupo 1
### Software Architecture Review & Gap Analysis

**Fecha de Revisión:** 3 de Abril de 2026  
**Revisor:** Experto en Arquitectura de Software & Clean Architecture  
**Cliente:** Grupo 1 - Diseño de Software II

---

## RESUMEN EJECUTIVO

### Estado General del Proyecto

El proyecto **Grupo 1 – Préstamos de Dispositivos** presenta una **implementación parcial** de arquitectura de microservicios que demuestra comprensión de conceptos clave, pero requiere mejoras significativas en documentación, completitud del código y robustez arquitectónica.

**Scorecard Preliminar:**

| Aspecto | Calificación | Comentario |
|---------|-------------|-----------|
| **Arquitectura de Microservicios** | 7/10 | ✓ 3 servicios bien separados, ⚠ Sin service discovery |
| **Clean Architecture** | 6/10 | ✓ Capas separadas, ❌ Falta abstracción, DTOs incompletos |
| **API Gateway Pattern** | 8/10 | ✓ Implementado, ⚠ Funcionalidad mínima |
| **Database per Service** | 7/10 | ✓ Independientes, ⚠ Sin sincronización entre BDs |
| **Saga Pattern** | 5/10 | ⚠ Intento primitivo, ❌ No es verdadera Saga orquestada |
| **Documentación Entrega 1** | 1/10 | ❌ Completamente faltante/generada ahora |
| **Testing** | 4/10 | ⚠ Specs vacíos, ❌ Sin e2e tests |
| **Manejo de Errores** | 5/10 | ⚠ Inconsistente entre servicios |
| **Código limpio** | 7/10 | ✓ TypeScript+NestJS bien usado, ⚠ Falta comentarios |
| **Diseño de BD** | 7/10 | ✓ Funcional, ⚠ Sin índices ni constraints |

**Promedio General: 5.7/10** - Requiere mejoras significativas

---

## 1. HALLAZGOS POSITIVOS ✅

### 1.1 Arquitectura de Microservicios Correctamente Identificada

**Lo que está bien:**
- ✅ Tres servicios claramente separados: API Gateway, Device Service, Loan Service
- ✅ Cada servicio con responsabilidad única y bien definida
- ✅ Comunicación asíncrona via RPC/TCP usando NestJS microservices
- ✅ Puerto correcto para cada servicio (3000, 3001, 3002)

**Evidencia:**
```typescript
// api-gateway/src/app.module.ts
ClientsModule.register([
  {
    name: 'LOAN_SERVICE',
    transport: Transport.TCP,
    options: { port: 3000 }
  }
])

// device-service/src/devices/devices.controller.ts
@MessagePattern('get_device')
getDevice(@Payload() data: { id: string }) { ... }
```

---

### 1.2 Database per Service Pattern Implementado

**Lo que está bien:**
- ✅ device-service tiene BD SQLite independiente
- ✅ loan-service tiene BD SQLite independiente
- ✅ No hay queries directas entre BDs (verdadera separación de datos)
- ✅ Prisma ORM correctamente configurado

**Arquitectura:**
```
device-service/prisma/
  ├── schema.prisma
  └── dev.db                  ◄── Independiente

loan-service/prisma/
  ├── schema.prisma
  └── (dev.db)                ◄── Independiente
```

**Beneficio:** Escalabilidad: cada BD puede crecer sin afectar la otra.

---

### 1.3 Patrones de Diseño Clásicos Bien Implementados

#### **Factory Pattern** ✅

```typescript
// loan-service/domain/factory/LaptopLoanFactory.ts
export class LaptopLoanFactory implements LoanFactory {
  createLoan(id: string): Loan {
    return new Loan(id, 'LAPTOP', [
      new Device('laptop-1', 'INCLUDED')
    ]);
  }
}
```

**Evaluación:** Correcto uso del patrón. Fácil agregar ChargerLoanFactory, KitLoanFactory sin modificar LoansService.

#### **State Pattern** ✅

```typescript
// loan-service/domain/state/LoanState.ts
export interface LoanState {
  request(): void;
  approve(): void;
  deliver(): void;
  return(): void;
  expire(): void;
  getName(): string;
}

// Implementaciones: RequestedState, ApprovedState, DeliveredState, ReturnedState, ExpiredState
```

**Evaluación:** Máquina de estados correctamente modelada. No hay if/else dispersos.

#### **Composite Pattern** ✅

```typescript
// loan-service/domain/composite/LoanItem.ts
export interface LoanItem {
  getName(): string;
  getQuantity(): number;
}

// Device (Leaf) y Kit (Composite)
```

**Evaluación:** Permite tratar devices individuales y kits uniformemente.

#### **Repository Pattern** ✅

```typescript
// loan-service/infrastructure/prisma/loan.repository.ts
@Injectable()
export class LoanRepository {
  async createLoan(data): Promise<Loan> { ... }
  async findLoanById(id): Promise<Loan> { ... }
  async updateStatus(id, status): Promise<Loan> { ... }
}
```

**Evaluación:** Service desacoplado de Prisma. Fácil testear.

---

### 1.4 Uso Correcto de NestJS

**Lo que está bien:**
- ✅ `@Module()`, `@Controller()`, `@Injectable()` usados correctamente
- ✅ Dependency Injection mediante constructor
- ✅ Separación clara entre HTTP y RPC controllers
- ✅ DTOs con class-validator en loan-service

**Ejemplo:**
```typescript
// loan-service/loans.module.ts
@Module({
  imports: [ClientsModule.register([
    { name: 'DEVICE_SERVICE', transport: Transport.TCP, options: { port: 3001 } }
  ])],
  controllers: [LoansController],
  providers: [LoansService, LoanRepository]
})
export class LoansModule {}
```

---

### 1.5 Intento de Saga Pattern (Compensating Transactions)

**Lo que está bien:**
- ✓ Se intenta manejar transacciones distribuidas
- ✓ Hay try-catch con rollback manual
- ✓ Se revierte Device status si Loan falla

```typescript
// loans.service.ts - Saga attempt
try {
  // PASO 1: Obtener device
  const device = await this.deviceClient.send('get_device', { id: deviceId });
  
  // PASO 2: Crear Loan
  await this.loanRepository.createLoan({...});
  loanCreated = true;
  
  // PASO 3: Actualizar Device
  await this.deviceClient.send('update_device_status', { id: deviceId, status: 'LOANED' });
  
} catch (error) {
  // COMPENSATING TRANSACTIONS
  if (loanCreated) {
    await this.loanRepository.deleteLoan(id);  // Revert PASO 2
  }
  await this.deviceClient.send('update_device_status', { id: deviceId, status: 'AVAILABLE' });  // Revert PASO 3
  throw error;
}
```

**Evaluación:** Concepto correcto, pero implementación primitiva.

---

### 1.6 TypeScript Bien Utilizado

**Lo que está bien:**
- ✅ Tipado fuerte en todas partes
- ✅ Interfaces bien definidas (LoanState, LoanFactory, LoanItem)
- ✅ Genéricos usados donde corresponde
- ✅ sin `any` excessivos

---

## 2. PROBLEMAS CRÍTICOS ❌

### 2.1 Documentación de Entrega 1 Completamente Faltante

**CRÍTICO** ❌ **Impacto:** Evaluación será fallida sin documentación.

**Faltantes:**
- ❌ Contexto del problema (documento formal)
- ❌ Actores del sistema (diagrama + descripción)
- ❌ Requerimientos funcionales (no hay RF-001 a RF-010)
- ❌ Requerimientos no funcionales medibles
- ❌ Justificación de estilo arquitectónico
- ❌ Tabla de patrones de arquitectura
- ❌ Diagramas C4
- ❌ Diagrama de BD
- ❌ Prototipos Figma
- ❌ Presentación PowerPoint

**Solución:** Se proporciona documento `ENTREGA_1_ARQUITECTURA.md` completo.

---

### 2.2 Saga Pattern Implementado de Forma Incorrecta

**CRÍTICO** ❌ **Impacto:** Patrón asignado no implementado correctamente.

**Problemas:**

1. **Síncronamente, no distribuido realmente**
   ```typescript
   // Problema: Espera respuesta de cada paso
   const device = await firstValueFrom(this.deviceClient.send(...));  // Bloqueante
   ```

2. **Sin eventos ni message broker**
   - No hay PublishSubscribe
   - Sin Dead Letter Queue
   - Sin Event Sourcing

3. **Sin orquestador explícito**
   - La Saga está mezclada en LoansService
   - Difícil de testear y revisar

4. **Sin durabilidad de transacciones**
   - Si el servidor falla en mitad de compensating transaction, queda inconsistente
   - Sin outbox pattern

**Verdadera Saga debería:**
```
Step 1: Loan Service publica evento "LoanRequested"
Step 2: Device Service escucha y actualiza status → publica "DeviceReserved"
Step 3: Loan Service escucha y confirma Loan
Si fallo en Step 2: Event system publica "DeviceReservationFailed"
          → Loan Service revierte automáticamente
```

**Solución propuesta en sección 3.3**

---

### 2.3 Clean Architecture Incompleta

**Problema** ⚠️

**Current State:**
```
├── domain/
│   ├── entities/        ✓ Loan.ts
│   ├── state/           ✓ LoanState.ts, etc.
│   ├── factory/         ✓ LoanFactory interface
│   └── composite/       ✓ LoanItem interface
├── infrastructure/
│   └── prisma/          ✓ LoanRepository
├── controllers/         ✓ LoansController
├── services/            ✓ LoansService
└── dtos/                ✓ CreateLoanDto
```

**Faltantes de Clean Architecture:**
- ❌ **No hay Application Layer** (use cases, commands, queries)
- ❌ **DTOs incompletos** en device-service
- ❌ **Mappers** entre capas no explícitos
- ❌ **Boundary interfaces** (repos deberían ser interfaces, no concretos)
- ❌ **Error handling** no es por dominio

**Correcta Clean Architecture:**
```
┌─────────────────────────────────────────────┐
│ Presentation Layer (Controllers)            │
│ - HTTP DTOs                                 │
└─────────────────┬───────────────────────────┘
                  │
┌─────────────────▼───────────────────────────┐
│ Application Layer (Use Cases/Services)      │
│ - LoansUseCases: CreateLoan, ApproveLoan   │
│ - Orchestration, mapping                    │
└─────────────────┬───────────────────────────┘
                  │
┌─────────────────▼───────────────────────────┐
│ Domain Layer (Business Logic)               │
│ - Loan entity                               │
│ - LoanState, LoanFactory                    │
│ - Domain rules, invariants                  │
└─────────────────┬───────────────────────────┘
                  │
┌─────────────────▼───────────────────────────┐
│ Infrastructure Layer (Persistence)          │
│ - LoanRepository interface                  │
│ - Prisma implementation                     │
│ - External services (DeviceClient)          │
└─────────────────────────────────────────────┘
```

**Refactorización necesaria:**

```typescript
// ACTUAL (Mezclado)
@Injectable()
export class LoansService {
  async createLoan(...) {  // Application logic + domain orchestration
    const device = await this.deviceClient.send(...);  // Infrastructure call
    const factory = this.getFactory(type);            // Domain logic
    const loan = factory.createLoan(id);              // Domain logic
    await this.loanRepository.createLoan(...);        // Infrastructure call
  }
}

// CORRECTO (Limpio)
@Injectable()
export class CreateLoanUseCase {  // Application layer
  constructor(
    private loanRepository: ILoanRepository,  // Interface, no concrete
    private deviceService: IDeviceService,    // Interface
    private loanFactory: LoanFactory          // Domain service
  ) {}
  
  async execute(command: CreateLoanCommand): Promise<CreateLoanResult> {
    // 1. Obtener dispositivo (infrastructure)
    const device = await this.deviceService.getDevice(command.deviceId);
    
    if (!device.isAvailable()) {
      throw new DeviceNotAvailableError(`Device ${command.deviceId} not available`);
    }
    
    // 2. Crear loan (domain)
    const loan = this.loanFactory.createLoan(
      command.userId,
      command.deviceId,
      command.type,
      command.startDate,
      command.endDate
    );
    
    // 3. Persist (infrastructure)
    const saved = await this.loanRepository.save(loan);
    
    // 4. Cambiar device status (infrastructure)
    await this.deviceService.updateStatus(device.id, DeviceStatus.LOANED);
    
    return new CreateLoanResult(saved.id, saved.getState());
  }
}
```

---

### 2.4 Testing Prácticamente Inexistente

**Problema** ❌

**Current state:**
```
backend/
├── api-gateway/
│   └── src/app.controller.spec.ts      ◄── VACÍO
├── device-service/
│   └── src/devices/devices.service.spec.ts  ◄── VACÍO
└── loan-service/
    └── src/modules/loans/loans.service.spec.ts  ◄── VACÍO
```

**Faltantes:**
- ❌ Unit tests de servicios (0%)
- ❌ E2E tests de flujos (0%)
- ❌ Tests de patrones (Factory, State)
- ❌ Tests de Saga (success y failure)
- ❌ Tests de error handling

**Ejemplo de test necesario:**

```typescript
// loans.service.spec.ts
describe('LoansService', () => {
  describe('createLoan', () => {
    
    it('should create loan when device is available', async () => {
      // Arrange
      const mockDevice = { id: 'dev1', status: 'AVAILABLE' };
      (deviceClient.send as jest.Mock).mockReturnValue(of(mockDevice));
      
      // Act
      const result = await service.createLoan(
        'user1', 'dev1', 'LAPTOP',
        new Date('2025-03-10'), new Date('2025-03-20')
      );
      
      // Assert
      expect(result.state).toBe('REQUESTED');
      expect(loanRepository.createLoan).toHaveBeenCalled();
      expect(deviceClient.send).toHaveBeenCalledWith('update_device_status', {
        id: 'dev1',
        status: 'LOANED'
      });
    });
    
    it('should execute compensating transactions when device update fails', async () => {
      // Arrange
      const mockDevice = { id: 'dev1', status: 'AVAILABLE' };
      (deviceClient.send as jest.Mock)
        .mockReturnValueOnce(of(mockDevice))  // Step 1: get_device OK
        .mockReturnValueOnce(throwError(new Error('Service unavailable')));  // Step 3: update fails
      
      // Act & Assert
      await expect(service.createLoan(...)).rejects.toThrow();
      expect(loanRepository.deleteLoan).toHaveBeenCalled();  // Rollback
      expect(deviceClient.send).toHaveBeenLastCalledWith('update_device_status', {
        status: 'AVAILABLE'  // Restored
      });
    });
  });
});
```

---

### 2.5 Manejo de Errores Inconsistente

**Problema** ⚠️

**Problemas detectados:**

1. **device-service sin validación de input**
   ```typescript
   // device-service/devices.service.ts
   async getDeviceById(id: string) {
     const device = await this.repo.findById(id);
     if (!device) {
       throw new NotFoundException('Dispositivo no encontrado');
     }
     return device;  // ¿Cómo se serializa? ¿Qué si hay error?
   }
   // Falta: validar que id sea UUID válido
   ```

2. **loan-service con BadRequestException pero sin HttpCode**
   ```typescript
   if (endDate <= startDate) {
     throw new BadRequestException('La fecha de fin debe ser posterior...');
   }
   // Debería retornar 400, pero ¿cómo se mapea en RPC?
   ```

3. **Sin centralización de error mappings**
   ```typescript
   // Cada servicio inventa su error handling
   // Debería haber un ErrorFilter centralizado
   ```

4. **Sin logging de errores distribuidos**
   ```typescript
   } catch (error) {
     console.log('Error en Saga...');  // ⚠️ Solo consola, sin trace ID
   }
   ```

---

### 2.6 Sin Resiliencia (Circuit Breaker, Retry, Timeout)

**Problema** ❌

**Current code:**
```typescript
const device = await firstValueFrom(
  this.deviceClient.send('get_device', { id: deviceId })
);
```

**Problemas:**
- Sin timeout definido → puede esperar indefinidamente
- Sin reintentos → fallo en 1 intento falla toda la transacción
- Sin circuit breaker → si Device Service cae, Loan Service se queda esperando

**Debería ser:**
```typescript
const device = await firstValueFrom(
  this.deviceClient.send('get_device', { id: deviceId }).pipe(
    timeout(5000),  // Timeout 5s
    retry(3),       // Reintentar 3 veces
    catchError(err => {
      if (++this.failureCount > 5) {
        this.circuitBreakerOpen = true;  // Abrir circuito
      }
      throw new ServiceUnavailableException('Device Service unavailable');
    })
  )
);
```

---

### 2.7 Sin Service Discovery (Puertos Hardcodeados)

**Problema** ⚠️

**Current:**
```typescript
// api-gateway/app.module.ts
ClientsModule.register([
  {
    name: 'LOAN_SERVICE',
    transport: Transport.TCP,
    options: { port: 3000 }  // ◄── Hardcodeado
  }
])

// loan-service/app.module.ts
ClientsModule.register([
  {
    name: 'DEVICE_SERVICE',
    transport: Transport.TCP,
    options: { port: 3001 }  // ◄── Hardcodeado
  }
])
```

**Problema:**
- En desarrollo: OK
- En producción: ¿Cómo escalamos? ¿Qué portos usan las replicas?
- Sin service discovery (Consul, Eureka), infraestructura es frágil

**Solución futura:**
```typescript
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [ConfigModule.forRoot()],
  providers: [
    {
      provide: 'DEVICE_SERVICE_PORT',
      useFactory: (config: ConfigService) =>
        config.get('DEVICE_SERVICE_PORT', 3002)
    }
  ]
})
```

---

### 2.8 Sin Autenticación/Autorización

**Problema** ❌

**Faltantes:**
- ❌ JWT o OAuth
- ❌ Validación de usuario en cada request
- ❌ Roles (admin vs. usuario normal)
- ❌ Audit trail

**Cualquiera puede llamar:**
```
POST /loans
{
  "userId": "malicious-user-1",  // ← Sin validar
  "deviceId": "device-1",
  "type": "LAPTOP"
}
```

---

### 2.9 Sin Logging Centralizado

**Problema** ⚠️

```typescript
} catch (error) {
  console.log('Error en Saga, ejecutando rollback...');  // ◄── Solo stdout
  console.error('Error eliminando loan en rollback');
}
```

**Problema:** En producción con múltiples instancias:
- Logs dispersos en múltiples servidores, sin agregación
- Sin trace IDs para seguir request entre servicios
- Sin timestamp consistente
- Sin severity levels organizados

---

### 2.10 Frontend Desconectado

**Problema** ⚠️

```
frontend/
├── src/
│   ├── api/
│   │   └── loans.api.ts     ◄── API client
│   └── pages/
│       └── LoansPage.tsx    ◄── UI
```

**Estado:** Frontend existe pero está desconectado del backend.

---

## 3. ÁREAS DE MEJORA

### 3.1 Arquitectura

#### **Mejora 1: Verdadera Saga Pattern con Event Sourcing**

```typescript
// Event-based Saga (Propuesto)

// Step 1: Loan Service publica evento
@Injectable()
export class CreateLoanSaga {
  constructor(private eventBus: EventBus) {}
  
  @Saga()
  complete$ = this.events$.pipe(
    ofType(LoanRequestedEvent),
    mergeMap(event =>
      of(new ReserveDeviceCommand(event.deviceId)).pipe(
        catchError(() =>
          of(new RevertLoanCommand(event.loanId))  // Compensating transaction
        )
      )
    )
  );
}

// Step 2: Device Service escucha comando
@CommandHandler(ReserveDeviceCommand)
handle(cmd: ReserveDeviceCommand) {
  const device = this.deviceRepo.getById(cmd.deviceId);
  if (!device.isAvailable()) {
    throw new DeviceUnavailableException();  // Automáticamente compensa
  }
  device.reserve();
  this.eventBus.publish(new DeviceReservedEvent(device.id));
}

// Step 3: Saga continúa si sucede sin errores
@EventHandler(DeviceReservedEvent)
handle(event: DeviceReservedEvent) {
  const loan = this.loanRepo.getByDeviceId(event.deviceId);
  loan.confirm();  // Estado pasa a APPROVED
  this.eventBus.publish(new LoanConfirmedEvent(loan.id));
}
```

**Ventajas:**
- ✅ Verdadero event sourcing
- ✅ Compensating transactions automáticas
- ✅ Auditable (event log)
- ✅ Distribuido y escalable

---

#### **Mejora 2: Agregar Circuit Breaker & Resiliencia**

```typescript
// circuit-breaker.decorator.ts
@Injectable()
export class CircuitBreakerDecorator {
  private failures = 0;
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';
  
  @CircuitBreaker({
    failureThreshold: 5,
    successThreshold: 2,
    timeout: 30000
  })
  async callExternalService(fn: () => Promise<any>) {
    if (this.state === 'OPEN') {
      throw new ServiceUnavailableException('Circuit breaker is open');
    }
    
    try {
      const result = await fn();
      this.failures = 0;
      return result;
    } catch (error) {
      this.failures++;
      if (this.failures >= 5) {
        this.state = 'OPEN';
      }
      throw error;
    }
  }
}

// Uso
async createLoan(...) {
  const device = await this.circuitBreaker.callExternalService(() =>
    firstValueFrom(this.deviceClient.send('get_device', { id: deviceId }))
  ).pipe(
    retry({ count: 3, delay: 1000 }),
    timeout(5000)
  );
}
```

---

#### **Mejora 3: Agregar Logging Centralizado**

```typescript
// logging.interceptor.ts
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(private logger: Logger) {}
  
  intercept(context: ExecutionContext, next: CallHandler) {
    const req = context.switchToHttp().getRequest();
    const traceId = req.headers['x-trace-id'] || generateUUID();
    
    const start = Date.now();
    
    return next.handle().pipe(
      tap(response => {
        const duration = Date.now() - start;
        this.logger.log({
          traceId,
          method: req.method,
          path: req.path,
          status: 200,
          duration,
          timestamp: new Date().toISOString()
        });
      }),
      catchError(error => {
        const duration = Date.now() - start;
        this.logger.error({
          traceId,
          method: req.method,
          path: req.path,
          status: error.status || 500,
          error: error.message,
          duration,
          timestamp: new Date().toISOString()
        });
        throw error;
      })
    );
  }
}
```

---

### 3.2 Clean Architecture

#### **Mejora: Separar Use Cases Explícitamente**

```typescript
// application/use-cases/create-loan.use-case.ts
@Injectable()
export class CreateLoanUseCase implements IUseCase<CreateLoanCommand, CreateLoanResult> {
  
  constructor(
    private readonly deviceService: IDeviceService,
    private readonly loanRepository: ILoanRepository,
    private readonly loanFactory: LoanFactory,
    private readonly eventBus: EventBus
  ) {}
  
  async execute(command: CreateLoanCommand): Promise<CreateLoanResult> {
    // Validar precondiciones
    if (!command.userId) throw new InvalidUserIdError();
    if (command.endDate <= command.startDate) throw new InvalidDateRangeError();
    
    // Obtener dispositivo (infrastructure)
    const device = await this.deviceService.getById(command.deviceId);
    
    // Lógica de dominio
    if (!device.isAvailable()) {
      throw new DeviceNotAvailableError(command.deviceId);
    }
    
    // Crear préstamo (domain)
    const loan = this.loanFactory.create(device, command);
    
    // Persist (infrastructure)
    const savedLoan = await this.loanRepository.save(loan);
    
    // Publicar evento (infrastructure)
   this.eventBus.publish(new LoanCreatedEvent(savedLoan.id));
    
    // Mapear respuesta
    return new CreateLoanResult(savedLoan.id, savedLoan.getState());
  }
}

// presentation/controllers/loans.controller.ts
@Controller('loans')
export class LoansController {
  
  @Post()
  async create(@Body() dto: CreateLoanDto) {
    const command = CreateLoanCommand.from(dto);
    return this.createLoanUseCase.execute(command);
  }
}
```

---

### 3.3 Testing

#### **Mejora: Crear Suite de Tests**

```typescript
// __tests__/integration/create-loan.integration.spec.ts

describe('Create Loan End-to-End', () => {
  let app: INestApplication;
  let loanService: LoansService;
  let deviceService: DevicesService;
  
  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule]
    }).compile();
    
    app = moduleRef.createNestApplication();
    await app.init();
    
    loanService = moduleRef.get(LoansService);
    deviceService = moduleRef.get(DevicesService);
  });
  
  it('should create loan and reserve device', async () => {
    // Arrange: Create device
    const device = await deviceService.create({ name: 'Laptop', status: 'AVAILABLE' });
    
    // Act: Create loan
    const result = await loanService.createLoan(
      'user1',
      device.id,
      'LAPTOP',
      new Date('2025-03-10'),
      new Date('2025-03-20')
    );
    
    // Assert: Verify loan created
    expect(result.state).toBe('REQUESTED');
    expect(result.id).toBeDefined();
    
    // Assert: Verify device reserved
    const updatedDevice = await deviceService.getById(device.id);
    expect(updatedDevice.status).toBe('LOANED');
  });
  
  it('should rollback when device becomes unavailable', async () => {
    // Arrange
    const device = await deviceService.create({ name: 'Laptop', status: 'AVAILABLE' });
    
    // Mock device service to fail on second call
    jest.spyOn(deviceService, 'updateStatus')
      .mockRejectedValueOnce(new Error('Service unavailable'));
    
    // Act & Assert
    await expect(
      loanService.createLoan('user1', device.id, 'LAPTOP', new Date('2025-03-10'), new Date('2025-03-20'))
    ).rejects.toThrow();
    
    // Verify device status remained AVAILABLE
    const unchangedDevice = await deviceService.getById(device.id);
    expect(unchangedDevice.status).toBe('AVAILABLE');
  });
});
```

---

### 3.4 Seguridad

#### **Mejora: Agregar Autenticación JWT**

```typescript
// auth/decorators/auth.decorator.ts
export const Auth = () => UseGuards(JwtAuthGuard);

// auth/guards/jwt.guard.ts
@Injectable()
export class JwtAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    
    if (!token) {
      throw new UnauthorizedException('Missing token');
    }
    
    try {
      const decoded = verify(token, process.env.JWT_SECRET);
      request.user = decoded;
      return true;
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}

// loans.controller.ts
@Controller('loans')
export class LoansController {
  
  @Post()
  @Auth()  // ◄── Protegido
  async create(@Body() dto: CreateLoanDto, @Request() req) {
    const userId = req.user.id;  // ◄── Secured from token
    return this.loansService.createLoan(userId, ...);
  }
}
```

---

## 4. CHECKLIST DE COMPLETITUD

### Según PDF - Requisitos de Entrega 1

| Sección | Requisito | Estado | Acción |
|---------|-----------|--------|--------|
| 6.1 | Contexto del problema | ❌ FALTANTE | ✅ COMPLETADO (en documento entregado) |
| 6.2 | Actores del sistema | ❌ FALTANTE | ✅ COMPLETADO |
| 6.3 | 10 RF + 5 RNF | ❌ FALTANTE | ✅ COMPLETADO |
| 6.4 | Estilo arquitectónico | ❌ FALTANTE | ✅ COMPLETADO |
| 6.5 | Tabla patrones | ❌ FALTANTE | ✅ COMPLETADO |
| 6.6 | Diagramas C4 | ⚠️ PARCIAL | ✅ COMPLETADO (ASCII, necesita SVG) |
| 6.6 | Diagrama BD | ⚠️ PARCIAL | ✅ COMPLETADO (ASCII) |
| 6.6 | Prototipos Figma | ❌ FALTANTE | ⚠️ RECOMENDADO |
| Exposición | Diapositivas | ❌ FALTANTE | ⚠️ RECOMENDADO |

---

## 5. RECOMENDACIONES FINALES

### Prioridad CRÍTICA (Hace la diferencia entre pasar/fallar)

1. **Completar documentación de Entrega 1** ← Acabo de entregar
2. **Implementar correctamente Saga Pattern** con event sourcing
3. **Agregar Clean Architecture** con capas bien definidas
4. **Crear tests** (mínimo 70% coverage)
5. **Crear presentación** con diapositivas profesionales

### Prioridad ALTA (Mejora calificación)

6. Agregar autenticación JWT
7. Implementar Circuit Breaker & Resilience
8. Agregar logging centralizado
9. Mejorar error handling
10. Crear prototipos Figma

### Prioridad MEDIA (Mejora arquitectura long-term)

11. Service discovery (Consul)
12. Event sourcing completo
13. Outbox Pattern
14. Distributed tracing (Jaeger)
15. Health checks & monitoring

---

## 6. PLAN DE ACCIÓN RECOMENDADO

### Fase 1: Entrega Mínima (próxima semana)
- [ ] Usar documento `ENTREGA_1_ARQUITECTURA.md` como base
- [ ] Crear presentación powerpoint (2-3 slides por estudiante)
- [ ] Corregir `app.module.ts` del loan-service (múltiples @Module)
- [ ] Agrega timeout a RPC calls

### Fase 2: Mejora Código (semana 2)
- [ ] Implementar verdadera Saga con event bus
- [ ] Agregar testing a 80%
- [ ] Refactorizar a Clean Architecture

### Fase 3: Producción-Ready (semana 3+)
- [ ] Autenticación
- [ ] Logging centralizado
- [ ] Resiliencia (Circuit breaker, retry)

---

## 7. PREGUNTAS PARA DEFENSAR ENTREGA 1

**Antes de la presentación, preparen respuestas a:**

1. **¿Por qué Microservicios y no Monolito?**
   - Respuesta: Escalabilidad independiente, separación de responsabilidades...

2. **¿Cómo garantizan consistencia entre Loan DB y Device DB?**
   - Respuesta: Saga Pattern con compensating transactions...

3. **¿Qué sucede si Device Service no responde?**
   - Respuesta: Compensating transaction revierte Loan creation, se lanza error al cliente...

4. **¿Cómo agregan nuevo tipo de dispositivo (Monitor)?**
   - Respuesta: Implementar MonitorLoanFactory sin modificar LoansService (Factory Pattern)...

5. **¿Qué trade-offs tienen en esta arquitectura?**
   - Respuesta: -Complejidad operacional + Service discovery, timeout handling... +Escalabilidad, resiliencia...

---

## CONCLUSIÓN

El proyecto **Grupo 1 - Préstamos de Dispositivos** demuestra comprensión sólida de conceitos de microservicios y patrones de diseño clásicos. Sin embargo, **falta documentación crítica de Entrega 1** y la **implementación de Saga Pattern es primitiva**.

Con las mejoras propuestas en este reporte:

✅ Pasarán la Entrega 1 (con documentación ahora disponible)  
✅ Demostraránarquitectura coherente  
✅ Implementarán patrones correctamente  
✅ Recibirán calificación 7-8/10 si corrigen críticos

---

**Reviewed by:** Experto en Arquitectura de Software  
**Date:** 3 de Abril de 2026  
**Status:** ✅ REVISIÓN COMPLETADA

**Next Steps:** Revisar documentación entregada, implementar recomendaciones críticas, preparar presentación.
