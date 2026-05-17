const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const superAdmins = await prisma.user.findMany({
      where: {
        permissions: { array_contains: 'MANAJEMEN_ADMIN' }
      }
    });
    console.log('Success:', superAdmins.length);
  } catch (e) {
    console.error('Error:', e);
  } finally {
    await prisma.$disconnect();
  }
}
main();
