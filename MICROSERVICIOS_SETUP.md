# 🚀 MICROSERVICIOS - Sistema de Préstamos de Dispositivos

## Arquitectura

```
┌─────────────────────┐
│   API Gateway       │  (Puerto 3000)
│   HTTP REST API     │
└──────────┬──────────┘
           │
    ┌──────┴──────┐
    │             │
    ▼             ▼
┌──────────┐  ┌──────────────┐
│  Loan    │  │    Device    │
│ Service  │  │   Service    │
│ (3001)   │  │   (3002)     │
└──┬───────┘  └──────────────┘
   │
   ▼
┌──────────┐
│ Loan DB  │  (SQLite)
└──────────┘
```

## 🔧 Configuración de Microservicios

### Puertos Utilizados

| Servicio | Tipo | Puerto | Descripción |
|----------|------|--------|-------------|
| **API Gateway** | HTTP | 3000 | Punto de entrada único |
| **Loan Service** | HTTP | 3001 | Gestión de préstamos (HTTP) |
| **Loan Service** | TCP/RPC | 3011 | Comunicación inter-servicios |
| **Device Service** | TCP/RPC | 3002 | Gestión de dispositivos |

### Variables de Entorno

```bash
# Top-level .env
GATEWAY_PORT=3000
LOAN_SERVICE_HOST=localhost
LOAN_SERVICE_PORT=3001
LOAN_SERVICE_RPC_PORT=3011
DEVICE_SERVICE_HOST=localhost
DEVICE_SERVICE_PORT=3002
NODE_ENV=development
```

## ⚡ Instalación y Ejecución

### Opción 1: Ejecución Local (Recomendado para desarrollo)

```bash
# 1. Instalar dependencias en cada servicio
cd backend/api-gateway
npm install

cd ../device-service
npm install

cd ../loan-service
npm install

# 2. Ejecutar cada servicio en terminal separada

# Terminal 1: Device Service (dependencia)
cd backend/device-service
npm run start:dev

# Terminal 2: Loan Service
cd backend/loan-service
npm run start:dev

# Terminal 3: API Gateway
cd backend/api-gateway
npm run start:dev
```

**Verificar que están corriendo:**
```bash
# API Gateway HTTP
curl http://localhost:3000

# Device Service TCP (debe estar escuchando)
netstat -an | grep 3002

# Loan Service HTTP
curl http://localhost:3001
```

### Opción 2: Docker Compose (Recomendado para producción/CI/CD)

```bash
# 1. Crear archivos Dockerfile en cada servicio (ver abajo)

# 2. Ejecutar con Docker Compose
docker-compose up -d

# 3. Ver logs
docker-compose logs -f

# 4. Detener
docker-compose down
```

## 🐳 Dockerfile Plantilla

Crear `backend/api-gateway/Dockerfile`:

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "start:prod"]
```

Repetir para `device-service` y `loan-service` (cambiar puerto en ENV).

## 📡 Flujo de Comunicación

### Crear un Préstamo (Ejemplo)

```
1. Cliente HTTP
   POST http://localhost:3000/loans
   {
     "userId": "user1",
     "deviceId": "device1",
     "type": "LAPTOP",
     "startDate": "2025-03-10",
     "endDate": "2025-03-20"
   }

2. API Gateway (3000)
   - Recibe request HTTP
   - Enruta a Loan Service via TCP

3. Loan Service (3001+3011)
   - Orchestration: Saga Pattern
   - PASO 1: RPC call → Device Service: get_device(device1)
   - PASO 2: Local: Crear Loan en BD
   - PASO 3: RPC call → Device Service: reserve_device(device1)
   - Si éxito: return {id, state: REQUESTED}
   - Si error: Compensating transactions (rollback)

4. Device Service (3002)
   - Escucha RPC messages
   - @MessagePattern('get_device')
   - @MessagePattern('reserve_device')
   - @MessagePattern('unreserve_device')
```

## 🧪 Pruebas

### POST - Crear Préstamo

```bash
curl -X POST http://localhost:3000/loans \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user1",
    "deviceId": "device1",
    "type": "LAPTOP",
    "startDate": "2025-03-10",
    "endDate": "2025-03-20"
  }'
```

**Respuesta esperada:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "state": "REQUESTED"
}
```

### GET - Listar Préstamos

```bash
curl http://localhost:3000/loans?status=REQUESTED
```

### GET - Obtener Detalle

```bash
curl http://localhost:3000/loans/550e8400-e29b-41d4-a716-446655440000
```

## 🔍 Diagnóstico

### Verificar que los servicios estén corriendo

```bash
# Comprobar puertos abiertos (Windows)
netstat -ano | findstr "3000\|3001\|3002\|3011"

# Comprobar puertos abiertos (Mac/Linux)
lsof -i :3000
lsof -i :3001
lsof -i :3002
lsof -i :3011

# Probar conectividad HTTP
curl -v http://localhost:3000/

# Probar conectividad TCP (si está en imagen)
nc -zv localhost 3002
```

### Logs de Debug

```bash
# Con NODE_ENV=development, verás logs detallados:
# - "API Gateway is running on port 3000"
# - "Loan Service HTTP listening on port 3001"
# - "Device Service listening on port 3002"

# Para MORE debug, agregar en main.ts:
console.log('Service running on:', process.env.XXX_PORT);
```

## ⚠️ Problemas Comunes

### Error: "EADDRINUSE: address already in use"
```bash
# Puerto ya está en uso
# Windows: netstat -ano | findstr :3001
# Mac: lsof -i :3001
# Mata el proceso: kill -9 <PID>
```

### Device Service no responde
```bash
# Asegúrate de que esté corriendo 
# Verifica puerto 3002 está escuchando
# Revisa que sea microservicio TCP (no HTTP)
```

### Loan Service no llama a Device Service
```bash
# Verifica ClientsModule en app.module.ts
# Verifica DEVICE_SERVICE_HOST y DEVICE_SERVICE_PORT
# En Docker: host='device-service' (nombre del servicio, no localhost)
```

## 📚 Referencias

- [NestJS Microservices](https://docs.nestjs.com/microservices/basics)
- [NestJS ClientsModule](https://docs.nestjs.com/microservices/client)
- [TCP Transport](https://docs.nestjs.com/microservices/transports)

---

**Estado:** ✅ Microservicios configurados correctamente  
**Próximo paso:** Ejecutar con `npm run start:dev` en cada terminal
