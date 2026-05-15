const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkUsers() {
  const users = await prisma.user.findMany({
    where: { role: 'ADMIN_PUSAT' },
    select: { email: true, permissions: true, namaLengkap: true }
  });
  console.log(JSON.stringify(users, null, 2));
}

checkUsers().catch(console.error).finally(() => prisma.$disconnect());
