import DashboardLayout from "@/components/layout/DashboardLayout";
import { useApp } from "@/context/AppContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Save, Send, ArrowLeft, CheckCircle, XCircle, Clock, Calendar, ExternalLink, AlertCircle, CalendarCheck, CalendarX, FileEdit } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ExamSchedule {
  id: string;
  examName: string;
  examType: string;
  className: string;
  subject: string;
  date: string;
  startTime: string;
  endTime: string;
  academicYear: string;
}

interface StudentMark {
  id: string;
  studentId: string;
  name: string;
  midterm: number;
  final: number;
  homework: number;
  total: number;
  percentage: number;
}

interface MarksEntry {
  examId: string;
  status: "draft" | "submitted" | "approved";
  students: StudentMark[];
  submittedAt?: string;
  approvedAt?: string;
}

export default function Marks() {
  const { language, selectedAcademicYear, user } = useApp();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const t = (en: string, so: string) => (language === "en" ? en : so);
  
  // Load exam schedules
  const [allExams, setAllExams] = useState<ExamSchedule[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [allMarksEntries, setAllMarksEntries] = useState<Record<string, MarksEntry>>({});
  const [selectedExam, setSelectedExam] = useState<ExamSchedule | null>(null);
  const [currentMarks, setCurrentMarks] = useState<StudentMark[]>([]);

  // Load data
  useEffect(() => {
    try {
      // Load exam schedules
      const examsData = localStorage.getItem("du_exam_schedules_json");
      if (examsData) {
        setAllExams(JSON.parse(examsData));
      }

      // Load students
      const studentsData = localStorage.getItem("du_students_store_json");
      if (studentsData) {
        setStudents(JSON.parse(studentsData));
      }

      // Load marks entries
      const marksData = localStorage.getItem("du_marks_entries_json");
      if (marksData) {
        setAllMarksEntries(JSON.parse(marksData));
      }
    } catch (error) {
      console.error("Failed to load data:", error);
    }
  }, []);

  // Auto-save marks entries
  useEffect(() => {
    localStorage.setItem("du_marks_entries_json", JSON.stringify(allMarksEntries));
  }, [allMarksEntries]);

  // Filter exams for current academic year
  const examsForYear = useMemo(() => {
    return allExams.filter(e => e.academicYear === selectedAcademicYear);
  }, [allExams, selectedAcademicYear]);

  // Filter exams based on user role
  const availableExams = useMemo(() => {
    if (user.role === "admin") {
      return examsForYear;
    }
    
    // For teachers: filter by assigned classes/subjects
    // TODO: In a real system, load teacher's assignments from database
    // For now, show all exams for teachers (you can add assignment logic later)
    return examsForYear;
  }, [examsForYear, user.role]);

  // Check if exam deadline has passed
  const isAfterDeadline = (exam: ExamSchedule) => {
    const examDate = new Date(exam.date);
    const now = new Date();
    // Deadline is 24 hours after exam end time
    examDate.setHours(parseInt(exam.endTime.split(':')[0]) + 24);
    return now > examDate;
  };

  // Check if teacher can enter marks for this exam
  const canTeacherEnter = (exam: ExamSchedule) => {
    if (user.role === "admin") return true;
    
    const entry = allMarksEntries[exam.id];
    const afterDeadline = isAfterDeadline(exam);
    
    // Teacher can enter if:
    // 1. Before deadline AND (no entry OR entry is draft OR entry is rejected)
    // 2. Cannot enter after deadline
    if (afterDeadline) return false;
    
    if (!entry) return true;
    if (entry.status === "draft") return true;
    if (entry.status === "submitted" || entry.status === "approved") return false;
    
    return true;
  };

  // Get exam status
  const getExamStatus = (exam: ExamSchedule) => {
    const examDate = new Date(exam.date);
    const now = new Date();
    const entry = allMarksEntries[exam.id];
    
    // Check if marks are approved
    if (entry?.status === "approved") {
      return { status: "approved", label: t("Approved", "La ansixiyay"), color: "green" };
    }
    
    // Check if marks are submitted
    if (entry?.status === "submitted") {
      return { status: "submitted", label: t("Pending Approval", "Sugitaan Ansixinta"), color: "yellow" };
    }
    
    // Check if exam has passed
    if (now > examDate) {
      if (isAfterDeadline(exam)) {
        return { status: "deadline-passed", label: t("Deadline Passed", "Wakhtigii wuu dhamaday"), color: "red" };
      }
      return { status: "completed", label: t("Exam Completed", "Imtixaanka la dhammaystay"), color: "blue" };
    }
    
    // Exam is upcoming
    return { status: "upcoming", label: t("Upcoming", "Imaanaya"), color: "gray" };
  };

  // Load students for selected exam
  const loadStudentsForExam = (exam: ExamSchedule) => {
    const studentsInClass = students.filter(s => 
      s.className === exam.className && 
      s.academicYear === selectedAcademicYear
    );

    const entry = allMarksEntries[exam.id];
    
    if (entry) {
      // Load existing marks
      setCurrentMarks(entry.students);
    } else {
      // Initialize new marks
      const newMarks: StudentMark[] = studentsInClass.map(s => ({
        id: Date.now().toString() + Math.random(),
        studentId: s.id,
        name: s.name,
        midterm: 0,
        final: 0,
        homework: 0,
        total: 0,
        percentage: 0,
      }));
      setCurrentMarks(newMarks);
    }
  };

  const handleSelectExam = (exam: ExamSchedule) => {
    setSelectedExam(exam);
    loadStudentsForExam(exam);
  };

  const handleBackToList = () => {
    setSelectedExam(null);
    setCurrentMarks([]);
  };

  const calculatePercentage = (total: number) => {
    const avg = total / 3;
    return Math.round(avg);
  };

  const updateMark = (studentId: string, field: string, value: string) => {
    const updatedMarks = currentMarks.map(m => {
      if (m.studentId === studentId) {
        const updated = { ...m, [field]: parseInt(value) || 0 };
        updated.total = updated.midterm + updated.final + updated.homework;
        updated.percentage = calculatePercentage(updated.total);
        return updated;
      }
      return m;
    });
    
    setCurrentMarks(updatedMarks);
  };

  const handleSaveDraft = () => {
    if (!selectedExam) return;

    const entry: MarksEntry = {
      examId: selectedExam.id,
      status: "draft",
      students: currentMarks,
    };

    setAllMarksEntries({
      ...allMarksEntries,
      [selectedExam.id]: entry,
    });

    toast({
      title: t("Draft Saved", "Qabaalka la keydiyay"),
      description: t("Your marks have been saved as draft", "Dhibcahaaga waxaa loo keydiyay qabaal ahaan"),
    });
  };

  const handleSubmit = () => {
    if (!selectedExam) return;

    const entry: MarksEntry = {
      examId: selectedExam.id,
      status: "submitted",
      students: currentMarks,
      submittedAt: new Date().toISOString(),
    };

    setAllMarksEntries({
      ...allMarksEntries,
      [selectedExam.id]: entry,
    });

    // 🚀 AUTOMATED WORKFLOW: Auto-approve if all marks are complete
    if (checkIfMarksComplete(currentMarks)) {
      setTimeout(() => {
        handleAutoApprove(selectedExam.id);
      }, 1000); // Small delay to show submission first
    }

    toast({
      title: t("Submitted Successfully", "Si guul leh ayaa loo gudbiyay"),
      description: t("Marks submitted to admin for approval", "Dhibcaha waxaa loo gudbiyay maamulaha ansixinta"),
    });

    // Go back to list
    handleBackToList();
  };

  // 🚀 AUTOMATED WORKFLOW: Check if all marks are complete
  const checkIfMarksComplete = (marks: StudentMark[]) => {
    return marks.every(mark => {
      const hasMidterm = selectedExam?.examType === "Midterm" ? mark.midterm !== null && mark.midterm !== undefined : true;
      const hasFinal = selectedExam?.examType === "Final" ? mark.final !== null && mark.final !== undefined : true;
      const hasHomework = selectedExam?.examType === "Quiz" ? mark.homework !== null && mark.homework !== undefined : true;
      
      return hasMidterm && hasFinal && hasHomework;
    });
  };

  // 🚀 AUTOMATED WORKFLOW: Auto-approve marks if complete
  const handleAutoApprove = (examId: string) => {
    const entry: MarksEntry = {
      ...allMarksEntries[examId],
      status: "approved",
      approvedAt: new Date().toISOString(),
    };

    setAllMarksEntries({
      ...allMarksEntries,
      [examId]: entry,
    });

    // 🚀 AUTOMATED WORKFLOW: Auto-generate results
    generateResultsFromApprovedMarks(examId);

    toast({
      title: t("🚀 Auto-Approved!", "🚀 Si toos ah loo ansixiyay!"),
      description: t("Marks were complete and auto-approved! Results generated.", "Dhibcaha way dhammaadeen oo si toos ah loo ansixiyay! Natiijooyinka waa la sameeyay."),
    });
  };

  // 🚀 AUTOMATED WORKFLOW: Auto-generate results from approved marks
  const generateResultsFromApprovedMarks = (examId: string) => {
    try {
      const marksEntry = allMarksEntries[examId];
      if (!marksEntry || marksEntry.status !== "approved") return;

      const exam = allExams.find(e => e.id === examId);
      if (!exam) return;

      // Load existing results
      const existingResults = localStorage.getItem("du_results_store_json");
      const allResults = existingResults ? JSON.parse(existingResults) : {};

      // Generate results for each student
      const studentResults = marksEntry.students.map((studentMark: any) => {
        const total = (studentMark.midterm || 0) + (studentMark.final || 0) + (studentMark.homework || 0);
        const average = total / 3;
        const percentage = Math.round(average);
        
        // Calculate grade
        let grade = "F";
        if (percentage >= 90) grade = "A+";
        else if (percentage >= 85) grade = "A";
        else if (percentage >= 80) grade = "B+";
        else if (percentage >= 75) grade = "B";
        else if (percentage >= 70) grade = "C+";
        else if (percentage >= 65) grade = "C";
        else if (percentage >= 60) grade = "D+";
        else if (percentage >= 50) grade = "D";

        return {
          id: `${examId}-${studentMark.studentId}`,
          studentId: studentMark.studentId,
          studentName: studentMark.name,
          className: exam.className,
          subject: exam.subject,
          examName: exam.examName,
          examType: exam.examType,
          midterm: studentMark.midterm || 0,
          final: studentMark.final || 0,
          homework: studentMark.homework || 0,
          total: total,
          average: average,
          percentage: percentage,
          grade: grade,
          academicYear: selectedAcademicYear,
          examDate: exam.date,
          status: "published",
          autoGenerated: true,
          generatedAt: new Date().toISOString()
        };
      });

      // Save results
      allResults[examId] = {
        examId: examId,
        examName: exam.examName,
        className: exam.className,
        subject: exam.subject,
        students: studentResults,
        generatedAt: new Date().toISOString()
      };

      localStorage.setItem("du_results_store_json", JSON.stringify(allResults));
    } catch (error) {
      console.error("Failed to auto-generate results:", error);
    }
  };

  const handleApprove = () => {
    if (!selectedExam) return;

    const entry: MarksEntry = {
      ...allMarksEntries[selectedExam.id],
      status: "approved",
      approvedAt: new Date().toISOString(),
    };

    setAllMarksEntries({
      ...allMarksEntries,
      [selectedExam.id]: entry,
    });

    // 🚀 AUTOMATED WORKFLOW: Auto-generate results when manually approved
    generateResultsFromApprovedMarks(selectedExam.id);

    toast({
      title: t("Marks Approved", "Dhibcaha waa la ansixiyay"),
      description: t("Marks have been approved and results auto-generated!", "Dhibcaha waa la ansixiyay oo natiijooyinka si toos ah loo sameeyay!"),
    });

    handleBackToList();
  };

  const handleReject = () => {
    if (!selectedExam) return;

    const entry: MarksEntry = {
      ...allMarksEntries[selectedExam.id],
      status: "draft",
    };

    setAllMarksEntries({
      ...allMarksEntries,
      [selectedExam.id]: entry,
    });

    toast({
      title: t("Marks Rejected", "Dhibcaha waa la diiday"),
      description: t("Marks returned to teacher for revision", "Dhibcaha waxaa dib loogu celiyay macallinka wax ka beddelka"),
      variant: "destructive",
    });

    handleBackToList();
  };

  // Calculate stats
  const stats = useMemo(() => {
    const total = availableExams.length;
    const completed = availableExams.filter(e => allMarksEntries[e.id]?.status === "approved").length;
    const pending = availableExams.filter(e => allMarksEntries[e.id]?.status === "submitted").length;
    const deadlinePassed = availableExams.filter(e => isAfterDeadline(e) && !allMarksEntries[e.id]).length;
    
    return { total, completed, pending, deadlinePassed };
  }, [availableExams, allMarksEntries]);

  const currentEntry = selectedExam ? allMarksEntries[selectedExam.id] : null;
  const currentStatus = selectedExam ? getExamStatus(selectedExam) : null;
  const canEdit = selectedExam ? canTeacherEnter(selectedExam) : false;

  // If an exam is selected, show the marks entry view
  if (selectedExam) {
    const classAverage = currentMarks.length > 0
      ? currentMarks.reduce((sum, m) => sum + m.percentage, 0) / currentMarks.length
      : 0;

    return (
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBackToList}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              {t("Back to Exams", "Dib ugu noqo Imtixaanada")}
            </Button>
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <h2 className="text-3xl font-bold tracking-tight">
                  {selectedExam.examName}
                </h2>
                {currentStatus && (
                  <Badge 
                    variant={currentStatus.status === "approved" ? "default" : "outline"}
                    className={
                      currentStatus.color === "green" ? "bg-green-600 text-white" :
                      currentStatus.color === "yellow" ? "bg-yellow-600 text-white" :
                      currentStatus.color === "red" ? "bg-red-600 text-white" :
                      currentStatus.color === "blue" ? "bg-blue-600 text-white" : ""
                    }
                  >
                    {currentStatus.label}
                  </Badge>
                )}
              </div>
              <p className="text-muted-foreground mt-1">
                {selectedExam.className} • {selectedExam.subject} • {new Date(selectedExam.date).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Access Control Alerts */}
          {!canEdit && user.role === "teacher" && (
            <Alert className="bg-red-50 dark:bg-red-950/30 border-red-200">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-900 dark:text-red-100">
                {isAfterDeadline(selectedExam) ? (
                  <>
                    {t(
                      "⛔ Deadline has passed. Only administrators can enter marks after the deadline.",
                      "⛔ Wakhtigii wuu dhamaday. Maamulayaasha kaliya ayaa gelin kara dhibcaha kadib wakhtigii."
                    )}
                  </>
                ) : (
                  <>
                    {t(
                      "🔒 Marks have been submitted and are locked pending admin approval.",
                      "🔒 Dhibcaha waa la gudbiyay waana la xiray ilaa maamulaha ansixiyo."
                    )}
                  </>
                )}
              </AlertDescription>
            </Alert>
          )}

          {currentEntry?.status === "submitted" && user.role === "admin" && (
            <Alert className="bg-blue-50 dark:bg-blue-950/30 border-blue-200">
              <CheckCircle className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-900 dark:text-blue-100">
                {t(
                  "📋 These marks are pending your approval. Review them and click 'Approve Marks' to finalize, or 'Reject' to send back to the teacher.",
                  "📋 Dhibcahan waxay sugayaan ansixintaada. Eeg oo guji 'Ansixiya Dhibcaha' si aad u dhammaystirto, ama 'Diid' si aad dib ugu celiso macallinka."
                )}
              </AlertDescription>
            </Alert>
          )}

          {currentEntry?.status === "approved" && (
            <Alert className="bg-green-50 dark:bg-green-950/30 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-900 dark:text-green-100">
                ✅ {t(
                  "These marks have been approved and are now final.",
                  "Dhibcahan waa la ansixiyay waxayna hadda yihiin kuwa dhammaystiran."
                )}
              </AlertDescription>
            </Alert>
          )}

          {/* Marks Entry Card */}
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="space-y-1">
                  <CardTitle>{t("Student Marks", "Dhibcaha Ardayda")}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {t("Class Average", "Celcelis Fasalka")}: <strong>{classAverage.toFixed(1)}%</strong>
                  </p>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {/* Teacher Actions (before deadline, draft status) */}
                  {user.role === "teacher" && canEdit && (
                    <>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={handleSaveDraft}
                      >
                        <Save className="h-4 w-4 mr-2" />
                        {t("Save Draft", "Keydi Qabaal")}
                      </Button>
                      <Button 
                        size="sm" 
                        onClick={handleSubmit}
                      >
                        <Send className="h-4 w-4 mr-2" />
                        {t("Submit for Approval", "U gudbi Ansixinta")}
                      </Button>
                    </>
                  )}
                  
                  {/* Admin Actions */}
                  {user.role === "admin" && currentEntry?.status === "submitted" && (
                    <>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={handleReject}
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        {t("Reject", "Diid")}
                      </Button>
                      <Button 
                        size="sm" 
                        onClick={handleApprove}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        {t("Approve Marks", "Ansixiya Dhibcaha")}
                      </Button>
                    </>
                  )}

                  {/* Admin can always save if not approved */}
                  {user.role === "admin" && currentEntry?.status !== "approved" && currentEntry?.status !== "submitted" && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleSaveDraft}
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {t("Save", "Keydi")}
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Marks Table */}
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">#</TableHead>
                      <TableHead className="min-w-[200px]">{t("Student Name", "Magaca Ardayga")}</TableHead>
                      <TableHead className="w-[100px] text-center">{t("Midterm", "Barxad-dhexe")}</TableHead>
                      <TableHead className="w-[100px] text-center">{t("Final", "Dhammaad")}</TableHead>
                      <TableHead className="w-[100px] text-center">{t("Homework", "Shaqo Guriga")}</TableHead>
                      <TableHead className="w-[100px] text-center">{t("Total", "Wadarta")}</TableHead>
                      <TableHead className="w-[100px] text-center">{t("Average %", "Celcelis %")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentMarks.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-12">
                          <div className="flex flex-col items-center gap-3">
                            <AlertCircle className="h-16 w-16 text-muted-foreground" />
                            <div>
                              <p className="font-medium text-lg">
                                {t("No students found in this class", "Ardayda lama helin fasalkan")}
                              </p>
                              <p className="text-sm text-muted-foreground mt-1">
                                {t("Please add students to this class first", "Fadlan ku dar ardayda fasalkan marka hore")}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      currentMarks.map((student, index) => (
                        <TableRow key={student.id}>
                          <TableCell className="font-medium">{index + 1}</TableCell>
                          <TableCell className="font-medium">{student.name}</TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              min="0"
                              max="100"
                              value={student.midterm || ""}
                              onChange={(e) => updateMark(student.studentId, "midterm", e.target.value)}
                              className="text-center h-9"
                              disabled={!canEdit && user.role === "teacher"}
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              min="0"
                              max="100"
                              value={student.final || ""}
                              onChange={(e) => updateMark(student.studentId, "final", e.target.value)}
                              className="text-center h-9"
                              disabled={!canEdit && user.role === "teacher"}
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              min="0"
                              max="100"
                              value={student.homework || ""}
                              onChange={(e) => updateMark(student.studentId, "homework", e.target.value)}
                              className="text-center h-9"
                              disabled={!canEdit && user.role === "teacher"}
                            />
                          </TableCell>
                          <TableCell className="text-center font-semibold">
                            {student.total}
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge 
                              variant={
                                student.percentage >= 85 ? "default" : 
                                student.percentage >= 70 ? "secondary" : 
                                student.percentage < 50 ? "destructive" : "outline"
                              }
                              className="font-bold text-base"
                            >
                              {student.percentage > 0 ? `${student.percentage}%` : "-"}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Performance Scale */}
              <div className="mt-4 p-4 rounded-lg bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800">
                <h4 className="font-medium text-sm text-blue-900 dark:text-blue-100 mb-2">
                  {t("Performance Scale", "Qiimaha Horumarka")}:
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-blue-800 dark:text-blue-200">
                  <div className="flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-green-500"></span>
                    {t("Excellent", "Aad u fiican")}: 85-100%
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-blue-500"></span>
                    {t("Good", "Fiican")}: 70-84%
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-yellow-500"></span>
                    {t("Satisfactory", "Caadi")}: 50-69%
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-red-500"></span>
                    {t("Needs Improvement", "U baahan horumar")}: 0-49%
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  // Main exam list view
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
                {user.role === "admin" 
                  ? t("Marks Approval", "Ansixinta Dhibcaha")
                  : t("Enter Marks", "Geli Dhibcaha")
                } 📝
              </h2>
              <Badge variant="outline" className="text-sm">
                {selectedAcademicYear}
              </Badge>
            </div>
            <p className="text-muted-foreground mt-1">
              {user.role === "admin"
                ? t("Review and approve marks submitted by teachers", "Eeg oo ansixiya dhibcaha macallimiintu gudbiyeen")
                : t("Enter marks for your assigned exams before the deadline", "Geli dhibcaha imtixaanadaada loo qoondeeyay ka hor wakhtigii")
              }
            </p>
          </div>
        </div>


        {/* Statistics */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {t("Total Exams", "Wadarta Imtixaanada")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {t("Completed", "La dhammaystay")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {t("Pending Approval", "Sugitaan Ansixinta")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {t("Deadline Passed", "Wakhtigii dhamaday")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.deadlinePassed}</div>
            </CardContent>
          </Card>
        </div>

        {/* Exam List */}
        <Card>
          <CardHeader>
            <CardTitle>{t("Scheduled Exams", "Imtixaanada La qorsheeyay")}</CardTitle>
            <CardDescription>
              {user.role === "admin"
                ? t("All scheduled exams for this academic year", "Dhammaan imtixaanada la qorsheeyay sanadkan dugsiga")
                : t("Select an exam to enter marks. You can only enter marks before the deadline.", "Dooro imtixaan si aad u geliso dhibcaha. Waxaad gelin kartaa dhibcaha kaliya ka hor wakhtigii.")
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {availableExams.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Calendar className="h-16 w-16 text-muted-foreground mb-4" />
                <p className="text-lg font-medium">{t("No exams scheduled", "Imtixaano lama qorsheyn")}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {user.role === "admin"
                    ? t("Create exam schedules to start", "Abuur jadwalka imtixaanada si aad u bilowdo")
                    : t("No exams have been scheduled yet", "Weli imtixaano lama qorsheyn")
                  }
                </p>
                {user.role === "admin" && (
                  <Link to="/dashboard/exam-schedule" className="mt-4">
                    <Button>
                      <Calendar className="h-4 w-4 mr-2" />
                      {t("Go to Exam Schedule", "Tag Jadwalka Imtixaanada")}
                    </Button>
                  </Link>
                )}
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {availableExams.map((exam) => {
                  const status = getExamStatus(exam);
                  const entry = allMarksEntries[exam.id];
                  const examDate = new Date(exam.date);
                  const canEnter = canTeacherEnter(exam);
                  const deadlinePassed = isAfterDeadline(exam);

                  return (
                    <Card key={exam.id} className={
                      status.status === "approved" ? "border-green-200 bg-green-50/50 dark:bg-green-950/20" :
                      status.status === "submitted" ? "border-yellow-200 bg-yellow-50/50 dark:bg-yellow-950/20" :
                      status.status === "deadline-passed" ? "border-red-200 bg-red-50/50 dark:bg-red-950/20" :
                      ""
                    }>
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <CardTitle className="text-base truncate">{exam.examName}</CardTitle>
                            <CardDescription className="mt-1">
                              {exam.className} • {exam.subject}
                            </CardDescription>
                          </div>
                          <Badge 
                            variant="outline"
                            className={
                              status.color === "green" ? "bg-green-100 text-green-700 border-green-300" :
                              status.color === "yellow" ? "bg-yellow-100 text-yellow-700 border-yellow-300" :
                              status.color === "red" ? "bg-red-100 text-red-700 border-red-300" :
                              status.color === "blue" ? "bg-blue-100 text-blue-700 border-blue-300" :
                              ""
                            }
                          >
                            {status.label}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {/* Exam Details */}
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <CalendarCheck className="h-4 w-4" />
                            <span>
                              {examDate.toLocaleDateString(language === "en" ? "en-US" : "so-SO", {
                                weekday: 'short',
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                              })}
                            </span>
                          </div>
                          
                          {/* 🚀 AUTOMATED WORKFLOW: Show workflow status */}
                          {entry && (
                            <div className="flex items-center gap-2 text-xs">
                              <span className="text-muted-foreground">🔄</span>
                              <span className={
                                entry.status === "approved" ? "text-green-600 font-medium" :
                                entry.status === "submitted" ? "text-blue-600 font-medium" :
                                "text-gray-500"
                              }>
                                {entry.status === "approved" ? t("✅ Results Auto-Generated", "✅ Natiijooyinka si toos ah loo sameeyay") :
                                 entry.status === "submitted" ? t("📝 Ready for Auto-Approval", "📝 Diyaar u ah Ansixinta Tooska") :
                                 entry.status === "draft" ? t("📋 Marks Template Ready", "📋 Qaabka Dhibcaha diyaar") :
                                 ""}
                              </span>
                            </div>
                          )}
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            <span>{exam.startTime} - {exam.endTime}</span>
                          </div>
                          {deadlinePassed && (
                            <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                              <CalendarX className="h-4 w-4" />
                              <span className="font-medium">
                                {t("Deadline: 24hrs after exam", "Waqtiga: 24 saacadood kadib imtixaanka")}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Marks Progress */}
                        {entry && (
                          <div className="pt-2 border-t">
                            <div className="text-xs text-muted-foreground mb-1">
                              {t("Marks Entry Status", "Xaalada Gelitaanka Dhibcaha")}
                            </div>
                            <div className="flex items-center gap-2">
                              {entry.status === "draft" && <Badge variant="outline">{t("Draft", "Qabaal")}</Badge>}
                              {entry.status === "submitted" && <Badge className="bg-yellow-600">{t("Submitted", "La gudbiyay")}</Badge>}
                              {entry.status === "approved" && <Badge className="bg-green-600">{t("Approved", "La ansixiyay")}</Badge>}
                            </div>
                          </div>
                        )}

                        {/* Action Button */}
                        <Button 
                          className="w-full" 
                          onClick={() => handleSelectExam(exam)}
                          disabled={user.role === "teacher" && !canEnter && !entry}
                          variant={status.status === "approved" ? "outline" : "default"}
                        >
                          <FileEdit className="h-4 w-4 mr-2" />
                          {entry?.status === "approved" 
                            ? t("View Marks", "Eeg Dhibcaha")
                            : entry?.status === "submitted" && user.role === "admin"
                            ? t("Review & Approve", "Eeg oo Ansixiya")
                            : entry
                            ? t("Edit Marks", "Wax ka beddel Dhibcaha")
                            : t("Enter Marks", "Geli Dhibcaha")
                          }
                        </Button>

                        {/* Teacher Access Warning */}
                        {user.role === "teacher" && !canEnter && !entry && (
                          <p className="text-xs text-red-600 text-center">
                            {deadlinePassed 
                              ? t("⛔ Deadline passed", "⛔ Wakhtigii wuu dhamaday")
                              : t("🔒 Access restricted", "🔒 Gelitaanka waa xaddidan")
                            }
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Connection to Exam Schedule */}
        {user.role === "admin" && (
          <Card className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/30 dark:to-blue-950/30 border-purple-200">
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <Calendar className="h-10 w-10 text-purple-600 flex-shrink-0" />
                  <div>
                    <h3 className="text-lg font-semibold">
                      {t("Manage Exam Schedule", "Maamul Jadwalka Imtixaanada")}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {t("Schedule new exams, set dates and deadlines for mark entries", "Jadwali imtixaano cusub, go'aami taariikhaha iyo waqtiyada gelitaanka dhibcaha")}
                    </p>
                  </div>
                </div>
                <Link to="/dashboard/exam-schedule">
                  <Button size="lg" className="gap-2 bg-purple-600 hover:bg-purple-700 whitespace-nowrap">
                    {t("Go to Exam Schedule", "Tag Jadwalka Imtixaanada")}
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
