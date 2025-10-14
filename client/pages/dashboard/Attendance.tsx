import DashboardLayout from "@/components/layout/DashboardLayout";
import { useApp } from "@/context/AppContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle2, XCircle, Clock, FileDown, ArrowLeft, Users, Calendar as CalendarIcon, TrendingUp, Search, UserCheck, UserX, Timer } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface AttendanceRecord {
  studentId: string;
  name: string;
  className: string;
  status: "present" | "absent" | "late" | "excused";
  date: string;
  notes?: string;
}

export default function Attendance() {
  const { language, selectedAcademicYear } = useApp();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [selectedClass, setSelectedClass] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<string>("mark");
  
  const t = (en: string, so: string) => (language === "en" ? en : so);
  
  // Load real students and classes from localStorage
  const [students, setStudents] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  
  useEffect(() => {
    try {
      const studentsData = localStorage.getItem("du_students_store_json");
      const classesData = localStorage.getItem("du_classes_store_json");
      
      if (studentsData) {
        const allStudents = JSON.parse(studentsData);
        setStudents(allStudents.filter((s: any) => s.academicYear === selectedAcademicYear));
      }
      
      if (classesData) {
        const allClasses = JSON.parse(classesData);
        const classesForYear = allClasses.filter((c: any) => c.academicYear === selectedAcademicYear);
        setClasses([
          { id: "all", name: t("All Classes", "Dhammaan Fasallada") },
          ...classesForYear
        ]);
      } else {
        setClasses([{ id: "all", name: t("All Classes", "Dhammaan Fasallada") }]);
      }
    } catch (error) {
      console.error("Failed to load data:", error);
    }
  }, [selectedAcademicYear, language]);

  // Load attendance records from localStorage
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(() => {
    try {
      const saved = localStorage.getItem("du_attendance_records_json");
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  // Auto-save to localStorage
  useEffect(() => {
    localStorage.setItem("du_attendance_records_json", JSON.stringify(attendanceRecords));
  }, [attendanceRecords]);

  // Filter students by selected class
  const filteredStudents = useMemo(() => {
    let filtered = students;
    
    if (selectedClass !== "all") {
      filtered = filtered.filter(s => s.className === selectedClass);
    }
    
    if (searchQuery) {
      filtered = filtered.filter(s => 
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.studentId.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    return filtered;
  }, [students, selectedClass, searchQuery]);

  // Get attendance status for a student on selected date
  const getAttendanceStatus = (studentId: string): "present" | "absent" | "late" | "excused" | null => {
    const record = attendanceRecords.find(
      r => r.studentId === studentId && r.date === selectedDate
    );
    return record?.status || null;
  };

  // Mark attendance for a student
  const markAttendance = (studentId: string, status: "present" | "absent" | "late" | "excused") => {
    const student = filteredStudents.find(s => s.id === studentId);
    if (!student) return;

    const existingIndex = attendanceRecords.findIndex(
      r => r.studentId === studentId && r.date === selectedDate
    );

    const newRecord: AttendanceRecord = {
      studentId,
      name: student.name,
      className: student.className,
      status,
      date: selectedDate,
    };

    if (existingIndex >= 0) {
      const updated = [...attendanceRecords];
      updated[existingIndex] = newRecord;
      setAttendanceRecords(updated);
    } else {
      setAttendanceRecords([...attendanceRecords, newRecord]);
    }
  };

  // Mark all as present
  const markAllPresent = () => {
    const newRecords = filteredStudents.map(s => ({
      studentId: s.id,
      name: s.name,
      className: s.className,
      status: "present" as const,
      date: selectedDate,
    }));

    // Remove existing records for these students on this date
    const otherRecords = attendanceRecords.filter(
      r => !(filteredStudents.some(s => s.id === r.studentId) && r.date === selectedDate)
    );

    setAttendanceRecords([...otherRecords, ...newRecords]);
    
    toast({
      title: t("Success", "Guul"),
      description: t(`Marked ${filteredStudents.length} students as present`, `${filteredStudents.length} arday ayaa loo calaamadeeyay inay joogaan`),
    });
  };

  // Calculate statistics for selected date
  const stats = useMemo(() => {
    const todayRecords = attendanceRecords.filter(r => r.date === selectedDate);
    
    return {
      present: todayRecords.filter(r => r.status === "present").length,
      absent: todayRecords.filter(r => r.status === "absent").length,
      late: todayRecords.filter(r => r.status === "late").length,
      excused: todayRecords.filter(r => r.status === "excused").length,
      total: filteredStudents.length,
      marked: todayRecords.length,
      rate: filteredStudents.length > 0 
        ? Math.round((todayRecords.filter(r => r.status === "present" || r.status === "late").length / filteredStudents.length) * 100)
        : 0
    };
  }, [attendanceRecords, selectedDate, filteredStudents]);

  // Calculate historical statistics (last 7 days)
  const historicalStats = useMemo(() => {
    const today = new Date(selectedDate);
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      return d.toISOString().split('T')[0];
    });

    const weekRecords = attendanceRecords.filter(r => last7Days.includes(r.date));
    const totalPossible = filteredStudents.length * 7;
    const totalPresent = weekRecords.filter(r => r.status === "present" || r.status === "late").length;

    return {
      weeklyRate: totalPossible > 0 ? Math.round((totalPresent / totalPossible) * 100) : 0,
      daysTracked: new Set(weekRecords.map(r => r.date)).size,
    };
  }, [attendanceRecords, selectedDate, filteredStudents]);

  const handleExport = () => {
    toast({
      title: t("Export Started", "Dhoofisku wuu bilaabmay"),
      description: t("Attendance report is being prepared", "Warbixinta hoyga ayaa la diyaarinayaa"),
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
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
            <div className="flex items-center gap-3">
              <h2 className="text-3xl font-bold tracking-tight">
                {t("Attendance Management", "Maamulka Hoyga")} ✓
              </h2>
              <Badge variant="outline" className="text-sm">
                {selectedAcademicYear}
              </Badge>
            </div>
            <p className="text-muted-foreground mt-1">
              {t("Professional attendance tracking and reporting system", "Nidaamka raadinta hoyga iyo warbixinta xirfadeed")}
            </p>
          </div>
        </div>

        {/* Statistics Overview */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <Card className="border-l-4 border-l-green-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <UserCheck className="h-4 w-4 text-green-600" />
                {t("Present", "Joogo")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{stats.present}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.total > 0 ? `${Math.round((stats.present / stats.total) * 100)}%` : '0%'} {t("of class", "fasalka")}
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-red-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <UserX className="h-4 w-4 text-red-600" />
                {t("Absent", "Maqan")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">{stats.absent}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.total > 0 ? `${Math.round((stats.absent / stats.total) * 100)}%` : '0%'} {t("of class", "fasalka")}
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-yellow-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Timer className="h-4 w-4 text-yellow-600" />
                {t("Late", "Daahmay")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-600">{stats.late}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {t("Tardy arrivals", "Daahnimada")}
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Users className="h-4 w-4 text-blue-600" />
                {t("Total Students", "Wadarta Ardayda")}
                </CardTitle>
              </CardHeader>
              <CardContent>
              <div className="text-3xl font-bold text-blue-600">{stats.total}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.marked} {t("marked", "la calaamadeeyay")}
              </p>
              </CardContent>
            </Card>

          <Card className="border-l-4 border-l-purple-500 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950/30 dark:to-blue-950/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-purple-600" />
                {t("Attendance Rate", "Heerka Imashada")}
                </CardTitle>
              </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600">{stats.rate}%</div>
              <p className="text-xs text-muted-foreground mt-1">
                {t("Today's rate", "Heerka maanta")}
              </p>
              </CardContent>
            </Card>
          </div>

        {/* Main Content */}
            <Card>
              <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <CardTitle className="text-xl">
                  {t("Mark Attendance", "Calaamadee Hoyga")}
                </CardTitle>
                <CardDescription className="mt-1">
                  {new Date(selectedDate).toLocaleDateString(language === "en" ? "en-US" : "so-SO", {
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                </CardDescription>
                  </div>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" onClick={markAllPresent} disabled={filteredStudents.length === 0}>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  {t("Mark All Present", "Dhammaan Joogo")}
                </Button>
                    <Button variant="outline" size="sm" onClick={handleExport}>
                      <FileDown className="h-4 w-4 mr-2" />
                      {t("Export", "Dhoofso")}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder={t("Search students...", "Raadi ardayda...")}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="w-full sm:w-[200px]">
                <Input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full"
                />
              </div>
              <div className="w-full sm:w-[250px]">
                  <Select value={selectedClass} onValueChange={setSelectedClass}>
                  <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {classes.map((cls) => (
                        <SelectItem key={cls.id} value={cls.id}>
                          {cls.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
              </div>
                </div>

            {/* Student Grid */}
            {filteredStudents.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold">
                  {t("No Students Found", "Ardayda Lama Helin")}
                </h3>
                <p className="text-sm text-muted-foreground mt-2">
                  {t("No students match your filters or no students enrolled for this year", "Ardaydu kuma habboonaan shuruudahaaga ama arday looma diiwaan gelin sanadkan")}
                                </p>
                              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {filteredStudents.map((student) => {
                    const status = getAttendanceStatus(student.id);
                    
                    return (
                      <Card key={student.id} className={cn(
                        "transition-all hover:shadow-md",
                        status === "present" && "bg-green-50 dark:bg-green-950/20 border-green-200",
                        status === "absent" && "bg-red-50 dark:bg-red-950/20 border-red-200",
                        status === "late" && "bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200",
                        status === "excused" && "bg-blue-50 dark:bg-blue-950/20 border-blue-200"
                      )}>
                        <CardContent className="p-4">
                          <div className="space-y-3">
                            <div>
                              <h4 className="font-semibold text-sm line-clamp-1">{student.name}</h4>
                              <p className="text-xs text-muted-foreground">{student.studentId}</p>
                              <p className="text-xs text-muted-foreground">{student.className}</p>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-1.5">
                              <Button
                                size="sm"
                                variant={status === "present" ? "default" : "outline"}
                                className={cn(
                                  "h-8 text-xs",
                                  status === "present" && "bg-green-600 hover:bg-green-700"
                                )}
                                onClick={() => markAttendance(student.id, "present")}
                              >
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                {t("Present", "Joogo")}
                              </Button>
                              
                              <Button
                                size="sm"
                                variant={status === "absent" ? "default" : "outline"}
                                className={cn(
                                  "h-8 text-xs",
                                  status === "absent" && "bg-red-600 hover:bg-red-700"
                                )}
                                onClick={() => markAttendance(student.id, "absent")}
                              >
                                <XCircle className="h-3 w-3 mr-1" />
                                {t("Absent", "Maqan")}
                              </Button>
                              
                              <Button
                                size="sm"
                                variant={status === "late" ? "default" : "outline"}
                                className={cn(
                                  "h-8 text-xs",
                                  status === "late" && "bg-yellow-600 hover:bg-yellow-700"
                                )}
                                onClick={() => markAttendance(student.id, "late")}
                              >
                                <Clock className="h-3 w-3 mr-1" />
                                {t("Late", "Daahmay")}
                              </Button>
                              
                            <Button
                              size="sm"
                                variant={status === "excused" ? "default" : "outline"}
                                className={cn(
                                  "h-8 text-xs",
                                  status === "excused" && "bg-blue-600 hover:bg-blue-700"
                                )}
                                onClick={() => markAttendance(student.id, "excused")}
                              >
                                {t("Excused", "Cafis")}
                            </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>

                {/* Progress Indicator */}
                <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30">
                  <CardContent className="py-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">
                        {t("Marking Progress", "Horumarka Calaamadaynta")}
                      </span>
                      <span className="text-sm font-bold">
                        {stats.marked} / {stats.total}
                      </span>
                    </div>
                    <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      {/* Dynamic width for progress bar - inline style needed */}
                      <div 
                        className="h-full bg-gradient-to-r from-blue-600 to-purple-600 transition-all duration-500"
                        style={{ width: `${stats.total > 0 ? (stats.marked / stats.total) * 100 : 0}%` }}
                      />
                    </div>
                    {stats.marked === stats.total && stats.total > 0 && (
                      <p className="text-xs text-green-600 font-medium mt-2 flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" />
                        {t("All students marked!", "Dhammaan ardayda waa la calaamadeeyay!")}
                      </p>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Weekly Insights */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              {t("Weekly Insights", "Aragtiyada Toddobaadka")}
            </CardTitle>
            <CardDescription>
              {t("Attendance trends for the past 7 days", "Isbedelada hoyga 7-kii maalmood ee la soo dhaafay")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="flex items-center gap-4 p-4 rounded-lg border bg-card">
                <div className="h-12 w-12 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                  <CalendarIcon className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{historicalStats.weeklyRate}%</p>
                  <p className="text-xs text-muted-foreground">{t("Weekly Rate", "Heerka Toddobaadka")}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4 p-4 rounded-lg border bg-card">
                <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                  <CheckCircle2 className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{historicalStats.daysTracked}</p>
                  <p className="text-xs text-muted-foreground">{t("Days Tracked", "Maalmaha La Raacay")}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4 p-4 rounded-lg border bg-card">
                <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{filteredStudents.length}</p>
                  <p className="text-xs text-muted-foreground">{t("Students in Class", "Ardayda Fasalka")}</p>
                </div>
              </div>
                </div>
              </CardContent>
            </Card>

        {/* Help Card */}
        <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950/30">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center flex-shrink-0">
                <CalendarIcon className="h-5 w-5 text-blue-600" />
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-blue-900 dark:text-blue-100">
                  {t("How to Use Attendance System", "Sida loo isticmaalo Nidaamka Hoyga")}
                </h3>
                <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                  <li>• {t("Select a date and class to view students", "Dooro taariikhda iyo fasalka si aad u aragto ardayda")}</li>
                  <li>• {t("Click status buttons on each student card to mark attendance", "Guji badhanka xaalada kaarka arday kasta si aad u calaamadeyso hoyga")}</li>
                  <li>• {t("Use 'Mark All Present' for quick marking", "Isticmaal 'Dhammaan Joogo' si deg deg loogu calaamadeeyo")}</li>
                  <li>• {t("Green card = Present, Red = Absent, Yellow = Late, Blue = Excused", "Kaarka cagaaran = Joogo, Guduud = Maqan, Jaalle = Daahmay, Buluug = Cafis")}</li>
                  <li>• {t("Progress bar shows how many students you've marked", "Barka horumarka wuxuu muujinayaa inta arday ee aad calaamadaysay")}</li>
                </ul>
          </div>
        </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
