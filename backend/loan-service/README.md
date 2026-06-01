# Loan Service

This microservice manages loans, users, and the lifecycle state of each loan.

## What it does
- Persists `Loan` and `User` in SQLite via Prisma.
- Creates demo users with `npm run db:seed`.
- Exposes RPC for the `api-gateway`.

## Environment variables
Create a `.env` file from `.env.example`.

```env
DATABASE_URL=file:./prisma/dev.db
LOAN_SERVICE_HOST=0.0.0.0
LOAN_SERVICE_PORT=3001
LOAN_SERVICE_RPC_PORT=3011
CORS_ORIGIN=*
```

## Installation

```bash
cd backend/loan-service
npm install
```

## Prepare the database

```bash
npx prisma generate
npx prisma db push
npm run db:seed
```

> `npm run db:seed` now ensures the database schema is present before seeding.

## Run

```bash
npm run start:dev
```

The service will listen on `http://localhost:3001` and RPC TCP on port `3011`.

## Responsibilities
- Manages loans: `POST /loans`, `PATCH /loans/:id/approve`, `PATCH /loans/:id/deliver`, `PATCH /loans/:id/return`.
- Stores users and answers the gateway.
- Communicates with `device-service` via microservices.

## Notes
- If seed fails, run `npx prisma db push` first.
- Demo users are `carlos.mendoza@empresa.com` and `ana.ramirez@empresa.com`.
