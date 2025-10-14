import DashboardLayout from "@/components/layout/DashboardLayout";
import { useApp } from "@/context/AppContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Calendar, Plus, Edit, Trash2, ArrowLeft, Clock, BookOpen, FileEdit, ExternalLink, AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

interface ExamSchedule {
  id: string;
  examName: string;
  examType: string;
  className: string;
  subject: string;
  subjects?: string[]; // Support multiple subjects
  date: string;
  startTime: string;
  endTime: string;
  duration: string;
  room: string;
  academicYear: string;
  teacherId?: string; // Track which teacher created this
}

export default function ExamSchedule() {
  const { language, selectedAcademicYear, user } = useApp();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingExam, setEditingExam] = useState<ExamSchedule | null>(null);
  
  const t = (en: string, so: string) => (language === "en" ? en : so);
  const isAdmin = user.role === "admin";
  const currentTeacherId = user.role === "teacher" ? user.id : null;
  
  // Load classes and subjects from localStorage
  const [classes, setClasses] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  
  useEffect(() => {
    try {
      const classesData = localStorage.getItem("du_classes_store_json");
      const subjectsData = localStorage.getItem("du_subjects_store_json");
      
      if (classesData) {
        const allClasses = JSON.parse(classesData);
        // Filter by selected academic year
        setClasses(allClasses.filter((c: any) => c.academicYear === selectedAcademicYear));
      }
      
      if (subjectsData) {
        setSubjects(JSON.parse(subjectsData));
      }
    } catch (error) {
      console.error("Failed to load classes/subjects:", error);
    }
  }, [selectedAcademicYear]);

  // 🎯 TEACHER-SPECIFIC SUBJECT FILTERING
  const getAvailableSubjects = () => {
    if (isAdmin) {
      // Admin can see all subjects
      return subjects;
    } else if (currentTeacherId) {
      // Teacher can only see subjects they are assigned to teach
      try {
        const teachersData = localStorage.getItem("du_teachers_store_json");
        if (teachersData) {
          const allTeachers = JSON.parse(teachersData);
          const currentTeacher = allTeachers.find((t: any) => t.id === currentTeacherId);
          
          if (currentTeacher && currentTeacher.subjects) {
            const teacherSubjects = JSON.parse(currentTeacher.subjects);
            return subjects.filter(subject => teacherSubjects.includes(subject.name));
          }
        }
      } catch (error) {
        console.error("Failed to load teacher subjects:", error);
      }
      // Fallback: show all subjects if teacher data not found
      return subjects;
    }
    return [];
  };

  const availableSubjects = getAvailableSubjects();

  // Form state
  const [formData, setFormData] = useState({
    examName: "",
    examType: "Midterm",
    className: "",
    subject: "",
    subjects: [] as string[], // Support multiple subjects
    subjectAssignments: {} as Record<string, { room?: string; startTime?: string; duration?: string }>, // Editable assignments per subject
    date: "",
    startTime: "09:00",
    endTime: "11:00",
    duration: "2 hours",
    room: "",
    academicYear: selectedAcademicYear,
    teacherId: currentTeacherId
  });

  const examTypes = [
    { value: "Midterm", label: t("Midterm Exam", "Imtixaanka Barxad-dhexe") },
    { value: "Final", label: t("Final Exam", "Imtixaanka Dhammaadka") },
    { value: "Quiz", label: t("Quiz", "Imtixaan yar") },
    { value: "Monthly", label: t("Monthly Test", "Tijaabada Bishii") },
  ];

  // Load exam schedules from localStorage
  const [allExams, setAllExams] = useState<ExamSchedule[]>(() => {
    try {
      const saved = localStorage.getItem("du_exam_schedules_json");
      if (saved) return JSON.parse(saved);
    } catch {}
    
    // Default exam schedules
    return [
      {
        id: "1",
        examName: "Mathematics Midterm",
        examType: "Midterm",
        className: "8aad",
        subject: "Mathematics",
        date: "2025-11-15",
        startTime: "09:00",
        endTime: "11:00",
        duration: "2 hours",
        room: "Room 201",
        academicYear: "2024-2025"
      },
      {
        id: "2",
        examName: "English Final Exam",
        examType: "Final",
        className: "Form 1",
        subject: "English",
        date: "2025-12-10",
        startTime: "10:00",
        endTime: "12:00",
        duration: "2 hours",
        room: "Room 202",
        academicYear: "2024-2025"
      },
      {
        id: "3",
        examName: "Science Final Exam",
        examType: "Final",
        className: "5aad",
        subject: "Science",
        date: "2025-12-12",
        startTime: "09:00",
        endTime: "11:00",
        duration: "2 hours",
        room: "Room 105",
        academicYear: "2024-2025"
      },
      {
        id: "4",
        examName: "Physics Midterm",
        examType: "Midterm",
        className: "9aad",
        subject: "Physics",
        date: "2025-11-20",
        startTime: "10:00",
        endTime: "12:00",
        duration: "2 hours",
        room: "Room 302",
        academicYear: "2024-2025"
      },
    ];
  });

  // Auto-save
  useEffect(() => {
    localStorage.setItem("du_exam_schedules_json", JSON.stringify(allExams));
  }, [allExams]);

  // Filter by selected academic year and teacher permissions
  const examsForYear = allExams.filter(e => {
    const matchesYear = e.academicYear === selectedAcademicYear;
    
    if (isAdmin) {
      // Admin can see all exams
      return matchesYear;
    } else {
      // Teachers can only see exams they created or that are for their subjects
      const isOwnExam = e.teacherId === currentTeacherId;
      const isForMySubject = availableSubjects.some(subject => 
        (e.subjects && e.subjects.includes(subject.name)) || e.subject === subject.name
      );
      
      return matchesYear && (isOwnExam || isForMySubject);
    }
  });

  // Sort by date
  const sortedExams = [...examsForYear].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  // 🎯 AUTO-ASSIGNMENT: Generate automatic room, time, and duration assignments
  const generateAutoAssignments = (selectedSubjects: string[]) => {
    const rooms = ["Room 101", "Room 102", "Room 103", "Room 201", "Room 202", "Room 203", "Room 301", "Room 302", "Room 303"];
    const timeSlots = [
      { start: "09:00", end: "11:00", duration: "2 hours" },
      { start: "11:30", end: "13:30", duration: "2 hours" },
      { start: "14:00", end: "16:00", duration: "2 hours" },
      { start: "16:30", end: "18:30", duration: "2 hours" }
    ];
    
    const assignments = selectedSubjects.map((subject, index) => ({
      subject,
      room: rooms[index % rooms.length],
      timeSlot: timeSlots[index % timeSlots.length]
    }));
    
    return assignments;
  };

  const handleOpenAdd = () => {
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0];
    
    setFormData({
      examName: "",
      examType: "Midterm",
      className: "",
      subject: "",
      subjects: [],
      subjectAssignments: {},
      date: dateStr,
      startTime: "09:00",
      endTime: "11:00",
      duration: "2 hours",
      room: "",
      academicYear: selectedAcademicYear,
      teacherId: currentTeacherId
    });
    setEditingExam(null);
    setIsAddDialogOpen(true);
  };

  const handleOpenEdit = (exam: ExamSchedule) => {
    setFormData({
      ...exam,
      subjects: exam.subjects || [],
      subjectAssignments: (exam as any).subjectAssignments || {},
      teacherId: exam.teacherId || ""
    });
    setEditingExam(exam);
    setIsAddDialogOpen(true);
  };

  const handleSave = () => {
    if (!formData.examName || !formData.className || formData.subjects.length === 0 || !formData.date) {
      toast({
        title: t("Error", "Qalad"),
        description: t("Please fill in all required fields and select at least one subject", "Fadlan buuxi dhammaan goobaha loo baahan yahay oo dooro ugu yaraan hal maaddo"),
        variant: "destructive",
      });
      return;
    }

    // 🎯 AUTO-ASSIGNMENT: Create separate exam entries for each subject with editable assignments
    const newExams: ExamSchedule[] = [];

    formData.subjects.forEach((subject, index) => {
      const examId = editingExam ? editingExam.id : `${Date.now()}-${index}`;
      
      // Get auto-assignment as fallback
      const autoAssignment = generateAutoAssignments([subject])[0];
      
      // Use custom assignment if available, otherwise use auto-assignment
      const customAssignment = formData.subjectAssignments[subject];
      const finalAssignment = {
        room: customAssignment?.room || autoAssignment.room,
        startTime: customAssignment?.startTime || autoAssignment.timeSlot.start,
        duration: customAssignment?.duration || autoAssignment.timeSlot.duration
      };
      
      // Calculate end time based on start time and duration
      const startTime = new Date(`2000-01-01T${finalAssignment.startTime}`);
      const durationHours = parseFloat(finalAssignment.duration.replace(' hours', '').replace(' hour', ''));
      const endTime = new Date(startTime.getTime() + (durationHours * 60 * 60 * 1000));
      const endTimeStr = endTime.toTimeString().slice(0, 5);
      
      const newExam: ExamSchedule = {
        id: examId,
        examName: `${formData.examName} - ${subject}`,
        examType: formData.examType,
        className: formData.className,
        subject: subject,
        subjects: [subject], // Single subject per exam entry
        date: formData.date,
        startTime: finalAssignment.startTime,
        endTime: endTimeStr,
        duration: finalAssignment.duration,
        room: finalAssignment.room,
        academicYear: formData.academicYear,
        teacherId: formData.teacherId
      };

      newExams.push(newExam);
    });

    if (editingExam) {
      // Remove the old exam and add new ones
      const filteredExams = allExams.filter(e => e.id !== editingExam.id);
      setAllExams([...filteredExams, ...newExams]);
    } else {
      setAllExams([...allExams, ...newExams]);
    }

    // 🚀 AUTOMATED WORKFLOW: Create marks entry templates for each exam
    newExams.forEach(exam => {
      createMarksEntryTemplate(exam);
    });
    
    toast({
      title: t("Success", "Guul"),
      description: t(`Exam schedule created with ${newExams.length} subjects and marks entry templates auto-generated!`, `Jadwalka imtixaanka waa la abuuray iyada oo ${newExams.length} maaddo ah oo qaabka gelinta dhibcaha si toos ah loo sameeyay!`),
    });

    setIsAddDialogOpen(false);
  };

  // 🚀 AUTOMATED WORKFLOW: Auto-create marks entry template when exam is scheduled
  const createMarksEntryTemplate = (exam: ExamSchedule) => {
    try {
      // Load existing marks entries
      const existingMarks = localStorage.getItem("du_marks_entries_json");
      const allMarksEntries: Record<string, any> = existingMarks ? JSON.parse(existingMarks) : {};

      // Load students for the class
      const studentsData = localStorage.getItem("du_students_store_json");
      if (!studentsData) return;

      const allStudents = JSON.parse(studentsData);
      const classStudents = allStudents.filter((s: any) => 
        s.className === exam.className && s.academicYear === selectedAcademicYear
      );

      // Handle multiple subjects - create marks entry for each subject
      const subjectsToCreate = exam.subjects && exam.subjects.length > 0 ? exam.subjects : [exam.subject];
      
      subjectsToCreate.forEach(subject => {
        const marksEntry = {
          examId: exam.id,
          examName: exam.examName,
          examType: exam.examType,
          className: exam.className,
          subject: subject,
          examDate: exam.date,
          status: "draft",
          students: classStudents.map((student: any) => ({
            studentId: student.id,
            name: student.name,
            className: student.className,
            midterm: exam.examType === "Midterm" ? null : undefined,
            final: exam.examType === "Final" ? null : undefined,
            homework: exam.examType === "Quiz" ? null : undefined,
            total: null,
            percentage: null
          })),
          submittedAt: null,
          approvedAt: null,
          autoGenerated: true,
          createdAt: new Date().toISOString()
        };
        
        allMarksEntries[`${exam.id}-${subject}`] = marksEntry;
      });

      // Save to localStorage
      localStorage.setItem("du_marks_entries_json", JSON.stringify(allMarksEntries));
    } catch (error) {
      console.error("Failed to auto-create marks entry template:", error);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm(t("Are you sure you want to delete this exam schedule?", "Ma hubtaa inaad tirtirto jadwalkan imtixaanka?"))) {
      setAllExams(allExams.filter(e => e.id !== id));
      toast({
        title: t("Deleted", "La tirtiray"),
        description: t("Exam schedule deleted successfully", "Jadwalka imtixaanka waa la tirtiray si guul leh"),
      });
    }
  };

  const getExamTypeBadge = (type: string) => {
    switch (type) {
      case "Midterm":
        return <Badge className="bg-blue-600">{t("Midterm", "Barxad-dhexe")}</Badge>;
      case "Final":
        return <Badge className="bg-green-600">{t("Final", "Dhammaad")}</Badge>;
      case "Quiz":
        return <Badge className="bg-yellow-600">{t("Quiz", "Imtixaan yar")}</Badge>;
      case "Monthly":
        return <Badge className="bg-purple-600">{t("Monthly", "Bishii")}</Badge>;
      default:
        return <Badge>{type}</Badge>;
    }
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
                {t("Exam Schedule", "Jadwalka Imtixaanada")} 📅
              </h2>
              <Badge variant="outline" className="text-sm">
                {selectedAcademicYear}
              </Badge>
            </div>
            <p className="text-muted-foreground mt-1">
              {t("Schedule and manage exams for all classes", "Jadwali oo maamul imtixaanada dhammaan fasallada")}
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {t("Total Exams", "Wadarta Imtixaanada")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{examsForYear.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {t("Midterm Exams", "Imtixaanada Barxad-dhexe")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {examsForYear.filter(e => e.examType === "Midterm").length}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {t("Final Exams", "Imtixaanada Dhammaadka")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {examsForYear.filter(e => e.examType === "Final").length}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {t("Upcoming", "Imaanaya")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {examsForYear.filter(e => new Date(e.date) >= new Date()).length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Exam Schedule List */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <CardTitle>{t("Exam Schedule", "Jadwalka Imtixaanada")}</CardTitle>
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={handleOpenAdd}>
                    <Plus className="h-4 w-4 mr-2" />
                    {t("Schedule Exam", "Jadwali Imtixaan")}
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>
                      {editingExam 
                        ? t("Edit Exam Schedule", "Wax ka beddel Jadwalka Imtixaanka")
                        : t("Schedule New Exam", "Jadwali Imtixaan Cusub")
                      }
                    </DialogTitle>
                    <DialogDescription>
                      {t("Fill in the exam details below", "Buuxi faahfaahinta imtixaanka hoose")}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    {/* Alert if no classes or subjects */}
                    {(classes.length === 0 || subjects.length === 0) && (
                      <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription className="flex flex-col gap-2">
                          {classes.length === 0 && (
                            <span>
                              {t(
                                "⚠️ No classes available for this academic year. Please add classes first.",
                                "⚠️ Fasallo looma hayo sanadkan dugsiga. Fadlan marka hore ku dar fasallo."
                              )}
                            </span>
                          )}
                          {subjects.length === 0 && (
                            <span>
                              {t(
                                "⚠️ No subjects available. Please add subjects first.",
                                "⚠️ Maadooyin lama heli karo. Fadlan marka hore ku dar maadooyin."
                              )}
                            </span>
                          )}
                          <div className="flex gap-2 mt-2">
                            {classes.length === 0 && (
                              <Link to="/dashboard/classes">
                                <Button size="sm" variant="outline">
                                  <BookOpen className="h-3 w-3 mr-1" />
                                  {t("Add Classes", "Ku dar Fasallo")}
                                </Button>
                              </Link>
                            )}
                            {subjects.length === 0 && (
                              <Link to="/dashboard/subjects">
                                <Button size="sm" variant="outline">
                                  <FileEdit className="h-3 w-3 mr-1" />
                                  {t("Add Subjects", "Ku dar Maadooyin")}
                                </Button>
                              </Link>
                            )}
                          </div>
                        </AlertDescription>
                      </Alert>
                    )}

                    <div className="grid gap-2">
                      <Label htmlFor="examName">{t("Exam Name", "Magaca Imtixaanka")} *</Label>
                      <Input
                        id="examName"
                        value={formData.examName}
                        onChange={(e) => setFormData({ ...formData, examName: e.target.value })}
                        placeholder={t("e.g., Mathematics Midterm Exam", "Tusaale: Imtixaanka Barxad-dhexe ee Xisaabta")}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label>{t("Exam Type", "Nooca Imtixaanka")} *</Label>
                        <Select 
                          value={formData.examType}
                          onValueChange={(value) => setFormData({ ...formData, examType: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {examTypes.map((type) => (
                              <SelectItem key={type.value} value={type.value}>
                                {type.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid gap-2">
                        <Label>{t("Class", "Fasalka")} *</Label>
                        <Select 
                          value={formData.className}
                          onValueChange={(value) => setFormData({ ...formData, className: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder={t("Select class", "Dooro fasalka")} />
                          </SelectTrigger>
                          <SelectContent>
                            {classes.length === 0 ? (
                              <SelectItem value="no-classes" disabled>
                                {t("No classes available", "Fasallo ma jiraan")}
                              </SelectItem>
                            ) : (
                              classes.map((cls) => (
                                <SelectItem key={cls.id} value={cls.name}>
                                  {cls.name}
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                      <div className="grid gap-2">
                        <Label>{t("Subjects", "Maadooyin")} *</Label>
                        <div className="space-y-2">
                          {/* Show selected subjects */}
                          {formData.subjects.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {formData.subjects.map((subject, index) => (
                                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                                  {subject}
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const newSubjects = formData.subjects.filter((_, i) => i !== index);
                                      setFormData({ ...formData, subjects: newSubjects });
                                    }}
                                    className="ml-1 hover:text-red-500"
                                  >
                                    ×
                                  </button>
                                </Badge>
                              ))}
                            </div>
                          )}
                          
                          {/* Subject selector */}
                          <Select 
                            value=""
                            onValueChange={(value) => {
                              if (value && !formData.subjects.includes(value)) {
                                setFormData({ 
                                  ...formData, 
                                  subjects: [...formData.subjects, value],
                                  subject: value // Keep single subject for backward compatibility
                                });
                              }
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder={t("Add subject", "Ku dar maaddo")} />
                            </SelectTrigger>
                            <SelectContent>
                              {availableSubjects.length === 0 ? (
                                <SelectItem value="no-subjects" disabled>
                                  {t("No subjects available", "Maadooyin ma jiraan")}
                                </SelectItem>
                              ) : (
                                availableSubjects
                                  .filter(subject => !formData.subjects.includes(subject.name))
                                  .map((subject) => (
                                    <SelectItem key={subject.id} value={subject.name}>
                                      {language === "en" ? subject.name : (subject.nameInSomali || subject.name)}
                                    </SelectItem>
                                  ))
                              )}
                            </SelectContent>
                          </Select>
                          
                          {/* Show teacher-specific message */}
                          {!isAdmin && (
                            <p className="text-xs text-muted-foreground">
                              {t("Only showing subjects you are assigned to teach", "Kaliya waxaan ku tusi maadooyinka aad wax ku bartid")}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* 🎯 AUTO-ASSIGNMENT: Editable automatic room and time assignments */}
                      {formData.subjects.length > 0 && (
                        <div className="grid gap-2">
                          <Label>{t("Subject Schedule Assignments", "Qaybiyada Jadwalka Maaddooyinka")}</Label>
                          <div className="border rounded-lg p-4 bg-blue-50">
                            <h4 className="font-semibold text-blue-800 mb-2">
                              {t("Auto-Generated & Editable Schedule", "Jadwalka Si Toos Ah Loosameeyay & La Tafatiri Karo")} 🤖✏️
                            </h4>
                            <div className="space-y-3">
                              {formData.subjects.map((subject, index) => {
                                const autoAssignment = generateAutoAssignments([subject])[0];
                                return (
                                  <div key={index} className="p-3 bg-white rounded border">
                                    <div className="flex items-center justify-between mb-3">
                                      <div className="flex items-center gap-2">
                                        <Badge variant="outline" className="bg-blue-100">
                                          {subject}
                                        </Badge>
                                        <span className="text-sm text-muted-foreground">
                                          {t("Auto-assigned, but editable", "Si toos ah loo qaybiyay, laakiin la tafatiri karo")}
                                        </span>
                                      </div>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                          const autoAssignment = generateAutoAssignments([subject])[0];
                                          setFormData(prev => ({
                                            ...prev,
                                            subjectAssignments: {
                                              ...prev.subjectAssignments,
                                              [subject]: {
                                                room: autoAssignment.room,
                                                startTime: autoAssignment.timeSlot.start,
                                                duration: autoAssignment.timeSlot.duration
                                              }
                                            }
                                          }));
                                        }}
                                        className="text-xs"
                                      >
                                        🔄 {t("Reset to Auto", "Ku celi Si Toos Ah")}
                                      </Button>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                      {/* Room */}
                                      <div className="grid gap-1">
                                        <Label className="text-xs">{t("Room", "Qol")}</Label>
                                        <Input
                                          value={formData.subjectAssignments?.[subject]?.room || autoAssignment.room}
                                          onChange={(e) => {
                                            setFormData(prev => ({
                                              ...prev,
                                              subjectAssignments: {
                                                ...prev.subjectAssignments,
                                                [subject]: {
                                                  ...prev.subjectAssignments?.[subject],
                                                  room: e.target.value
                                                }
                                              }
                                            }));
                                          }}
                                          placeholder="Room 101"
                                          className="text-sm"
                                        />
                                      </div>

                                      {/* Time */}
                                      <div className="grid gap-1">
                                        <Label className="text-xs">{t("Start Time", "Waqtiga Bilowga")}</Label>
                                        <Input
                                          type="time"
                                          value={formData.subjectAssignments?.[subject]?.startTime || autoAssignment.timeSlot.start}
                                          onChange={(e) => {
                                            setFormData(prev => ({
                                              ...prev,
                                              subjectAssignments: {
                                                ...prev.subjectAssignments,
                                                [subject]: {
                                                  ...prev.subjectAssignments?.[subject],
                                                  startTime: e.target.value
                                                }
                                              }
                                            }));
                                          }}
                                          className="text-sm"
                                        />
                                      </div>

                                      {/* Duration */}
                                      <div className="grid gap-1">
                                        <Label className="text-xs">{t("Duration", "Muddo")}</Label>
                                        <Select 
                                          value={formData.subjectAssignments?.[subject]?.duration || autoAssignment.timeSlot.duration}
                                          onValueChange={(value) => {
                                            setFormData(prev => ({
                                              ...prev,
                                              subjectAssignments: {
                                                ...prev.subjectAssignments,
                                                [subject]: {
                                                  ...prev.subjectAssignments?.[subject],
                                                  duration: value
                                                }
                                              }
                                            }));
                                          }}
                                        >
                                          <SelectTrigger className="text-sm">
                                            <SelectValue />
                                          </SelectTrigger>
                                          <SelectContent>
                                            <SelectItem value="1 hour">{t("1 Hour", "1 Saac")}</SelectItem>
                                            <SelectItem value="1.5 hours">{t("1.5 Hours", "1.5 Saac")}</SelectItem>
                                            <SelectItem value="2 hours">{t("2 Hours", "2 Saac")}</SelectItem>
                                            <SelectItem value="2.5 hours">{t("2.5 Hours", "2.5 Saac")}</SelectItem>
                                            <SelectItem value="3 hours">{t("3 Hours", "3 Saac")}</SelectItem>
                                          </SelectContent>
                                        </Select>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                            <p className="text-xs text-blue-600 mt-2">
                              {t("Auto-assigned values are shown by default, but you can edit any field as needed", "Qiimaha si toos ah loo qaybiyay ayaa si dabiici ah loo tusiyaa, laakiin waxaad tafatiri kartaa goob kasta oo aad u baahan tahay")}
                            </p>
                          </div>
                        </div>
                      )}

                      <div className="grid gap-2">
                        <Label htmlFor="date">{t("Exam Date", "Taariikhda Imtixaanka")} *</Label>
                        <Input
                          id="date"
                          type="date"
                          value={formData.date}
                          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        />
                      </div>
                    </div>

                    {/* Auto-assignment notice */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-center gap-2">
                        <div className="text-blue-600">ℹ️</div>
                        <div className="text-sm">
                          <p className="font-medium text-blue-800">
                            {t("Automatic Assignment", "Qaybinta Si Toos Ah")}
                          </p>
                          <p className="text-blue-600">
                            {t("Room, time slots, and duration will be automatically assigned based on selected subjects", "Qol, waqtiyada, iyo muddada si toos ah loo qaybin doonaa iyada oo lagu saleeyo maadooyinka la doortay")}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                      {t("Cancel", "Ka noqo")}
                    </Button>
                    <Button 
                      onClick={handleSave}
                      disabled={classes.length === 0 || subjects.length === 0}
                    >
                      {editingExam 
                        ? t("Update Schedule", "Cusboonaysii Jadwalka")
                        : t("Create Schedule", "Abuur Jadwal")
                      }
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto -mx-6 px-6">
              <Table className="min-w-full">
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[200px]">{t("Exam Name", "Magaca Imtixaanka")}</TableHead>
                    <TableHead className="min-w-[100px]">{t("Type", "Nooca")}</TableHead>
                    <TableHead className="min-w-[120px]">{t("Class", "Fasalka")}</TableHead>
                    <TableHead className="min-w-[120px]">{t("Subject", "Maadda")}</TableHead>
                    <TableHead className="min-w-[150px]">{t("Date & Time", "Taariikhda & Waqtiga")}</TableHead>
                    <TableHead className="min-w-[100px]">{t("Room", "Qolka")}</TableHead>
                    <TableHead className="text-right min-w-[120px]">{t("Actions", "Ficillada")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedExams.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-12">
                        <div className="flex flex-col items-center gap-3">
                          <Calendar className="h-16 w-16 text-muted-foreground" />
                          <div>
                            <p className="font-medium text-lg">
                              {t("No exam schedules found", "Jadwalka imtixaanada lama helin")}
                            </p>
                            <p className="text-sm text-muted-foreground mt-1">
                              {t("Click 'Schedule Exam' to create your first exam schedule", "Guji 'Jadwali Imtixaan' si aad u abuurto jadwalkaaga imtixaanka ugu horreeya")}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    sortedExams.map((exam) => {
                      const examDate = new Date(exam.date);
                      const isPast = examDate < new Date();
                      
                      return (
                        <TableRow key={exam.id} className={isPast ? "opacity-60" : ""}>
                          <TableCell>
                            <div className="font-medium">{exam.examName}</div>
                            {/* 🚀 AUTOMATED WORKFLOW: Show marks entry status */}
                            {(() => {
                              try {
                                const marksData = localStorage.getItem("du_marks_entries_json");
                                if (marksData) {
                                  const allMarksEntries = JSON.parse(marksData);
                                  const marksEntry = allMarksEntries[exam.id];
                                  if (marksEntry) {
                                    const statusColor = marksEntry.status === "approved" ? "text-green-600" : 
                                                      marksEntry.status === "submitted" ? "text-blue-600" : "text-gray-500";
                                    const statusIcon = marksEntry.status === "approved" ? "✅" : 
                                                     marksEntry.status === "submitted" ? "📝" : "📋";
                                    return (
                                      <div className="text-xs mt-1 flex items-center gap-1">
                                        <span className={statusColor}>{statusIcon}</span>
                                        <span className={statusColor}>
                                          {marksEntry.status === "approved" ? t("Marks Approved", "Dhibcaha la ansixiyay") :
                                           marksEntry.status === "submitted" ? t("Marks Submitted", "Dhibcaha la gudbiyay") :
                                           t("Marks Template Ready", "Qaabka Dhibcaha diyaar")}
                                        </span>
                                      </div>
                                    );
                                  }
                                }
                                return null;
                              } catch {
                                return null;
                              }
                            })()}
                          </TableCell>
                          <TableCell>
                            {getExamTypeBadge(exam.examType)}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <BookOpen className="h-3 w-3 text-muted-foreground" />
                              {exam.className}
                              {exam.teacherId && (
                                <Badge variant="outline" className="text-xs ml-1">
                                  {t("Teacher", "Macallin")}
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {(exam.subjects && exam.subjects.length > 0 ? exam.subjects : [exam.subject]).map((subject, idx) => (
                                <Badge key={idx} variant="secondary" className="text-xs">
                                  {subject}
                                </Badge>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="font-medium">
                                {examDate.toLocaleDateString(language === "en" ? "en-US" : "so-SO", {
                                  weekday: 'short',
                                  month: 'short',
                                  day: 'numeric'
                                })}
                              </div>
                              <div className="text-sm text-muted-foreground flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {exam.startTime} - {exam.endTime}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{exam.room || "-"}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex gap-2 justify-end">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleOpenEdit(exam)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(exam.id)}
                                className="text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>

            <div className="mt-4 p-4 rounded-lg bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800">
              <p className="text-sm text-blue-900 dark:text-blue-100">
                💡 {t("Tip: Exam schedules help teachers and students prepare. Past exams are shown with reduced opacity.", "Talo: Jadwalka imtixaanadu waxay caawiyaan macallimiinta iyo ardayda inay diyaar garoobaan. Imtixaanada hore waxaa lagu muujiyaa caddaad yar.")}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Connection to Marks Approval */}
        <Card className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border-green-200">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <FileEdit className="h-10 w-10 text-green-600 flex-shrink-0" />
                <div>
                  <h3 className="text-lg font-semibold">
                    {t("Review & Approve Marks", "Eeg oo Ansixiya Dhibcaha")}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {t("After teachers enter marks, review and approve them to make them final", "Kadib markay macallimiintu geliyaan dhibcaha, eeg oo ansixiya si ay u noqdaan kuwa dhammaystiran")}
                  </p>
                </div>
              </div>
              <Link to="/dashboard/marks">
                <Button size="lg" className="gap-2 bg-green-600 hover:bg-green-700 whitespace-nowrap">
                  {t("Go to Marks Approval", "Tag Ansixinta Dhibcaha")}
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

