# Sistema de Préstamos de Dispositivos

## Descripción del Proyecto

Este proyecto implementa una **API backend para la gestión de préstamos de dispositivos** utilizando **NestJS** y **Prisma ORM**.  

El sistema permite gestionar el ciclo de vida de un préstamo, desde su solicitud hasta su devolución o expiración, aplicando **patrones de diseño para estructurar la lógica de negocio de manera modular y escalable**.

El objetivo principal es demostrar la aplicación práctica de patrones de diseño dentro de una arquitectura backend moderna.

---

# Tecnologías Utilizadas

- **Node.js**
- **NestJS**
- **TypeScript**
- **Prisma ORM**
- **PostgreSQL / SQLite**
- **Thunder Client / Postman** para pruebas de API

---

# Patrones de Diseño Implementados

El sistema utiliza varios patrones de diseño para separar responsabilidades y mejorar la mantenibilidad del código.

## 1. State Pattern

Se utiliza para representar los distintos **estados de un préstamo**.

Estados posibles:

- `REQUESTED`
- `APPROVED`
- `DELIVERED`
- `RETURNED`
- `EXPIRED`

Cada estado define qué transiciones son válidas dentro del ciclo de vida del préstamo.

---

## 2. Factory Method

Se utiliza para **crear diferentes tipos de préstamos** según el dispositivo solicitado.

Tipos soportados:

- Laptop
- Charger
- Kit

Cada tipo tiene su propia fábrica encargada de crear el objeto correspondiente.

---

## 3. Repository Pattern

Se utiliza para **separar la lógica de acceso a datos** de la lógica de negocio.

Esto permite:

- desacoplar la base de datos del dominio
- facilitar cambios futuros en la persistencia
- mejorar la mantenibilidad del sistema

---

# Arquitectura del Proyecto

El proyecto sigue una arquitectura modular basada en **NestJS**.

src
│
├── modules
│ └── loans
│ ├── domain
│ │ ├── entities
│ │ ├── states
│ │ └── factory
│ │
│ ├── infrastructure
│ │ └── prisma
│ │
│ ├── dto
│ │
│ ├── loans.controller.ts
│ ├── loans.service.ts
│ └── loans.module.ts
│
├── prisma
│ └── schema.prisma
│
└── main.ts


# Modelo de Base de Datos

El sistema utiliza **Prisma ORM** para la gestión de la base de datos.

Modelo principal:

```prisma
model Loan {
  id        String   @id @default(uuid())
  userId    String
  bookId    String
  type      String
  status    String
  createdAt DateTime @default(now())
}
```
# Instalación del Proyecto

1. Clonar el repositorio

git clone <repo-url>
cd backend

2. Instalar dependencias

npm install

3. Configurar Prisma

npx prisma generate

4. Ejecutar migraciones

npx prisma migrate dev

5. Iniciar el servidor

npm run start:dev

El servidor iniciará en:

http://localhost:3000

# Endpoints de la API

## Crear préstamo

POST /loans

Body:
{
  "userId": "user1",
  "bookId": "device1",
  "type": "LAPTOP"
}

Respuesta:

{
  "id": "uuid",
  "state": "REQUESTED"
}
## Listar préstamos

GET /loans

Respuesta:
[
  {
    "id": "uuid",
    "state": "REQUESTED"
  }
]

## Aprobar préstamo

PATCH /loans/:id/approve

## Entregar dispositivo

PATCH /loans/:id/deliver
## Devolver dispositivo

PATCH /loans/:id/return
## Expirar préstamo

PATCH /loans/:id/expire

# Flujo del Préstamo

El flujo del préstamo sigue el siguiente ciclo:

REQUESTED
   ↓
APPROVED
   ↓
DELIVERED
   ↓
RETURNED

También existe la posibilidad de que un préstamo pase a:

EXPIRED

si no se completa dentro del tiempo establecido.

# Pruebas de la API

Las pruebas de los endpoints pueden realizarse utilizando:

 - Thunder Client (VS Code)

 - Postman

 - Curl

## Ejemplo de prueba:

1. Crear préstamo

2. Listar préstamos

3. Aprobar préstamo

4. Entregar dispositivo

5. Devolver dispositivo

# Posibles Mejoras Futuras

- Autenticación de usuarios

- Control de inventario de dispositivos

- Historial de préstamos

- Notificaciones de expiración

- Integración con frontend