const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  try {
    const res = await prisma.user.findMany({
      where: { role: { notIn: ['WALI_SANTRI', 'CALON_WALI'] } }
    });
    console.log("Success! Users found:", res.length);
  } catch (e) {
    console.error("Prisma Error:", e.message);
  } finally {
    await prisma.$disconnect();
  }
}
main();
