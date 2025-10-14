import "dotenv/config";
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Development mode: skip bcrypt
const isDev = true;

async function main() {
  console.log('🌱 Seeding database...');

  // Create Academic Year
  const academicYear = await prisma.academicYear.upsert({
    where: { name: '2024-2025' },
    update: {},
    create: {
      name: '2024-2025',
      startDate: new Date('2024-09-01'),
      endDate: new Date('2025-06-30'),
      isCurrent: true,
      isActive: true
    }
  });
  console.log('✅ Academic Year created:', academicYear.name);

  // Create Admin User
  const adminPassword = 'admin123'; // Plain password for development
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@darulumah.edu' },
    update: {},
    create: {
      email: 'admin@darulumah.edu',
      username: 'admin',
      password: adminPassword,
      role: 'ADMIN',
      isActive: true,
      admin: {
        create: {
          name: 'School Administrator',
          phone: '+252 61 000 0000'
        }
      }
    },
    include: { admin: true }
  });
  console.log('✅ Admin user created:', adminUser.email);

  // Create Teacher User
  const teacherPassword = 'teacher123'; // Plain password for development
  const teacherUser = await prisma.user.upsert({
    where: { email: 'ahmed.hassan@darulumah.edu' },
    update: {},
    create: {
      email: 'ahmed.hassan@darulumah.edu',
      username: 'ahmed.hassan',
      password: teacherPassword,
      role: 'TEACHER',
      isActive: true,
      teacher: {
        create: {
          name: 'Ahmed Hassan Mohamed',
          email: 'ahmed.hassan@darulumah.edu',
          phone: '+252 61 234 5678',
          employeeId: 'TC-2024-001',
          subjects: JSON.stringify(['Mathematics', 'Algebra']),
          isActive: true
        }
      }
    },
    include: { teacher: true }
  });
  console.log('✅ Teacher user created:', teacherUser.email);

  // Create Students
  const students = [
    {
      studentId: 'DU-2025-001',
      name: 'Fatima Ahmed Ali',
      gender: 'FEMALE' as const,
      className: 'Grade 8A',
      email: 'fatima.ahmed@student.edu',
      phone: '+252 61 111 1111',
      parentPhone: '+252 61 999 1111'
    },
    {
      studentId: 'DU-2025-002',
      name: 'Mohamed Hassan Abdi',
      gender: 'MALE' as const,
      className: 'Grade 8A',
      email: 'mohamed.hassan@student.edu',
      phone: '+252 61 111 1112',
      parentPhone: '+252 61 999 1112'
    },
    {
      studentId: 'DU-2025-003',
      name: 'Amina Omar Said',
      gender: 'FEMALE' as const,
      className: 'Grade 8A',
      email: 'amina.omar@student.edu',
      phone: '+252 61 111 1113',
      parentPhone: '+252 61 999 1113'
    },
    {
      studentId: 'DU-2025-004',
      name: 'Hassan Ali Mohamed',
      gender: 'MALE' as const,
      className: 'Grade 8A',
      email: 'hassan.ali@student.edu',
      phone: '+252 61 111 1114',
      parentPhone: '+252 61 999 1114'
    },
    {
      studentId: 'DU-2025-005',
      name: 'Khadija Yusuf Ali',
      gender: 'FEMALE' as const,
      className: 'Grade 8A',
      email: 'khadija.yusuf@student.edu',
      phone: '+252 61 111 1115',
      parentPhone: '+252 61 999 1115'
    }
  ];

  for (const student of students) {
    const created = await prisma.student.upsert({
      where: { studentId: student.studentId },
      update: {},
      create: {
        ...student,
        academicYearId: academicYear.id,
        isActive: true
      }
    });
    console.log(`✅ Student created: ${created.name}`);
  }

  // Create Class (Grade 8A removed as requested)
  if (teacherUser.teacher) {
    // Grade 8A class creation removed as requested
    console.log('✅ Class creation skipped - Grade 8A removed');

    // Create sample marks (commented out since Grade 8A class was removed)
    /*
    for (const student of studentRecords) {
      await prisma.mark.create({
        data: {
          studentId: student.id,
          classId: classRecord.id,
          teacherId: teacherUser.teacher.id,
          academicYearId: academicYear.id,
          subject: 'Mathematics',
          midterm: Math.floor(Math.random() * 30) + 70,
          final: Math.floor(Math.random() * 30) + 70,
          homework: Math.floor(Math.random() * 30) + 70,
          total: 0,
          grade: 'A',
          status: 'PUBLISHED'
        }
      });
    }
    console.log('✅ Sample marks created');

    // Update marks with calculated totals and percentages
    const marks = await prisma.mark.findMany();
    for (const mark of marks) {
      const total = (mark.midterm || 0) + (mark.final || 0) + (mark.homework || 0);
      const avg = total / 3;
      const percentage = Math.round(avg);
      
      let grade = `${percentage}%`;
      if (percentage >= 85) grade = `${percentage}% (Excellent)`;
      else if (percentage >= 70) grade = `${percentage}% (Good)`;
      else if (percentage >= 50) grade = `${percentage}% (Satisfactory)`;
      else grade = `${percentage}% (Needs Improvement)`;

      await prisma.mark.update({
        where: { id: mark.id },
        data: { total, grade }
      });
    }
    console.log('✅ Marks calculated and updated with percentages');
    */
  }

  // Create Settings
  await prisma.settings.upsert({
    where: { key: 'resultsPublished' },
    update: { value: 'true' },
    create: {
      key: 'resultsPublished',
      value: 'true'
    }
  });
  console.log('✅ Settings created');

  // Create sample notifications
  await prisma.notification.create({
    data: {
      title: 'Welcome to Darul Umah School System',
      message: 'The school management system is now live!',
      type: 'INFO',
      recipientRole: null
    }
  });
  console.log('✅ Notifications created');

  console.log('\n🎉 Seeding completed!');
  console.log('\n📝 Login Credentials:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Admin:');
  console.log('  Email: admin@darulumah.edu');
  console.log('  Password: admin123');
  console.log('');
  console.log('Teacher:');
  console.log('  Email: ahmed.hassan@darulumah.edu');
  console.log('  Password: teacher123');
  console.log('');
  console.log('Test Student ID:');
  console.log('  DU-2025-001 (Fatima Ahmed Ali)');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Seeding error:', e);
    await prisma.$disconnect();
    process.exit(1);
  });

