require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  try {
    await prisma.$connect();
    console.log('✅ DB CONNECTION: SUCCESS');
    const userCount = await prisma.user.count();
    console.log('👤 User count:', userCount);
    const categoryCount = await prisma.category.count();
    console.log('📂 Category count:', categoryCount);
    const facultyCount = await prisma.faculty.count();
    console.log('🏫 Faculty count:', facultyCount);
  } catch (e) {
    console.error('❌ DB CONNECTION ERROR:', e.message);
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
