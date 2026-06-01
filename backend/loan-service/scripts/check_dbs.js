const { PrismaClient } = require('@prisma/client');
const paths = [
  'file:C:/Users/AlanP/Documents/Prestamos_de_Dispositivos/backend/device-service/dev.db',
  'file:C:/Users/AlanP/Documents/Prestamos_de_Dispositivos/backend/device-service/prisma/dev.db',
  'file:C:/Users/AlanP/Documents/Prestamos_de_Dispositivos/backend/loan-service/prisma/dev.db',
  'file:C:/Users/AlanP/Documents/Prestamos_de_Dispositivos/backend/loan-service/prisma/prisma/dev.db'
];

(async()=>{
  for (const url of paths) {
    process.env.DATABASE_URL = url;
    try {
      const p = new PrismaClient();
      const users = await p.user.findMany();
      console.log(url, '->', users.length);
      await p.$disconnect();
    } catch (e) {
      console.log(url, '-> ERR', e.message || e);
    }
  }
})();