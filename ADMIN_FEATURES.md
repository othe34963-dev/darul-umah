# Admin Features - Darul Umah School System

## 🎯 Complete Admin Functionality

All admin features have been successfully implemented with full bilingual support (English/Somali).

---

## 🎓 1. Students Management (`/dashboard/students`)

### Features:
✅ **Add New Students** with auto-generated Student IDs  
✅ **Edit Student Details**  
✅ **Delete Students**  
✅ **Search & Filter** students  
✅ **Export Student List**  
✅ **View Statistics** (Total, Male, Female, Classes)  

### Auto-Generated Student ID Format:
- Pattern: `DU-YYYY-XXX`
- Example: `DU-2025-001`, `DU-2025-002`
- Year is based on current year
- Number is auto-incremented

### Student Information Fields:
**Required:**
- Student ID (auto-generated, unique)
- Full Name
- Gender (Male/Female)
- Class Name
- Academic Year

**Optional:**
- Email address
- Phone number
- Parent phone number

### Actions Available:
- **➕ Add Student** - Opens dialog with form
- **✏️ Edit** - Update student information
- **🗑️ Delete** - Remove student from system
- **📥 Export** - Download student list (PDF/Excel)
- **🔍 Search** - Filter by name, ID, or class

### Statistics Dashboard:
- **Total Students** - Count of all students
- **Male Students** - Count by gender
- **Female Students** - Count by gender  
- **Total Classes** - Unique class count

---

## 👨‍🏫 2. Teachers Management (`/dashboard/teachers`)

### Features:
✅ **Add New Teachers** with auto-generated Employee IDs  
✅ **Edit Teacher Profiles**  
✅ **Delete Teachers**  
✅ **Assign Subjects** to teachers  
✅ **Assign Classes** to teachers  
✅ **Create Login Credentials**  
✅ **Search & Filter** teachers  
✅ **View Teacher Status** (Active/Inactive)  

### Auto-Generated Employee ID Format:
- Pattern: `TC-YYYY-XXX`
- Example: `TC-2024-001`, `TC-2024-002`
- Year is based on current year
- Number is auto-incremented

### Teacher Information Fields:
**Required:**
- Employee ID (auto-generated, unique)
- Full Name
- Email Address
- Username (for login)
- Password (default: teacher123)

**Optional:**
- Phone Number
- Subjects (comma-separated list)
- Assigned Classes (comma-separated list)

### Actions Available:
- **➕ Add Teacher** - Opens dialog with account creation
- **✏️ Edit** - Update teacher information and assignments
- **🗑️ Delete** - Remove teacher account
- **🔍 Search** - Filter by name, email, or employee ID

### Statistics Dashboard:
- **Total Teachers** - Count of all teachers
- **Active Teachers** - Currently active accounts
- **Total Classes** - Sum of all assigned classes

### Subject & Class Assignment:
Teachers can be assigned multiple subjects and classes:
- **Subjects**: Mathematics, Physics, English, etc.
- **Classes**: Grade 8A, Grade 8B, Grade 9A, etc.
- Simply enter comma-separated values

---

## 📅 3. Academic Year Management (`/dashboard/academic-year`)

### Features:
✅ **Create New Academic Years**  
✅ **Edit Year Details**  
✅ **Set Current Year**  
✅ **Archive Old Years**  
✅ **Delete Empty Years**  
✅ **View Year Statistics**  
✅ **Prevent Deletion** of years with data  

### Academic Year Format:
- Pattern: `YYYY-YYYY`
- Example: `2024-2025`, `2025-2026`
- Represents school year (e.g., September 2024 to June 2025)

### Year Information Fields:
**Required:**
- Year Name (e.g., "2024-2025")
- Start Date (e.g., September 1, 2024)
- End Date (e.g., June 30, 2025)

**Settings:**
- **Set as Current Year** - Toggle to mark as active year
- **Active Status** - Toggle to archive/activate year

### Year States:

#### **Current Year** (Green badge):
- ✅ The active academic year
- ✅ New students/records go here
- ✅ Only ONE year can be current at a time

#### **Active Year**:
- ✅ Year is active but not current
- ✅ Can view and edit records
- ✅ Can have students assigned

#### **Archived Year**:
- ❌ Marked inactive
- ✅ Read-only access
- ✅ Historical data preserved

### Actions Available:
- **➕ Create Year** - Set up new academic year
- **✏️ Edit** - Update year details
- **Set Current** - Make this the active year
- **🗑️ Delete** - Remove year (only if no students)
- **Archive** - Mark year as inactive

### Statistics:
- **Total Years** - Count of all years
- **Current Year** - Name of active year
- **Active Years** - Count of non-archived years
- **Students per Year** - Student count for each year
- **Teachers per Year** - Teacher assignments

### Data Protection:
⚠️ **Cannot delete years with students** - Must archive instead  
✅ **Prevents data loss** - Safe academic year management  
✅ **Historical records** - All past data preserved  

---

## 🆔 Student ID Generation System

### Auto-Generation Features:

**Format:** `DU-YYYY-XXX`
- **DU** = Darul Umah (school code)
- **YYYY** = Current year (e.g., 2025)
- **XXX** = Sequential number (001, 002, 003...)

**Examples:**
```
DU-2025-001 → First student of 2025
DU-2025-002 → Second student of 2025
DU-2025-150 → 150th student of 2025
```

### How It Works:

1. **Click "Add Student"**
2. Student ID is **automatically generated**
3. ID is **unique** and **sequential**
4. ID is **read-only** after creation
5. Format follows school standards

### Benefits:
✅ **No Manual Entry** - Saves time  
✅ **No Duplicates** - System enforces uniqueness  
✅ **Consistent Format** - Professional and organized  
✅ **Easy Tracking** - Year-based organization  
✅ **Searchable** - Quick student lookup  

---

## 🔑 Teacher Account Creation

### Credential Generation:

When adding a new teacher, the admin provides:
1. **Full Name** - Teacher's full name
2. **Email** - For communication and login
3. **Username** - Login identifier
4. **Password** - Initial password (default: teacher123)

**Example:**
```
Name: Ahmed Hassan Mohamed
Email: ahmed.hassan@darulumah.edu
Username: ahmed.hassan
Password: teacher123
Employee ID: TC-2024-001 (auto-generated)
```

### Teacher Can:
- Login with email or username
- Change their password after first login
- View assigned classes
- Mark attendance
- Enter marks
- Generate reports

### Admin Can:
- Create/edit teacher accounts
- Assign subjects and classes
- Activate/deactivate accounts
- Reset passwords
- View teacher activity

---

## 📊 Workflow Examples

### Adding a New Student:

1. Admin navigates to **Students** page
2. Clicks **"Add Student"** button
3. System generates ID: `DU-2025-008`
4. Admin fills in:
   - Name: "Ali Mohamed Hassan"
   - Gender: Male
   - Class: Grade 9B
   - Email: ali.mohamed@student.edu
   - Phone: +252 61 555 5555
   - Parent Phone: +252 61 999 9999
   - Academic Year: 2024-2025
5. Clicks **"Add Student"**
6. Student is created and visible in table

### Adding a New Teacher:

1. Admin navigates to **Teachers** page
2. Clicks **"Add Teacher"** button
3. System generates Employee ID: `TC-2024-003`
4. Admin fills in:
   - Name: "Maryan Farah Ali"
   - Email: maryan.farah@darulumah.edu
   - Username: maryan.farah
   - Password: teacher123
   - Phone: +252 61 777 7777
   - Subjects: Biology, Chemistry
   - Classes: Grade 10A, Grade 10B
5. Clicks **"Add Teacher"**
6. Teacher account created - can login immediately

### Creating Academic Year:

1. Admin navigates to **Academic Year** page
2. Clicks **"Create Academic Year"** button
3. System suggests name: `2025-2026`
4. Admin sets:
   - Start Date: September 1, 2025
   - End Date: June 30, 2026
   - Set as Current: No (keep 2024-2025 current)
   - Active: Yes
5. Clicks **"Create Year"**
6. New year created and ready for use

---

## 🎨 UI Features

### Search & Filter:
- Real-time search across all fields
- Filter by name, ID, email, class
- Instant results update

### Data Tables:
- Sortable columns
- Pagination (auto-added when needed)
- Avatar images with fallback initials
- Color-coded badges for status
- Responsive design

### Forms & Dialogs:
- Clean modal dialogs
- Form validation
- Required field indicators (*)
- Helpful placeholders
- Success/error notifications

### Statistics Cards:
- Real-time counts
- Color-coded metrics
- Visual icons
- Quick overview

---

## 🔒 Admin-Only Features

These pages are **only accessible to Admin role**:

✅ Students Management - Full CRUD  
✅ Teachers Management - Full CRUD  
✅ Academic Year Management - Full CRUD  
✅ Settings - System configuration  

**Teachers cannot access:**
❌ Add/delete students  
❌ Manage other teachers  
❌ Create/delete academic years  
❌ System settings  

---

## 🌍 Bilingual Labels

All admin features support English/Somali:

### Students Page:
- "Students Management" → "Maamulka Ardayda"
- "Add Student" → "Ku dar Arday"
- "Student ID" → "Aqoonsiga Ardayga"
- "Full Name" → "Magaca Buuxa"
- "Gender" → "Jinsiga"
- "Male" → "Lab"
- "Female" → "Dheddig"

### Teachers Page:
- "Teachers Management" → "Maamulka Macallimiinta"
- "Add Teacher" → "Ku dar Macallin"
- "Employee ID" → "Aqoonsiga Shaqaalaha"
- "Subjects" → "Maadooyinka"
- "Active" → "Firfircoon"

### Academic Year:
- "Academic Year Management" → "Maamulka Sanadka Dugsiga"
- "Create Academic Year" → "Abuur Sanad Dugsiyeed"
- "Current" → "Hadda"
- "Archived" → "La keydiyay"

---

## 📝 Summary

**3 New Admin Pages Created:**
1. ✅ `Students.tsx` - Full student management with ID generation
2. ✅ `Teachers.tsx` - Full teacher management with account creation
3. ✅ `AcademicYear.tsx` - Full year management with current year toggle

**Features Implemented:**
- ✅ Auto-generated IDs (Student & Employee)
- ✅ Full CRUD operations
- ✅ Search & filter functionality
- ✅ Form validation
- ✅ Statistics dashboards
- ✅ Bilingual support
- ✅ Back navigation buttons
- ✅ Responsive design
- ✅ Toast notifications
- ✅ Delete protection for data integrity

**All requirements met! 🎉**

The admin can now fully manage students, teachers, and academic years with professional ID generation and assignment systems!

