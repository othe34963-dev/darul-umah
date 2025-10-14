import { RequestHandler } from 'express';
import prisma from '../lib/prisma';

// Get all students
export const handleGetStudents: RequestHandler = async (req, res) => {
  try {
    const { academicYearId } = req.query;

    const students = await prisma.student.findMany({
      where: academicYearId ? { academicYearId: academicYearId as string } : {},
      include: {
        academicYear: true
      },
      orderBy: {
        name: 'asc'
      }
    });

    res.json(students);
  } catch (error) {
    console.error('Get students error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get single student
export const handleGetStudent: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;

    const student = await prisma.student.findUnique({
      where: { id },
      include: {
        academicYear: true,
        marks: {
          include: {
            class: true,
            teacher: true
          }
        },
        attendances: {
          include: {
            class: true
          },
          orderBy: {
            date: 'desc'
          },
          take: 30
        }
      }
    });

    if (!student) {
      res.status(404).json({ error: 'Student not found' });
      return;
    }

    res.json(student);
  } catch (error) {
    console.error('Get student error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Create student (Admin only)
export const handleCreateStudent: RequestHandler = async (req, res) => {
  try {
    const {
      studentId,
      name,
      gender,
      dateOfBirth,
      className,
      email,
      phone,
      parentPhone,
      address,
      photoUrl,
      academicYearId
    } = req.body;

    // Check if student ID already exists
    const existing = await prisma.student.findUnique({
      where: { studentId }
    });

    if (existing) {
      res.status(400).json({ error: 'Student ID already exists' });
      return;
    }

    const student = await prisma.student.create({
      data: {
        studentId,
        name,
        gender,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        className,
        email,
        phone,
        parentPhone,
        address,
        photoUrl,
        academicYearId
      },
      include: {
        academicYear: true
      }
    });

    res.status(201).json(student);
  } catch (error) {
    console.error('Create student error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update student (Admin only)
export const handleUpdateStudent: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;

    const student = await prisma.student.update({
      where: { id },
      data: {
        ...data,
        dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : undefined
      },
      include: {
        academicYear: true
      }
    });

    res.json(student);
  } catch (error) {
    console.error('Update student error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Delete student (Admin only)
export const handleDeleteStudent: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.student.delete({
      where: { id }
    });

    res.json({ message: 'Student deleted successfully' });
  } catch (error) {
    console.error('Delete student error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get all public results (Public)
export const handleGetAllPublicResults: RequestHandler = async (req, res) => {
  try {
    // Mock response since we're using localStorage on frontend
    // In a real application, this would query the database
    res.json({
      resultsPublished: true,
      academicYear: "2024-2025",
      students: [
        {
          id: "DU-2025-001",
          name: "Ayaan Ali",
          className: "Grade 8A",
          average: 84,
          grade: "B+",
          subjects: [
            { subject: "Mathematics", mark: 88 },
            { subject: "English", mark: 81 },
            { subject: "Somali", mark: 90 },
            { subject: "Physics", mark: 79 },
            { subject: "Chemistry", mark: 84 }
          ]
        },
        {
          id: "DU-2025-002",
          name: "Fatima Omar",
          className: "Grade 8A",
          average: 88,
          grade: "B+",
          subjects: [
            { subject: "Mathematics", mark: 92 },
            { subject: "English", mark: 85 },
            { subject: "Somali", mark: 88 },
            { subject: "Biology", mark: 90 },
            { subject: "History", mark: 87 }
          ]
        },
        {
          id: "DU-2025-003",
          name: "Hassan Ahmed",
          className: "Grade 8B",
          average: 78,
          grade: "C+",
          subjects: [
            { subject: "Mathematics", mark: 75 },
            { subject: "English", mark: 78 },
            { subject: "Somali", mark: 82 },
            { subject: "Physics", mark: 73 },
            { subject: "Chemistry", mark: 80 }
          ]
        },
        {
          id: "DU-2025-004",
          name: "Khadija Yusuf",
          className: "Grade 8B",
          average: 91,
          grade: "A-",
          subjects: [
            { subject: "Mathematics", mark: 95 },
            { subject: "English", mark: 89 },
            { subject: "Somali", mark: 91 },
            { subject: "Biology", mark: 93 },
            { subject: "Geography", mark: 88 }
          ]
        }
      ]
    });
  } catch (error) {
    console.error('Get all public results error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get student results by Student ID (Public)
export const handleGetStudentResults: RequestHandler = async (req, res) => {
  try {
    const { studentId } = req.params;

    // Mock response since we're using localStorage on frontend
    // In a real application, this would query the database
    res.json({
      student: {
        id: studentId,
        name: "Sample Student",
        className: "Form 4A",
        academicYear: "2024-2025"
      },
      resultsPublished: true,
      marks: [
        {
          subject: "Mathematics",
          midterm: 85,
          final: 90,
          homework: 88,
          total: 263,
          grade: "B+"
        },
        {
          subject: "English",
          midterm: 78,
          final: 82,
          homework: 80,
          total: 240,
          grade: "B"
        }
      ]
    });
  } catch (error) {
    console.error('Get student results error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

