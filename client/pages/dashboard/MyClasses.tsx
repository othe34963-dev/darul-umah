import DashboardLayout from "@/components/layout/DashboardLayout";
import { useApp } from "@/context/AppContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Users, ArrowRight, ArrowLeft, GraduationCap } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect, useMemo } from "react";

export default function MyClasses() {
  const { language, selectedAcademicYear } = useApp();
  const navigate = useNavigate();
  
  const t = (en: string, so: string) => (language === "en" ? en : so);
  
  // Load real classes from localStorage
  const [allClasses, setAllClasses] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  
  useEffect(() => {
    try {
      const classesData = localStorage.getItem("du_classes_store_json");
      const studentsData = localStorage.getItem("du_students_store_json");
      
      if (classesData) {
        setAllClasses(JSON.parse(classesData));
      }
      
      if (studentsData) {
        setStudents(JSON.parse(studentsData));
      }
    } catch (error) {
      console.error("Failed to load classes:", error);
    }
  }, []);

  // Filter classes by selected academic year
  // In production, also filter by teacher ID
  const myClasses = useMemo(() => {
    const classesForYear = allClasses.filter(c => c.academicYear === selectedAcademicYear);
    
    // Calculate real student count for each class
    return classesForYear.map(classItem => {
      const studentsInClass = students.filter(s => 
        s.className === classItem.name && s.academicYear === selectedAcademicYear
      );
      
      return {
        ...classItem,
        studentCount: studentsInClass.length
      };
    });
  }, [allClasses, students, selectedAcademicYear]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header with Back Button */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            {t("Back", "Dib u noqo")}
          </Button>
          <div className="flex-1">
            <h2 className="text-3xl font-bold tracking-tight">
              {t("My Classes", "Fasalladayda")} 📚
            </h2>
            <p className="text-muted-foreground mt-1">
              {t("View and manage your assigned classes", "Eeg oo maamul fasallada laguu qoondeeyay")}
            </p>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t("Total Classes", "Wadarta Fasallada")}
              </CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{myClasses.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t("Total Students", "Wadarta Ardayda")}
              </CardTitle>
              <GraduationCap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {myClasses.reduce((sum, c) => sum + c.studentCount, 0)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t("Subjects", "Maadooyinka")}
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {new Set(myClasses.flatMap(c => c.subjects || [])).size}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Classes Grid */}
        {myClasses.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  {t("No Classes Found", "Fasallo Lama Helin")}
                </h3>
                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                  {t(
                    "No classes are assigned for the selected academic year. Please contact the administrator to assign classes.",
                    "Fasallo looma qoondeynin sanadka dugsiga la doortay. Fadlan la xidhiidh maamulaha si aad fasallo u hesho."
                  )}
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
            {myClasses.map((classItem) => (
              <Card key={classItem.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-xl">{classItem.name}</CardTitle>
                    <CardDescription className="mt-1">
                      {classItem.subjects && classItem.subjects.length > 0 
                        ? classItem.subjects.join(", ") 
                        : t("No subjects assigned", "Maadooyin lama qoondeynin")}
                    </CardDescription>
                  </div>
                  <Badge variant="secondary">
                    {classItem.studentCount} {t("students", "arday")}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">
                      {t("Teacher", "Macallin")}:
                    </span>
                    <span className="font-medium">{classItem.teacher || t("Not assigned", "Lama qoondeynin")}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">
                      {t("Room", "Qolka")}:
                    </span>
                    <span className="font-medium">{classItem.room || t("TBD", "Weli")}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">
                      {t("Capacity", "Awooda")}:
                    </span>
                    <span className="font-medium">
                      {classItem.studentCount} / {classItem.capacity || 30}
                    </span>
                  </div>
                </div>

                <Link to={`/dashboard/class/${classItem.id}/students`} className="pt-2 block">
                  <Button className="w-full" size="sm">
                    <Users className="mr-2 h-4 w-4" />
                    {t("View Students", "Eeg Ardayda")}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

