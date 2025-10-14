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
import { Search, Plus, Edit, Trash2, FileDown, ArrowLeft, Mail, Phone, BookOpen, FileEdit, ExternalLink } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

export default function Teachers() {
  const { language, selectedAcademicYear } = useApp();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<any>(null);
  
  const t = (en: string, so: string) => (language === "en" ? en : so);
  
  // Form state
  const [formData, setFormData] = useState({
    employeeId: "",
    name: "",
    email: "",
    phone: "",
    username: "",
    password: "",
    subjects: [] as string[],
    classes: [] as string[]
  });

  // Mock data
  const [teachers, setTeachers] = useState([
    {
      id: "1",
      employeeId: "TC-2024-001",
      name: "Ahmed Hassan Mohamed",
      email: "ahmed.hassan@darulumah.edu",
      phone: "+252 61 234 5678",
      username: "ahmed.hassan",
      subjects: ["Mathematics", "Algebra"],
      classes: ["Grade 8A", "Grade 8B", "Grade 9A"],
      isActive: true,
      photoUrl: ""
    },
    {
      id: "2",
      employeeId: "TC-2024-002",
      name: "Fatima Omar Ali",
      email: "fatima.omar@darulumah.edu",
      phone: "+252 61 234 5679",
      username: "fatima.omar",
      subjects: ["English", "Literature"],
      classes: ["Grade 7A", "Grade 7B"],
      isActive: true,
      photoUrl: ""
    },
  ]);

  const filteredTeachers = teachers.filter(t => 
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.employeeId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const generateEmployeeId = () => {
    const year = new Date().getFullYear();
    const nextNumber = teachers.length + 1;
    return `TC-${year}-${String(nextNumber).padStart(3, '0')}`;
  };

  const handleOpenAdd = () => {
    setFormData({
      employeeId: generateEmployeeId(),
      name: "",
      email: "",
      phone: "",
      username: "",
      password: "teacher123",
      subjects: [],
      classes: []
    });
    setEditingTeacher(null);
    setIsAddDialogOpen(true);
  };

  const handleOpenEdit = (teacher: any) => {
    setFormData({
      ...teacher,
      password: ""
    });
    setEditingTeacher(teacher);
    setIsAddDialogOpen(true);
  };

  const handleSave = () => {
    if (!formData.name || !formData.email || !formData.username) {
      toast({
        title: t("Error", "Qalad"),
        description: t("Please fill in required fields", "Fadlan buuxi goobaha loo baahan yahay"),
        variant: "destructive",
      });
      return;
    }

    if (editingTeacher) {
      setTeachers(teachers.map(t => 
        t.id === editingTeacher.id ? { ...formData, id: t.id, isActive: t.isActive, photoUrl: t.photoUrl } : t
      ));
      toast({
        title: t("Success", "Guul"),
        description: t("Teacher updated successfully", "Macallinka waa la cusbooneysiiyay si guul leh"),
      });
    } else {
      setTeachers([...teachers, { 
        ...formData, 
        id: Date.now().toString(),
        isActive: true,
        photoUrl: ""
      }]);
      toast({
        title: t("Success", "Guul"),
        description: t("Teacher added successfully", "Macallinka waa lagu daray si guul leh"),
      });
    }

    setIsAddDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm(t("Are you sure you want to delete this teacher?", "Ma hubtaa inaad tirtirto macallinkan?"))) {
      setTeachers(teachers.filter(t => t.id !== id));
      toast({
        title: t("Deleted", "La tirtiray"),
        description: t("Teacher deleted successfully", "Macallinka waa la tirtiray si guul leh"),
      });
    }
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
                {t("Teachers Management", "Maamulka Macallimiinta")} 👨‍🏫
              </h2>
              <Badge variant="outline" className="text-sm">
                {selectedAcademicYear}
              </Badge>
            </div>
            <p className="text-muted-foreground mt-1">
              {t("Add, edit, and manage teacher accounts", "Ku dar, wax ka beddel, oo maamul akoonada macallimiinta")}
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {t("Total Teachers", "Wadarta Macallimiinta")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{teachers.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {t("Active", "Firfircoon")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {teachers.filter(t => t.isActive).length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {t("Total Classes", "Wadarta Fasallada")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {teachers.reduce((sum, t) => sum + t.classes.length, 0)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Teacher List */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <CardTitle>{t("Teacher List", "Liiska Macallimiinta")}</CardTitle>
              <div className="flex gap-2 flex-wrap">
                <div className="relative flex-1 sm:w-[300px]">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder={t("Search teachers...", "Raadi macallimiin...")}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={handleOpenAdd}>
                      <Plus className="h-4 w-4 mr-2" />
                      {t("Add Teacher", "Ku dar Macallin")}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>
                        {editingTeacher 
                          ? t("Edit Teacher", "Wax ka beddel Macallinka")
                          : t("Add New Teacher", "Ku dar Macallin Cusub")
                        }
                      </DialogTitle>
                      <DialogDescription>
                        {t("Fill in the teacher information below", "Buuxi xogta macallinka hoose")}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="employeeId">{t("Employee ID", "Aqoonsiga Shaqaalaha")} *</Label>
                        <Input
                          id="employeeId"
                          value={formData.employeeId}
                          onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                          placeholder="TC-2024-001"
                          disabled={!!editingTeacher}
                        />
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="name">{t("Full Name", "Magaca Buuxa")} *</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder={t("Enter teacher name", "Geli magaca macallinka")}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <Label htmlFor="email">{t("Email", "Email")} *</Label>
                          <Input
                            id="email"
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            placeholder="teacher@darulumah.edu"
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="phone">{t("Phone", "Telefoon")}</Label>
                          <Input
                            id="phone"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            placeholder="+252 61 234 5678"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <Label htmlFor="username">{t("Username", "Magaca isticmaale")} *</Label>
                          <Input
                            id="username"
                            value={formData.username}
                            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                            placeholder="username"
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="password">
                            {editingTeacher 
                              ? t("New Password (leave blank to keep)", "Furaha Cusub (ka tag maran si aad u ilaaliso)")
                              : t("Password", "Furaha sirta") + " *"
                            }
                          </Label>
                          <Input
                            id="password"
                            type="password"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            placeholder={editingTeacher ? t("Leave blank", "Ka tag maran") : "teacher123"}
                          />
                        </div>
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="subjects">{t("Subjects (comma-separated)", "Maadooyinka (kala saar xariqaad)")}</Label>
                        <Input
                          id="subjects"
                          value={formData.subjects.join(", ")}
                          onChange={(e) => setFormData({ 
                            ...formData, 
                            subjects: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                          })}
                          placeholder={t("Mathematics, Physics, Chemistry", "Xisaabta, Fiisikiska, Kiimistriyaha")}
                        />
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="classes">{t("Assigned Classes (comma-separated)", "Fasallada la qoondeeyay (kala saar xariqaad)")}</Label>
                        <Input
                          id="classes"
                          value={formData.classes.join(", ")}
                          onChange={(e) => setFormData({ 
                            ...formData, 
                            classes: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                          })}
                          placeholder="Grade 8A, Grade 8B, Grade 9A"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                        {t("Cancel", "Ka noqo")}
                      </Button>
                      <Button onClick={handleSave}>
                        {editingTeacher 
                          ? t("Update Teacher", "Cusboonaysii Macallinka")
                          : t("Add Teacher", "Ku dar Macallin")
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
                    <TableHead className="w-[100px]">{t("Employee ID", "Aqoonsiga")}</TableHead>
                    <TableHead>{t("Name", "Magaca")}</TableHead>
                    <TableHead>{t("Subjects", "Maadooyinka")}</TableHead>
                    <TableHead>{t("Classes", "Fasallada")}</TableHead>
                    <TableHead>{t("Status", "Xaalada")}</TableHead>
                    <TableHead className="text-right">{t("Actions", "Ficillada")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTeachers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        {t("No teachers found", "Macallimiin lama helin")}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredTeachers.map((teacher) => (
                      <TableRow key={teacher.id}>
                        <TableCell className="font-mono text-xs">
                          {teacher.employeeId}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarImage src={teacher.photoUrl} />
                              <AvatarFallback>
                                {teacher.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{teacher.name}</div>
                              <div className="text-sm text-muted-foreground flex items-center gap-1">
                                <Mail className="h-3 w-3" />
                                {teacher.email}
                              </div>
                              <div className="text-sm text-muted-foreground flex items-center gap-1">
                                <Phone className="h-3 w-3" />
                                {teacher.phone}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {teacher.subjects.map((subject, idx) => (
                              <Badge key={idx} variant="secondary" className="text-xs">
                                {subject}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {teacher.classes.length} {t("classes", "fasallo")}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={teacher.isActive ? "default" : "secondary"}>
                            {teacher.isActive ? t("Active", "Firfircoon") : t("Inactive", "Ma firfircoon")}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-2 justify-end">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenEdit(teacher)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(teacher.id)}
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
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border-blue-200 hover:shadow-md transition-shadow">
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
                      {t("Assign teachers to classes", "U qoondeey macallimiinta fasallada")}
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

          <Card className="bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-950/30 dark:to-violet-950/30 border-purple-200 hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                    <FileEdit className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm">
                      {t("Manage Subjects", "Maamul Maadooyinka")}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {t("Assign subjects to teachers", "U qoondeey maadooyinka macallimiinta")}
                    </p>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full justify-between"
                  onClick={() => navigate("/dashboard/subjects")}
                >
                  {t("Go to Subjects", "Tag Maadooyinka")}
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

