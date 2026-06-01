# API Gateway

This service is the entry point of the system and orchestrates calls to the `loan-service` and `device-service` microservices.

## What it does
- Receives requests from the frontend.
- Authenticates users.
- Forwards loan and user operations.
- Exposes REST endpoints used by the web UI.

## Requirements
- Node.js 20+.
- Run `npm install` in this directory.
- Start `device-service` and `loan-service` before the gateway.

## Environment variables
Create a `.env` file from `.env.example`.

```env
GATEWAY_PORT=3000
JWT_SECRET=super-secret-key-change-in-production
LOAN_SERVICE_HOST=localhost
LOAN_SERVICE_PORT=3011
DEVICE_SERVICE_HOST=localhost
DEVICE_SERVICE_PORT=3002
```

## Installation

```bash
cd backend/api-gateway
npm install
```

## Run

```bash
npm run start:dev
```

The service will listen on `http://localhost:3000`.

## Startup order
1. `backend/device-service`
2. `backend/loan-service`
3. `backend/api-gateway`

## Main endpoints
- `POST /auth/login`
- `POST /loans`
- `GET /loans`
- `PATCH /loans/:id/approve`
- `PATCH /loans/:id/deliver`
- `PATCH /loans/:id/return`
- `GET /users`

## Notes
- If the gateway fails to start, check that `loan-service` and `device-service` are running on the configured ports.
- Replace `JWT_SECRET` before using the project in a real environment.
