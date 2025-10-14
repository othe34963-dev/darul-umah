import { RequestHandler } from 'express';
import prisma from '../lib/prisma';

// Get all teachers
export const handleGetTeachers: RequestHandler = async (req, res) => {
  try {
    const teachers = await prisma.teacher.findMany({
      include: {
        user: {
          select: {
            email: true,
            isActive: true
          }
        },
        classes: {
          include: {
            academicYear: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });

    res.json(teachers);
  } catch (error) {
    console.error('Get teachers error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get single teacher
export const handleGetTeacher: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;

    const teacher = await prisma.teacher.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            email: true,
            username: true,
            isActive: true
          }
        },
        classes: {
          include: {
            academicYear: true
          }
        },
        marks: {
          include: {
            student: true,
            class: true
          }
        }
      }
    });

    if (!teacher) {
      res.status(404).json({ error: 'Teacher not found' });
      return;
    }

    res.json(teacher);
  } catch (error) {
    console.error('Get teacher error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update teacher profile
export const handleUpdateTeacher: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, phone, photoUrl, subjects } = req.body;

    const teacher = await prisma.teacher.update({
      where: { id },
      data: {
        name,
        phone,
        photoUrl,
        subjects: subjects ? JSON.stringify(subjects) : undefined
      }
    });

    res.json(teacher);
  } catch (error) {
    console.error('Update teacher error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get teacher's classes
export const handleGetTeacherClasses: RequestHandler = async (req, res) => {
  try {
    const teacherId = (req as any).user.profile?.id;

    if (!teacherId) {
      res.status(400).json({ error: 'Teacher ID not found' });
      return;
    }

    const classes = await prisma.class.findMany({
      where: {
        teacherId,
        isActive: true
      },
      include: {
        academicYear: true,
        teacher: true
      },
      orderBy: {
        name: 'asc'
      }
    });

    res.json(classes);
  } catch (error) {
    console.error('Get teacher classes error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

