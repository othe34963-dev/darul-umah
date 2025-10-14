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
import { BookOpen, Plus, Edit, Trash2, ArrowLeft, GraduationCap, TrendingUp, ExternalLink } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

interface Subject {
  id: string;
  name: string;
  nameInSomali: string;
  code: string;
  category: string;
  description: string;
  grades: string[];
  color: string;
}

export default function Subjects() {
  const { language, selectedAcademicYear } = useApp();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  
  const t = (en: string, so: string) => (language === "en" ? en : so);
  
  // Form state
  const [formData, setFormData] = useState({
    name: "",
    nameInSomali: "",
    code: "",
    category: "Core",
    description: "",
    grades: [] as string[],
    color: "blue"
  });

  const categories = [
    { value: "Core", label: t("Core Subjects", "Maadooyinka Aasaasiga ah") },
    { value: "Science", label: t("Sciences", "Sayniska") },
    { value: "Language", label: t("Languages", "Luqadaha") },
    { value: "Islamic", label: t("Islamic Studies", "Waxbarashada Diinta") },
    { value: "Arts", label: t("Arts & Sports", "Farshaxanka & Ciyaaraha") },
    { value: "Other", label: t("Other", "Kale") },
  ];

  const colors = [
    { value: "blue", label: t("Blue", "Buluug"), class: "bg-blue-500" },
    { value: "green", label: t("Green", "Cagaar"), class: "bg-green-500" },
    { value: "purple", label: t("Purple", "Guduud-buluug"), class: "bg-purple-500" },
    { value: "yellow", label: t("Yellow", "Jaalle"), class: "bg-yellow-500" },
    { value: "red", label: t("Red", "Guduud"), class: "bg-red-500" },
    { value: "orange", label: t("Orange", "Liin"), class: "bg-orange-500" },
    { value: "pink", label: t("Pink", "Casaan"), class: "bg-pink-500" },
    { value: "gray", label: t("Gray", "Cawlan"), class: "bg-gray-500" },
  ];

  const grades = ["7", "8", "9", "10", "11", "12"];

  // Load subjects from localStorage
  const [subjects, setSubjects] = useState<Subject[]>(() => {
    try {
      const saved = localStorage.getItem("du_subjects_store_json");
      if (saved) return JSON.parse(saved);
    } catch {}
    
    // Default subjects
    return [
      {
        id: "1",
        name: "Mathematics",
        nameInSomali: "Xisaabta",
        code: "MATH",
        category: "Core",
        description: "Core mathematics curriculum",
        grades: ["7", "8", "9", "10", "11", "12"],
        color: "blue"
      },
      {
        id: "2",
        name: "English",
        nameInSomali: "Ingiriisi",
        code: "ENG",
        category: "Language",
        description: "English language and literature",
        grades: ["7", "8", "9", "10", "11", "12"],
        color: "green"
      },
      {
        id: "3",
        name: "Somali",
        nameInSomali: "Soomaali",
        code: "SOM",
        category: "Language",
        description: "Somali language and literature",
        grades: ["7", "8", "9", "10", "11", "12"],
        color: "green"
      },
      {
        id: "4",
        name: "Physics",
        nameInSomali: "Fiisikis",
        code: "PHY",
        category: "Science",
        description: "Physical sciences",
        grades: ["9", "10", "11", "12"],
        color: "purple"
      },
      {
        id: "5",
        name: "Chemistry",
        nameInSomali: "Kiimiyo",
        code: "CHEM",
        category: "Science",
        description: "Chemical sciences",
        grades: ["9", "10", "11", "12"],
        color: "purple"
      },
      {
        id: "6",
        name: "Biology",
        nameInSomali: "Bayoolaji",
        code: "BIO",
        category: "Science",
        description: "Biological sciences",
        grades: ["9", "10", "11", "12"],
        color: "purple"
      },
      {
        id: "7",
        name: "Islamic Studies",
        nameInSomali: "Cilmiga Diinta",
        code: "ISL",
        category: "Islamic",
        description: "Islamic education",
        grades: ["7", "8", "9", "10", "11", "12"],
        color: "yellow"
      },
      {
        id: "8",
        name: "Arabic",
        nameInSomali: "Carabi",
        code: "ARB",
        category: "Language",
        description: "Arabic language",
        grades: ["7", "8", "9", "10", "11", "12"],
        color: "yellow"
      },
      {
        id: "9",
        name: "History",
        nameInSomali: "Taariikh",
        code: "HIST",
        category: "Core",
        description: "World and Somali history",
        grades: ["7", "8", "9", "10", "11", "12"],
        color: "orange"
      },
      {
        id: "10",
        name: "Geography",
        nameInSomali: "Juqraafi",
        code: "GEO",
        category: "Core",
        description: "Physical and human geography",
        grades: ["7", "8", "9", "10"],
        color: "orange"
      },
      {
        id: "11",
        name: "Computer Science",
        nameInSomali: "Sayniska Kombiyuutarka",
        code: "CS",
        category: "Core",
        description: "Computer skills and programming",
        grades: ["8", "9", "10", "11", "12"],
        color: "gray"
      },
      {
        id: "12",
        name: "Physical Education",
        nameInSomali: "Ciyaaraha Jirka",
        code: "PE",
        category: "Arts",
        description: "Sports and physical fitness",
        grades: ["7", "8", "9", "10", "11", "12"],
        color: "pink"
      },
    ];
  });

  // Auto-save
  useEffect(() => {
    localStorage.setItem("du_subjects_store_json", JSON.stringify(subjects));
  }, [subjects]);

  const filteredSubjects = subjects.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.nameInSomali.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOpenAdd = () => {
    setFormData({
      name: "",
      nameInSomali: "",
      code: "",
      category: "Core",
      description: "",
      grades: [],
      color: "blue"
    });
    setEditingSubject(null);
    setIsAddDialogOpen(true);
  };

  const handleOpenEdit = (subject: Subject) => {
    setFormData({
      name: subject.name,
      nameInSomali: subject.nameInSomali,
      code: subject.code,
      category: subject.category,
      description: subject.description,
      grades: subject.grades,
      color: subject.color
    });
    setEditingSubject(subject);
    setIsAddDialogOpen(true);
  };

  const handleSave = () => {
    if (!formData.name || !formData.code) {
      toast({
        title: t("Error", "Qalad"),
        description: t("Please fill in required fields", "Fadlan buuxi goobaha loo baahan yahay"),
        variant: "destructive",
      });
      return;
    }

    if (editingSubject) {
      // Update
      setSubjects(subjects.map(s => 
        s.id === editingSubject.id ? { ...formData, id: s.id } : s
      ));
      toast({
        title: t("Success", "Guul"),
        description: t("Subject updated successfully", "Maadda waa la cusbooneysiiyay si guul leh"),
      });
    } else {
      // Add new
      setSubjects([...subjects, { ...formData, id: Date.now().toString() }]);
      toast({
        title: t("Success", "Guul"),
        description: t("Subject added successfully", "Maadda waa lagu daray si guul leh"),
      });
    }

    setIsAddDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm(t("Are you sure you want to delete this subject?", "Ma hubtaa inaad tirtirto maaddan?"))) {
      setSubjects(subjects.filter(s => s.id !== id));
      toast({
        title: t("Deleted", "La tirtiray"),
        description: t("Subject deleted successfully", "Maadda waa la tirtiray si guul leh"),
      });
    }
  };

  const getColorClass = (color: string) => {
    const colorMap: Record<string, string> = {
      blue: "bg-blue-500",
      green: "bg-green-500",
      purple: "bg-purple-500",
      yellow: "bg-yellow-500",
      red: "bg-red-500",
      orange: "bg-orange-500",
      pink: "bg-pink-500",
      gray: "bg-gray-500"
    };
    return colorMap[color] || "bg-gray-500";
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
                {t("Subjects Management", "Maamulka Maadooyinka")} 📖
              </h2>
            </div>
            <p className="text-muted-foreground mt-1">
              {t("Create and manage subjects taught in the school", "Abuur oo maamul maadooyinka lagu barto dugsiga")}
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {t("Total Subjects", "Wadarta Maadooyinka")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{subjects.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {t("Core Subjects", "Maadooyinka Aasaasiga")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {subjects.filter(s => s.category === "Core").length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {t("Sciences", "Sayniska")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {subjects.filter(s => s.category === "Science").length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {t("Languages", "Luqadaha")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {subjects.filter(s => s.category === "Language").length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Subjects List */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <CardTitle>{t("Subjects List", "Liiska Maadooyinka")}</CardTitle>
              <div className="flex gap-2 flex-wrap">
                <div className="relative flex-1 sm:w-[300px]">
                  <Input
                    placeholder={t("Search subjects...", "Raadi maadooyin...")}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={handleOpenAdd}>
                      <Plus className="h-4 w-4 mr-2" />
                      {t("Add Subject", "Ku dar Maaddo")}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>
                        {editingSubject 
                          ? t("Edit Subject", "Wax ka beddel Maadda")
                          : t("Add New Subject", "Ku dar Maaddo Cusub")
                        }
                      </DialogTitle>
                      <DialogDescription>
                        {t("Fill in the subject information below", "Buuxi xogta maadda hoose")}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <Label htmlFor="name">{t("Subject Name (English)", "Magaca Maadda (Ingiriisi)")} *</Label>
                          <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="Mathematics"
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="nameInSomali">{t("Subject Name (Somali)", "Magaca Maadda (Soomaali)")}</Label>
                          <Input
                            id="nameInSomali"
                            value={formData.nameInSomali}
                            onChange={(e) => setFormData({ ...formData, nameInSomali: e.target.value })}
                            placeholder="Xisaabta"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <Label htmlFor="code">{t("Subject Code", "Koodhka Maadda")} *</Label>
                          <Input
                            id="code"
                            value={formData.code}
                            onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                            placeholder="MATH"
                            maxLength={10}
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label>{t("Category", "Qaybta")}</Label>
                          <Select 
                            value={formData.category}
                            onValueChange={(value) => setFormData({ ...formData, category: value })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {categories.map((cat) => (
                                <SelectItem key={cat.value} value={cat.value}>
                                  {cat.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="description">{t("Description", "Sharaxaad")}</Label>
                        <Input
                          id="description"
                          value={formData.description}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          placeholder={t("Brief description", "Sharaxaad kooban")}
                        />
                      </div>

                      <div className="grid gap-2">
                        <Label>{t("Grades/Levels", "Fasallada/Heellada")}</Label>
                        <div className="flex flex-wrap gap-2 p-3 border rounded-md">
                          {grades.map((grade) => (
                            <Badge
                              key={grade}
                              variant={formData.grades.includes(grade) ? "default" : "outline"}
                              className="cursor-pointer"
                              onClick={() => {
                                setFormData({
                                  ...formData,
                                  grades: formData.grades.includes(grade)
                                    ? formData.grades.filter(g => g !== grade)
                                    : [...formData.grades, grade]
                                });
                              }}
                            >
                              {t("Grade", "Fasal")} {grade}
                            </Badge>
                          ))}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {t("Click grades to select/deselect", "Guji fasallada si aad u doorato/ka saarto")}
                        </p>
                      </div>

                      <div className="grid gap-2">
                        <Label>{t("Color (for timetable)", "Midabka (jadwalka)")}</Label>
                        <div className="flex flex-wrap gap-2">
                          {colors.map((color) => (
                            <button
                              key={color.value}
                              type="button"
                              title={color.label}
                              aria-label={color.label}
                              className={`h-10 w-10 rounded-md border-2 ${
                                formData.color === color.value ? 'border-black dark:border-white' : 'border-gray-300'
                              } ${color.class}`}
                              onClick={() => setFormData({ ...formData, color: color.value })}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                        {t("Cancel", "Ka noqo")}
                      </Button>
                      <Button onClick={handleSave}>
                        {editingSubject 
                          ? t("Update Subject", "Cusboonaysii Maadda")
                          : t("Add Subject", "Ku dar Maadda")
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
                    <TableHead className="w-[50px]"></TableHead>
                    <TableHead className="w-[80px]">{t("Code", "Koodh")}</TableHead>
                    <TableHead>{t("Subject Name", "Magaca Maadda")}</TableHead>
                    <TableHead>{t("Category", "Qaybta")}</TableHead>
                    <TableHead>{t("Grades", "Fasallada")}</TableHead>
                    <TableHead className="text-right">{t("Actions", "Ficillada")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSubjects.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-12">
                        <div className="flex flex-col items-center gap-3">
                          <div className="text-5xl">📖</div>
                          <div>
                            <p className="font-medium text-lg">
                              {t("No subjects found", "Maadooyin lama helin")}
                            </p>
                            <p className="text-sm text-muted-foreground mt-1">
                              {t("Add subjects to organize your curriculum", "Ku dar maadooyin si aad u abaabusho manhajkaaga")}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredSubjects.map((subject) => (
                      <TableRow key={subject.id}>
                        <TableCell>
                          <div className={`h-8 w-8 rounded-md ${getColorClass(subject.color)}`} />
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="font-mono">
                            {subject.code}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{subject.name}</div>
                            <div className="text-sm text-muted-foreground">{subject.nameInSomali}</div>
                            {subject.description && (
                              <div className="text-xs text-muted-foreground mt-1">{subject.description}</div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            {categories.find(c => c.value === subject.category)?.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {subject.grades.slice(0, 4).map((grade, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {grade}
                              </Badge>
                            ))}
                            {subject.grades.length > 4 && (
                              <Badge variant="outline" className="text-xs">
                                +{subject.grades.length - 4}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-2 justify-end">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenEdit(subject)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(subject.id)}
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
                💡 {t("Tip: Subjects are shared across all academic years. Define them once and use in multiple classes.", "Talo: Maadooyinka waxaa la wadaagaa dhammaan sannadaha dugsiga. Qeex hal mar oo isticmaal fasallo badan.")}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Quick Links - Related Pages */}
        <div className="grid gap-4 md:grid-cols-2">
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
                      {t("Assign subjects to classes", "U qoondeey maadooyinka fasallada")}
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

          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border-green-200 hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm">
                      {t("Student Results", "Natiijooyinka Ardayda")}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {t("Add results using these subjects", "Ku dar natiijooyinka adoo isticmaalaya maadooyinkan")}
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
      </div>
    </DashboardLayout>
  );
}

