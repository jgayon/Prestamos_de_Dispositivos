const { PrismaClient } = require('@prisma/client');
const path = require('path');
(async () => {
  try {
    process.env.DATABASE_URL = `file:${path.resolve('prisma','dev.db').replace(/\\/g,'/')}`;
    console.log('DATABASE_URL=', process.env.DATABASE_URL);
    const p = new PrismaClient();
    const devices = await p.device.findMany();
    console.log('FOUND', devices.length);
    await p.$disconnect();
  } catch (e) {
    console.error('ERR', e);
    process.exit(1);
  }
})();