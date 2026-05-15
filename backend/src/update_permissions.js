const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function updatePermissions() {
  const newPermissions = [
    "ORGANISASI_VIEW",
    "SEKRETARIAT_VIEW",
    "SDM_VIEW",
    "LITBANG_VIEW",
    "KEUANGAN_ANGGARAN_VIEW",
    "LEGAL_VIEW",
    "AKADEMIK_ADMIN_VIEW",
    "SPMB_LITERASI_VIEW",
    "MANAJEMEN_ADMIN"
  ];

  const users = await prisma.user.findMany({
    where: { role: 'ADMIN_PUSAT' }
  });

  for (const user of users) {
    const existingPerms = user.permissions || [];
    const mergedPerms = [...new Set([...existingPerms, ...newPermissions])];

    await prisma.user.update({
      where: { id: user.id },
      data: { permissions: mergedPerms }
    });

    console.log(`Updated permissions for ${user.email}`);
  }
}

updatePermissions()
  .then(() => console.log("Done updating permissions!"))
  .catch(console.error)
  .finally(() => prisma.$disconnect());
