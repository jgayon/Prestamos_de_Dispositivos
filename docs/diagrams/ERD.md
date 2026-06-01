# ERD - Modelo de Datos (extraído de Prisma)

```mermaid
erDiagram
    USER {
        String id PK "uuid"
        String name
        String email
        String password
        String role
        DateTime createdAt
    }
    DEVICE {
        String id PK "uuid"
        String name
        String status
        DateTime createdAt
    }
    LOAN {
        String id PK "uuid"
        String userId FK
        String deviceId FK
        String type
        String status
        DateTime startDate
        DateTime endDate
        DateTime createdAt
        DateTime updatedAt
    }

    USER ||--o{ LOAN : "makes"
    DEVICE ||--o{ LOAN : "is_assigned_to"
```

## Notas
- `User` y `Device` están en servicios distintos (loan-service y device-service respectivamente). Se hace referencia por `id` entre servicios.
- Indexes y validaciones están definidas en los `schema.prisma` de cada servicio.
