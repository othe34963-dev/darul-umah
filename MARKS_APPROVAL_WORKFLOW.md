# Marks Approval Workflow & Exam Schedule Integration

## Overview
This document describes the complete workflow for exam scheduling, marks entry, and marks approval in the Darul Umah School Management System.

## Workflow Steps

### 1. **Admin Schedules Exams** 📅
- **Who**: Admin only
- **Page**: `/dashboard/exam-schedule`
- **Actions**:
  - Create new exam schedules
  - Set exam type (Midterm, Final, Quiz, Monthly)
  - Assign class, subject, date, time, and room
  - Edit or delete existing exam schedules
  - View upcoming and past exams

### 2. **Teacher Enters Marks** ✍️
- **Who**: Teachers
- **Page**: `/dashboard/marks`
- **Actions**:
  - View exam schedules (can see what exams are coming)
  - Enter marks for students (Midterm, Final, Homework)
  - Save as draft (can edit anytime)
  - Submit marks for admin approval (becomes locked)
  - **Status**: Draft (Yellow "Pending Approval" badge appears)

### 3. **Admin Reviews & Approves** ✅
- **Who**: Admin only
- **Page**: `/dashboard/marks`
- **Actions**:
  - Review submitted marks from teachers
  - See status: "Pending Approval" in yellow badge
  - **Approve**: Makes marks final and locked (Green "Approved" badge)
  - **Reject**: Returns marks to teacher for revision (back to Draft)

### 4. **Final State** 🎯
- Once approved, marks are **permanently locked**
- Cannot be edited by anyone
- Green "Approved" badge shows the status
- Marks are now official and ready for reports

## Status Badges

| Status | Badge Color | Description | Can Edit? |
|--------|-------------|-------------|-----------|
| **Draft** | Gray (Clock icon) | Teacher is working on marks | ✅ Teacher only |
| **Pending Approval** | Yellow (Send icon) | Submitted to admin | ❌ Locked |
| **Approved** | Green (CheckCircle) | Final approved marks | ❌ Locked |

## User Roles & Permissions

### Admin Permissions
- ✅ Schedule exams
- ✅ View all exam schedules
- ✅ View all marks (draft, submitted, approved)
- ✅ Approve marks
- ✅ Reject marks (send back to teacher)
- ✅ Access Exam Schedule page
- ✅ Access Marks Approval page

### Teacher Permissions
- ❌ Cannot schedule exams
- ✅ Can view exam schedules (read-only)
- ✅ Enter marks for their classes
- ✅ Save marks as draft
- ✅ Submit marks for approval
- ✅ Edit rejected marks
- ❌ Cannot approve marks
- ❌ Cannot access Exam Schedule management

## Navigation & Connections

### Admin Dashboard Quick Actions
1. **Exam Schedule** → Schedule and manage exams
2. **Approve Marks** → Review and approve teacher submissions
3. Links between pages for smooth workflow

### Teacher Dashboard Quick Actions
1. **Mark Attendance** → Take daily attendance
2. **Enter Marks** → Submit marks for approval
3. **My Classes** → View assigned classes

### Cross-Page Connections

#### Exam Schedule Page → Marks Approval
- Green connection card: "Review & Approve Marks"
- Links to `/dashboard/marks`
- Explains the next step after scheduling exams

#### Marks Page → Exam Schedule
- **Admin**: Purple connection card: "Manage Exam Schedule"
- **Teacher**: Blue informational card: "View Exam Schedule"
- Links to `/dashboard/exam-schedule` (admin only)

## Technical Implementation

### Routes
```typescript
// Admin only - Exam Schedule
<Route path="/dashboard/exam-schedule" element={
  <ProtectedRoute adminOnly>
    <ExamSchedule />
  </ProtectedRoute>
} />

// Both roles - Marks (different views)
<Route path="/dashboard/marks" element={
  <ProtectedRoute>
    <Marks />
  </ProtectedRoute>
} />
```

### Data Storage
- **Exam Schedules**: `localStorage.du_exam_schedules_json`
- **Marks**: `localStorage.du_marks_store_json`
- All data persists per academic year

### Status Management
```typescript
type MarksStatus = "draft" | "submitted" | "approved";

// Teacher actions (only in draft state)
- Save Draft
- Submit for Approval

// Admin actions (only in submitted state)
- Approve Marks
- Reject (back to draft)
```

## User Experience Features

### Visual Feedback
- Color-coded badges for status
- Alert messages explaining current state
- Disabled input fields when marks are locked
- Role-specific button visibility

### Workflow Alerts
1. **Teacher - Submitted**: Yellow alert explaining they must wait for approval
2. **Admin - Pending**: Blue alert prompting to review and approve/reject
3. **Both - Approved**: Green alert showing marks are final

### Data Validation
- Required fields: Exam name, class, subject, date
- Mark ranges: 0-100
- Automatic calculation of totals and percentages
- Performance scale: Excellent (85-100%), Good (70-84%), Satisfactory (50-69%), Needs Improvement (0-49%)

## Benefits

### For Administrators
- ✅ Full control over exam scheduling
- ✅ Quality assurance for entered marks
- ✅ Prevent unauthorized mark changes
- ✅ Clear audit trail

### For Teachers
- ✅ Clear exam schedule visibility
- ✅ Simple mark entry process
- ✅ Draft mode for work-in-progress
- ✅ Confirmation when approved

### For the School
- ✅ Professional marks management
- ✅ Accountability and transparency
- ✅ Reduced errors and disputes
- ✅ Organized exam logistics

## Future Enhancements (Potential)
- Email notifications when marks are approved/rejected
- Comments/notes from admin to teacher on rejection
- Bulk approval for multiple classes
- Print exam schedules
- Export marks history

