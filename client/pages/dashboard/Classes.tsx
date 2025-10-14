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
import { Textarea } from "@/components/ui/textarea";
import { BookOpen, Plus, Edit, Trash2, Users, ArrowLeft, GraduationCap, User, CalendarCheck, ExternalLink } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

interface ClassInfo {
  id: string;
  name: string;
  grade: string;
  section: string;
  teacher: string;
  teacherId: string;
  room: string;
  capacity: number;
  studentCount: number;
  subjects: string[];
  academicYear: string;
}

export default function Classes() {
  const { language, selectedAcademicYear } = useApp();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<ClassInfo | null>(null);
  
  const t = (en: string, so: string) => (language === "en" ? en : so);
  
  // Form state
  const [formData, setFormData] = useState({
    name: "",
    grade: "1aad",
    section: "a",
    room: "",
    capacity: 30,
    subjects: [] as string[],
    academicYear: selectedAcademicYear
  });

  // Load all classes from localStorage
  const [allClasses, setAllClasses] = useState<ClassInfo[]>(() => {
    try {
      const saved = localStorage.getItem("du_classes_store_json");
      if (saved) return JSON.parse(saved);
    } catch {}
    
    // Default Somali school classes for 2024-2025
    return [
      {
        id: "1",
        name: "8aad",
        grade: "8",
        section: "aad",
        teacher: "Ahmed Hassan Mohamed",
        teacherId: "TC-2024-001",
        room: "Room 201",
        capacity: 35,
        studentCount: 32,
        subjects: ["Mathematics", "Science", "English", "Somali"],
        academicYear: "2024-2025"
      },
      {
        id: "2",
        name: "Form 1",
        grade: "1",
        section: "Form",
        teacher: "Fatima Omar Ali",
        teacherId: "TC-2024-002",
        room: "Room 301",
        capacity: 30,
        studentCount: 28,
        subjects: ["Mathematics", "Physics", "Chemistry", "Biology"],
        academicYear: "2024-2025"
      },
      {
        id: "3",
        name: "5aad",
        grade: "5",
        section: "aad",
        teacher: "Mohamed Ali Hassan",
        teacherId: "TC-2024-003",
        room: "Room 105",
        capacity: 40,
        studentCount: 35,
        subjects: ["Mathematics", "Science", "English", "Somali", "Social Studies"],
        academicYear: "2024-2025"
      },
      {
        id: "4",
        name: "9aad",
        grade: "9",
        section: "aad",
        teacher: "Aisha Ahmed Yusuf",
        teacherId: "TC-2024-004",
        room: "Room 302",
        capacity: 30,
        studentCount: 27,
        subjects: ["Mathematics", "Physics", "Chemistry", "Biology", "English"],
        academicYear: "2024-2025"
      },
      {
        id: "5",
        name: "Form 2",
        grade: "2",
        section: "Form",
        teacher: "Omar Mohamed Hassan",
        teacherId: "TC-2024-005",
        room: "Room 401",
        capacity: 25,
        studentCount: 23,
        subjects: ["Mathematics", "Physics", "Chemistry", "Biology", "English"],
        academicYear: "2024-2025"
      }
    ];
  });

  // Auto-save
  useEffect(() => {
    localStorage.setItem("du_classes_store_json", JSON.stringify(allClasses));
  }, [allClasses]);

  // Update subjects when they change in localStorage
  useEffect(() => {
    const handleStorageChange = () => {
      try {
        const saved = localStorage.getItem("du_subjects_store_json");
        if (saved) {
          const subjects = JSON.parse(saved);
          setSchoolSubjects(subjects.map((subject: any) => subject.name));
        }
      } catch {}
    };

    // Listen for storage changes
    window.addEventListener('storage', handleStorageChange);
    
    // Also check on component mount
    handleStorageChange();

    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Filter by selected academic year
  const classesForYear = allClasses.filter(c => c.academicYear === selectedAcademicYear);

  // Then filter by search query
  const filteredClasses = classesForYear.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.room.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const grades = ["1aad", "2aad", "3aad", "4aad", "5aad", "6aad", "7aad", "8aad", "Form 1", "Form 2", "Form 3", "Form 4"];
  const sections = ["a", "b"];
  
  // Load subjects from localStorage (same as subjects page)
  const [schoolSubjects, setSchoolSubjects] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("du_subjects_store_json");
      if (saved) {
        const subjects = JSON.parse(saved);
        return subjects.map((subject: any) => subject.name);
      }
    } catch {}
    return [];
  });
  
  // Mock teachers - in production, fetch from API
  const teachers = [
    { id: "TC-2024-001", name: "Ahmed Hassan Mohamed" },
    { id: "TC-2024-002", name: "Fatima Omar Ali" },
    { id: "TC-2024-003", name: "Ali Mohamed Hassan" },
  ];

  const handleOpenAdd = () => {
    setFormData({
      name: "",
      grade: "1aad",
      section: "a",
      room: "",
      capacity: 30,
      subjects: [],
      academicYear: selectedAcademicYear
    });
    setEditingClass(null);
    setIsAddDialogOpen(true);
  };

  const handleOpenEdit = (classItem: ClassInfo) => {
    setFormData({
      name: classItem.name,
      grade: classItem.grade,
      section: classItem.section,
      room: classItem.room,
      capacity: classItem.capacity,
      subjects: classItem.subjects,
      academicYear: classItem.academicYear
    });
    setEditingClass(classItem);
    setIsAddDialogOpen(true);
  };

  const handleSave = () => {
    if (!formData.name) {
      toast({
        title: t("Error", "Qalad"),
        description: t("Please fill in class name", "Fadlan buuxi magaca fasalka"),
        variant: "destructive",
      });
      return;
    }

    const className = formData.name || `${formData.grade}-${formData.section}`;

    if (editingClass) {
      // Update existing class
      setAllClasses(allClasses.map(c => 
        c.id === editingClass.id 
          ? { 
              ...c, 
              name: className,
              grade: formData.grade,
              section: formData.section,
              room: formData.room,
              capacity: formData.capacity,
              subjects: formData.subjects,
              academicYear: formData.academicYear
            }
          : c
      ));
      toast({
        title: t("Success", "Guul"),
        description: t("Class updated successfully", "Fasalka waa la cusbooneysiiyay si guul leh"),
      });
    } else {
      // Add new class
      const newClass: ClassInfo = {
        id: Date.now().toString(),
        name: className,
        grade: formData.grade,
        section: formData.section,
        teacher: "", // No assigned teacher
        teacherId: "", // No assigned teacher
        room: formData.room,
        capacity: formData.capacity,
        studentCount: 0,
        subjects: formData.subjects,
        academicYear: formData.academicYear
      };
      
      setAllClasses([...allClasses, newClass]);
      toast({
        title: t("Success", "Guul"),
        description: t("Class created successfully", "Fasalka waa la abuuray si guul leh"),
      });
    }

    setIsAddDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm(t("Are you sure you want to delete this class?", "Ma hubtaa inaad tirtirto fasalkan?"))) {
      setAllClasses(allClasses.filter(c => c.id !== id));
      toast({
        title: t("Deleted", "La tirtiray"),
        description: t("Class deleted successfully", "Fasalka waa la tirtiray si guul leh"),
      });
    }
  };

  const getCapacityBadge = (studentCount: number, capacity: number) => {
    const percentage = (studentCount / capacity) * 100;
    if (percentage >= 100) return <Badge variant="destructive">{studentCount}/{capacity}</Badge>;
    if (percentage >= 80) return <Badge className="bg-yellow-500">{studentCount}/{capacity}</Badge>;
    return <Badge variant="secondary">{studentCount}/{capacity}</Badge>;
  };

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
            <div className="flex items-center gap-3">
              <h2 className="text-3xl font-bold tracking-tight">
                {t("Classes Management", "Maamulka Fasallada")} 📚
              </h2>
              <Badge variant="outline" className="text-sm">
                {selectedAcademicYear}
              </Badge>
            </div>
            <p className="text-muted-foreground mt-1">
              {t("Create and manage classes, assign teachers and students", "Abuur oo maamul fasallada, u qoondee macallimiin iyo arday")}
              {classesForYear.length === 0 && (
                <span className="text-blue-600"> • {t("No classes yet for this year", "Weli fasallo loo ma hayo sanadkan")}</span>
              )}
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {t("Total Classes", "Wadarta Fasallada")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{classesForYear.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {t("Total Students", "Wadarta Ardayda")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {classesForYear.reduce((sum, c) => sum + c.studentCount, 0)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {t("Total Capacity", "Wadarta Awooda")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {classesForYear.reduce((sum, c) => sum + c.capacity, 0)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {t("Teachers", "Macallimiinta")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {new Set(classesForYear.map(c => c.teacherId)).size}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Classes List */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <CardTitle>{t("Classes List", "Liiska Fasallada")}</CardTitle>
              <div className="flex gap-2 flex-wrap">
                <div className="relative flex-1 sm:w-[300px]">
                  <Input
                    placeholder={t("Search classes...", "Raadi fasallo...")}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={handleOpenAdd}>
                      <Plus className="h-4 w-4 mr-2" />
                      {t("Create Class", "Abuur Fasal")}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>
                        {editingClass 
                          ? t("Edit Class", "Wax ka beddel Fasalka")
                          : t("Create New Class", "Abuur Fasal Cusub")
                        }
                      </DialogTitle>
                      <DialogDescription>
                        {t("Fill in the class information below", "Buuxi xogta fasalka hoose")}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="name">{t("Class Name", "Magaca Fasalka")} *</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder="1aad-a"
                        />
                        <p className="text-xs text-muted-foreground">
                          {t("Or use Class Level + Section below", "Ama isticmaal Heerka Fasalka + Qaybta hoose")}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <Label>{t("Class Level", "Heerka Fasalka")}</Label>
                          <Select 
                            value={formData.grade}
                            onValueChange={(value) => {
                              setFormData({ 
                                ...formData, 
                                grade: value,
                                name: `${value}-${formData.section}`
                              });
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="max-h-60 overflow-y-auto">
                              {grades.map((g) => (
                                <SelectItem key={g} value={g}>
                                  {g}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid gap-2">
                          <Label>{t("Section", "Qaybta")}</Label>
                          <Select 
                            value={formData.section}
                            onValueChange={(value) => {
                              setFormData({ 
                                ...formData, 
                                section: value,
                                name: `${formData.grade}-${value}`
                              });
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="max-h-40 overflow-y-auto">
                              {sections.map((s) => (
                                <SelectItem key={s} value={s}>{s}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>


                      <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <Label htmlFor="room">{t("Classroom", "Qolka Fasalka")}</Label>
                          <Input
                            id="room"
                            value={formData.room}
                            onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                            placeholder="Room 201"
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="capacity">{t("Max Capacity", "Awooda Ugu Badan")}</Label>
                          <Input
                            id="capacity"
                            type="number"
                            min="1"
                            value={formData.capacity}
                            onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) || 30 })}
                          />
                        </div>
                      </div>

                      <div className="grid gap-2">
                        <Label>{t("Subjects", "Maadooyinka")}</Label>
                        <div className="max-h-40 overflow-y-auto border rounded-md p-2 space-y-1">
                          {schoolSubjects.map((subject) => (
                            <div key={subject} className="flex items-center space-x-2 py-1">
                              <input
                                type="checkbox"
                                id={subject}
                                checked={formData.subjects.includes(subject)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setFormData({ 
                                      ...formData, 
                                      subjects: [...formData.subjects, subject]
                                    });
                                  } else {
                                    setFormData({ 
                                      ...formData, 
                                      subjects: formData.subjects.filter(s => s !== subject)
                                    });
                                  }
                                }}
                                className="rounded"
                              />
                              <label htmlFor={subject} className="flex-1 text-sm cursor-pointer">
                                {subject}
                              </label>
                            </div>
                          ))}
                        </div>
                        {formData.subjects.length > 0 && (
                          <div className="text-xs text-muted-foreground">
                            {t("Selected", "La dooran")}: {formData.subjects.join(", ")}
                          </div>
                        )}
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                        {t("Cancel", "Ka noqo")}
                      </Button>
                      <Button onClick={handleSave}>
                        {editingClass 
                          ? t("Update Class", "Cusboonaysii Fasalka")
                          : t("Create Class", "Abuur Fasal")
                        }
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("Class", "Fasalka")}</TableHead>
                    <TableHead>{t("Room", "Qolka")}</TableHead>
                    <TableHead>{t("Subjects", "Maadooyinka")}</TableHead>
                    <TableHead className="text-center">{t("Students", "Ardayda")}</TableHead>
                    <TableHead className="text-right">{t("Actions", "Ficillada")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredClasses.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-12">
                        <div className="flex flex-col items-center gap-3">
                          <div className="text-5xl">📚</div>
                          <div>
                            <p className="font-medium text-lg">
                              {t("No classes for this academic year", "Fasallo looma hayo sanadkan dugsiga")}
                            </p>
                            <p className="text-sm text-muted-foreground mt-1">
                              {t("Click 'Create Class' to add your first class", "Guji 'Abuur Fasal' si aad u darto fasalkaga ugu horreeya")}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredClasses.map((classItem) => (
                      <TableRow key={classItem.id}>
                        <TableCell>
                          <div>
                            <div className="font-semibold text-lg">{classItem.name}</div>
                            <div className="text-xs text-muted-foreground">
                              {t("Capacity", "Awooda")}: {classItem.capacity}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{classItem.room}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {classItem.subjects.slice(0, 2).map((subject, idx) => (
                              <Badge key={idx} variant="secondary" className="text-xs">
                                {subject}
                              </Badge>
                            ))}
                            {classItem.subjects.length > 2 && (
                              <Badge variant="secondary" className="text-xs">
                                +{classItem.subjects.length - 2}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          {getCapacityBadge(classItem.studentCount, classItem.capacity)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-2 justify-end">
                            <Link to={`/dashboard/class/${classItem.id}/students`}>
                              <Button variant="ghost" size="sm">
                                <Users className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenEdit(classItem)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(classItem.id)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            <div className="mt-4 p-4 rounded-lg bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800">
              <p className="text-sm text-blue-900 dark:text-blue-100">
                💡 {t("Tip: You can delete any class. Students will be automatically unassigned.", "Talo: Waxaad tirtiri kartaa fasalka kasta. Ardayda si toos ah ayaa loo saarayaa.")}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Quick Links - Related Pages */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border-green-200 hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                    <GraduationCap className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm">
                      {t("Manage Students", "Maamul Ardayda")}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {t("Add and assign students to classes", "Ku dar oo u qoondeey ardayda fasallada")}
                    </p>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full justify-between"
                  onClick={() => navigate("/dashboard/students")}
                >
                  {t("Go to Students", "Tag Ardayda")}
                  <ExternalLink className="h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/30 border-orange-200 hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-orange-100 dark:bg-orange-900 flex items-center justify-center">
                    <CalendarCheck className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm">
                      {t("Mark Attendance", "Calaamadee Hoyga")}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {t("Track student attendance by class", "Raac hoyga ardayda fasalka")}
                    </p>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full justify-between"
                  onClick={() => navigate("/dashboard/attendance")}
                >
                  {t("Go to Attendance", "Tag Hoyga")}
                  <ExternalLink className="h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

      </div>
    </DashboardLayout>
  );
}

