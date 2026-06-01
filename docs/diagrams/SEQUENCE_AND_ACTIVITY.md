# Diagramas requeridos (plantillas)

## Secuencia: Solicitud de préstamo
```mermaid
sequenceDiagram
    participant Frontend
    participant APIGateway
    participant LoanService
    participant DeviceService

    Frontend->>APIGateway: POST /loans (userId, deviceId, dates)
    APIGateway->>LoanService: POST /loans
    LoanService->>DeviceService: GET /devices/:id (verificar disponibilidad)
    DeviceService-->>LoanService: 200 AVAILABLE
    LoanService-->>APIGateway: 201 created (loan id)
    APIGateway-->>Frontend: 201 OK
```

## Secuencia: Aprobar préstamo
```mermaid
sequenceDiagram
    participant Admin
    participant APIGateway
    participant LoanService

    Admin->>APIGateway: PATCH /loans/:id/approve
    APIGateway->>LoanService: PATCH /:id/approve
    LoanService-->>APIGateway: 200 OK (status=APPROVED)
    APIGateway-->>Admin: 200 OK
```

## Actividad: Flujo de préstamo (simplificado)
```mermaid
flowchart TD
  A[Solicitud recibida] --> B{Disponible?}
  B -- Si --> C[Crear préstamo REQUESTED]
  C --> D[Aprobación admin]
  D -- Aprobado --> E[Entregar dispositivo]
  E --> F[Devolver dispositivo]
  D -- Rechazado --> G[Marcar REJECTED]
  B -- No --> H[Notificar no disponible]
```

## Actividad: Manejo de autenticación (simplificado)
```mermaid
flowchart TD
  L[Usuario ingresa credenciales] --> M[API Gateway /auth/login]
  M --> N{Credenciales válidas}
  N -- Si --> O[Emitir token y redirigir]
  N -- No --> P[Mostrar error]
```


> Estos diagramas están como mermaid y pueden exportarse a PNG para la entrega. Puedes pedir que genere imágenes o archivos SVG si lo deseas.
