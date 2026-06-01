# Device Service

This service manages device inventory and responds to requests from the `api-gateway`.

## What it does
- Persists `Device` in SQLite with Prisma.
- Exposes endpoints to query and update device status.
- Communicates with the gateway via TCP microservices.

## Environment variables
Create a `.env` file from `.env.example`.

```env
DATABASE_URL=file:./prisma/dev.db
DEVICE_SERVICE_HTTP_PORT=3100
DEVICE_SERVICE_PORT=3002
DEVICE_SERVICE_HOST=0.0.0.0
CORS_ORIGIN=*
```

## Installation

```bash
cd backend/device-service
npm install
```

## Prepare the database

```bash
npx prisma generate
npx prisma db push
```

## Run

```bash
npm run start:dev
```

The service will listen on HTTP `http://localhost:3100` and TCP RPC port `3002`.

## Notes
- If `DATABASE_URL` is not set, the service defaults to `prisma/dev.db`.
- The `api-gateway` expects this service at `localhost:3002`.
