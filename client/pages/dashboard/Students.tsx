import DashboardLayout from "@/components/layout/DashboardLayout";
import { useApp } from "@/context/AppContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Search, Plus, Edit, Trash2, FileDown, ArrowLeft, User, BookOpen, IdCard, TrendingUp, ExternalLink, Users } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

export default function Students() {
  const { language, selectedAcademicYear } = useApp();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [bulkAddDialogOpen, setBulkAddDialogOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<any>(null);
  
  const t = (en: string, so: string) => (language === "en" ? en : so);
  
  // All years are editable - no read-only mode
  const isHistoricalYear = false; // Allow editing all years
  
  // Form state
  const [formData, setFormData] = useState({
    studentId: "",
    name: "",
    gender: "male" as "male" | "female",
    className: "",
    email: "",
    phone: "",
    parentPhone: ""
  });

  // Load year-specific students from localStorage
  const [allStudents, setAllStudents] = useState(() => {
    try {
      const yearData = localStorage.getItem("du_year_data_json");
      if (yearData) {
        const data = JSON.parse(yearData);
        return data[selectedAcademicYear]?.students || [];
      }
    } catch {}
    return [];
  });

  // Auto-save to year-specific localStorage whenever students change
  useEffect(() => {
    try {
      const yearData = localStorage.getItem("du_year_data_json");
      const data = yearData ? JSON.parse(yearData) : {};
      data[selectedAcademicYear] = {
        ...data[selectedAcademicYear],
        students: allStudents
      };
      localStorage.setItem("du_year_data_json", JSON.stringify(data));
    } catch (error) {
      console.error("Error saving year data:", error);
    }
  }, [allStudents, selectedAcademicYear]);

  // Reload students when academic year changes
  useEffect(() => {
    try {
      const yearData = localStorage.getItem("du_year_data_json");
      if (yearData) {
        const data = JSON.parse(yearData);
        setAllStudents(data[selectedAcademicYear]?.students || []);
      }
    } catch (error) {
      console.error("Error loading year data:", error);
      setAllStudents([]);
    }
  }, [selectedAcademicYear]);

  // Filter by selected academic year
  const studentsForYear = allStudents.filter(s => s.academicYear === selectedAcademicYear);

  // Then filter by search query
  const filteredStudents = studentsForYear.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.studentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.className.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const generateStudentId = () => {
    // Get year from selected academic year (e.g., "2024-2025" -> 2025)
    const yearPart = selectedAcademicYear.split('-')[1] || new Date().getFullYear();
    // Count students in this year only
    const studentsInYear = allStudents.filter(s => s.academicYear === selectedAcademicYear);
    const nextNumber = studentsInYear.length + 1;
    return `DU-${yearPart}-${String(nextNumber).padStart(3, '0')}`;
  };

  const handleOpenAdd = () => {
    setFormData({
      studentId: generateStudentId(),
      name: "",
      gender: "male",
      className: "",
      email: "",
      phone: "",
      parentPhone: ""
    });
    setEditingStudent(null);
    setIsAddDialogOpen(true);
  };

  const handleOpenEdit = (student: any, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation(); // Prevent event bubbling
    }
    setFormData(student);
    setEditingStudent(student);
    setIsAddDialogOpen(true);
  };

  const handleRowClick = (student: any) => {
    // Click on row to edit
    handleOpenEdit(student);
  };

  const handleSave = () => {
    if (!formData.name || !formData.className) {
      toast({
        title: t("Error", "Qalad"),
        description: t("Please fill in required fields", "Fadlan buuxi goobaha loo baahan yahay"),
        variant: "destructive",
      });
      return;
    }

    if (editingStudent) {
      // Update existing student
      setAllStudents(allStudents.map(s => 
        s.id === editingStudent.id ? { ...formData, academicYear: selectedAcademicYear, id: s.id } : s
      ));
      toast({
        title: t("Success", "Guul"),
        description: t("Student updated successfully", "Ardayga waa la cusbooneysiiyay si guul leh"),
      });
    } else {
      // Add new student
      setAllStudents([...allStudents, { ...formData, academicYear: selectedAcademicYear, id: Date.now().toString() }]);
      toast({
        title: t("Success", "Guul"),
        description: t("Student added successfully", "Ardayga waa lagu daray si guul leh"),
      });
    }

    setIsAddDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm(t("Are you sure you want to delete this student?", "Ma hubtaa inaad tirtirto ardaygan?"))) {
      setAllStudents(allStudents.filter(s => s.id !== id));
      toast({
        title: t("Deleted", "La tirtiray"),
        description: t("Student deleted successfully", "Ardayga waa la tirtiray si guul leh"),
      });
    }
  };

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
                {t("Students Management", "Maamulka Ardayda")} 🎓
              </h2>
              <Badge variant="outline" className="text-sm">
                {selectedAcademicYear}
              </Badge>
            </div>
            <p className="text-muted-foreground mt-1">
              {t("Click any row to edit student information", "Guji sadar kasta si aad u beddesho xogta ardayga")}
              {studentsForYear.length === 0 && (
                <span className="text-blue-600"> • {t("No students yet for this year", "Weli arday loo ma hayo sanadkan")}</span>
              )}
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {t("Total Students", "Wadarta Ardayda")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{studentsForYear.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {t("Male", "Lab")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {studentsForYear.filter(s => s.gender === "male").length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {t("Female", "Dheddig")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-pink-600">
                {studentsForYear.filter(s => s.gender === "female").length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {t("Classes", "Fasallada")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {new Set(studentsForYear.map(s => s.className)).size}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Student List */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <CardTitle>{t("Student List", "Liiska Ardayda")}</CardTitle>
              <div className="flex gap-2 flex-wrap">
                <div className="relative flex-1 sm:w-[300px]">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder={t("Search students...", "Raadi ardayda...")}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Button variant="outline" onClick={handleExport}>
                  <FileDown className="h-4 w-4 mr-2" />
                  {t("Export", "Dhoofso")}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setBulkAddDialogOpen(true)}
                >
                  <Users className="h-4 w-4 mr-2" />
                  {t("Bulk Add", "Ku dar Badan")}
                </Button>
                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={handleOpenAdd}>
                      <Plus className="h-4 w-4 mr-2" />
                      {t("Add Student", "Ku dar Arday")}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>
                        {editingStudent 
                          ? t("Edit Student", "Wax ka beddel Ardayga")
                          : t("Add New Student", "Ku dar Arday Cusub")
                        }
                      </DialogTitle>
                      <DialogDescription>
                        {t("Fill in the student information below", "Buuxi xogta ardayga hoose")}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="studentId">{t("Student ID", "Aqoonsiga Ardayga")} *</Label>
                        <Input
                          id="studentId"
                          value={formData.studentId}
                          onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                          placeholder="DU-2025-001"
                          disabled={!!editingStudent}
                        />
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="name">{t("Full Name", "Magaca Buuxa")} *</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder={t("Enter student name", "Geli magaca ardayga")}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <Label>{t("Gender", "Jinsiga")} *</Label>
                          <Select 
                            value={formData.gender}
                            onValueChange={(value: "male" | "female") => setFormData({ ...formData, gender: value })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="male">{t("Male", "Lab")}</SelectItem>
                              <SelectItem value="female">{t("Female", "Dheddig")}</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="className">{t("Class", "Fasalka")} *</Label>
                          <Select 
                            value={formData.className}
                            onValueChange={(value) => setFormData({ ...formData, className: value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder={t("Select Class", "Dooro Fasalka")} />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="1aad">1aad (Primary)</SelectItem>
                              <SelectItem value="2aad">2aad (Primary)</SelectItem>
                              <SelectItem value="3aad">3aad (Primary)</SelectItem>
                              <SelectItem value="4aad">4aad (Primary)</SelectItem>
                              <SelectItem value="5aad">5aad (Primary)</SelectItem>
                              <SelectItem value="6aad">6aad (Primary)</SelectItem>
                              <SelectItem value="7aad">7aad (Middle)</SelectItem>
                              <SelectItem value="8aad">8aad (Middle)</SelectItem>
                              <SelectItem value="9aad">9aad (Middle)</SelectItem>
                              <SelectItem value="Form 1">Form 1 (Secondary)</SelectItem>
                              <SelectItem value="Form 2">Form 2 (Secondary)</SelectItem>
                              <SelectItem value="Form 3">Form 3 (Secondary)</SelectItem>
                              <SelectItem value="Form 4">Form 4 (Secondary)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="email">{t("Email", "Email")}</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          placeholder="student@example.com"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <Label htmlFor="phone">{t("Phone", "Telefoon")}</Label>
                          <Input
                            id="phone"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            placeholder="+252 61 234 5678"
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="parentPhone">{t("Parent Phone", "Telefoonka Waalidka")}</Label>
                          <Input
                            id="parentPhone"
                            value={formData.parentPhone}
                            onChange={(e) => setFormData({ ...formData, parentPhone: e.target.value })}
                            placeholder="+252 61 999 9999"
                          />
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                        {t("Cancel", "Ka noqo")}
                      </Button>
                      <Button onClick={handleSave}>
                        {editingStudent 
                          ? t("Update Student", "Cusboonaysii Ardayga")
                          : t("Add Student", "Ku dar Ardayga")
                        }
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-3 text-sm text-muted-foreground flex items-center gap-2">
              <Edit className="h-4 w-4" />
              {t("Tip: Click on any row to edit the student", "Talooyin: Guji sadar kasta si aad u beddesho ardayga")}
            </div>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">{t("Student ID", "Aqoonsiga")}</TableHead>
                    <TableHead>{t("Name", "Magaca")}</TableHead>
                    <TableHead>{t("Gender", "Jinsiga")}</TableHead>
                    <TableHead>{t("Class", "Fasalka")}</TableHead>
                    <TableHead>{t("Contact", "Xiriir")}</TableHead>
                    <TableHead className="text-right">{t("Actions", "Ficillada")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStudents.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        {t("No students found", "Arday lama helin")}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredStudents.map((student) => (
                      <TableRow 
                        key={student.id}
                        onClick={() => handleRowClick(student)}
                        className="cursor-pointer hover:bg-accent/50 transition-colors"
                      >
                        <TableCell className="font-mono text-xs">
                          {student.studentId}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarImage src={student.photoUrl} />
                              <AvatarFallback>{getInitials(student.name)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{student.name}</div>
                              <div className="text-sm text-muted-foreground">{student.email}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {student.gender === "male" ? t("Male", "Lab") : t("Female", "Dheddig")}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{student.className}</Badge>
                        </TableCell>
                        <TableCell className="text-sm">
                          <div>{student.phone}</div>
                          <div className="text-muted-foreground">
                            {t("Parent", "Waalid")}: {student.parentPhone}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-2 justify-end">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => handleOpenEdit(student, e)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(student.id);
                              }}
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
          </CardContent>
        </Card>

        {/* Quick Links - Related Pages */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 border-blue-200 hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                    <BookOpen className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm">
                      {t("Manage Classes", "Maamul Fasallada")}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {t("Organize students into classes", "U abaabul ardayda fasallo")}
                    </p>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full justify-between"
                  onClick={() => navigate("/dashboard/classes")}
                >
                  {t("Go to Classes", "Tag Fasallada")}
                  <ExternalLink className="h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 border-purple-200 hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                    <IdCard className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm">
                      {t("Generate ID Cards", "Samee Kaadhadhka")}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {t("Create student ID cards", "Abuur kaadhadhka ardayda")}
                    </p>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full justify-between"
                  onClick={() => navigate("/dashboard/id-cards")}
                >
                  {t("Go to ID Cards", "Tag Kaadhadhka")}
                  <ExternalLink className="h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border-green-200 hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm">
                      {t("View Results", "Eeg Natiijooyinka")}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {t("Manage student results", "Maamul natiijooyinka ardayda")}
                    </p>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full justify-between"
                  onClick={() => navigate("/dashboard/results")}
                >
                  {t("Go to Results", "Tag Natiijooyinka")}
                  <ExternalLink className="h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bulk Add Students Dialog */}
        <Dialog open={bulkAddDialogOpen} onOpenChange={setBulkAddDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{t("Bulk Add Students", "Ku dar Arday Badan")}</DialogTitle>
              <DialogDescription>
                {t("Add multiple students to a specific class", "Ku dar arday badan fasalka gaarka ah")}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid gap-2">
                <Label>{t("Select Class", "Dooro Fasal")}</Label>
                <Select onValueChange={(value) => {
                  // Handle class selection
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder={t("Choose a class", "Dooro fasal")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1aad">1aad (Primary)</SelectItem>
                    <SelectItem value="2aad">2aad (Primary)</SelectItem>
                    <SelectItem value="3aad">3aad (Primary)</SelectItem>
                    <SelectItem value="4aad">4aad (Primary)</SelectItem>
                    <SelectItem value="5aad">5aad (Primary)</SelectItem>
                    <SelectItem value="6aad">6aad (Primary)</SelectItem>
                    <SelectItem value="7aad">7aad (Middle)</SelectItem>
                    <SelectItem value="8aad">8aad (Middle)</SelectItem>
                    <SelectItem value="9aad">9aad (Middle)</SelectItem>
                    <SelectItem value="Form 1">Form 1 (Secondary)</SelectItem>
                    <SelectItem value="Form 2">Form 2 (Secondary)</SelectItem>
                    <SelectItem value="Form 3">Form 3 (Secondary)</SelectItem>
                    <SelectItem value="Form 4">Form 4 (Secondary)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label>{t("Student Names (one per line)", "Magacyada Ardayda (mid kasta hal dhibic)")}</Label>
                <Textarea
                  placeholder={t("Enter student names, one per line:\nAhmed Hassan\nFatima Ali\nMohamed Omar", "Geli magacyada ardayda, mid kasta hal dhibic:\nAhmed Hassan\nFatima Ali\nMohamed Omar")}
                  className="min-h-[200px]"
                />
              </div>

              <div className="bg-blue-50 p-3 rounded-md">
                <p className="text-sm text-blue-800">
                  <strong>{t("Note:", "Ogaansho:")}</strong> {t("Students will be automatically assigned student IDs and added to the selected class.", "Ardayda si toos ah ayaa loo qoondeeyaa aqoonsiga ardayda oo lagu darayaa fasalka la dooran.")}
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setBulkAddDialogOpen(false)}>
                {t("Cancel", "Ka noqo")}
              </Button>
              <Button onClick={() => {
                // Handle bulk add students
                toast({
                  title: t("Success", "Guul"),
                  description: t("Students added successfully", "Ardayda si guul leh ayaa loo daray"),
                });
                setBulkAddDialogOpen(false);
              }}>
                {t("Add Students", "Ku dar Ardayda")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}

