# ENTREGA 1: ANÁLISIS Y DISEÑO ARQUITECTÓNICO
## Sistema de Préstamos de Dispositivos
### Diseño de Software II - Grupo 1

---

## TABLA DE CONTENIDOS

1. [Contexto del Problema](#1-contexto-del-problema)
2. [Actores del Sistema](#2-actores-del-sistema)
3. [Requerimientos](#3-requerimientos)
4. [Estilo Arquitectónico Principal](#4-estilo-arquitectónico-principal)
5. [Patrones de Arquitectura](#5-patrones-de-arquitectura)
6. [Diagramas](#6-diagramas)
7. [Mapeo de Responsabilidades](#7-mapeo-de-responsabilidades)

---

## 1. CONTEXTO DEL PROBLEMA

### 1.1 Descripción del Problema

En las instituciones educativas y empresas, la gestión de dispositivos tecnológicos es una tarea crítica. Actualmente, existe un problema sistemático:

- **Falta de disponibilidad** de dispositivos cuando se necesitan
- **Pérdidas** de equipos por falta de control
- **Duplicidad de registros** en múltiples sistemas desacoplados
- **Procesos manuales** lentos e ineficientes para solicitar, aprobar y devolver dispositivos
- **Falta de trazabilidad** en el ciclo de vida de los préstamos
- **Imposibilidad de escalar** el sistema a nuevas líneas de dispositivos sin rediseñar

### 1.2 Alcance de la Solución

El sistema de **Préstamos de Dispositivos** propone una solución integral que:

✅ Permite a usuarios solicitar dispositivos mediante una interfaz intuitiva (web y mobile-ready)  
✅ Automatiza el flujo de aprobación de préstamos (REQUESTED → APPROVED → DELIVERED → RETURNED)  
✅ Mantiene un inventario actualizado de dispositivos disponibles en tiempo real  
✅ Genera un historial completo y auditable de todos los préstamos  
✅ Permite gestionar múltiples tipos de dispositivos (laptops, cargadores, kits combinados)  
✅ Escalable: Fácil adicionar nuevos tipos de dispositivos mediante el patrón Factory  
✅ Desacoplado: Cada servicio es independiente y puede evolucionar sin afectar otros  

**Fuera del alcance de esta versión:**
- Integración con sistemas legacy de presupuestos
- Reservas futuras de dispositivos
- Notificaciones por email/SMS
- Mobile app nativa (solo web responsive)
- Analytics avanzados

### 1.3 Supuestos

1. **Disponibilidad de red**: Se asume conectividad estable entre los servicios
2. **Datos iniciales**: Se asume existencia de usuarios y dispositivos en la BD
3. **Horarios laborales**: El sistema operará principalmente en horarios de negocio
4. **Usuarios registrados**: Solo personas registradas en el sistema pueden solicitar préstamos
5. **Roles básicos**: Existen usuarios normales y administradores que aprueban préstamos

### 1.4 Restricciones

1. **Bases de datos independientes**: No se pueden realizar queries directas entre servicios
2. **Comunicación síncrona**: Los servicios se comunican mediante RPC TCP (NestJS microservices)
3. **SQLite para desarrollo**: En producción, se migrará a PostgreSQL en contenedores
4. **Consistencia eventual**: El sistema tolera inconsistencias temporales entre servicios
5. **Latencia máxima**: Las operaciones deben completarse en menos de 5 segundos
6. **Disponibilidad**: Al menos 99% uptime durante horas laborales

### 1.5 Justificación de la Propuesta

Se eligió una **arquitectura de Microservicios** porque:

| Criterio | Beneficio |
|----------|-----------|
| **Independencia** | Cada equipo puede trabajar en un servicio sin impactar otros |
| **Escalabilidad** | El device-service puede replicarse sin tocar loan-service |
| **Tolerancia a fallos** | Si un servicio cae, otros siguen operando parcialmente |
| **Evolución tecnológica** | Cada servicio puede usar tecnologías diferentes si es necesario |
| **Testing independiente** | Los servicios pueden testearse nítidamente en aislamiento |
| **Mantenimiento** | Despliegues independientes reducen riesgo y downtime |

---

## 2. ACTORES DEL SISTEMA

### 2.1 Identificación de Actores

```
┌─────────────────────────────────┐
│                                 │
│        Solicitante (User)       │
│  (Profesor, Estudiante, Admin)  │
│                                 │
└──────────────┬──────────────────┘
               │
               │ solicita/consulta
               ▼
        ┌──────────────┐
        │  API Gateway │
        │   (3000)     │     HTTP/REST
        └──────────────┘
               │
        ┌──────┴──────┐
        │             │
        ▼             ▼
   ┌────────┐    ┌─────────┐
   │ Loan   │    │ Device  │
   │Service │    │Service  │
   │(3001)  │    │(3002)   │
   └────────┘    └─────────┘
        │             │
        ▼             ▼
     Loan DB      Device DB
   (SQLite)      (SQLite)
```

### 2.2 Descripción de Actores

#### **Actor 1: Solicitante (End User)**

| Propiedad | Valor |
|-----------|-------|
| **Rol** | Estudiante, Profesor, Personal administrativo |
| **Objetivo** | Solicitar dispositivos que necesita de forma rápida |
| **Interacciones** | Crear préstamo, Consultar estado, Ver historial |
| **Frecuencia** | 1-5 veces por semana |
| **Responsabilidades** | Devolver dispositivo en fecha, Reportar daños |

**Flujo típico:**
```
1. Accede a la plataforma web
2. Solicita un dispositivo (ej: Laptop)
3. Recibe confirmación con ID y estado REQUESTED
4. Espera aprobación (notificación o consulta manual)
5. Retira dispositivo (estado cambia a DELIVERED)
6. Usa dispositivo durante el período acordado
7. Devuelve dispositivo (estado RETURNED)
```

#### **Actor 2: Administrador de Préstamos**

| Propiedad | Valor |
|-----------|-------|
| **Rol** | Persona autorizada para aprobar/rechazar préstamos |
| **Objetivo** | Gestionar el flujo de préstamos de forma controlada |
| **Interacciones** | Aprobar, Rechazar, Ver solicitudes pendientes |
| **Frecuencia** | Cada 1-2 horas (horario laboral) |
| **Responsabilidades** | Verificar disponibilidad, Validar políticas |

**Flujo típico:**
```
1. Consulta préstamos en estado REQUESTED
2. Verifica disponibilidad de dispositivos
3. Aprueba o rechaza
4. Sistema autoriza entrega
```

#### **Actor 3: Sistema (Device Service)**

| Propiedad | Valor |
|-----------|-------|
| **Rol** | Servicio encargado de gestionar inventario |
| **Objetivo** | Disponibilizar información de dispositivos |
| **Interacciones** | Validar disponibilidad, Actualizar estado |
| **Frecuencia** | Cada operación de préstamo |
| **Responsabilidades** | Mantener inventario actualizado, Garantizar consistencia |

**Flujo típico:**
```
1. Recibe solicitud de validación desde Loan Service
2. Verifica si dispositivo está disponible
3. Reserva dispositivo
4. Notifica cambio a Loan Service
```

### 2.3 Diagrama de Interacción entre Actores

```
┌──────────────────┐
│    Solicitante   │──1. Crea préstamo─────┐
│                  │                       │
│ - Consulta BD    │◄──5. Confirmación◄────┤
│ - Solicita       │                       │
│ - Retira         │                       ▼
│ - Devuelve       │                  ┌─────────┐
└──────────────────┘                  │ Loan    │
                                      │ Service │
┌──────────────────┐                  │ (3001)  │
│   Administrador  │                  └────┬────┘
│                  │                       │
│ - Aprueba        │                    2. Valida
│ - Rechaza        │                       │
│ - Consulta       │                       ▼
└──────────────────┘                  ┌──────────────┐
                                      │ Device       │
                                      │ Service      │
                                      │ (3002)       │
                                      └──────────────┘
```

---

## 3. REQUERIMIENTOS

### 3.1 Requerimientos Funcionales (RF)

#### **RF-1: Crear Solicitud de Préstamo**
- **ID**: RF-001
- **Descripción**: El solicitante puede crear una solicitud de préstamo especificando dispositivo, usuario, fechas
- **Actores**: Solicitante
- **Precondición**: Usuario registrado, dispositivo existe
- **Flujo Normal**:
  1. Solicitante accede a "Crear préstamo"
  2. Completa formulario (userId, deviceId, type, startDate, endDate)
  3. Sistema valida datos
  4. Sistema crea registro con estado REQUESTED
  5. Sistema retorna ID de préstamo
- **Postcondición**: Préstamo existe en estado REQUESTED

#### **RF-2: Listar Préstamos con Filtros**
- **ID**: RF-002
- **Descripción**: El usuario puede consultar préstamos con filtros opcionales
- **Actores**: Solicitante, Administrador
- **Parámetros**: status (opcional), startDate (opcional), endDate (opcional)
- **Precondición**: Al menos un préstamo existe
- **Salida**: Lista de préstamos que coinciden con criterios
- **Postcondición**: Se retorna información completa de cada préstamo

#### **RF-3: Obtener Detalle de Préstamo**
- **ID**: RF-003
- **Descripción**: Consultar información detallada de un préstamo específico
- **Actores**: Solicitante, Administrador
- **Parámetro**: ID del préstamo
- **Precondición**: Préstamo existe
- **Salida**: Objeto con detalles completos del préstamo
- **Postcondición**: Se retorna información actual

#### **RF-4: Aprobar Préstamo**
- **ID**: RF-004
- **Descripción**: Administrador puede cambiar estado de REQUESTED a APPROVED
- **Actores**: Administrador
- **Parámetro**: ID del préstamo
- **Precondición**: Préstamo en estado REQUESTED, dispositivo disponible
- **Flujo Normal**:
  1. Admin consulta préstamo pendiente
  2. Verifica disponibilidad en Device Service
  3. Aprueba (estado APPROVED)
  4. Device Service cambia dispositivo a LOANED
- **Postcondición**: Préstamo en estado APPROVED, dispositivo reservado

#### **RF-5: Entregar Dispositivo**
- **ID**: RF-005
- **Descripción**: Cambiar estado de APPROVED a DELIVERED
- **Actores**: Administrador
- **Parámetro**: ID del préstamo
- **Precondición**: Préstamo en estado APPROVED
- **Postcondición**: Préstamo en estado DELIVERED, dispositivo en posesión del usuario

#### **RF-6: Devolver Dispositivo**
- **ID**: RF-006
- **Descripción**: Cambiar estado de DELIVERED a RETURNED
- **Actores**: Solicitante, Administrador
- **Parámetro**: ID del préstamo
- **Precondición**: Préstamo en estado DELIVERED
- **Postcondición**: Préstamo en estado RETURNED, dispositivo disponible nuevamente

#### **RF-7: Expirar Préstamo**
- **ID**: RF-007  
- **Descripción**: Sistema expira automáticamente préstamos vencidos
- **Actores**: Sistema (proceso automático)
- **Condición**: Fecha actual > endDate
- **Postcondición**: Préstamo en estado EXPIRED, dispositivo libera su reserva

#### **RF-8: Cambiar Estado de Préstamo**
- **ID**: RF-008
- **Descripción**: Cambiar el estado de un préstamo a través de endpoint genérico
- **Actores**: Administrador
- **Parámetro**: ID, nuevo estado
- **Precondición**: Estado válido según máquina de estados
- **Postcondición**: Préstamo en nuevo estado

#### **RF-9: Obtener Información de Dispositivo**
- **ID**: RF-009
- **Descripción**: Device Service retorna información de dispositivo por ID
- **Actores**: Loan Service, Administrador
- **Parámetro**: Device ID
- **Precondición**: Dispositivo existe
- **Salida**: Nombre, estado, tipo, capacidad
- **Postcondición**: Información disponible

#### **RF-10: Actualizar Estado de Dispositivo**
- **ID**: RF-010
- **Descripción**: Cambiar estado del dispositivo (AVAILABLE → LOANED, LOANED → AVAILABLE)
- **Actores**: Loan Service
- **Parámetro**: Device ID, nuevo estado
- **Precondición**: Dispositivo existe
- **Postcondición**: Dispositivo en nuevo estado, sincronizando con préstamos

### 3.2 Requerimientos No Funcionales (RNF)

#### **RNF-1: Performance - Latencia en Operaciones CRUD**
- **Métrica**: Operaciones CRUD < 500ms en promedio
- **Justificación**: Usuarios esperan respuesta inmediata
- **Medición**: Prometheus/timing en logs
- **Aceptación**: 95% de operaciones < 500ms

#### **RNF-2: Performance - Concurrent Users**
- **Métrica**: Sistema soporta mínimo 100 usuarios concurrentes
- **Justificación**: Al inicio de ciclo escolar puede haber solicitudes masivas
- **Medición**: Load testing con JMeter/Gatling
- **Aceptación**: Degradación < 20% en latencia con 100 users

#### **RNF-3: Disponibilidad - Uptime**
- **Métrica**: 99% uptime durante horas laborales (8:00-18:00)
- **Justificación**: Crítico para la operación diaria
- **Medición**: Logs de disponibilidad, alertas en time-series DB
- **Aceptación**: Máximo 43 minutos de downtime por mes

#### **RNF-4: Escalabilidad - Crecimiento de Datos**
- **Métrica**: Sistema soporta 1 millón de registros de préstamos
- **Justificación**: Crecimientos futuros de la institución
- **Medición**: Benchmark con 1M registros
- **Aceptación**: Latencia < 1s para queries principales

#### **RNF-5: Seguridad - Autenticación**
- **Métrica**: Cada request requiere credencial válida (futura: JWT)
- **Justificación**: Evitar acceso no autorizado
- **Medición**: Validación en cada endpoint
- **Aceptación**: 100% de requests autenticados antes de procesar

### 3.3 Matriz de Trazabilidad Requerimientos-Componentes

| RF # | Objetivo | Componente Principal | Patrón |
|------|----------|----------------------|--------|
| RF-1 | Crear préstamo | LoansController, LoansService | Factory, State |
| RF-2 | Listar préstamos | LoansRepository, LoansService | Repository |
| RF-3 | Obtener detalle | LoansRepository | Repository |
| RF-4 | Aprobar | LoansService, DeviceService | Saga, RPC |
| RF-5 | Entregar | LoansService | State |
| RF-6 | Devolver | LoansService, DeviceService | Saga |
| RF-7 | Expirar | LoansService (scheduler) | - |
| RF-8 | Cambiar estado | LoansService | State |
| RF-9 | Obtener device | DevicesService, DevicesRepository | Repository |
| RF-10 | Actualizar device | DevicesService, DeviceRepository | Repository |

---

## 4. ESTILO ARQUITECTÓNICO PRINCIPAL

### 4.1 Estilo Seleccionado: MICROSERVICIOS

```
                        ┌─────────────────────────┐
                        │    API Gateway (3000)   │
                        │  HTTP REST Entry Point  │
                        └────────────┬────────────┘
                                     │
                    ┌────────────────┼────────────────┐
                    │                │                │
                    ▼                ▼                ▼
           ┌─────────────────┐ ┌───────────────┐ ┌─────────────┐
           │  Loan Service   │ │ Device Service│ │ User Service│
           │     (3001)      │ │    (3002)     │ │   (3003)    │
           └────────┬────────┘ └───────┬───────┘ └──────┬──────┘
                    │                  │                │
         ┌──────────▼──────────┐  ┌────▼────┐  ┌──────▼──────┐
         │   Loan Database     │  │Device DB│  │  User DB    │
         │   (SQLite/Postgres) │  │(SQLite) │  │ (SQLite)    │
         └─────────────────────┘  └─────────┘  └─────────────┘
```

### 4.2 Justificación del Estilo

**Por qué Microservicios y no Monolito:**

1. **Separación de Responsabilidades Explícita**
   - Cada servicio maneja un dominio específico (loans, devices, users)
   - Evita que el código escale "verticalmente" en complejidad
   - Equipos alineados con servicios (Conway's Law)

2. **Escalabilidad Independiente**
   - Si hay picos de solicitudes de dispositivos, scalamos device-service
   - Sin afectar loan-service o user-service
   - Cada BD puede optimizarse según su carga

3. **Tolerancia a Fallos**
   - Si device-service falla, loan-service puede continuar (modo degradado)
   - Falla de una BD no derriba el sistema completo
   - Circuitos breakers pueden aislar errores

4. **Evolución Tecnológica**
   - Device-service podría cambiar de Node.js a Go sin rehacer todo
   - Cada servicio elige sus dependencias
   - Migraciones tecnológicas aisladas y paralelas

5. **Testing Independiente**
   - Unit tests, integration tests, e2e tests por servicio
   - Mock fácil de dependencias externas (client proxies)
   - CI/CD pipeline independiente por servicio

### 4.3 Ventajas del Estilo

| Ventaja | Descripción | Impacto |
|---------|-------------|--------|
| **Desacoplamiento** | Servicios independientes, sin dependencias circulares | Cambios no tienen cascada |
| **Escalabilidad** | Cada servicio escala según demanda específica | Optimización de costos |
| **Resiliencia** | Fallos aislados, sin punto único de fallo | Mayor disponibilidad |
| **Velocidad de desarrollo** | Equipos en paralelo en servicios diferentes | TTM reducido |
| **Deployment independiente** | Cambios en un servicio sin tocar otros | Menor riesgo |
| **Flexibility tecnológica** | Cada servicio elige su stack | Adopción de nuevas tecnologías |

### 4.4 Trade-offs del Estilo

| Trade-off | Costo | Mitigation |
|-----------|-------|------------|
| **Complejidad operacional** | Múltiples BDs, múltiples procesos | Docker, Kubernetes, monitoreo |
| **Latencia de red** | RPC calls entre servicios | Caching, async messaging |
| **Consistencia de datos** | Consistencia eventual no inmediata | Saga pattern, outbox pattern |
| **Testing distribuido** | E2E más complejos | Contract testing, stub services |
| **Debugging distribuido** | Errores distribuidos difícil de trazar | Logging centralizado, tracing |
| **Overhead de infraestructura** | Más servidores necesarios | Cloud-native, auto-scaling |

### 4.5 Alternativas Consideradas

#### **Opción 1: Monolito (Rechazada)**
```
┌──────────────────────────┐
│     Monolithic App       │
│ ├─ loans                 │
│ ├─ devices               │
│ ├─ users                 │
│ └─ Single Database       │
└──────────────────────────┘
```
**Razones de rechazo:**
- Difícil escalar componentes individuales
- Cambio en loans afecta todo el sistema
- Riesgo alto en deployment

#### **Opción 2: SOA (Rechazada)**
```
Similar a Microservicios pero con:
- Enterprise Service Bus centralizado
- Mayor acoplamiento
- Gobernanza más pesada
```
**Razones de rechazo:**
- Overkill para este problema
- ESB es cuello de botella
- Menor resiliencia

#### **Opción 3: Serverless (Considerada pero rechazada)**
```
- AWS Lambda para cada operación
- Event-driven architecture
```
**Razones de rechazo:**
- Mayor costo inicial de setup
- Cold starts pueden afectar latencia
- Infraestructura como código más compleja
- Mejor para arquitecturas event-driven puro

**Conclusión:** Microservicios es el mejor fit para este problema, balanceando complejidad vs. beneficios.

---

## 5. PATRONES DE ARQUITECTURA

### 5.1 Tabla Obligatoria de Patrones Asignados

| Estudiante # | Patrón | Componente | Problema que Resuelve |
|--------------|--------|-----------|----------------------|
| 1 | **API Gateway** | api-gateway (puerto 3000) | Punto de entrada único, enrutamiento a servicios, cross-cutting concerns |
| 2 | **Database per Service** | loan-service (BD) + device-service (BD) | Desacoplamiento de datos, independencia de esquemas, escalabilidad |
| 3 | **Saga Pattern** | LoansService (compensating transactions) | Coordinación de transacciones distribuidas, rollback en fallos |

### 5.2 Patrón 1: API GATEWAY

#### **Descripción**
El patrón API Gateway actúa como punto de entrada único para todos los clientes. Encapsula la complejidad de los microservicios detrás de una interfaz unificada.

#### **Implementación**

**Ubicación:** `/backend/api-gateway`

```typescript
// api-gateway/src/app.controller.ts
@Controller()
export class AppController {
  constructor(
    @Inject('LOAN_SERVICE') private readonly loanClient: ClientProxy
  ) {}

  @Post('loans')
  async createLoan(@Body() body: any) {
    return await firstValueFrom(
      this.loanClient.send('create_loan', body)
    );
  }
}
```

#### **Beneficios**

✅ **Punto de entrada único**: Clientes no necesitan conocer detalles de servicios  
✅ **Routing centralizado**: Redirecciona requests a servicios apropiados  
✅ **Cross-cutting concerns**: Futuros: autenticación, logging, rate limiting  
✅ **Versionamiento**: API versioning centralizado  
✅ **Evolución sin romper clientes**: Servicios pueden cambiar internamente  

#### **Diagrama**

```
HTTP Clients (Web, Mobile, CLI)
           │
           ▼
    ┌─────────────────┐
    │  API Gateway    │
    │    (3000)       │
    │  - Route /loans │
    │  - Route /users │
    │  - Route /device├─────────────────────┐
    └────┬─────────────┘                    │
         │                                  │
    TCP RPC                            TCP RPC
         │                                  │
    ┌────▼────────┐              ┌─────────▼───┐
    │  Loan Svc   │              │ Device Svc  │
    │  (3001)     │              │   (3002)    │
    └─────────────┘              └─────────────┘
```

---

### 5.3 Patrón 2: DATABASE PER SERVICE

#### **Descripción**
Cada microservicio tiene su propia base de datos, evitando dependencias de esquema y acoplamiento de datos entre servicios.

#### **Implementación**

```
backend/
├── api-gateway/
│   └── (no tiene BD, solo router)
├── device-service/
│   ├── prisma/
│   │   ├── schema.prisma     ◄── Device DB Schema
│   │   └── dev.db             ◄── SQLite
│   └── src/
└── loan-service/
    ├── prisma/
    │   ├── schema.prisma     ◄── Loan DB Schema
    │   └── (dev.db)
    └── src/
```

**device-service/prisma/schema.prisma:**
```prisma
datasource db {
  provider = "sqlite"
  url      = "file:./dev.db"
}

model Device {
  id     String @id
  name   String
  status String  // AVAILABLE, LOANED, MAINTENANCE
}
```

**loan-service/prisma/schema.prisma:**
```prisma
datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

model Loan {
  id        String @id @default(uuid())
  userId    String
  deviceId  String
  status    String  // REQUESTED, APPROVED, DELIVERED, RETURNED, EXPIRED
  startDate DateTime
  endDate   DateTime
}
```

#### **Beneficios**

✅ **Independencia**: Cambios en Device DB no afectan Loan DB  
✅ **Escalabilidad de datos**: Cada BD optimizada para su carga  
✅ **Flexibilidad de BD**: device-service podría usar MongoDB, loan-service PostgreSQL  
✅ **Consistencia eventual**: Aceptamos inconsistencias temporales por resiliencia  
✅ **Eliminación sin impacto**: Borrar BD de un servicio no derriba otros  

#### **Desafío & Solución**

**Challenge:** ¿Cómo asegurar consistencia entre BDs?  
**Solución:** Saga Pattern + Outbox Pattern (ver sección 5.4)

---

### 5.4 Patrón 3: SAGA PATTERN

#### **Descripción**
Coordina transacciones distribuidas separando una transacción lógica en múltiples transacciones locales, con compensating transactions para rollback.

#### **Tipos de Saga**

**Opción A: Saga Orquestada (Actual)**
```
┌─────────────────────────────┐
│   Saga Orchestrator         │
│  (LoansService)             │
└────────────┬────────────────┘
             │
    ┌────────┼────────┐
    │        │        │
    ▼        ▼        ▼
 Paso 1   Paso 2   Paso 3
(local)   (RPC)    (RPC)
```

**Opción B: Saga Coreografía (No implementada)**
```
Device Svc ◄─── Event ────► Loan Svc
   │                         │
   └──────── Event ───────► User Svc
```

**Implementación Actual: Saga con Compensating Transactions**

Ubicación: `/backend/loan-service/src/modules/loans/loans.service.ts`

```typescript
async createLoan(
  userId: string,
  deviceId: string,
  type: string,
  startDate: Date,
  endDate: Date
): Promise<{ id: string; state: string }> {

  let loanCreated = false;
  const id = randomUUID();

  try {
    // PASO 1: Validar dispositivo (RPC call)
    const device = await firstValueFrom(
      this.deviceClient.send('get_device', { id: deviceId })
    );

    if (device.status !== 'AVAILABLE') {
      throw new BadRequestException('Dispositivo no disponible');
    }

    // PASO 2: Crear Loan localmente
    const factory = this.getFactory(type);
    const loan = factory.createLoan(id);

    await this.loanRepository.createLoan({
      id, userId, deviceId, type,
      status: loan.getState(),
      startDate, endDate
    });

    loanCreated = true;

    // PASO 3: Actualizar estado de Device (RPC call)
    await firstValueFrom(
      this.deviceClient.send('update_device_status', {
        id: deviceId,
        status: 'LOANED'
      })
    );

    this.loans.set(id, loan);

    return { id: loan.id, state: loan.getState() };

  } catch (error) {
    
    // COMPENSATING TRANSACTIONS (Rollback)
    console.log('Error en Saga, ejecutando rollback...');

    // Compensar PASO 2: Eliminar Loan si se creó
    if (loanCreated) {
      try {
        await this.loanRepository.deleteLoan(id);
      } catch (e) {
        console.error('Error en compensating transaction para Loan');
      }
    }

    // Compensar PASO 3: Restaurar Device a AVAILABLE
    try {
      await firstValueFrom(
        this.deviceClient.send('update_device_status', {
          id: deviceId,
          status: 'AVAILABLE'
        })
      );
    } catch (e) {
      console.error('Error en compensating transaction para Device');
    }

    throw error;
  }
}
```

#### **Flujo Paso a Paso**

```
Request: createLoan(user1, device1, LAPTOP, 2025-03-10, 2025-03-20)
│
├─ [PASO 1] Validar Device ──────► Device Service (RPC)
│           ✓ device1 Status=AVAILABLE
│                                   
├─ [PASO 2] Crear Loan localmente ──► Loan DB
│           ✓ Loan id=uuid, Status=REQUESTED, loanCreated=true
│
├─ [PASO 3] Actualizar Device ──────► Device Service (RPC)
│           ✓ device1 Status=LOANED
│
└─ [SUCCESS] Return {id: uuid, state: REQUESTED}

---

Si error en PASO 3 (Device Service no responde):
│
├─ [ERROR] Catch exception
│
├─ [ROLLBACK PASO 2] Eliminar Loan id=uuid
│           ✓ Loan DB: DELETE WHERE id=uuid
│
├─ [ROLLBACK PASO 3] Restaurar Device
│           ✓ Device Service: device1 Status=AVAILABLE
│
└─ [FAILURE] Throw error al cliente
```

#### **Beneficios**

✅ **Consistencia eventual**: Las transacciones distribuidas se completan eventualmente  
✅ **Rollback automático**: En caso de fallo, compensating transactions reviertan cambios  
✅ **Independencia de BDs**: Cada servicio maneja su consistencia local  
✅ **Resiliencia**: Si Device Service falla, Loan se revierte automáticamente  

#### **Limitaciones Actuales**

⚠️ **Síncrono**: Request espera todas las operaciones (max 5s timeout)  
⚠️ **Punto de fallo**: Si Device Service tarda, Loan se revierte  
⚠️ **No hay durabilidad de compensations**: Si server falla en rollback, inconsistencia  
⚠️ **Sin Dead Letter Queue**: Fallos no se registran externamente  

#### **Mejora Futura: Saga Coreografía con Event Sourcing**

```typescript
// Flujo mejorado (futuro)

// Device Service publica evento
eventBus.publish('DeviceCreated', { deviceId, status: 'LOANED' });

// Loan Service suscrito
@EventPattern('DeviceCreated')
handleDeviceCreated(data) {
  // Confirmar Loan
  this.loanRepository.confirmLoan(data.deviceId);
}

// Error handling
@EventPattern('DeviceUnavailable')
handleDeviceUnavailable(data) {
  // Compensar: Revertir Loan
  this.loanRepository.revertLoan(data.deviceId);
}
```

---

### 5.5 Patrones de Diseño Clásicos (Implementados)

Además de los patrones arquitectónicos asignados, se implementan patrones de diseño clásicos:

#### **1. Factory Pattern**

**Ubicación:** `/backend/loan-service/src/modules/loans/domain/factory/`

**Problema:** Crear diferentes tipos de préstamos (Laptop, Charger, Kit) sin acoplar la creación al uso.

```typescript
// LoanFactory.ts (Interfaz)
export interface LoanFactory {
  createLoan(id: string): Loan;
}

// LaptopLoanFactory.ts (Implementación específica)
export class LaptopLoanFactory implements LoanFactory {
  createLoan(id: string): Loan {
    return new Loan(id, 'LAPTOP', [
      new Device('laptop-1', 'INCLUDED')
    ]);
  }
}

// Uso en LoansService
private getFactory(type: string): LoanFactory {
  switch (type) {
    case 'LAPTOP': return new LaptopLoanFactory();
    case 'CHARGER': return new ChargerLoanFactory();
    case 'KIT': return new KitLoanFactory();
    default: throw new Error('Invalid type');
  }
}
```

**Beneficio:** Fácil agregar nuevos tipos sin modificar código existente.

#### **2. State Pattern**

**Ubicación:** `/backend/loan-service/src/modules/loans/domain/state/`

**Problema:** Máquina de estados de un préstamo con transiciones válidas.

```typescript
// LoanState.ts (Interfaz)
export interface LoanState {
  request(): void;
  approve(): void;
  deliver(): void;
  return(): void;
  expire(): void;
  getName(): string;
}

// RequestedState.ts
export class RequestedState implements LoanState {
  constructor(private loan: Loan) {}

  approve() {
    this.loan.setState(new ApprovedState(this.loan));
  }

  deliver() {
    throw new Error('Cannot deliver from REQUESTED state');
  }

  getName() { return 'REQUESTED'; }
}

// ApprovedState.ts
export class ApprovedState implements LoanState {
  constructor(private loan: Loan) {}

  deliver() {
    this.loan.setState(new DeliveredState(this.loan));
  }

  approve() {
    throw new Error('Already approved');
  }

  getName() { return 'APPROVED'; }
}

// Máquina de estados
export class Loan {
  private currentState: LoanState = new RequestedState(this);

  setState(state: LoanState) {
    this.currentState = state;
  }

  approve() {
    this.currentState.approve(); // Delega según estado actual
  }

  getState(): string {
    return this.currentState.getName();
  }
}
```

**Máquina de Estados:**
```
REQUESTED ──approve──► APPROVED ──deliver──► DELIVERED ──return──► RETURNED
    │
    └──────(timeout)──────► EXPIRED
```

**Beneficio:** No hay if/else dispersos, lógica de transiciones centralizada.

#### **3. Composite Pattern**

**Ubicación:** `/backend/loan-service/src/modules/loans/domain/composite/`

**Problema:** Tratar dispositivos individuales y kits de dispositivos uniformemente.

```typescript
// LoanItem.ts (Interfaz)
export interface LoanItem {
  getName(): string;
  getQuantity(): number;
}

// Device.ts (Leaf)
export class Device implements LoanItem {
  constructor(private name: string, private quantity: number = 1) {}

  getName(): string { return this.name; }
  getQuantity(): number { return this.quantity; }
}

// Kit.ts (Composite)
export class Kit implements LoanItem {
  private items: LoanItem[] = [];

  constructor(private name: string) {}

  addItem(item: LoanItem) { this.items.push(item); }
  removeItem(item: LoanItem) { 
    this.items = this.items.filter(i => i !== item);
  }

  getName(): string { return this.name; }
  getQuantity(): number {
    return this.items.reduce((sum, item) => sum + item.getQuantity(), 0);
  }

  getItems(): LoanItem[] { return this.items; }
}

// Uso
const kit = new Kit('Dev Kit Pro');
kit.addItem(new Device('Laptop', 1));
kit.addItem(new Device('Mouse', 1));
kit.addItem(new Device('Charger', 1));

console.log(kit.getName()); // "Dev Kit Pro"
console.log(kit.getQuantity()); // 3
```

**Beneficio:** Mismo código maneja devices individuales y kits complejos.

#### **4. Repository Pattern**

**Ubicación:** `/backend/loan-service/src/modules/loans/infrastructure/prisma/`

**Problema:** Abstraer acceso a datos, hacer testeable el servicio.

```typescript
@Injectable()
export class LoanRepository {
  private prisma = new PrismaClient();

  async createLoan(data: CreateLoanInput): Promise<Loan> {
    return this.prisma.loan.create({ data });
  }

  async findLoanById(id: string): Promise<Loan | null> {
    return this.prisma.loan.findUnique({ where: { id } });
  }

  async updateStatus(id: string, status: string): Promise<Loan> {
    return this.prisma.loan.update({
      where: { id },
      data: { status }
    });
  }

  async deleteLoan(id: string): Promise<void> {
    await this.prisma.loan.delete({ where: { id } });
  }
}
```

**Beneficio:** Service no conoce Prisma, fácil cambiar a SQL directo o MongoDB.

---

### 5.6 Resumen de Patrones

| Patrón | Ubicación | Propósito |
|--------|-----------|----------|
| **API Gateway** | api-gateway (3000) | Punto de entrada único |
| **Database per Service** | device-service, loan-service | Independencia de datos |
| **Saga (Orchestrated)** | LoansService | Transacciones distribuidas |
| **Factory** | domain/factory/ | Creación de tipos de préstamos |
| **State** | domain/state/ | Máquina de estados del préstamo |
| **Composite** | domain/composite/ | Kits de dispositivos |
| **Repository** | infrastructure/ | Abstracción de persistencia |
| **Microservices** | 3 servicios independientes | Desacoplamiento |

---

## 6. DIAGRAMAS

### 6.1 Diagrama C4 - Nivel 1 (Contexto del Sistema)

```
┌──────────────────────────────────────────────────────────┐
│                    Institución Educativa                 │
│                                                            │
│  ┌───────────┐        ┌──────────────────────┐   HTTP    │
│  │ Solicitante       │ Sistema Préstamos    │◄──┤web/mobile
│  │(Estudiante,      │ de Dispositivos      │            │
│  │Profesor)  │  ◄────┤                      │            │
│  └───────────┘        └──────────────────────┘            │
│                                                            │
│  ┌──────────────────────────────────────┐               │
│  │  Administrador de Préstamos          │               │
│  │  (Aprueba/Rechaza solicitudes)       │               │
│  └──────────────────────────────────────┘               │
└──────────────────────────────────────────────────────────┘
```

### 6.2 Diagrama C4 - Nivel 2 (Contenedores)

```
┌─────────────────────────────────────────────────────────────────┐
│                        Sistema de Préstamos de Dispositivos       │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ Navegador Web / Cliente HTTP                             │  │
│  │ - React SPA                                              │  │
│  │ - TypeScript                                             │  │
│  └──────────────────────┬───────────────────────────────────┘  │
│                         │ HTTP/REST (JSON)                      │
│                         │                                        │
│  ┌──────────────────────▼───────────────────────────────────┐  │
│  │ API Gateway (Puerto 3000)                                │  │
│  │ - NestJS + Express                                       │  │
│  │ - Enrutamiento y orquestación                            │  │
│  └──────────────────────┬───────────────────────────────────┘  │
│        ┌────────────────┼────────────────┐                      │
│        │ RPC/TCP        │ RPC/TCP        │ RPC/TCP            │
│        ▼                ▼                ▼                      │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐           │
│  │ Loan Service │ │Device Service │ │User Service  │           │
│  │ (3001)       │ │ (3002)        │ │ (3003)       │           │
│  │              │ │               │ │              │           │
│  │- LoansModule │ │DevicesModule  │ │UsersModule   │           │
│  │- Factory     │ │               │ │              │           │
│  │- State       │ │- Repository   │ │- Repository  │           │
│  │- Saga        │ │               │ │              │           │
│  └──────┬───────┘ └───────┬───────┘ └──────┬───────┘           │
│         │                 │                 │                  │
│         ▼                 ▼                 ▼                  │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐           │
│  │ Loan DB      │ │ Device DB    │ │ User DB      │           │
│  │ (SQLite)     │ │ (SQLite)     │ │ (SQLite)     │           │
│  └──────────────┘ └──────────────┘ └──────────────┘           │
└─────────────────────────────────────────────────────────────────┘
```

### 6.3 Diagrama C4 - Nivel 3 (Componentes - Loan Service)

```
┌──────────────────────────────────────────────────────────────┐
│                      Loan Service (3001)                      │
│                                                                │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │ LoansModule                                             │ │
│  │                                                          │ │
│  │  ┌────────────────┐  ┌──────────────┐ ┌─────────────┐ │ │
│  │  │LoansController │  │LoansService  │ │LoanRepository
│  │  │ - HTTP POST    │  │ - Orchestrate│ │- Prisma ORM │ │ │
│  │  │ - Validation   │  │  Saga        │ │- SQL queries│ │ │
│  │  │ - RESTful      │  │ - Factory    │ │- Transactions
│  │  │                │  │ - State      │ │              │ │ │
│  │  └────────────────┘  └──────────────┘ └─────────────┘ │ │
│  │                                                          │ │
│  │  Domain Layer (Business Logic)                          │ │
│  │  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐   │ │
│  │  │ Loan Entity  │ │LoanFactory   │ │ LoanState    │   │ │
│  │  │ - id         │ │- Laptop      │ │- Requested   │   │ │
│  │  │ - userId     │ │- Charger     │ │- Approved    │   │ │
│  │  │ - deviceId   │ │- KitFactory  │ │- Delivered   │   │ │
│  │  │ - state      │ │              │ │- Returned    │   │ │
│  │  └──────────────┘ └──────────────┘ └──────────────┘   │ │
│  │                                                          │ │
│  │  Infrastructure Layer                      ┌─────────┐  │ │
│  │                                            │Prisma   │  │ │
│  │                                            │Client   │  │ │
│  │                                            └────┬────┘  │ │
│  │                                                 │        │ │
│  │                                              CREATE      │ │
│  │                                              UPDATE      │ │
│  │                                              DELETE      │ │
│  └─────────────────────────────────────────────────────────┘ │
│         │                                  │                  │
│         │ RPC: get_device           RPC:   │                 │
│         │ update_device_status             │                 │
│         ▼                                  ▼                 │
│    Device Service              Loan Database (SQLite)        │
└──────────────────────────────────────────────────────────────┘
```

### 6.4 Diagrama de Entidad-Relación (Modelo de Datos)

```
┌─────────────────────────┐
│       Loan              │
├─────────────────────────┤
│ id (PK, UUID)           │
│ userId (FK)             │
│ deviceId (FK)           │
│ type (VARCHAR)          │
│ status (VARCHAR)        │◄────────────────┐
│ startDate (DATETIME)    │                 │
│ endDate (DATETIME)      │               STATES:
│ createdAt (DATETIME)    │              - REQUESTED
└─────────────────────────┘              - APPROVED
                                        - DELIVERED
┌─────────────────────────┐              - RETURNED
│      Device             │              - EXPIRED
├─────────────────────────┤─────────────┘
│ id (PK, UUID)           │
│ name (VARCHAR)          │
│ status (VARCHAR)        │◄────────────────┐
│ createdAt (DATETIME)    │                 │
└─────────────────────────┘              STATUS:
                                        - AVAILABLE
┌─────────────────────────┐              - LOANED
│       User              │              - MAINTENANCE
├─────────────────────────┤─────────────┘
│ id (PK, UUID)           │
│ name (VARCHAR)          │
│ email (VARCHAR, UNIQUE) │
│ createdAt (DATETIME)    │
└─────────────────────────┘

Relaciones:
- Loan.userId → User.id (M:1)
- Loan.deviceId → Device.id (M:1)
```

### 6.5 Diagrama de Flujo - Crear Préstamo (Saga)

```
ACTOR: Solicitante
REQUEST: POST /loans
{
  "userId": "user1",
  "deviceId": "device1",
  "type": "LAPTOP",
  "startDate": "2025-03-10",
  "endDate": "2025-03-20"
}

┌─────────────────────────────────────────────────────────────────┐
│ API Gateway (3000)                                              │
│  @Post('/loans')                                                │
│  - Valida DTO                                                   │
│  - Enruta a Loan Service                                        │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                  TCP RPC: create_loan
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│ Loan Service (3001) - LoansService.createLoan()                │
│                                                                  │
│ ┌─ SAGA ORCHESTRATOR ────────────────────────────────────────┐  │
│ │                                                              │  │
│ │ try {                                                        │  │
│ │   [STEP 1] RPC → Device Service: 'get_device'             │  │
│ │            ✓ device1 { status: AVAILABLE }                │  │
│ │                                                              │  │
│ │   [STEP 2] LOCAL: Create Loan                             │  │
│ │            ✓ Loan { id, status: REQUESTED }               │  │
│ │            loanCreated = true                              │  │
│ │                                                              │  │
│ │   [STEP 3] RPC → Device Service: 'update_device_status'   │  │
│ │            ✓ device1 { status: LOANED }                   │  │
│ │                                                              │  │
│ │   ✓ SUCCESS: Return { id, state: REQUESTED }              │  │
│ │                                                              │  │
│ │ } catch (error) {                                          │  │
│ │   // COMPENSATING TRANSACTIONS                            │  │
│ │                                                              │  │
│ │   ✗ IF loanCreated: DELETE from Loan DB                  │  │
│ │   ✗ RPC → Device Service: 'update_device_status'          │  │
│ │            device1 { status: AVAILABLE } [RESTORE]        │  │
│ │                                                              │  │
│ │   ✗ FAILURE: Throw error                                  │  │
│ │ }                                                            │  │
│ └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘

RESPONSE SUCCESS:
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "state": "REQUESTED"
}

RESPONSE ERROR (if device unavailable):
{
  "statusCode": 400,
  "message": "Dispositivo no disponible",
  "error": "BadRequestException"
}
↓ Rollback automático
```

### 6.6 Diagrama de Máquina de Estados

```
                    ┌──────────────────────────────────────┐
                    │                                      │
                    │   [REQUESTED]  ◄─ Initial State     │
                    │      │                                │
                    │      │ approve()                       │
                    │      ▼                                │
                    │   [APPROVED]                          │
                    │      │                                │
                    │      │ deliver()                       │
                    │      ▼                                │
                    │   [DELIVERED]                         │
                    │      │                                │
                    │      │ return()                        │
                    │      ▼                                │
                    │   [RETURNED]   ◄─ Final State        │
                    └──────────────────────────────────────┘

                    SPECIAL TRANSITIONS:
                    
                    Any State ──(if timeout)──► [EXPIRED]


Valid Transitions Table:
┌──────────┬──────────────────────────────────────┐
│ Current  │ Valid Next States                    │
├──────────┼──────────────────────────────────────┤
│REQUESTED │ APPROVED, EXPIRED                    │
│APPROVED  │ DELIVERED, EXPIRED                   │
│DELIVERED │ RETURNED, EXPIRED                    │
│RETURNED  │ (FINAL - no more transitions)        │
│EXPIRED   │ (FINAL - no more transitions)        │
└──────────┴──────────────────────────────────────┘
```

---

## 7. MAPEO DE RESPONSABILIDADES

### 7.1 Responsabilidades por Estudiante

#### **Estudiante 1: API Gateway Pattern**

**Patrón Asignado:** API Gateway  
**Componente:** `/backend/api-gateway`  
**Puerto:** 3000

**Responsabilidades:**

✓ Implementar punto de entrada HTTP único  
✓ Enrutar requests a servicios internos (TCP RPC)  
✓ Manejo básico de DTOs  
✓ Documentar endpoints expuestos  
✓ Testing de rutas HTTP  

**Archivos a entregar:**
- `api-gateway/src/app.controller.ts` - Rutas y lógica de enrutamiento
- `api-gateway/src/app.module.ts` - Configuración de ClientsModule
- `api-gateway/src/main.ts` - Entry point
- `api-gateway/README.md` - Documentación local

**Criterios de evaluación:**
- ✓ API Gateway correctamente configurado
- ✓ Rutas HTTP mapeadas a microservicios
- ✓ Manejo de errores en enrutamiento
- ✓ DTOs con validación (introducción)
- ✓ Testing básico de endpoints

---

#### **Estudiante 2: Database per Service Pattern**

**Patrón Asignado:** Database per Service  
**Componentes:** 
- `/backend/device-service/prisma/` (Device DB)
- `/backend/loan-service/prisma/` (Loan DB)

**Responsabilidades:**

✓ Diseñar esquema independiente para device-service  
✓ Diseñar esquema independiente para loan-service  
✓ Configurar Prisma en ambos servicios  
✓ Crear migraciones apropiadas  
✓ Documentar independencia de BDs  
✓ Asegurar consistencia eventual  

**Archivos a entregar:**
- `device-service/prisma/schema.prisma` - Esquema Device
- `loan-service/prisma/schema.prisma` - Esquema Loan
- Migraciones en ambas carpetas
- `DESIGN.md` - Documento justificando separación

**Criterios de evaluación:**
- ✓ Esquemas correctamente diseñados
- ✓ Sin referencias directas entre BDs
- ✓ Cada BD optimizada para su dominio
- ✓ Migraciones ejecutables
- ✓ Documentación de trade-offs

---

#### **Estudiante 3: Saga Pattern**

**Patrón Asignado:** Saga Pattern (Orchestrated)  
**Componente Principal:** `/backend/loan-service/src/modules/loans/loans.service.ts`

**Responsabilidades:**

✓ Implementar orquestación de Saga en createLoan  
✓ Compensating transactions para rollback  
✓ Manejo de errores en pasos distribuidos  
✓ Garantizar consistencia eventual  
✓ Documentar flujo de Saga  
✓ Testing de escenarios de fallo  

**Archivos a entregar:**
- `loan-service/src/modules/loans/loans.service.ts` - Saga implementation
- `loan-service/src/modules/loans/loans.controller.ts` - Endpoints
- `SAGA_PATTERN.md` - Documentación detallada
- Tests: `loans.service.spec.ts`

**Criterios de evaluación:**
- ✓ Saga correctamente orquestada
- ✓ Compensating transactions funcionales
- ✓ Rollback automático en errores
- ✓ Logs de transacciones distribuidas
- ✓ Manejo de timeouts y reintentos

---

### 7.2 Matriz de Responsabilidades

| Componente | Estudiante 1 | Estudiante 2 | Estudiante 3 | Porcentaje |
|-----------|-------------|-------------|-------------|-----------|
| API Gateway | **PRIMARY** | Support | - | 40% |
| Device Service BD | - | **PRIMARY** | - | 20% |
| Loan Service BD | - | **PRIMARY** | - | 15% |
| Saga Implementation | - | - | **PRIMARY** | 40% |
| Documentation | 25% | 25% | 25% | 25% |
| Testing | 33.3% | 33.3% | 33.3% | 33.3% |

---

### 7.3 Checklist de Entrega

**Estudiante 1 (API Gateway):**
- [ ] API Gateway escucha en puerto 3000
- [ ] Rutas POST /loans redirigen a Loan Service
- [ ] Error handling consistente
- [ ] README con instrucciones de inicio
- [ ] 3+ test cases en app.controller.spec.ts

**Estudiante 2 (Database per Service):**
- [ ] device-service tiene su propia BD SQLite
- [ ] loan-service tiene su propia BD SQLite
- [ ] Prisma correctamente configurado en ambas
- [ ] Migraciones ejecutables
- [ ] Documento explicando independencia

**Estudiante 3 (Saga):**
- [ ] createLoan implementa Saga con pasos ordenados
- [ ] Compensating transactions reviertan cambios en error
- [ ] Device y Loan permanecen consistentes
- [ ] Logs de cada paso de Saga
- [ ] 5+ test cases cubriendo escenarios de fallo

---

## 8. SIGUIENTE PASOS (Entrega 2)

1. **Completar Documentación faltante:**
   - Diagramas vistos (PNG/SVG)
   - Prototipos UI en Figma
   - Presentación PowerPoint

2. **Implementar completamente el código:**
   - Completar UserService
   - Agregar autenticación
   - Tests e2e cubre todos flujos

3. **Mejoras arquitectónicas propuestas:**
   - Event sourcing para auditoria
   - Circuit breaker para resiliencia
   - Logging centralizado
   - Caching en API gateway

4. **Documentación final:**
   - ADR (Architecture Decision Records)
   - Runbook de deployment
   - Guía de troubleshooting

---

**Fecha de entrega:** [Según calendario del curso]  
**Autor:** Grupo 1 - Préstamos de Dispositivos  
**Fecha de documento:** 3 de Abril de 2026
