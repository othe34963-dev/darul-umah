import "dotenv/config";
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createSampleClasses() {
  console.log('🏫 Creating sample classes...');

  try {
    // Get the current academic year
    const academicYear = await prisma.academicYear.findFirst({
      where: { isCurrent: true }
    });

    if (!academicYear) {
      console.error('❌ No current academic year found');
      return;
    }

    // Get the teacher
    const teacher = await prisma.teacher.findFirst({
      where: { isActive: true }
    });

    if (!teacher) {
      console.error('❌ No active teacher found');
      return;
    }

    // Get all students
    const students = await prisma.student.findMany({
      where: { isActive: true }
    });

    if (students.length === 0) {
      console.error('❌ No students found');
      return;
    }

    // Create sample classes
    const classes = [
      {
        name: "Grade 8A",
        subject: "Mathematics",
        room: "Room 101",
        schedule: JSON.stringify({
          "Monday": "9:00 AM - 10:00 AM",
          "Wednesday": "9:00 AM - 10:00 AM",
          "Friday": "9:00 AM - 10:00 AM"
        }),
        studentIds: JSON.stringify(students.slice(0, 3).map(s => s.id)) // First 3 students
      },
      {
        name: "Grade 8B",
        subject: "English",
        room: "Room 102",
        schedule: JSON.stringify({
          "Tuesday": "10:00 AM - 11:00 AM",
          "Thursday": "10:00 AM - 11:00 AM"
        }),
        studentIds: JSON.stringify(students.slice(2, 5).map(s => s.id)) // Last 3 students
      },
      {
        name: "Form 1",
        subject: "Science",
        room: "Room 103",
        schedule: JSON.stringify({
          "Monday": "2:00 PM - 3:00 PM",
          "Wednesday": "2:00 PM - 3:00 PM"
        }),
        studentIds: JSON.stringify(students.slice(0, 2).map(s => s.id)) // First 2 students
      }
    ];

    for (const classData of classes) {
      // Check if class already exists
      const existingClass = await prisma.class.findFirst({
        where: { 
          name: classData.name,
          academicYearId: academicYear.id
        }
      });

      if (existingClass) {
        console.log(`⚠️ Class already exists: ${classData.name}`);
        continue;
      }

      const createdClass = await prisma.class.create({
        data: {
          ...classData,
          teacherId: teacher.id,
          academicYearId: academicYear.id,
          isActive: true
        }
      });
      console.log(`✅ Class created: ${createdClass.name} (${createdClass.subject})`);
    }

    console.log('\n🎉 Sample classes created successfully!');
    console.log('\n📝 Classes created:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Grade 8A - Mathematics (3 students)');
    console.log('Grade 8B - English (3 students)');
    console.log('Form 1 - Science (2 students)');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  } catch (error) {
    console.error('❌ Error creating classes:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createSampleClasses();
