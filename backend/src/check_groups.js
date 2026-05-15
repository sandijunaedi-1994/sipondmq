const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkGroups() {
  const groups = await prisma.adminGroup.findMany();
  console.log(JSON.stringify(groups, null, 2));
}

checkGroups().catch(console.error).finally(() => prisma.$disconnect());
