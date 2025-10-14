import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";

// Auth
import { handleLogin, handleRegister, handleGetMe } from "./routes/auth";
import { authMiddleware, adminOnly } from "./lib/auth";

// Students
import {
  handleGetStudents,
  handleGetStudent,
  handleCreateStudent,
  handleUpdateStudent,
  handleDeleteStudent,
  handleGetStudentResults,
  handleGetAllPublicResults
} from "./routes/students";

// Teachers
import {
  handleGetTeachers,
  handleGetTeacher,
  handleUpdateTeacher,
  handleGetTeacherClasses
} from "./routes/teachers";

// Marks
import {
  handleGetMarksByClass,
  handleUpsertMark,
  handleSubmitMarks,
  handleApproveMarks,
  handlePublishResults,
  handleCloseResults
} from "./routes/marks";

// Attendance
import {
  handleGetAttendance,
  handleMarkAttendance,
  handleGetAttendanceStats
} from "./routes/attendance";


// Fees
import {
  getFees,
  createFee,
  updateFee,
  deleteFee,
  markAsPaid,
  getStudents,
  getReceiptData,
  getClasses,
  bulkGenerateFees
} from "./routes/fees";

// Academic Years
import {
  handleGetAcademicYears,
  handleCreateAcademicYear,
  handleUpdateAcademicYear,
  handleDeleteAcademicYear,
  handleSetCurrentAcademicYear,
  handleGetCurrentAcademicYear
} from "./routes/academic-years";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Root route - API info
  app.get("/", (_req, res) => {
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

  // Health check
  app.get("/api/ping", (_req, res) => {
    res.json({ message: "pong" });
  });

  // Demo route
  app.get("/api/demo", handleDemo);

  // ===== PUBLIC ROUTES =====
  
  // Authentication
  app.post("/api/auth/login", handleLogin);
  app.post("/api/auth/register", handleRegister);
  
  // Public student results
  app.get("/api/public/results", handleGetAllPublicResults);
  app.get("/api/public/results/:studentId", handleGetStudentResults);

  // ===== PROTECTED ROUTES =====

  // Get current user
  app.get("/api/auth/me", authMiddleware, handleGetMe);

  // Students (Teachers can read, Admin can CRUD)
  app.get("/api/students", authMiddleware, handleGetStudents);
  app.get("/api/students/:id", authMiddleware, handleGetStudent);
  app.post("/api/students", authMiddleware, adminOnly, handleCreateStudent);
  app.put("/api/students/:id", authMiddleware, adminOnly, handleUpdateStudent);
  app.delete("/api/students/:id", authMiddleware, adminOnly, handleDeleteStudent);

  // Teachers (Admin only for CRUD, Teachers can read own)
  app.get("/api/teachers", authMiddleware, handleGetTeachers);
  app.get("/api/teachers/:id", authMiddleware, handleGetTeacher);
  app.put("/api/teachers/:id", authMiddleware, handleUpdateTeacher);
  app.get("/api/teachers/me/classes", authMiddleware, handleGetTeacherClasses);

  // Marks (Teachers can CRUD draft, Admin can approve/publish)
  app.get("/api/marks/class/:classId", authMiddleware, handleGetMarksByClass);
  app.post("/api/marks", authMiddleware, handleUpsertMark);
  app.post("/api/marks/submit", authMiddleware, handleSubmitMarks);
  app.post("/api/marks/approve", authMiddleware, adminOnly, handleApproveMarks);
  app.post("/api/marks/publish", authMiddleware, adminOnly, handlePublishResults);
  app.post("/api/marks/close", authMiddleware, adminOnly, handleCloseResults);

  // Attendance (Teachers can mark, both can read)
  app.get("/api/attendance", authMiddleware, handleGetAttendance);
  app.post("/api/attendance", authMiddleware, handleMarkAttendance);
  app.get("/api/attendance/stats", authMiddleware, handleGetAttendanceStats);


  // Fees (Admin only)
  app.get("/api/fees", authMiddleware, adminOnly, getFees);
  app.post("/api/fees", authMiddleware, adminOnly, createFee);
  app.put("/api/fees/:id", authMiddleware, adminOnly, updateFee);
  app.delete("/api/fees/:id", authMiddleware, adminOnly, deleteFee);
  app.patch("/api/fees/:id/paid", authMiddleware, adminOnly, markAsPaid);
  app.get("/api/fees/students", authMiddleware, adminOnly, getStudents);
  app.get("/api/fees/classes", authMiddleware, adminOnly, getClasses);
  app.post("/api/fees/bulk-generate", authMiddleware, adminOnly, bulkGenerateFees);
  app.get("/api/fees/receipt/:id", authMiddleware, adminOnly, getReceiptData);

  // Academic Years (Admin only)
  app.get("/api/academic-years", authMiddleware, adminOnly, handleGetAcademicYears);
  app.post("/api/academic-years", authMiddleware, adminOnly, handleCreateAcademicYear);
  app.put("/api/academic-years/:id", authMiddleware, adminOnly, handleUpdateAcademicYear);
  app.delete("/api/academic-years/:id", authMiddleware, adminOnly, handleDeleteAcademicYear);
  app.patch("/api/academic-years/:id/set-current", authMiddleware, adminOnly, handleSetCurrentAcademicYear);
  app.get("/api/academic-years/current", handleGetCurrentAcademicYear);

  return app;
}
