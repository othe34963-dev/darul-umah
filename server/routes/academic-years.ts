import { RequestHandler } from 'express';
import prisma from '../lib/prisma';

// Get all academic years
export const handleGetAcademicYears: RequestHandler = async (req, res) => {
  try {
    const academicYears = await prisma.academicYear.findMany({
      orderBy: { name: 'desc' },
      include: {
        _count: {
          select: {
            students: true,
            classes: true,
            marks: true,
            attendances: true,
            fees: true
          }
        }
      }
    });

    res.json(academicYears);
  } catch (error) {
    console.error('Error fetching academic years:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Create new academic year
export const handleCreateAcademicYear: RequestHandler = async (req, res) => {
  try {
    const { name, startDate, endDate } = req.body;

    if (!name || !startDate || !endDate) {
      return res.status(400).json({ error: 'Name, start date, and end date are required' });
    }

    // Check if year already exists
    const existingYear = await prisma.academicYear.findUnique({
      where: { name }
    });

    if (existingYear) {
      return res.status(400).json({ error: 'Academic year already exists' });
    }

    const academicYear = await prisma.academicYear.create({
      data: {
        name,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        isCurrent: false,
        isActive: true
      }
    });

    res.status(201).json(academicYear);
  } catch (error) {
    console.error('Error creating academic year:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update academic year
export const handleUpdateAcademicYear: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, startDate, endDate, isCurrent, isActive } = req.body;

    // If setting as current, unset all other current years
    if (isCurrent) {
      await prisma.academicYear.updateMany({
        where: { isCurrent: true },
        data: { isCurrent: false }
      });
    }

    const updateData: any = {};
    if (name) updateData.name = name;
    if (startDate) updateData.startDate = new Date(startDate);
    if (endDate) updateData.endDate = new Date(endDate);
    if (typeof isCurrent === 'boolean') updateData.isCurrent = isCurrent;
    if (typeof isActive === 'boolean') updateData.isActive = isActive;

    const academicYear = await prisma.academicYear.update({
      where: { id },
      data: updateData,
      include: {
        _count: {
          select: {
            students: true,
            classes: true,
            marks: true,
            attendances: true,
            fees: true
          }
        }
      }
    });

    res.json(academicYear);
  } catch (error) {
    console.error('Error updating academic year:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Delete academic year (only if no students)
export const handleDeleteAcademicYear: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if year has students
    const studentCount = await prisma.student.count({
      where: { academicYearId: id }
    });

    if (studentCount > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete academic year with students. Please archive it instead.' 
      });
    }

    await prisma.academicYear.delete({
      where: { id }
    });

    res.json({ message: 'Academic year deleted successfully' });
  } catch (error) {
    console.error('Error deleting academic year:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Set current academic year
export const handleSetCurrentAcademicYear: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;

    // Unset all other current years
    await prisma.academicYear.updateMany({
      where: { isCurrent: true },
      data: { isCurrent: false }
    });

    // Set the selected year as current
    const academicYear = await prisma.academicYear.update({
      where: { id },
      data: { isCurrent: true }
    });

    res.json(academicYear);
  } catch (error) {
    console.error('Error setting current academic year:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get current academic year
export const handleGetCurrentAcademicYear: RequestHandler = async (req, res) => {
  try {
    const currentYear = await prisma.academicYear.findFirst({
      where: { isCurrent: true }
    });

    if (!currentYear) {
      return res.status(404).json({ error: 'No current academic year found' });
    }

    res.json(currentYear);
  } catch (error) {
    console.error('Error fetching current academic year:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
