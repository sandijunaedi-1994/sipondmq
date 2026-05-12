const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.markaz.findMany().then(console.log).finally(() => prisma.$disconnect());
