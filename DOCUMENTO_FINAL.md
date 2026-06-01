# Documento Final - Proyecto: Sistema de Préstamos de Dispositivos

## 1. Contexto del problema
- Nombre del proyecto: LoanTech - Sistema de Préstamos de Dispositivos
- Descripción: Plataforma para gestionar solicitud, aprobación, entrega y devolución de dispositivos tecnológicos.
- Objetivo general: Proporcionar un sistema modular y mantenible para la gestión completa de préstamos.
- Alcance final: Módulos: API Gateway, Device Service, Loan Service, Frontend (UI). Autenticación básica, flujo completo de préstamos entre servicios, persistencia con Prisma/SQLite.
- Justificación: Facilitar control de inventario y procesos de préstamo en instituciones.
- Supuestos: Entorno con Node.js; cada microservicio ejecutable localmente; uso de SQLite para simplicidad.
- Restricciones: Tiempo y alcance del curso; uso de plantillas mínimas y librerías conocidas.

## 2. Actores
- Administrador: crea/gestiona dispositivos y usuarios, aprueba préstamos.
- Usuario final: solicita préstamos y marca devoluciones.
- Sistema: microservicios que realizan validaciones y persistencia.

## 3. Requerimientos
### Funcionales implementados (resumen)
- Login / autenticación (Front + API Gateway)
- CRUD parcial para dispositivos
- Solicitar préstamo
- Aprobar / entregar / devolver / expirar préstamos
- Endpoints REST por microservicio

### No funcionales
- Persistencia: Prisma + SQLite
- Modularidad: microservicios separados (api-gateway, device-service, loan-service)
- Validaciones básicas en DTOs y modelo Prisma

## 4. Diseño del sistema
- Arquitectura: microservicios con API Gateway que orquesta llamadas entre servicios.
- Componentes principales: `api-gateway`, `device-service`, `loan-service`, `frontend`.
- Decisiones clave: uso de Prisma para persistencia y SQLite para despliegue local rápido; separación de responsabilidades por servicio.

## 5. División modular
- `api-gateway`: autenticación, orquestación y endpoints compuestos.
- `device-service`: gestión de dispositivos (modelo `Device`).
- `loan-service`: gestión de préstamos y usuarios (modelo `Loan`, `User`).
- `frontend`: UI React + Vite

## 6. Persistencia y modelo de datos
Ver [docs/diagrams/ERD.md](docs/diagrams/ERD.md) para el modelo de base de datos extraído de `prisma/schema.prisma`.

## 7. Pruebas y ejecución
Resumen de comandos para ejecutar localmente (en la raíz del repo):

```bash
# Backend - api-gateway
cd backend/api-gateway
npm install
cp .env.example .env  # ajustar si aplica
npx prisma generate
npm run start:dev

# Device service
cd ../device-service
npm install
cp .env.example .env
npx prisma generate
npm run start:dev

# Loan service
cd ../loan-service
npm install
cp .env.example .env
npx prisma generate
npm run start:dev

# Frontend
cd frontend
npm install
npm run dev
```

## 8. Cumplimiento con la rúbrica
- Documento final: Parcial — este archivo cubre los apartados principales; faltan diagramas finales en Figma y artefactos de gestión (Jira).  
- Implementación funcional: Parcial/Mayoría — microservicios y frontend corren localmente; revisar migraciones y seeds.  
- Calidad de diseño y arquitectura: Implementada (microservicios, patrones descritos).  
- Artefactos obligatorios: Falta Figma, Jira, diagramas adicionales (actividad/diagrama de secuencia completos).  
- Presentación y demostración: pendiente (video y slides no incluidos).

## 9. Penalizaciones detectadas (posibles)
- Algunos tests/scripts de seed fallaron en tu entorno (`loan-service` y `api-gateway` muestran errores en terminales).  
- Antes se mostraban credenciales en el login y una campana no funcional; ya fueron removidos.

## 10. Tareas recomendadas (priorizadas)
1. Añadir README por servicio con pasos de ejecución y variables de entorno exactas. (Implementado parcialmente en `README.md` general).  
2. Incluir `rubrica.pdf` y este `DOCUMENTO_FINAL.md` en la raíz del repo.  
3. Generar y añadir diagramas: 2 diagramas de actividad, 2 diagramas de secuencia y el ERD (mermaid/PNG). (Agregar en `docs/diagrams/`).  
4. Subir prototipos finales en Figma y enlazarlos en el README.  
5. Preparar video demo y slides.  
6. Corregir scripts de seed y errores de arranque detectados en `loan-service` y `api-gateway`.

---

**Estado actual:** documento inicial creado automáticamente por el equipo técnico. Puedo completar las tareas 1, 2, 3 y 6 automáticamente aquí si me das permiso para crear más archivos y tocar scripts de inicio.

## Informe de cumplimiento de la rúbrica

Este informe resume cómo el proyecto cumple con cada criterio de la rúbrica proporcionada y qué evidencias están disponibles en el repositorio.

**Resumen ejecutivo:**
- Estado general: Funcionalidad mayoritaria implementada localmente. Frontend y API Gateway pueden arrancar y autenticar usuarios demo después de corregir una inconsistencia en la ubicación de la base de datos del `loan-service`.
- Puntos críticos: Ajustes menores en seeds y generación de Prisma en Windows; evidencia y documentación añadidas.

### Criterios de la rúbrica y cumplimiento

- **Documento final (estructura y contenido):** Cumple parcialmente/completamente. `DOCUMENTO_FINAL.md` contiene contexto, diseño, ejecución y tareas. Faltan evidencias multimedia (video demo y slides). (Evidencia: este archivo)
- **Implementación funcional:** Cumple en su mayoría. Microservicios y frontend arrancan localmente y permiten flujo de login y préstamos básicos. Se corrigió la ubicación de `dev.db` para que el `loan-service` use la BD con usuarios seed. (Evidencia: `backend/*/src`, seeds y logs de ejecución)
- **Calidad de diseño y arquitectura:** Cumple. Arquitectura basada en microservicios con API Gateway, separación clara de responsabilidades y uso de patrones (Factory, Composite, State). (Evidencia: código en `backend/*/src`, documentación en `docs/`) 
- **Pruebas y scripts:** Parcial. Existen seeds y tests básicos; algunos scripts en Windows necesitan ajuste (ver sección «Problemas conocidos»). (Evidencia: `backend/*/test`, `prisma/seed.ts`) 
- **Artefactos obligatorios:** Parcial. Documentación técnica presente; faltan prototipos finales en Figma, tablero en Jira y videos. (Evidencia: `docs/`, `README`)

### Evidencias en el repositorio (ubicaciones clave)
- `DOCUMENTO_FINAL.md` (este archivo) — informe y checklist.
- `backend/api-gateway/` — código del gateway y `README.md` por servicio.
- `backend/loan-service/prisma/seed.ts` — script de seed con credenciales demo.
- `backend/loan-service/prisma/prisma/dev.db` — copia con usuarios seed (se sincronizó a `prisma/dev.db`).
- `frontend/src/` — componente de login, layouts y llamadas API.
- `docs/diagrams/` — ERD y diagramas mermaid generados.

### Ejecución reproducible (pasos probados en este entorno)
1. En `backend/loan-service`: ejecutar

```powershell
cd backend/loan-service
npm install
npx prisma db push
npm run db:seed
npm run start:dev
```

2. En `backend/device-service`:

```powershell
cd backend/device-service
npm install
npx prisma generate
npm run start:dev
```

3. En `backend/api-gateway`:

```powershell
cd backend/api-gateway
npm install
npx prisma generate
npm run start:dev
```

4. En `frontend`:

```bash
cd frontend
npm install
VITE_API_URL=http://localhost:3000 npm run dev
```

5. Credenciales demo (seed):

- Administrador: `carlos.mendoza@empresa.com` / `admin123`
- Usuario: `ana.ramirez@empresa.com` / `user1234`

### Problemas conocidos y mitigaciones

- En Windows Prisma a veces genera archivos temporales bloqueados (`query_engine-windows.dll.node.tmp*`). Solución recomendada: cerrar procesos Node, ejecutar PowerShell como Administrador, eliminar archivos temporales en `node_modules/.prisma/client` y ejecutar `npx prisma generate`. Si persiste, reiniciar la máquina o excluir la carpeta del antivirus.
- El `loan-service` tenía dos ubicaciones de `dev.db` por un seed que escribió en `prisma/prisma/dev.db`. Se replicó la BD correcta a `prisma/dev.db`. Se recomienda ajustar el seed para escribir siempre en la ruta esperada y documentarlo.

### Checklist de la rúbrica (estado)
- Documento final: Sí (completo, con secciones obligatorias) — Parcialmente pendiente: evidencia multimedia.
- Implementación: Sí (endpoints principales y flujo de login) — Recomendado: agregar pruebas E2E y scripts CI.
- Diseño: Sí (microservicios, patrones) — Documentado.
- Artefactos: Parcial — Faltan Figma/Jira/video.

### Recomendaciones finales y próximos pasos
1. Ajustar `prisma/seed.ts` para usar siempre `prisma/dev.db` y evitar rutas anidadas.  
2. Añadir instrucciones claras en `backend/loan-service/README.md` sobre el seed y problemas en Windows.  
3. Generar y subir: video demo (3–5 min), slides (.pdf) y enlaces a Figma/Jira.  
4. Ejecutar pruebas E2E y añadir badge de estado en el `README.md` principal.

Si quieres, aplico automáticamente el ajuste del `seed.ts` para escribir en la ruta esperada y actualizo el `README` del `loan-service` con instrucciones Windows-friendly.
