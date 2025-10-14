import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting minimal database seeding...');

  // Create academic years
  const academicYear2024 = await prisma.academicYear.upsert({
    where: { name: '2024-2025' },
    update: {},
    create: {
      name: '2024-2025',
      startDate: new Date('2024-09-01'),
      endDate: new Date('2025-06-30'),
      isCurrent: true,
      isActive: true,
    },
  });

  const academicYear2025 = await prisma.academicYear.upsert({
    where: { name: '2025-2026' },
    update: {},
    create: {
      name: '2025-2026',
      startDate: new Date('2025-09-01'),
      endDate: new Date('2026-06-30'),
      isCurrent: false,
      isActive: true,
    },
  });

  console.log('✅ Academic years created');

  // Create system settings
  const settings = [
    { key: 'school_name', value: 'Darul Ummah School', description: 'Official school name' },
    { key: 'school_address', value: 'Mogadishu, Somalia', description: 'School address' },
    { key: 'school_phone', value: '+252-61-123-4567', description: 'School contact phone' },
    { key: 'school_email', value: 'info@darulumah.edu', description: 'School contact email' },
    { key: 'results_published', value: 'false', description: 'Whether results are published for current year' },
  ];

  for (const setting of settings) {
    await prisma.settings.upsert({
      where: { key: setting.key },
      update: {},
      create: setting,
    });
  }

  console.log('✅ System settings created');

  console.log('🎉 Minimal database seeding completed successfully!');
  console.log('');
  console.log('📋 Next Steps:');
  console.log('1. Register your first admin account through the registration page');
  console.log('2. Add teachers and students through the admin dashboard');
  console.log('3. Configure classes and subjects as needed');
  console.log('');
  console.log('🔒 No default credentials created - secure production setup');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
