import path from "path";
import "dotenv/config";
import * as express from "express";
import express__default from "express";
import cors from "cors";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import { z } from "zod";
const handleDemo = (req, res) => {
  const response = {
    message: "Hello from Express server"
  };
  res.status(200).json(response);
};
const globalForPrisma = global;
const prisma$1 = globalForPrisma.prisma || new PrismaClient({
  log: ["error"]
});
const JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-jwt-key";
const generateToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
};
const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (!token) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }
  const payload = verifyToken(token);
  if (!payload) {
    res.status(401).json({ error: "Invalid or expired token" });
    return;
  }
  req.user = payload;
  next();
};
const adminOnly = (req, res, next) => {
  const user = req.user;
  if (user.role !== "ADMIN") {
    res.status(403).json({ error: "Admin access required" });
    return;
  }
  next();
};
const isDev = false;
const handleLogin = async (req, res) => {
  try {
    const { username, password, role } = req.body;
    if (!username || !password || !role) {
      res.status(400).json({ error: "Username, password, and role are required" });
      return;
    }
    const user = await prisma$1.user.findFirst({
      where: {
        OR: [
          { username },
          { email: username }
        ],
        role: role.toUpperCase(),
        isActive: true
      },
      include: {
        teacher: true,
        admin: true
      }
    });
    if (!user) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }
    const isValidPassword = isDev ? password === "admin123" || password === "teacher123" || password === user.password : password === user.password;
    if (!isValidPassword) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role
    });
    const profile = user.role === "ADMIN" ? user.admin : user.teacher;
    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
        profile
      }
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
const handleRegister = async (req, res) => {
  try {
    const { email, username, password, role, name, phone } = req.body;
    const existingUser = await prisma$1.user.findFirst({
      where: {
        OR: [
          { email },
          { username }
        ]
      }
    });
    if (existingUser) {
      res.status(400).json({ error: "User already exists" });
      return;
    }
    const hashedPassword = isDev ? password : password;
    const user = await prisma$1.user.create({
      data: {
        email,
        username,
        password: hashedPassword,
        role: role.toUpperCase(),
        ...role.toUpperCase() === "ADMIN" ? {
          admin: {
            create: {
              name,
              phone
            }
          }
        } : {
          teacher: {
            create: {
              name,
              email,
              phone,
              employeeId: `TC-${Date.now()}`,
              subjects: JSON.stringify([])
            }
          }
        }
      },
      include: {
        admin: true,
        teacher: true
      }
    });
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role
    });
    res.status(201).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
        profile: user.role === "ADMIN" ? user.admin : user.teacher
      }
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
const handleGetMe = async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await prisma$1.user.findUnique({
      where: { id: userId },
      include: {
        admin: true,
        teacher: true
      }
    });
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    res.json({
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
      profile: user.role === "ADMIN" ? user.admin : user.teacher
    });
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
const handleGetStudents = async (req, res) => {
  try {
    const { academicYearId } = req.query;
    const students = await prisma$1.student.findMany({
      where: academicYearId ? { academicYearId } : {},
      include: {
        academicYear: true
      },
      orderBy: {
        name: "asc"
      }
    });
    res.json(students);
  } catch (error) {
    console.error("Get students error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
const handleGetStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const student = await prisma$1.student.findUnique({
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
            date: "desc"
          },
          take: 30
        }
      }
    });
    if (!student) {
      res.status(404).json({ error: "Student not found" });
      return;
    }
    res.json(student);
  } catch (error) {
    console.error("Get student error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
const handleCreateStudent = async (req, res) => {
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
    const existing = await prisma$1.student.findUnique({
      where: { studentId }
    });
    if (existing) {
      res.status(400).json({ error: "Student ID already exists" });
      return;
    }
    const student = await prisma$1.student.create({
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
    console.error("Create student error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
const handleUpdateStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    const student = await prisma$1.student.update({
      where: { id },
      data: {
        ...data,
        dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : void 0
      },
      include: {
        academicYear: true
      }
    });
    res.json(student);
  } catch (error) {
    console.error("Update student error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
const handleDeleteStudent = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma$1.student.delete({
      where: { id }
    });
    res.json({ message: "Student deleted successfully" });
  } catch (error) {
    console.error("Delete student error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
const handleGetAllPublicResults = async (req, res) => {
  try {
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
    console.error("Get all public results error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
const handleGetStudentResults = async (req, res) => {
  try {
    const { studentId } = req.params;
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
    console.error("Get student results error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
const handleGetTeachers = async (req, res) => {
  try {
    const teachers = await prisma$1.teacher.findMany({
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
        name: "asc"
      }
    });
    res.json(teachers);
  } catch (error) {
    console.error("Get teachers error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
const handleGetTeacher = async (req, res) => {
  try {
    const { id } = req.params;
    const teacher = await prisma$1.teacher.findUnique({
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
      res.status(404).json({ error: "Teacher not found" });
      return;
    }
    res.json(teacher);
  } catch (error) {
    console.error("Get teacher error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
const handleUpdateTeacher = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, phone, photoUrl, subjects } = req.body;
    const teacher = await prisma$1.teacher.update({
      where: { id },
      data: {
        name,
        phone,
        photoUrl,
        subjects: subjects ? JSON.stringify(subjects) : void 0
      }
    });
    res.json(teacher);
  } catch (error) {
    console.error("Update teacher error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
const handleGetTeacherClasses = async (req, res) => {
  try {
    const teacherId = req.user.profile?.id;
    if (!teacherId) {
      res.status(400).json({ error: "Teacher ID not found" });
      return;
    }
    const classes = await prisma$1.class.findMany({
      where: {
        teacherId,
        isActive: true
      },
      include: {
        academicYear: true,
        teacher: true
      },
      orderBy: {
        name: "asc"
      }
    });
    res.json(classes);
  } catch (error) {
    console.error("Get teacher classes error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
const handleGetMarksByClass = async (req, res) => {
  try {
    const { classId } = req.params;
    const marks = await prisma$1.mark.findMany({
      where: { classId },
      include: {
        student: true,
        class: true,
        teacher: true
      },
      orderBy: {
        student: {
          name: "asc"
        }
      }
    });
    res.json(marks);
  } catch (error) {
    console.error("Get marks error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
const handleUpsertMark = async (req, res) => {
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
    const total = (midterm || 0) + (final || 0) + (homework || 0);
    const avg = total / 3;
    const percentage = Math.round(avg);
    let grade = `${percentage}%`;
    if (percentage >= 85) grade = `${percentage}% (Excellent)`;
    else if (percentage >= 70) grade = `${percentage}% (Good)`;
    else if (percentage >= 50) grade = `${percentage}% (Satisfactory)`;
    else grade = `${percentage}% (Needs Improvement)`;
    const mark = id ? await prisma$1.mark.update({
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
    }) : await prisma$1.mark.create({
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
        status: "DRAFT"
      },
      include: {
        student: true,
        class: true
      }
    });
    res.json(mark);
  } catch (error) {
    console.error("Upsert mark error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
const handleSubmitMarks = async (req, res) => {
  try {
    const { markIds } = req.body;
    await prisma$1.mark.updateMany({
      where: {
        id: { in: markIds }
      },
      data: {
        status: "SUBMITTED",
        submittedAt: /* @__PURE__ */ new Date()
      }
    });
    res.json({ message: "Marks submitted successfully" });
  } catch (error) {
    console.error("Submit marks error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
const handleApproveMarks = async (req, res) => {
  try {
    const { markIds } = req.body;
    await prisma$1.mark.updateMany({
      where: {
        id: { in: markIds },
        status: "SUBMITTED"
      },
      data: {
        status: "APPROVED",
        approvedAt: /* @__PURE__ */ new Date()
      }
    });
    res.json({ message: "Marks approved successfully" });
  } catch (error) {
    console.error("Approve marks error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
const handlePublishResults = async (req, res) => {
  try {
    const { academicYearId } = req.body;
    await prisma$1.mark.updateMany({
      where: {
        academicYearId,
        status: "APPROVED"
      },
      data: {
        status: "PUBLISHED"
      }
    });
    await prisma$1.settings.upsert({
      where: { key: "resultsPublished" },
      create: { key: "resultsPublished", value: "true" },
      update: { value: "true" }
    });
    res.json({ message: "Results published successfully" });
  } catch (error) {
    console.error("Publish results error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
const handleCloseResults = async (req, res) => {
  try {
    await prisma$1.settings.upsert({
      where: { key: "resultsPublished" },
      create: { key: "resultsPublished", value: "false" },
      update: { value: "false" }
    });
    res.json({ message: "Results closed successfully" });
  } catch (error) {
    console.error("Close results error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
const handleGetAttendance = async (req, res) => {
  try {
    const { classId, date } = req.query;
    const attendance = await prisma$1.attendance.findMany({
      where: {
        classId,
        date: date ? new Date(date) : void 0
      },
      include: {
        student: true,
        class: true
      },
      orderBy: {
        student: {
          name: "asc"
        }
      }
    });
    res.json(attendance);
  } catch (error) {
    console.error("Get attendance error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
const handleMarkAttendance = async (req, res) => {
  try {
    const { records } = req.body;
    const teacherId = req.user.profile?.id;
    if (!teacherId) {
      res.status(400).json({ error: "Teacher ID not found" });
      return;
    }
    const classInfo = await prisma$1.class.findUnique({
      where: { id: records[0].classId }
    });
    if (!classInfo) {
      res.status(404).json({ error: "Class not found" });
      return;
    }
    const attendanceRecords = await Promise.all(
      records.map(async (record) => {
        return prisma$1.attendance.upsert({
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
    console.error("Mark attendance error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
const handleGetAttendanceStats = async (req, res) => {
  try {
    const { classId, startDate, endDate } = req.query;
    const attendance = await prisma$1.attendance.findMany({
      where: {
        classId,
        date: {
          gte: startDate ? new Date(startDate) : void 0,
          lte: endDate ? new Date(endDate) : void 0
        }
      }
    });
    const stats = {
      total: attendance.length,
      present: attendance.filter((a) => a.status === "PRESENT").length,
      absent: attendance.filter((a) => a.status === "ABSENT").length,
      late: attendance.filter((a) => a.status === "LATE").length,
      excused: attendance.filter((a) => a.status === "EXCUSED").length
    };
    res.json(stats);
  } catch (error) {
    console.error("Get attendance stats error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
const prisma = new PrismaClient();
const createFeeSchema = z.object({
  studentId: z.string().min(1, "Student ID is required"),
  academicYearId: z.string().min(1, "Academic Year ID is required"),
  feeType: z.enum(["TUITION", "EXAM", "LIBRARY", "TRANSPORT", "HOSTEL", "UNIFORM", "BOOKS", "OTHER"]),
  amount: z.number().positive("Amount must be positive"),
  dueDate: z.string().datetime("Invalid due date"),
  notes: z.string().optional()
});
const updateFeeSchema = createFeeSchema.partial();
async function updateOverdueFees() {
  const today = /* @__PURE__ */ new Date();
  await prisma.fee.updateMany({
    where: {
      status: "PENDING",
      dueDate: {
        lt: today
      }
    },
    data: {
      status: "OVERDUE"
    }
  });
}
const getFees = async (req, res) => {
  try {
    await updateOverdueFees();
    const { page = "1", limit = "10", search, status, classId, sortBy = "dueDate", sortOrder = "asc" } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;
    const where = {};
    if (search) {
      where.OR = [
        { student: { name: { contains: search, mode: "insensitive" } } },
        { student: { studentId: { contains: search, mode: "insensitive" } } },
        { student: { className: { contains: search, mode: "insensitive" } } }
      ];
    }
    if (status && status !== "ALL") {
      where.status = status;
    }
    if (classId && classId !== "ALL") {
      const classRecord = await prisma.class.findUnique({
        where: { id: classId },
        select: { name: true }
      });
      if (classRecord) {
        where.student = {
          ...where.student,
          className: classRecord.name
        };
      }
    }
    const orderBy = {};
    if (sortBy === "student") {
      orderBy.student = { name: sortOrder };
    } else if (sortBy === "amount") {
      orderBy.amount = sortOrder;
    } else if (sortBy === "dueDate") {
      orderBy.dueDate = sortOrder;
    } else {
      orderBy.createdAt = "desc";
    }
    const [fees, total] = await Promise.all([
      prisma.fee.findMany({
        where,
        include: {
          student: {
            select: {
              id: true,
              studentId: true,
              name: true,
              className: true
            }
          },
          academicYear: {
            select: {
              id: true,
              name: true
            }
          }
        },
        orderBy,
        skip,
        take: limitNum
      }),
      prisma.fee.count({ where })
    ]);
    const summary = await prisma.fee.groupBy({
      by: ["status"],
      _sum: {
        amount: true
      },
      _count: {
        id: true
      }
    });
    const summaryData = {
      totalPaid: summary.find((s) => s.status === "PAID")?._sum.amount || 0,
      totalPending: summary.find((s) => s.status === "PENDING")?._sum.amount || 0,
      totalOverdue: summary.find((s) => s.status === "OVERDUE")?._sum.amount || 0,
      paidCount: summary.find((s) => s.status === "PAID")?._count.id || 0,
      pendingCount: summary.find((s) => s.status === "PENDING")?._count.id || 0,
      overdueCount: summary.find((s) => s.status === "OVERDUE")?._count.id || 0
    };
    res.json({
      fees,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      },
      summary: summaryData
    });
  } catch (error) {
    console.error("Error fetching fees:", error);
    res.status(500).json({ error: "Failed to fetch fees" });
  }
};
const createFee = async (req, res) => {
  try {
    const validatedData = createFeeSchema.parse(req.body);
    const student = await prisma.student.findUnique({
      where: { id: validatedData.studentId },
      include: { academicYear: true }
    });
    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }
    const fee = await prisma.fee.create({
      data: {
        studentId: validatedData.studentId,
        academicYearId: validatedData.academicYearId,
        feeType: validatedData.feeType,
        amount: validatedData.amount,
        dueDate: new Date(validatedData.dueDate),
        status: "PENDING",
        notes: validatedData.notes
      },
      include: {
        student: {
          select: {
            id: true,
            studentId: true,
            name: true,
            className: true
          }
        },
        academicYear: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });
    res.status(201).json(fee);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Validation error", details: error.errors });
    }
    console.error("Error creating fee:", error);
    res.status(500).json({ error: "Failed to create fee" });
  }
};
const updateFee = async (req, res) => {
  try {
    const { id } = req.params;
    const validatedData = updateFeeSchema.parse(req.body);
    const fee = await prisma.fee.update({
      where: { id },
      data: {
        ...validatedData,
        dueDate: validatedData.dueDate ? new Date(validatedData.dueDate) : void 0
      },
      include: {
        student: {
          select: {
            id: true,
            studentId: true,
            name: true,
            className: true
          }
        },
        academicYear: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });
    res.json(fee);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Validation error", details: error.errors });
    }
    console.error("Error updating fee:", error);
    res.status(500).json({ error: "Failed to update fee" });
  }
};
const deleteFee = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.fee.delete({
      where: { id }
    });
    res.json({ message: "Fee deleted successfully" });
  } catch (error) {
    console.error("Error deleting fee:", error);
    res.status(500).json({ error: "Failed to delete fee" });
  }
};
const markAsPaid = async (req, res) => {
  try {
    const { id } = req.params;
    const fee = await prisma.fee.update({
      where: { id },
      data: {
        status: "PAID",
        paymentDate: /* @__PURE__ */ new Date()
      },
      include: {
        student: {
          select: {
            id: true,
            studentId: true,
            name: true,
            className: true
          }
        },
        academicYear: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });
    res.json(fee);
  } catch (error) {
    console.error("Error marking fee as paid:", error);
    res.status(500).json({ error: "Failed to mark fee as paid" });
  }
};
const getStudents = async (req, res) => {
  try {
    const students = await prisma.student.findMany({
      where: { isActive: true },
      select: {
        id: true,
        studentId: true,
        name: true,
        className: true,
        academicYear: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: { name: "asc" }
    });
    res.json(students);
  } catch (error) {
    console.error("Error fetching students:", error);
    res.status(500).json({ error: "Failed to fetch students" });
  }
};
const getReceiptData = async (req, res) => {
  try {
    const { id } = req.params;
    const fee = await prisma.fee.findUnique({
      where: { id },
      include: {
        student: {
          select: {
            id: true,
            studentId: true,
            name: true,
            className: true
          }
        },
        academicYear: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });
    if (!fee) {
      return res.status(404).json({ error: "Fee not found" });
    }
    if (fee.status !== "PAID") {
      return res.status(400).json({ error: "Fee must be paid to generate receipt" });
    }
    res.json(fee);
  } catch (error) {
    console.error("Error fetching receipt data:", error);
    res.status(500).json({ error: "Failed to fetch receipt data" });
  }
};
const getClasses = async (req, res) => {
  try {
    const classes = await prisma.class.findMany({
      where: { isActive: true },
      include: {
        teacher: {
          select: {
            id: true,
            name: true
          }
        },
        academicYear: {
          select: {
            id: true,
            name: true
          }
        },
        _count: {
          select: {
            marks: true
          }
        }
      },
      orderBy: { name: "asc" }
    });
    const classesWithStudentCount = await Promise.all(
      classes.map(async (cls) => {
        const studentIds = JSON.parse(cls.studentIds || "[]");
        const studentCount = await prisma.student.count({
          where: {
            id: { in: studentIds },
            isActive: true
          }
        });
        return {
          ...cls,
          studentCount
        };
      })
    );
    res.json(classesWithStudentCount);
  } catch (error) {
    console.error("Error fetching classes:", error);
    res.status(500).json({ error: "Failed to fetch classes" });
  }
};
const bulkGenerateFees = async (req, res) => {
  try {
    const { classIds, feeType, amount, dueDate, notes } = req.body;
    if (!classIds || !Array.isArray(classIds) || classIds.length === 0) {
      return res.status(400).json({ error: "Class IDs are required" });
    }
    if (!feeType || !amount || !dueDate) {
      return res.status(400).json({ error: "Fee type, amount, and due date are required" });
    }
    const createdFees = [];
    const errors = [];
    for (const classId of classIds) {
      try {
        const classData = await prisma.class.findUnique({
          where: { id: classId },
          include: {
            academicYear: true
          }
        });
        if (!classData) {
          errors.push(`Class with ID ${classId} not found`);
          continue;
        }
        const studentIds = JSON.parse(classData.studentIds || "[]");
        const students = await prisma.student.findMany({
          where: {
            id: { in: studentIds },
            isActive: true
          }
        });
        for (const student of students) {
          try {
            const fee = await prisma.fee.create({
              data: {
                studentId: student.id,
                academicYearId: classData.academicYearId,
                feeType,
                amount: parseFloat(amount),
                dueDate: new Date(dueDate),
                status: "PENDING",
                notes: notes || `Bulk generated for ${classData.name}`
              },
              include: {
                student: {
                  select: {
                    id: true,
                    studentId: true,
                    name: true,
                    className: true
                  }
                },
                academicYear: {
                  select: {
                    id: true,
                    name: true
                  }
                }
              }
            });
            createdFees.push(fee);
          } catch (error) {
            errors.push(`Failed to create fee for student ${student.name}: ${error}`);
          }
        }
      } catch (error) {
        errors.push(`Failed to process class ${classId}: ${error}`);
      }
    }
    res.json({
      success: true,
      createdCount: createdFees.length,
      fees: createdFees,
      errors: errors.length > 0 ? errors : void 0
    });
  } catch (error) {
    console.error("Error bulk generating fees:", error);
    res.status(500).json({ error: "Failed to bulk generate fees" });
  }
};
const handleGetAcademicYears = async (req, res) => {
  try {
    const academicYears = await prisma$1.academicYear.findMany({
      orderBy: { name: "desc" },
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
    console.error("Error fetching academic years:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
const handleCreateAcademicYear = async (req, res) => {
  try {
    const { name, startDate, endDate } = req.body;
    if (!name || !startDate || !endDate) {
      return res.status(400).json({ error: "Name, start date, and end date are required" });
    }
    const existingYear = await prisma$1.academicYear.findUnique({
      where: { name }
    });
    if (existingYear) {
      return res.status(400).json({ error: "Academic year already exists" });
    }
    const academicYear = await prisma$1.academicYear.create({
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
    console.error("Error creating academic year:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
const handleUpdateAcademicYear = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, startDate, endDate, isCurrent, isActive } = req.body;
    if (isCurrent) {
      await prisma$1.academicYear.updateMany({
        where: { isCurrent: true },
        data: { isCurrent: false }
      });
    }
    const updateData = {};
    if (name) updateData.name = name;
    if (startDate) updateData.startDate = new Date(startDate);
    if (endDate) updateData.endDate = new Date(endDate);
    if (typeof isCurrent === "boolean") updateData.isCurrent = isCurrent;
    if (typeof isActive === "boolean") updateData.isActive = isActive;
    const academicYear = await prisma$1.academicYear.update({
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
    console.error("Error updating academic year:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
const handleDeleteAcademicYear = async (req, res) => {
  try {
    const { id } = req.params;
    const studentCount = await prisma$1.student.count({
      where: { academicYearId: id }
    });
    if (studentCount > 0) {
      return res.status(400).json({
        error: "Cannot delete academic year with students. Please archive it instead."
      });
    }
    await prisma$1.academicYear.delete({
      where: { id }
    });
    res.json({ message: "Academic year deleted successfully" });
  } catch (error) {
    console.error("Error deleting academic year:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
const handleSetCurrentAcademicYear = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma$1.academicYear.updateMany({
      where: { isCurrent: true },
      data: { isCurrent: false }
    });
    const academicYear = await prisma$1.academicYear.update({
      where: { id },
      data: { isCurrent: true }
    });
    res.json(academicYear);
  } catch (error) {
    console.error("Error setting current academic year:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
const handleGetCurrentAcademicYear = async (req, res) => {
  try {
    const currentYear = await prisma$1.academicYear.findFirst({
      where: { isCurrent: true }
    });
    if (!currentYear) {
      return res.status(404).json({ error: "No current academic year found" });
    }
    res.json(currentYear);
  } catch (error) {
    console.error("Error fetching current academic year:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
function createServer() {
  const app2 = express__default();
  app2.use(cors());
  app2.use(express__default.json());
  app2.use(express__default.urlencoded({ extended: true }));
  app2.get("/", (_req, res) => {
    res.json({
      name: "Darul Umah School Management System API",
      version: "1.0.0",
      status: "✅ Running",
      endpoints: {
        health: "/api/ping",
        auth: {
          login: "POST /api/auth/login",
          register: "POST /api/auth/register",
          me: "GET /api/auth/me"
        },
        public: {
          allResults: "GET /api/public/results",
          studentResults: "GET /api/public/results/:studentId"
        },
        students: "GET /api/students",
        teachers: "GET /api/teachers",
        marks: "GET /api/marks/class/:classId",
        attendance: "GET /api/attendance",
        fees: "GET /api/fees"
      },
      documentation: "See SETUP.md for full API documentation"
    });
  });
  app2.get("/api/ping", (_req, res) => {
    res.json({ message: "pong" });
  });
  app2.get("/api/demo", handleDemo);
  app2.post("/api/auth/login", handleLogin);
  app2.post("/api/auth/register", handleRegister);
  app2.get("/api/public/results", handleGetAllPublicResults);
  app2.get("/api/public/results/:studentId", handleGetStudentResults);
  app2.get("/api/auth/me", authMiddleware, handleGetMe);
  app2.get("/api/students", authMiddleware, handleGetStudents);
  app2.get("/api/students/:id", authMiddleware, handleGetStudent);
  app2.post("/api/students", authMiddleware, adminOnly, handleCreateStudent);
  app2.put("/api/students/:id", authMiddleware, adminOnly, handleUpdateStudent);
  app2.delete("/api/students/:id", authMiddleware, adminOnly, handleDeleteStudent);
  app2.get("/api/teachers", authMiddleware, handleGetTeachers);
  app2.get("/api/teachers/:id", authMiddleware, handleGetTeacher);
  app2.put("/api/teachers/:id", authMiddleware, handleUpdateTeacher);
  app2.get("/api/teachers/me/classes", authMiddleware, handleGetTeacherClasses);
  app2.get("/api/marks/class/:classId", authMiddleware, handleGetMarksByClass);
  app2.post("/api/marks", authMiddleware, handleUpsertMark);
  app2.post("/api/marks/submit", authMiddleware, handleSubmitMarks);
  app2.post("/api/marks/approve", authMiddleware, adminOnly, handleApproveMarks);
  app2.post("/api/marks/publish", authMiddleware, adminOnly, handlePublishResults);
  app2.post("/api/marks/close", authMiddleware, adminOnly, handleCloseResults);
  app2.get("/api/attendance", authMiddleware, handleGetAttendance);
  app2.post("/api/attendance", authMiddleware, handleMarkAttendance);
  app2.get("/api/attendance/stats", authMiddleware, handleGetAttendanceStats);
  app2.get("/api/fees", authMiddleware, adminOnly, getFees);
  app2.post("/api/fees", authMiddleware, adminOnly, createFee);
  app2.put("/api/fees/:id", authMiddleware, adminOnly, updateFee);
  app2.delete("/api/fees/:id", authMiddleware, adminOnly, deleteFee);
  app2.patch("/api/fees/:id/paid", authMiddleware, adminOnly, markAsPaid);
  app2.get("/api/fees/students", authMiddleware, adminOnly, getStudents);
  app2.get("/api/fees/classes", authMiddleware, adminOnly, getClasses);
  app2.post("/api/fees/bulk-generate", authMiddleware, adminOnly, bulkGenerateFees);
  app2.get("/api/fees/receipt/:id", authMiddleware, adminOnly, getReceiptData);
  app2.get("/api/academic-years", authMiddleware, adminOnly, handleGetAcademicYears);
  app2.post("/api/academic-years", authMiddleware, adminOnly, handleCreateAcademicYear);
  app2.put("/api/academic-years/:id", authMiddleware, adminOnly, handleUpdateAcademicYear);
  app2.delete("/api/academic-years/:id", authMiddleware, adminOnly, handleDeleteAcademicYear);
  app2.patch("/api/academic-years/:id/set-current", authMiddleware, adminOnly, handleSetCurrentAcademicYear);
  app2.get("/api/academic-years/current", handleGetCurrentAcademicYear);
  return app2;
}
const app = createServer();
const port = process.env.PORT || 3e3;
const __dirname = import.meta.dirname;
const distPath = path.join(__dirname, "../spa");
app.use(express.static(distPath));
app.get("/*", (req, res) => {
  if (req.path.startsWith("/api/") || req.path.startsWith("/health")) {
    return res.status(404).json({ error: "API endpoint not found" });
  }
  res.sendFile(path.join(distPath, "index.html"));
});
app.listen(port, () => {
  console.log(`🚀 Fusion Starter server running on port ${port}`);
  console.log(`📱 Frontend: http://localhost:${port}`);
  console.log(`🔧 API: http://localhost:${port}/api`);
});
process.on("SIGTERM", () => {
  console.log("🛑 Received SIGTERM, shutting down gracefully");
  process.exit(0);
});
process.on("SIGINT", () => {
  console.log("🛑 Received SIGINT, shutting down gracefully");
  process.exit(0);
});
//# sourceMappingURL=node-build.mjs.map
