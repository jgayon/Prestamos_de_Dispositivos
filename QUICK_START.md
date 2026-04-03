# ⚡ QUICK START - Microservicios

## 🚀 Ejecutar en 3 Pasos

### Paso 1: Instalar dependencias

```bash
# Backend
cd backend/api-gateway && npm install
cd ../device-service && npm install
cd ../loan-service && npm install
cd ../../
```

### Paso 2: Abrir 3 terminales (PowerShell en Windows)

**Terminal 1 - Device Service (Dependencia 1):**
```bash
cd backend/device-service
npm run start:dev
```

Espera a ver:
```
✅ Device Service (Microservice) listening on port 3002
📡 Transport: TCP
```

**Terminal 2 - Loan Service (Dependencia 2):**
```bash
cd backend/loan-service
npm run start:dev
```

Espera a ver:
```
🚀 Loan Service HTTP listening on port 3001
🚀 Loan Service RPC (TCP) listening on port 3011
```

**Terminal 3 - API Gateway (Main Entry Point):**
```bash
cd backend/api-gateway
npm run start:dev
```

Espera a ver:
```
✅ API Gateway is running on http://localhost:3000
🔗 Connected to Loan Service at localhost:3001
🔗 Connected to Device Service at localhost:3002
```

### Paso 3: Probar

```bash
# Crear préstamo
curl -X POST http://localhost:3000/loans \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user1",
    "deviceId": "device1",
    "type": "LAPTOP",
    "startDate": "2025-03-10",
    "endDate": "2025-03-20"
  }'

# Listar préstamos
curl http://localhost:3000/loans
```

---

## 🐳 Alternativa: Docker Compose (Una línea)

```bash
# Builds + starts everything
docker-compose up

# En otra terminal para logs
docker-compose logs -f
```

---

## ✅ Verificación

Si ves estos mensajes **en orden**, ¡está TODO correcto!

```
✅ Device Service (Microservice) listening on port 3002 ← Inicia primero
🚀 Loan Service HTTP listening on port 3001 ← Segundo
🚀 Loan Service RPC (TCP) listening on port 3011
✅ API Gateway is running on http://localhost:3000 ← Último (todo conectado)
🔗 Connected to Loan Service at localhost:3001
🔗 Connected to Device Service at localhost:3002
```

---

## 🐛 Si algo falla

```bash
# Revisar puertos (Windows)
netstat -ano | findstr "3000\|3001\|3002\|3011"

# Matar proceso en puerto (si está ocupado)
netsh interface ipv4 show excludedportrange protocol=tcp

# Reinstalar (si es necesidad)
rm -r node_modules package-lock.json
npm install
```

---

## 📊 Arquitectura de Referencia

```
         User
          │
          ▼ HTTP POST /loans
    ┌─────────────────┐
    │ API Gateway     │ (3000)
    │ Point of entry  │◄─── Enruta a Loan Service
    └────────┬────────┘
             │
       TCP RPC (3001)
             │
             ▼
    ┌─────────────────┐
    │ Loan Service    │ (3001 HTTP + 3011 RPC)
    │ Orchestrator    │◄─── Llama a Device Service
    └────────┬────────┘
             │
       TCP RPC (3002)
             │
             ▼
    ┌─────────────────┐
    │ Device Service  │ (3002 TCP)
    │ Microservice    │◄─── Responde con datos
    └─────────────────┘
```

---

**Si todo funciona, ¡estás listo para desarrollar!** 🎉
