@echo off
cd /d %~dp0
set DATABASE_URL=file:C:\Users\AlanP\Documents\Prestamos_de_Dispositivos\backend\loan-service\prisma\dev.db
echo Running on %CD%
npx prisma db push --schema prisma/schema.prisma
