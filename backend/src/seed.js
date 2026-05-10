const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("Seeding CBT database...");

  // Check if exam already exists
  let exam = await prisma.exam.findFirst({ where: { title: "Ujian Saringan Masuk (Online)" } });
  
  if (!exam) {
    exam = await prisma.exam.create({
      data: {
        title: "Ujian Saringan Masuk (Online)",
        duration: 30, // 30 minutes
        passingGrade: 60,
      }
    });
    console.log("Exam created:", exam.id);
  } else {
    console.log("Exam already exists:", exam.id);
  }

  // Check if questions exist
  const existingQuestions = await prisma.question.count({ where: { examId: exam.id } });
  if (existingQuestions === 0) {
    const questionsToCreate = [];
    for (let i = 1; i <= 20; i++) {
      questionsToCreate.push({
        examId: exam.id,
        text: `Pertanyaan simulasi nomor ${i} untuk ujian masuk. Manakah jawaban yang paling benar?`,
        options: JSON.stringify(["Pilihan A", "Pilihan B", "Pilihan C", "Pilihan D"]),
        correctOption: Math.floor(Math.random() * 4), // Random correct answer 0-3
        category: i <= 7 ? "Diniyah" : i <= 14 ? "Matematika" : "Bahasa Arab"
      });
    }

    await prisma.question.createMany({
      data: questionsToCreate
    });
    console.log("20 dummy questions created.");
  } else {
    console.log(`Found ${existingQuestions} existing questions.`);
  }

  console.log("Seeding complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
