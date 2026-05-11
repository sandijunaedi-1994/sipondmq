const prisma = require('./src/lib/prisma');
async function test() {
  try {
    const id = require('crypto').randomUUID();
    await prisma.$executeRaw`
      INSERT INTO CatatanAdmin (id, tanggal, judul, tugas, warna, labels, status, createdAt, updatedAt)
      VALUES (${id}, '2026-05-11', 'test judul', 'test tugas', 'default', '[]', 'PENDING', NOW(), NOW())
    `;
    console.log("Success");
  } catch (e) {
    console.error(e);
  } finally {
    process.exit(0);
  }
}
test();
