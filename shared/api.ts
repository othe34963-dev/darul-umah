/**
 * Shared code between client and server
 * Useful to share types between client and server
 * and/or small pure JS functions that can be used on both client and server
 */

/**
 * Example response type for /api/demo
 */
export interface DemoResponse {
  message: string;
}

// Teacher & Student Data Types
export interface Teacher {
  id: string;
  name: string;
  email: string;
  phone: string;
  photoUrl?: string;
  subjects: string[];
  classes: string[];
}

export interface Student {
  id: string;
  name: string;
  gender: "male" | "female";
  className: string;
  email?: string;
  phone?: string;
  photoUrl?: string;
}

export interface Class {
  id: string;
  name: string;
  subject: string;
  teacherId: string;
  studentIds: string[];
  academicYear: string;
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  classId: string;
  date: string;
  status: "present" | "absent" | "late" | "excused";
  notes?: string;
}

export interface Mark {
  id: string;
  studentId: string;
  classId: string;
  subject: string;
  midterm?: number;
  final?: number;
  homework?: number;
  total?: number;
  grade?: string;
  status: "draft" | "submitted" | "published";
  academicYear: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: "info" | "warning" | "success" | "error";
  date: string;
  read: boolean;
}

// Fees Management Types
export type FeeType = "TUITION" | "EXAM" | "LIBRARY" | "TRANSPORT" | "HOSTEL" | "UNIFORM" | "BOOKS" | "OTHER";
export type FeeStatus = "PENDING" | "PAID" | "OVERDUE" | "WAIVED";

export interface Fee {
  id: string;
  studentId: string;
  student: {
    id: string;
    studentId: string;
    name: string;
    className: string;
  };
  academicYearId: string;
  academicYear: {
    id: string;
    name: string;
  };
  feeType: FeeType;
  amount: number;
  dueDate: string;
  status: FeeStatus;
  paymentDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateFeeRequest {
  studentId: string;
  academicYearId: string;
  feeType: FeeType;
  amount: number;
  dueDate: string;
  notes?: string;
}

export interface UpdateFeeRequest {
  studentId?: string;
  academicYearId?: string;
  feeType?: FeeType;
  amount?: number;
  dueDate?: string;
  notes?: string;
}

export interface FeesResponse {
  fees: Fee[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  summary: {
    totalPaid: number;
    totalPending: number;
    totalOverdue: number;
    paidCount: number;
    pendingCount: number;
    overdueCount: number;
  };
}

export interface StudentOption {
  id: string;
  studentId: string;
  name: string;
  className: string;
  academicYear: {
    id: string;
    name: string;
  };
}

export interface ClassOption {
  id: string;
  name: string;
  subject: string;
  teacher: {
    id: string;
    name: string;
  };
  academicYear: {
    id: string;
    name: string;
  };
  studentCount: number;
  studentIds: string;
  isActive: boolean;
}

export interface BulkGenerateFeesRequest {
  classIds: string[];
  feeType: FeeType;
  amount: number;
  dueDate: string;
  notes?: string;
}

export interface BulkGenerateFeesResponse {
  success: boolean;
  createdCount: number;
  fees: Fee[];
  errors?: string[];
}
