# Darul Umah School Management System - Setup Guide

## 🎓 Complete Setup Instructions

This is a full-featured, bilingual (Somali + English) School Management System with offline/online capability.

---

## 📋 Prerequisites

Before you begin, ensure you have installed:
- **Node.js** (v18 or higher)
- **pnpm** (Package manager)
- **Git** (Optional, for version control)

---

## 🚀 Quick Start (5 minutes)

### Step 1: Install Dependencies

```bash
cd "c:\Users\abdihakim\Desktop\darul umah"
pnpm install
```

### Step 2: Set Up Environment Variables

Create a `.env` file in the project root:

```env
# Database
DATABASE_URL="file:./dev.db"

# JWT Secret (Change this in production!)
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"

# Server Port
PORT=5000

# Frontend URL (for CORS)
FRONTEND_URL="http://localhost:3000"

# School Information
SCHOOL_NAME="Darul Umah School"
SCHOOL_LOGO_URL="/darul-umah-logo.svg"

# Results Publication Status
RESULTS_PUBLISHED=true
```

### Step 3: Initialize Database

```bash
# Generate Prisma Client
pnpm db:generate

# Create database schema
pnpm db:push

# Seed with sample data
pnpm db:seed
```

### Step 4: Start Development Servers

Open **TWO terminal windows**:

**Terminal 1 - Backend (Port 5000):**
```bash
cd "c:\Users\abdihakim\Desktop\darul umah"
pnpm dev:server
```

**Terminal 2 - Frontend (Port 3000):**
```bash
cd "c:\Users\abdihakim\Desktop\darul umah"
pnpm dev
```

### Step 5: Access the System

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000/api/ping

---

## 🔐 Default Login Credentials

After seeding, you can login with:

### Admin Account:
- **Email**: `admin@darulumah.edu`
- **Password**: `admin123`
- **Role**: School Admin

### Teacher Account:
- **Email**: `ahmed.hassan@darulumah.edu`
- **Password**: `teacher123`
- **Role**: Teacher

### Test Student ID (for public results):
- **Student ID**: `DU-2025-001`
- **Name**: Fatima Ahmed Ali

---

## 📊 Database Management

### View Database (GUI):
```bash
pnpm db:studio
```
This opens Prisma Studio at http://localhost:5555

### Reset Database:
```bash
rm dev.db
pnpm db:push
pnpm db:seed
```

---

## 🏗️ System Architecture

```
darul-umah/
├── prisma/
│   └── schema.prisma          # Database schema (SQLite/PostgreSQL)
├── server/
│   ├── lib/
│   │   ├── prisma.ts          # Prisma client
│   │   └── auth.ts            # JWT authentication
│   ├── routes/
│   │   ├── auth.ts            # Login, Register
│   │   ├── students.ts        # Student CRUD + Public Results
│   │   ├── teachers.ts        # Teacher management
│   │   ├── marks.ts           # Marks/Results management
│   │   ├── attendance.ts      # Attendance tracking
│   │   └── academic-years.ts  # Academic year management
│   ├── index.ts               # Express server setup
│   ├── dev.ts                 # Development server
│   └── seed.ts                # Database seeding
├── client/
│   ├── pages/
│   │   ├── Index.tsx          # Public results page
│   │   ├── Login.tsx          # Enhanced login
│   │   └── dashboard/
│   │       ├── Home.tsx       # Dashboard (Teacher/Admin)
│   │       ├── MyClasses.tsx  # Teacher: Class management
│   │       ├── Profile.tsx    # Teacher: Profile editor
│   │       ├── Attendance.tsx # Attendance marking
│   │       ├── Marks.tsx      # Marks entry
│   │       ├── Reports.tsx    # Report generation
│   │       └── StudentList.tsx# Class student list
│   ├── components/
│   │   ├── layout/
│   │   │   ├── PublicLayout.tsx      # Public page layout
│   │   │   └── DashboardLayout.tsx   # Role-based sidebar
│   │   └── common/
│   │       ├── AcademicYearSelector.tsx
│   │       ├── Footer.tsx
│   │       ├── Logo.tsx
│   │       └── LanguageToggle.tsx
│   └── context/
│       └── AppContext.tsx     # Global state management
└── shared/
    └── api.ts                 # Shared TypeScript types
```

---

## 🎨 Features Overview

### Public Features (No Login Required):
✅ **Student Results Lookup** - Enter Student ID to view exam results  
✅ **Results Toggle** - Admin can publish/close results visibility  
✅ **Bilingual Interface** - English/Somali language toggle  
✅ **Mobile Responsive** - Works on phones, tablets, desktops  

### Admin Features:
✅ **Dashboard** - School statistics and overview  
✅ **Student Management** - Add, edit, delete students  
✅ **Teacher Management** - Manage teacher accounts  
✅ **Academic Year** - Create and manage school years  
✅ **Results Approval** - Review and approve teacher submissions  
✅ **Results Publication** - Control public visibility  
✅ **ID Card Generation** - Generate student ID cards (Coming soon)  
✅ **Reports & Export** - Download records in PDF/Excel  
✅ **Settings** - School information management  

### Teacher Features:
✅ **Dashboard** - Personal stats and quick actions  
✅ **My Classes** - View assigned classes  
✅ **Attendance** - Mark daily attendance with calendar  
✅ **Marks Entry** - Enter midterm, final, homework marks  
✅ **Auto-Grading** - Automatic grade calculation (A+ to F)  
✅ **Submit to Admin** - Send marks for approval  
✅ **View Results** - Read-only access to published results  
✅ **Reports** - Generate class performance reports  
✅ **Profile** - Edit personal info and change password  
✅ **Notifications** - Receive admin messages  

---

## 🌐 API Endpoints

### Public Endpoints:
```
POST   /api/auth/login              # User login
POST   /api/auth/register           # User registration
GET    /api/public/results/:studentId  # Public results lookup
```

### Protected Endpoints (Require Authentication):

**Students:**
```
GET    /api/students                # List all students
GET    /api/students/:id            # Get student details
POST   /api/students                # Create student (Admin only)
PUT    /api/students/:id            # Update student (Admin only)
DELETE /api/students/:id            # Delete student (Admin only)
```

**Teachers:**
```
GET    /api/teachers                # List all teachers
GET    /api/teachers/:id            # Get teacher details
PUT    /api/teachers/:id            # Update teacher profile
GET    /api/teachers/me/classes     # Get teacher's classes
```

**Marks/Results:**
```
GET    /api/marks/class/:classId    # Get marks by class
POST   /api/marks                   # Create/update mark
POST   /api/marks/submit            # Submit marks to admin
POST   /api/marks/approve           # Approve marks (Admin)
POST   /api/marks/publish           # Publish results (Admin)
POST   /api/marks/close             # Close results (Admin)
```

**Attendance:**
```
GET    /api/attendance              # Get attendance records
POST   /api/attendance              # Mark attendance
GET    /api/attendance/stats        # Get attendance statistics
```

**Academic Years:**
```
GET    /api/academic-years          # List all years
GET    /api/academic-years/current  # Get current year
POST   /api/academic-years          # Create year (Admin)
PUT    /api/academic-years/:id      # Update year (Admin)
DELETE /api/academic-years/:id      # Delete year (Admin)
```

---

## 🗄️ Database Schema

### Core Tables:
- **User** - Authentication and role management
- **Admin** - Admin profile information
- **Teacher** - Teacher profile information
- **Student** - Student records with Student ID
- **AcademicYear** - School years (2024-2025, etc.)
- **Class** - Classes with teacher assignments
- **Mark** - Student marks/results with status workflow
- **Attendance** - Daily attendance records
- **Settings** - System settings (key-value store)
- **Notification** - System notifications

### Status Workflows:

**Mark Status:**
1. DRAFT → Teacher creates marks
2. SUBMITTED → Teacher submits to admin
3. APPROVED → Admin approves
4. PUBLISHED → Available to public

**Attendance Status:**
- PRESENT
- ABSENT
- LATE
- EXCUSED

---

## 🔒 Security Features

✅ **JWT Authentication** - Secure token-based auth  
✅ **Password Hashing** - bcrypt encryption  
✅ **Role-Based Access** - Admin vs Teacher permissions  
✅ **Protected Routes** - Middleware authentication  
✅ **CORS Configuration** - Frontend/Backend security  

---

## 📱 Deployment Options

### Option 1: Local/Offline (SQLite)
- Perfect for school computers without internet
- Database file: `dev.db`
- No external dependencies

### Option 2: Cloud (PostgreSQL)
1. Change `DATABASE_URL` in `.env` to PostgreSQL connection string
2. Update `prisma/schema.prisma`:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```
3. Run `pnpm db:push` and `pnpm db:seed`

### Option 3: Netlify/Vercel
- Use Netlify or Vercel for frontend
- Use Railway/Render/Supabase for backend + database
- Update `FRONTEND_URL` in `.env`

---

## 🛠️ Development Commands

```bash
# Frontend Development
pnpm dev                 # Start Vite dev server (port 3000)

# Backend Development  
pnpm dev:server          # Start Express server (port 5000)

# Database
pnpm db:generate         # Generate Prisma Client
pnpm db:push             # Push schema to database
pnpm db:studio           # Open Prisma Studio GUI
pnpm db:seed             # Seed with sample data

# Production Build
pnpm build               # Build frontend and backend
pnpm start               # Start production server

# Code Quality
pnpm typecheck           # TypeScript validation
pnpm test                # Run tests
pnpm format.fix          # Format code with Prettier
```

---

## 🎯 Testing the System

### 1. Test Public Results Page
1. Go to http://localhost:3000
2. Enter Student ID: `DU-2025-001`
3. Click "Search" to see results

### 2. Test Teacher Login
1. Click "Staff Login" button
2. Select "Teacher" role
3. Email: `ahmed.hassan@darulumah.edu`
4. Password: `teacher123`
5. Explore: Dashboard → My Classes → Attendance → Marks

### 3. Test Admin Login
1. Logout from teacher account
2. Login with "Admin" role
3. Email: `admin@darulumah.edu`
4. Password: `admin123`
5. Explore: Dashboard → Students → Teachers → Results

---

## 🌍 Language Support

The system supports **English** and **Somali**:

- Toggle language with the button in top-right corner
- All UI labels are bilingual
- Consistent translations across all pages

Example translations:
- Students → Ardayda
- Teachers → Macallimiinta
- Results → Natiijooyinka
- Attendance → Hoyga
- Dashboard → Golaha

---

## 🐛 Troubleshooting

### Issue: "pnpm not found"
```bash
npm install -g pnpm
```

### Issue: Database connection errors
```bash
rm dev.db
pnpm db:push
pnpm db:seed
```

### Issue: Port already in use
- Change `PORT` in `.env` to different number
- Or stop the process using that port

### Issue: Frontend can't connect to backend
- Ensure both servers are running
- Check `FRONTEND_URL` and `PORT` in `.env`
- Verify CORS settings in `server/index.ts`

---

## 📞 Support

For issues or questions:
1. Check the console for error messages
2. Review database with `pnpm db:studio`
3. Check API responses in browser DevTools (Network tab)

---

## 🎉 You're All Set!

Your Darul Umah School Management System is ready to use!

**Next Steps:**
1. Login as Admin and explore features
2. Add your real students and teachers
3. Customize school information in Settings
4. Test the complete workflow: Attendance → Marks → Publish Results
5. Customize colors and branding as needed

**Important:** Change the `JWT_SECRET` in `.env` before deploying to production!

---

## 📚 Documentation Files

- `TEACHER_FEATURES.md` - Complete teacher features documentation
- `SETUP.md` - This file
- `README.md` - Project overview
- `AGENTS.md` - Development notes

---

Enjoy your new school management system! 🎓✨

