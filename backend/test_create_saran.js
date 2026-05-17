const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    // get a valid user
    const user = await prisma.user.findFirst();
    
    // Simulate createSaran payload
    const subjek = "Test Subjek";
    const isiSaran = "Test Saran";
    const targetType = "SUPERADMIN";
    
    const saran = await prisma.saranOnline.create({
      data: {
        subjek,
        isiSaran,
        targetType,
        targetUnitId: null,
        pengirimId: user.id,
        status: 'TERKIRIM'
      }
    });

    console.log("Saran created:", saran);
    
    const superAdmins = await prisma.user.findMany({
      where: {
        permissions: { array_contains: 'MANAJEMEN_ADMIN' }
      }
    });
    const targetUserIds = superAdmins.map(u => u.id);
    
    if (targetUserIds.length > 0) {
      const pengirim = await prisma.pegawai.findUnique({
        where: { userId: user.id },
        select: { namaLengkap: true }
      });
      
      const namaPengirim = pengirim ? pengirim.namaLengkap : 'Seseorang';
      
      const notifications = targetUserIds.map(id => ({
        userId: id,
        judul: 'Ada Saran Online Baru!',
        isi: `Saran baru dari ${namaPengirim} dengan subjek: ${subjek}`,
        tipe: 'SARAN',
        urlTarget: '/admin/ruang-kerja'
      }));

      await prisma.notifikasi.createMany({
        data: notifications
      });
      console.log("Notifikasi created");
    }

  } catch (e) {
    console.error('Error:', e);
  } finally {
    await prisma.$disconnect();
  }
}
main();
