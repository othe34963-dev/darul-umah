import { RequestHandler } from "express";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";

const prisma = new PrismaClient();

// Validation schemas
const createFeeSchema = z.object({
  studentId: z.string().min(1, "Student ID is required"),
  academicYearId: z.string().min(1, "Academic Year ID is required"),
  feeType: z.enum(["TUITION", "EXAM", "LIBRARY", "TRANSPORT", "HOSTEL", "UNIFORM", "BOOKS", "OTHER"]),
  amount: z.number().positive("Amount must be positive"),
  dueDate: z.string().datetime("Invalid due date"),
  notes: z.string().optional(),
});

const updateFeeSchema = createFeeSchema.partial();

// Auto-update overdue fees
async function updateOverdueFees() {
  const today = new Date();
  await prisma.fee.updateMany({
    where: {
      status: "PENDING",
      dueDate: {
        lt: today,
      },
    },
    data: {
      status: "OVERDUE",
    },
  });
}

// GET /api/fees - List all fees with auto overdue update
export const getFees: RequestHandler = async (req, res) => {
  try {
    // Auto-update overdue fees
    await updateOverdueFees();

    const { page = "1", limit = "10", search, status, classId, sortBy = "dueDate", sortOrder = "asc" } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Build where clause
    const where: any = {};
    
    if (search) {
      where.OR = [
        { student: { name: { contains: search as string, mode: "insensitive" } } },
        { student: { studentId: { contains: search as string, mode: "insensitive" } } },
        { student: { className: { contains: search as string, mode: "insensitive" } } },
      ];
    }

    if (status && status !== "ALL") {
      where.status = status;
    }

    if (classId && classId !== "ALL") {
      // Find the class name by class ID
      const classRecord = await prisma.class.findUnique({
        where: { id: classId as string },
        select: { name: true },
      });
      
      if (classRecord) {
        where.student = {
          ...where.student,
          className: classRecord.name,
        };
      }
    }

    // Build orderBy clause
    const orderBy: any = {};
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
              className: true,
            },
          },
          academicYear: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy,
        skip,
        take: limitNum,
      }),
      prisma.fee.count({ where }),
    ]);

    // Get summary statistics
    const summary = await prisma.fee.groupBy({
      by: ["status"],
      _sum: {
        amount: true,
      },
      _count: {
        id: true,
      },
    });

    const summaryData = {
      totalPaid: summary.find(s => s.status === "PAID")?._sum.amount || 0,
      totalPending: summary.find(s => s.status === "PENDING")?._sum.amount || 0,
      totalOverdue: summary.find(s => s.status === "OVERDUE")?._sum.amount || 0,
      paidCount: summary.find(s => s.status === "PAID")?._count.id || 0,
      pendingCount: summary.find(s => s.status === "PENDING")?._count.id || 0,
      overdueCount: summary.find(s => s.status === "OVERDUE")?._count.id || 0,
    };

    res.json({
      fees,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
      summary: summaryData,
    });
  } catch (error) {
    console.error("Error fetching fees:", error);
    res.status(500).json({ error: "Failed to fetch fees" });
  }
};

// POST /api/fees - Create new fee
export const createFee: RequestHandler = async (req, res) => {
  try {
    const validatedData = createFeeSchema.parse(req.body);

    // Verify student exists
    const student = await prisma.student.findUnique({
      where: { id: validatedData.studentId },
      include: { academicYear: true },
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
        notes: validatedData.notes,
      },
      include: {
        student: {
          select: {
            id: true,
            studentId: true,
            name: true,
            className: true,
          },
        },
        academicYear: {
          select: {
            id: true,
            name: true,
          },
        },
      },
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

// PUT /api/fees/:id - Update fee
export const updateFee: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const validatedData = updateFeeSchema.parse(req.body);

    const fee = await prisma.fee.update({
      where: { id },
      data: {
        ...validatedData,
        dueDate: validatedData.dueDate ? new Date(validatedData.dueDate) : undefined,
      },
      include: {
        student: {
          select: {
            id: true,
            studentId: true,
            name: true,
            className: true,
          },
        },
        academicYear: {
          select: {
            id: true,
            name: true,
          },
        },
      },
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

// DELETE /api/fees/:id - Delete fee
export const deleteFee: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.fee.delete({
      where: { id },
    });

    res.json({ message: "Fee deleted successfully" });
  } catch (error) {
    console.error("Error deleting fee:", error);
    res.status(500).json({ error: "Failed to delete fee" });
  }
};

// PATCH /api/fees/:id/paid - Mark fee as paid
export const markAsPaid: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;

    const fee = await prisma.fee.update({
      where: { id },
      data: {
        status: "PAID",
        paymentDate: new Date(),
      },
      include: {
        student: {
          select: {
            id: true,
            studentId: true,
            name: true,
            className: true,
          },
        },
        academicYear: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    res.json(fee);
  } catch (error) {
    console.error("Error marking fee as paid:", error);
    res.status(500).json({ error: "Failed to mark fee as paid" });
  }
};

// GET /api/fees/students - Get students for dropdown
export const getStudents: RequestHandler = async (req, res) => {
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
            name: true,
          },
        },
      },
      orderBy: { name: "asc" },
    });

    res.json(students);
  } catch (error) {
    console.error("Error fetching students:", error);
    res.status(500).json({ error: "Failed to fetch students" });
  }
};

// GET /api/fees/receipt/:id - Generate receipt data
export const getReceiptData: RequestHandler = async (req, res) => {
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
            className: true,
          },
        },
        academicYear: {
          select: {
            id: true,
            name: true,
          },
        },
      },
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

// GET /api/fees/classes - Get all classes for bulk fee generation
export const getClasses: RequestHandler = async (req, res) => {
  try {
    const classes = await prisma.class.findMany({
      where: { isActive: true },
      include: {
        teacher: {
          select: {
            id: true,
            name: true,
          },
        },
        academicYear: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            marks: true,
          },
        },
      },
      orderBy: { name: "asc" },
    });

    // Get student count for each class
    const classesWithStudentCount = await Promise.all(
      classes.map(async (cls) => {
        const studentIds = JSON.parse(cls.studentIds || "[]");
        const studentCount = await prisma.student.count({
          where: {
            id: { in: studentIds },
            isActive: true,
          },
        });

        return {
          ...cls,
          studentCount,
        };
      })
    );

    res.json(classesWithStudentCount);
  } catch (error) {
    console.error("Error fetching classes:", error);
    res.status(500).json({ error: "Failed to fetch classes" });
  }
};

// POST /api/fees/bulk-generate - Generate fees for all students in selected classes
export const bulkGenerateFees: RequestHandler = async (req, res) => {
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
        // Get class details
        const classData = await prisma.class.findUnique({
          where: { id: classId },
          include: {
            academicYear: true,
          },
        });

        if (!classData) {
          errors.push(`Class with ID ${classId} not found`);
          continue;
        }

        // Get all students in this class
        const studentIds = JSON.parse(classData.studentIds || "[]");
        const students = await prisma.student.findMany({
          where: {
            id: { in: studentIds },
            isActive: true,
          },
        });

        // Create fees for each student
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
                notes: notes || `Bulk generated for ${classData.name}`,
              },
              include: {
                student: {
                  select: {
                    id: true,
                    studentId: true,
                    name: true,
                    className: true,
                  },
                },
                academicYear: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
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
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error("Error bulk generating fees:", error);
    res.status(500).json({ error: "Failed to bulk generate fees" });
  }
};
