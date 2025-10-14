import DashboardLayout from "@/components/layout/DashboardLayout";
import { useApp } from "@/context/AppContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap, BookOpen, FileEdit, CalendarCheck, Users, IdCard, TrendingUp, FolderArchive, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";

export default function DashboardHome() {
  const { language, user, results } = useApp();
  
  const t = (en: string, so: string) => (language === "en" ? en : so);
  
  // Load real data from localStorage
  const [realData, setRealData] = useState({
    students: [] as any[],
    teachers: [] as any[],
    classes: [] as any[],
    subjects: [] as any[],
    marks: [] as any[],
  });

  useEffect(() => {
    try {
      const studentsData = localStorage.getItem("du_students_store_json");
      const teachersData = localStorage.getItem("du_teachers_store_json");
      const classesData = localStorage.getItem("du_classes_store_json");
      const subjectsData = localStorage.getItem("du_subjects_store_json");
      const marksData = localStorage.getItem("du_marks_store_json");
      
      setRealData({
        students: studentsData ? JSON.parse(studentsData) : [],
        teachers: teachersData ? JSON.parse(teachersData) : [],
        classes: classesData ? JSON.parse(classesData) : [],
        subjects: subjectsData ? JSON.parse(subjectsData) : [],
        marks: marksData ? JSON.parse(marksData) : [],
      });
    } catch (error) {
      console.error("Failed to load data:", error);
    }
  }, []);

  // Calculate real teacher stats
  const teacherStats = {
    myStudents: realData.students.length, // Total students (in real app, filter by teacher's classes)
    mySubjects: realData.subjects.length, // Total subjects (in real app, filter by teacher)
    pendingMarks: 0, // Count from marks with status 'draft'
    attendanceThisWeek: { present: 95, absent: 5 }, // Calculate from attendance data
  };

  // Calculate real admin stats
  const totalResults = Object.keys(results).length;
  
  const adminStats = {
    totalStudents: realData.students.length || totalResults, // Fallback to results count if no students data
    totalTeachers: realData.teachers.length,
    totalClasses: realData.classes.length,
  };

  const isTeacher = user.role === "teacher";
  const stats = isTeacher ? teacherStats : adminStats;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Welcome Header */}
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            {t("Welcome", "Ku soo dhawoow")}, {user.role === "admin" ? t("Admin", "Maamule") : t("Teacher", "Macallin")}! 👋
          </h2>
          <p className="text-muted-foreground mt-1">
            {isTeacher 
              ? t("Manage your classes, attendance, and student progress.", "Maamul fasalka, hoyga, iyo horumarka ardayda.")
              : t("Monitor school operations and manage staff.", "La soco howlaha dugsiga iyo maamulka shaqaalaha.")}
          </p>
        </div>

        {/* Quick Stats Cards */}
        {isTeacher ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {t("My Students", "Ardaydayda")}
                </CardTitle>
                <GraduationCap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{teacherStats.myStudents}</div>
                <p className="text-xs text-muted-foreground">
                  {t("Students assigned to you", "Ardayda laguu qoondeeyay")}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {t("My Subjects", "Maadooyinkayga")}
                </CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{teacherStats.mySubjects}</div>
                <p className="text-xs text-muted-foreground">
                  {t("Subjects you teach", "Maadooyinka aad bartid")}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {t("Pending Marks", "Dhibcaha Sugaya")}
                </CardTitle>
                <FileEdit className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">{teacherStats.pendingMarks}</div>
                <p className="text-xs text-muted-foreground">
                  {t("Results to be entered", "Natiijooyin la gelin")}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {t("This Week", "Toddobaadkan")}
                </CardTitle>
                <CalendarCheck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {teacherStats.attendanceThisWeek.present}%
                </div>
                <p className="text-xs text-muted-foreground">
                  {t("Attendance rate", "Heerka imashada")}
                </p>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {t("Total Students", "Wadarta Ardayda")}
                </CardTitle>
                <GraduationCap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{adminStats.totalStudents}</div>
                <p className="text-xs text-muted-foreground">
                  {t("Enrolled this year", "La diiwaan geliyay sanadkan")}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {t("Total Teachers", "Wadarta Macallimiinta")}
                </CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{adminStats.totalTeachers}</div>
                <p className="text-xs text-muted-foreground">
                  {t("Active teaching staff", "Shaqaalaha waxbarashada firfircoon")}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {t("Total Classes", "Wadarta Fasallada")}
                </CardTitle>
                <FileEdit className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{adminStats.totalClasses}</div>
                <p className="text-xs text-muted-foreground">
                  {t("Across all grades", "Dhammaan fasallada")}
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Admin Quick Actions */}
        {!isTeacher && (
          <Card>
            <CardHeader>
              <CardTitle>{t("Quick Actions", "Ficillada Degdegga")}</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <Link to="/dashboard/students">
                <Button variant="outline" className="w-full justify-start">
                  <GraduationCap className="mr-2 h-4 w-4" />
                  {t("Manage Students", "Maamul Ardayda")}
                </Button>
              </Link>
              <Link to="/dashboard/teachers">
                <Button variant="outline" className="w-full justify-start">
                  <Users className="mr-2 h-4 w-4" />
                  {t("Manage Teachers", "Maamul Macallimiinta")}
                </Button>
              </Link>
              <Link to="/dashboard/classes">
                <Button variant="outline" className="w-full justify-start">
                  <BookOpen className="mr-2 h-4 w-4" />
                  {t("Manage Classes", "Maamul Fasallada")}
                </Button>
              </Link>
              <Link to="/dashboard/reports">
                <Button variant="outline" className="w-full justify-start">
                  <TrendingUp className="mr-2 h-4 w-4" />
                  {t("View Reports", "Eeg Warbixinnada")}
                </Button>
              </Link>
              <Link to="/dashboard/attendance">
                <Button variant="outline" className="w-full justify-start">
                  <CalendarCheck className="mr-2 h-4 w-4" />
                  {t("Attendance", "Hoyga")}
                </Button>
              </Link>
              <Link to="/dashboard/id-cards">
                <Button variant="outline" className="w-full justify-start">
                  <IdCard className="mr-2 h-4 w-4" />
                  {t("ID Cards", "Kaadhadhka")}
                </Button>
              </Link>
              <Link to="/dashboard/records">
                <Button variant="outline" className="w-full justify-start">
                  <FolderArchive className="mr-2 h-4 w-4" />
                  {t("Records", "Diiwaanada")}
                </Button>
              </Link>
              <Link to="/dashboard/subjects">
                <Button variant="outline" className="w-full justify-start">
                  <FileEdit className="mr-2 h-4 w-4" />
                  {t("Subjects", "Maadooyinka")}
                </Button>
              </Link>
              <Link to="/dashboard/exam-schedule">
                <Button variant="outline" className="w-full justify-start">
                  <Calendar className="mr-2 h-4 w-4" />
                  {t("Exam Schedule", "Jadwalka Imtixaanada")}
                </Button>
              </Link>
              <Link to="/dashboard/marks">
                <Button variant="outline" className="w-full justify-start">
                  <FileEdit className="mr-2 h-4 w-4" />
                  {t("Approve Marks", "Ansixiya Dhibcaha")}
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {/* Teacher-specific sections */}
        {isTeacher && (
          <>
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>{t("Quick Actions", "Ficillada Degdegga")}</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <Link to="/dashboard/attendance">
                  <Button variant="outline" className="w-full justify-start">
                    <CalendarCheck className="mr-2 h-4 w-4" />
                    {t("Mark Attendance", "Calaamadee Hoyga")}
                  </Button>
                </Link>
                <Link to="/dashboard/marks">
                  <Button variant="outline" className="w-full justify-start">
                    <FileEdit className="mr-2 h-4 w-4" />
                    {t("Enter Marks", "Geli Dhibcaha")}
                  </Button>
                </Link>
                <Link to="/dashboard/my-classes">
                  <Button variant="outline" className="w-full justify-start">
                    <BookOpen className="mr-2 h-4 w-4" />
                    {t("My Classes", "Fasalladayda")}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
