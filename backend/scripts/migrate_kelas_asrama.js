const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("Memulai migrasi data Kelas dan Asrama...");

  // Get all Santri that have string data but might be missing relation data
  const santriList = await prisma.santri.findMany({
    where: {
      OR: [
        { kelas: { not: null } },
        { asrama: { not: null } }
      ]
    }
  });

  console.log(`Ditemukan ${santriList.length} data Santri untuk diperiksa.`);

  let updatedCount = 0;
  
  const firstMarkaz = await prisma.markaz.findFirst();
  const markazId = firstMarkaz ? firstMarkaz.id : undefined;

  for (const santri of santriList) {
    let updateData = {};

    // Handle Kelas
    if (santri.kelas && !santri.kelasId) {
      let kelasRef = await prisma.kelas.findFirst({
        where: { nama: santri.kelas }
      });
      
      if (!kelasRef) {
        console.log(`Membuat Kelas baru: ${santri.kelas}`);
        kelasRef = await prisma.kelas.create({
          data: { 
            nama: santri.kelas, 
            tahunAjaran: "Migrasi",
            ...(markazId ? { markaz: { connect: { id: markazId } } } : {})
          }
        });
      }
      updateData.kelasId = kelasRef.id;
    }

    // Handle Asrama
    if (santri.asrama && !santri.asramaId) {
      let asramaRef = await prisma.asrama.findFirst({
        where: { nama: santri.asrama }
      });
      
      if (!asramaRef) {
        console.log(`Membuat Asrama baru: ${santri.asrama}`);
        asramaRef = await prisma.asrama.create({
          data: { 
            nama: santri.asrama,
            ...(markazId ? { markaz: { connect: { id: markazId } } } : {})
          }
        });
      }
      updateData.asramaId = asramaRef.id;
    }

    // Update if there are changes
    if (Object.keys(updateData).length > 0) {
      await prisma.santri.update({
        where: { id: santri.id },
        data: updateData
      });
      updatedCount++;
    }
  }

  console.log(`Migrasi selesai. Total data diperbarui: ${updatedCount}`);
}

main()
  .catch(e => {
    console.error("Gagal melakukan migrasi:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
