import { PrismaClient, Role, WordLevel } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const words = [
  { word: 'apple', translation: 'olma', example: 'I eat an apple every day.', exampleUz: 'Men har kuni olma yeyman.', level: WordLevel.A1 },
  { word: 'book', translation: 'kitob', example: 'She is reading a book.', exampleUz: 'U kitob oʻqiyapti.', level: WordLevel.A1 },
  { word: 'water', translation: 'suv', example: 'Please give me some water.', exampleUz: 'Iltimos, menga suv bering.', level: WordLevel.A1 },
  { word: 'house', translation: 'uy', example: 'My house is near the school.', exampleUz: 'Mening uyim maktab yaqinida.', level: WordLevel.A1 },
  { word: 'school', translation: 'maktab', example: 'Children go to school every day.', exampleUz: 'Bolalar har kuni maktabga borishadi.', level: WordLevel.A1 },
  { word: 'friend', translation: 'doʻst', example: 'He is my best friend.', exampleUz: 'U mening eng yaxshi doʻstim.', level: WordLevel.A1 },
  { word: 'beautiful', translation: 'chiroyli', example: 'What a beautiful day!', exampleUz: 'Qanday chiroyli kun!', level: WordLevel.A2 },
  { word: 'understand', translation: 'tushunmoq', example: 'Do you understand the lesson?', exampleUz: 'Siz darsni tushundingizmi?', level: WordLevel.A2 },
  { word: 'important', translation: 'muhim', example: 'This is very important information.', exampleUz: 'Bu juda muhim maʼlumot.', level: WordLevel.A2 },
  { word: 'experience', translation: 'tajriba', example: 'She has a lot of experience.', exampleUz: 'Uning koʻp tajribasi bor.', level: WordLevel.B1 },
  { word: 'knowledge', translation: 'bilim', example: 'Knowledge is power.', exampleUz: 'Bilim — kuch.', level: WordLevel.B1 },
  { word: 'opportunity', translation: 'imkoniyat', example: 'Don\'t miss this opportunity.', exampleUz: 'Bu imkoniyatni qoʻldan bermang.', level: WordLevel.B1 },
  { word: 'challenge', translation: 'qiyinchilik', example: 'Learning English is a challenge.', exampleUz: 'Ingliz tilini oʻrganish qiyinchilik.', level: WordLevel.B2 },
  { word: 'achievement', translation: 'yutuq', example: 'This is a great achievement.', exampleUz: 'Bu katta yutuq.', level: WordLevel.B2 },
  { word: 'perseverance', translation: 'qatʼiyat', example: 'Perseverance leads to success.', exampleUz: 'Qatʼiyat muvaffaqiyatga olib keladi.', level: WordLevel.C1 },
  { word: 'eloquent', translation: 'notiq', example: 'She is an eloquent speaker.', exampleUz: 'U notiq soʻzlovchi.', level: WordLevel.C1 },
  { word: 'ambiguous', translation: 'noaniq', example: 'The instructions were ambiguous.', exampleUz: 'Koʻrsatmalar noaniq edi.', level: WordLevel.C2 },
  { word: 'run', translation: 'yugurmoq', example: 'I run every morning.', exampleUz: 'Men har ertalab yuguraman.', level: WordLevel.A1 },
  { word: 'work', translation: 'ishlash', example: 'I work at a company.', exampleUz: 'Men kompaniyada ishlaman.', level: WordLevel.A1 },
  { word: 'learn', translation: 'oʻrganmoq', example: 'I want to learn English.', exampleUz: 'Men ingliz tilini oʻrganmoqchiman.', level: WordLevel.A1 },
];

async function main() {
  console.log('Seeding database...');

  const adminPassword = await bcrypt.hash('Admin123!', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@elp.uz' },
    update: {},
    create: {
      email: 'admin@elp.uz',
      password: adminPassword,
      name: 'Admin',
      role: Role.ADMIN,
    },
  });
  console.log('Admin created:', admin.email);

  const userPassword = await bcrypt.hash('User123!', 10);
  const user = await prisma.user.upsert({
    where: { email: 'user@elp.uz' },
    update: {},
    create: {
      email: 'user@elp.uz',
      password: userPassword,
      name: 'Test User',
      role: Role.USER,
    },
  });
  console.log('Test user created:', user.email);

  for (const wordData of words) {
    await prisma.word.upsert({
      where: { word: wordData.word },
      update: wordData,
      create: wordData,
    });
  }
  console.log(`${words.length} words seeded`);

  console.log('Seeding complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
