import DashboardLayout from "@/components/layout/DashboardLayout";
import { useApp } from "@/context/AppContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, Mail, Phone, FileDown, ArrowLeft } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

export default function StudentList() {
  const { language, selectedAcademicYear } = useApp();
  const { classId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  
  const t = (en: string, so: string) => (language === "en" ? en : so);
  
  // Load real class info from localStorage
  const [classInfo, setClassInfo] = useState<any>(null);
  const [allStudents, setAllStudents] = useState<any[]>([]);
  
  useEffect(() => {
    try {
      // Load class information
      const classesData = localStorage.getItem("du_classes_store_json");
      if (classesData) {
        const classes = JSON.parse(classesData);
        const foundClass = classes.find((c: any) => c.id === classId);
        setClassInfo(foundClass || null);
      }
      
      // Load students
      const studentsData = localStorage.getItem("du_students_store_json");
      if (studentsData) {
        setAllStudents(JSON.parse(studentsData));
      }
    } catch (error) {
      console.error("Failed to load class data:", error);
    }
  }, [classId]);

  // Filter students for this specific class
  const studentsInClass = useMemo(() => {
    if (!classInfo) return [];
    
    return allStudents.filter(s => 
      s.className === classInfo.name && 
      s.academicYear === selectedAcademicYear
    );
  }, [allStudents, classInfo, selectedAcademicYear]);

  // Apply search filter
  const filteredStudents = useMemo(() => {
    return studentsInClass.filter(s => 
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.email && s.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (s.studentId && s.studentId.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [studentsInClass, searchQuery]);

  const handleExport = () => {
    toast({
      title: t("Export Started", "Dhoofisku wuu bilaabmay"),
      description: t("Student list is being prepared", "Liiska ardayda ayaa la diyaarinayaa"),
    });
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header with Back Button */}
        <div>
          <div className="flex items-center justify-between">
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
              <div>
                <h2 className="text-3xl font-bold tracking-tight">
                  {classInfo ? classInfo.name : t("Class", "Fasal")} - {t("Students", "Ardayda")} 🎓
                </h2>
                <p className="text-muted-foreground mt-1">
                  {classInfo ? (
                    <>
                      {classInfo.subjects && classInfo.subjects.length > 0 
                        ? classInfo.subjects.join(", ") 
                        : t("No subjects", "Maadooyin ma jiraan")}
                      {classInfo.room && ` • ${classInfo.room}`}
                    </>
                  ) : (
                    t("Loading...", "Soo raraya...")
                  )}
                </p>
              </div>
            </div>
            <Button variant="outline" onClick={handleExport} disabled={studentsInClass.length === 0}>
              <FileDown className="h-4 w-4 mr-2" />
              {t("Export List", "Dhoofso Liiska")}
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {t("Total Students", "Wadarta Ardayda")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{studentsInClass.length}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {studentsInClass.filter((s: any) => s.gender === 'male').length} {t("male", "lab")}, {studentsInClass.filter((s: any) => s.gender === 'female').length} {t("female", "dhedig")}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {t("Capacity", "Awooda")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {studentsInClass.length} / {classInfo?.capacity || 30}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {classInfo?.capacity ? `${Math.round((studentsInClass.length / classInfo.capacity) * 100)}%` : '0%'} {t("filled", "buuxay")}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {t("Teacher", "Macallin")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-semibold text-blue-600">
                {classInfo?.teacher || t("Not assigned", "Lama qoondeynin")}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {classInfo?.teacherId || '-'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Student List */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <CardTitle>{t("Student List", "Liiska Ardayda")}</CardTitle>
              <div className="relative w-full sm:w-[300px]">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t("Search students...", "Raadi ardayda...")}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">#</TableHead>
                    <TableHead>{t("Student", "Ardayga")}</TableHead>
                    <TableHead>{t("Student ID", "Aqoonsiga Ardayga")}</TableHead>
                    <TableHead>{t("Gender", "Jinsiga")}</TableHead>
                    <TableHead>{t("Contact", "Xiriir")}</TableHead>
                    <TableHead>{t("Parent Phone", "Telefoonka Waalid")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStudents.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-12">
                        <div className="flex flex-col items-center gap-3">
                          <Search className="h-12 w-12 text-muted-foreground" />
                          <div>
                            <p className="font-medium text-lg">
                              {t("No students found", "Arday lama helin")}
                            </p>
                            <p className="text-sm text-muted-foreground mt-1">
                              {studentsInClass.length === 0 
                                ? t("No students enrolled in this class", "Arday looma diiwaan gelin fasalkan")
                                : t("Try adjusting your search query", "Isku day inaad wax ka beddesho raadinta")}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredStudents.map((student, index) => (
                      <TableRow key={student.id}>
                        <TableCell className="font-medium">{index + 1}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarImage src={student.photoUrl} />
                              <AvatarFallback>{getInitials(student.name)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{student.name}</div>
                              {student.email && (
                                <div className="text-sm text-muted-foreground flex items-center gap-1">
                                  <Mail className="h-3 w-3" />
                                  {student.email}
                                </div>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="font-mono">
                            {student.studentId || student.id}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {student.gender === "male" ? t("Male", "Lab") : t("Female", "Dheddig")}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {student.phone ? (
                            <div className="flex items-center gap-1 text-sm">
                              <Phone className="h-3 w-3" />
                              {student.phone}
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-sm">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {student.parentPhone ? (
                            <div className="flex items-center gap-1 text-sm">
                              <Phone className="h-3 w-3" />
                              {student.parentPhone}
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-sm">-</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

