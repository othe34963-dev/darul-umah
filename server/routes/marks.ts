import { RequestHandler } from 'express';
import prisma from '../lib/prisma';

// Get marks by class
export const handleGetMarksByClass: RequestHandler = async (req, res) => {
  try {
    const { classId } = req.params;

    const marks = await prisma.mark.findMany({
      where: { classId },
      include: {
        student: true,
        class: true,
        teacher: true
      },
      orderBy: {
        student: {
          name: 'asc'
        }
      }
    });

    res.json(marks);
  } catch (error) {
    console.error('Get marks error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Create or update mark
export const handleUpsertMark: RequestHandler = async (req, res) => {
  try {
    const {
      id,
      studentId,
      classId,
      teacherId,
      academicYearId,
      subject,
      midterm,
      final,
      homework
    } = req.body;

    // Calculate total and percentage
    const total = (midterm || 0) + (final || 0) + (homework || 0);
    const avg = total / 3;
    const percentage = Math.round(avg);
    
    // Keep grade for backward compatibility, but use percentage as primary
    let grade = `${percentage}%`;
    if (percentage >= 85) grade = `${percentage}% (Excellent)`;
    else if (percentage >= 70) grade = `${percentage}% (Good)`;
    else if (percentage >= 50) grade = `${percentage}% (Satisfactory)`;
    else grade = `${percentage}% (Needs Improvement)`;

    const mark = id
      ? await prisma.mark.update({
          where: { id },
          data: {
            midterm,
            final,
            homework,
            total,
            grade
          },
          include: {
            student: true,
            class: true
          }
        })
      : await prisma.mark.create({
          data: {
            studentId,
            classId,
            teacherId,
            academicYearId,
            subject,
            midterm,
            final,
            homework,
            total,
            grade,
            status: 'DRAFT'
          },
          include: {
            student: true,
            class: true
          }
        });

    res.json(mark);
  } catch (error) {
    console.error('Upsert mark error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Submit marks to admin
export const handleSubmitMarks: RequestHandler = async (req, res) => {
  try {
    const { markIds } = req.body;

    await prisma.mark.updateMany({
      where: {
        id: { in: markIds }
      },
      data: {
        status: 'SUBMITTED',
        submittedAt: new Date()
      }
    });

    res.json({ message: 'Marks submitted successfully' });
  } catch (error) {
    console.error('Submit marks error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Approve marks (Admin only)
export const handleApproveMarks: RequestHandler = async (req, res) => {
  try {
    const { markIds } = req.body;

    await prisma.mark.updateMany({
      where: {
        id: { in: markIds },
        status: 'SUBMITTED'
      },
      data: {
        status: 'APPROVED',
        approvedAt: new Date()
      }
    });

    res.json({ message: 'Marks approved successfully' });
  } catch (error) {
    console.error('Approve marks error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Publish results (Admin only)
export const handlePublishResults: RequestHandler = async (req, res) => {
  try {
    const { academicYearId } = req.body;

    // Update all approved marks to published
    await prisma.mark.updateMany({
      where: {
        academicYearId,
        status: 'APPROVED'
      },
      data: {
        status: 'PUBLISHED'
      }
    });

    // Update settings to show results are published
    await prisma.settings.upsert({
      where: { key: 'resultsPublished' },
      create: { key: 'resultsPublished', value: 'true' },
      update: { value: 'true' }
    });

    res.json({ message: 'Results published successfully' });
  } catch (error) {
    console.error('Publish results error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Close results (Admin only)
export const handleCloseResults: RequestHandler = async (req, res) => {
  try {
    await prisma.settings.upsert({
      where: { key: 'resultsPublished' },
      create: { key: 'resultsPublished', value: 'false' },
      update: { value: 'false' }
    });

    res.json({ message: 'Results closed successfully' });
  } catch (error) {
    console.error('Close results error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

