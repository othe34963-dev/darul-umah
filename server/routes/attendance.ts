import { RequestHandler } from 'express';
import prisma from '../lib/prisma';

// Get attendance by class and date
export const handleGetAttendance: RequestHandler = async (req, res) => {
  try {
    const { classId, date } = req.query;

    const attendance = await prisma.attendance.findMany({
      where: {
        classId: classId as string,
        date: date ? new Date(date as string) : undefined
      },
      include: {
        student: true,
        class: true
      },
      orderBy: {
        student: {
          name: 'asc'
        }
      }
    });

    res.json(attendance);
  } catch (error) {
    console.error('Get attendance error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Mark attendance
export const handleMarkAttendance: RequestHandler = async (req, res) => {
  try {
    const { records } = req.body; // Array of { studentId, classId, date, status }

    const teacherId = (req as any).user.profile?.id;
    if (!teacherId) {
      res.status(400).json({ error: 'Teacher ID not found' });
      return;
    }

    // Get class to get academic year
    const classInfo = await prisma.class.findUnique({
      where: { id: records[0].classId }
    });

    if (!classInfo) {
      res.status(404).json({ error: 'Class not found' });
      return;
    }

    const attendanceRecords = await Promise.all(
      records.map(async (record: any) => {
        return prisma.attendance.upsert({
          where: {
            studentId_classId_date: {
              studentId: record.studentId,
              classId: record.classId,
              date: new Date(record.date)
            }
          },
          create: {
            studentId: record.studentId,
            classId: record.classId,
            teacherId,
            academicYearId: classInfo.academicYearId,
            date: new Date(record.date),
            status: record.status,
            notes: record.notes
          },
          update: {
            status: record.status,
            notes: record.notes
          }
        });
      })
    );

    res.json(attendanceRecords);
  } catch (error) {
    console.error('Mark attendance error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get attendance statistics
export const handleGetAttendanceStats: RequestHandler = async (req, res) => {
  try {
    const { classId, startDate, endDate } = req.query;

    const attendance = await prisma.attendance.findMany({
      where: {
        classId: classId as string,
        date: {
          gte: startDate ? new Date(startDate as string) : undefined,
          lte: endDate ? new Date(endDate as string) : undefined
        }
      }
    });

    const stats = {
      total: attendance.length,
      present: attendance.filter(a => a.status === 'PRESENT').length,
      absent: attendance.filter(a => a.status === 'ABSENT').length,
      late: attendance.filter(a => a.status === 'LATE').length,
      excused: attendance.filter(a => a.status === 'EXCUSED').length
    };

    res.json(stats);
  } catch (error) {
    console.error('Get attendance stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

