const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function cleanupDuplicates() {
  console.log("Starting cleanup of duplicate routine schedules...");
  const schedules = await prisma.mcRoutineSchedule.findMany({
    orderBy: { createdAt: 'asc' }
  });

  const seen = new Set();
  const duplicates = [];

  for (const s of schedules) {
    // Format to YYYY-MM-DD
    const dateStr = s.taskDate.toISOString().split('T')[0];
    const key = `${s.routineTaskId}_${dateStr}`;
    
    if (seen.has(key)) {
      duplicates.push(s.id);
    } else {
      seen.add(key);
    }
  }

  console.log(`Found ${duplicates.length} duplicates.`);

  if (duplicates.length > 0) {
    const res = await prisma.mcRoutineSchedule.deleteMany({
      where: { id: { in: duplicates } }
    });
    console.log(`Deleted ${res.count} duplicates.`);
  } else {
    console.log("No duplicates found.");
  }
}

cleanupDuplicates()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
