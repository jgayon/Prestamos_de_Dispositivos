const { PrismaClient } = require('@prisma/client');

(async () => {
  try {
    const p = new PrismaClient();
    const users = await p.user.findMany();
    console.log('FOUND', users.length);
    console.log(users);
    await p.$disconnect();
  } catch (e) {
    console.error('ERR', e);
    process.exit(1);
  }
})();