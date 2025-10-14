import DashboardLayout from "@/components/layout/DashboardLayout";
import { useApp } from "@/context/AppContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, FileText, Plus, Search, Filter, SortAsc, SortDesc, Edit, Trash2, Mail, Download, Upload, Calculator, CheckCircle, XCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useMemo } from "react";

interface SubjectMark {
  subject: string;
  mark: number;
}

interface StudentResult {
  id: string;
  name: string;
  className: string;
  academicYear: string;
  term: string;
  subjects: SubjectMark[];
  average: number;
  grade: string;
  passFail: boolean;
  parentEmail?: string;
}

export default function ResultsPage() {
  console.log("Results page is loading...");
  const { language } = useApp();
  const navigate = useNavigate();

  const t = (en: string, so: string) => (language === "en" ? en : so);

  // State management
  const [results, setResults] = useState<StudentResult[]>([
    // Sample students with Somali school classes (Grade 8A, 8B, 9A classes removed as requested)
    {
      id: "DU-2025-003",
      name: "Hassan Ahmed",
      className: "Form 1",
      academicYear: "2024-2025",
      term: "Final Exam",
      subjects: [
        { subject: "Mathematics", mark: 75 },
        { subject: "English", mark: 78 },
        { subject: "Somali", mark: 82 },
        { subject: "Physics", mark: 73 },
        { subject: "Chemistry", mark: 80 },
      ],
      average: 78,
      grade: "C+",
      passFail: true,
      parentEmail: "hassan.parent@email.com"
    },
    {
      id: "DU-2025-004",
      name: "Khadija Yusuf",
      className: "Form 1",
      academicYear: "2024-2025",
      term: "Final Exam",
      subjects: [
        { subject: "Mathematics", mark: 95 },
        { subject: "English", mark: 89 },
        { subject: "Somali", mark: 91 },
        { subject: "Biology", mark: 93 },
        { subject: "Geography", mark: 88 },
      ],
      average: 91,
      grade: "A-",
      passFail: true,
      parentEmail: "khadija.parent@email.com"
    },
    {
      id: "DU-2025-005",
      name: "Mohamed Hassan",
      className: "5aad",
      academicYear: "2024-2025",
      term: "Final Exam",
      subjects: [
        { subject: "Mathematics", mark: 85 },
        { subject: "English", mark: 78 },
        { subject: "Somali", mark: 92 },
        { subject: "Science", mark: 88 },
        { subject: "History", mark: 82 },
      ],
      average: 85,
      grade: "B+",
      passFail: true,
      parentEmail: "mohamed.parent@email.com"
    },
    {
      id: "DU-2025-007",
      name: "Omar Yusuf",
      className: "Form 2",
      academicYear: "2024-2025",
      term: "Final Exam",
      subjects: [
        { subject: "Mathematics", mark: 76 },
        { subject: "English", mark: 82 },
        { subject: "Somali", mark: 85 },
        { subject: "Physics", mark: 79 },
        { subject: "Chemistry", mark: 81 },
      ],
      average: 81,
      grade: "B-",
      passFail: true,
      parentEmail: "omar.parent@email.com"
    },
    {
      id: "DU-2025-008",
      name: "Hawa Mohamed",
      className: "3aad",
      academicYear: "2024-2025",
      term: "Final Exam",
      subjects: [
        { subject: "Mathematics", mark: 88 },
        { subject: "English", mark: 84 },
        { subject: "Somali", mark: 90 },
        { subject: "Science", mark: 86 },
        { subject: "Social Studies", mark: 89 },
      ],
      average: 87,
      grade: "B+",
      passFail: true,
      parentEmail: "hawa.parent@email.com"
    }
  ]);

  // Filter and search state
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClass, setSelectedClass] = useState("all");
  const [selectedYear, setSelectedYear] = useState("all");
  const [selectedTerm, setSelectedTerm] = useState("all");
  const [sortBy, setSortBy] = useState<"name" | "average" | "grade" | "class">("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  // Dialog states
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isBulkAddDialogOpen, setIsBulkAddDialogOpen] = useState(false);
  const [editingResult, setEditingResult] = useState<StudentResult | null>(null);

  // New result form state
  const [newResult, setNewResult] = useState({
    name: "",
    className: "",
    academicYear: "2024-2025",
    term: "",
    parentEmail: "",
    subjects: [{ subject: "", mark: 0 }]
  });

  // Bulk add state
  const [bulkStudents, setBulkStudents] = useState<Partial<StudentResult>[]>([]);
  const [bulkFormData, setBulkFormData] = useState({
    className: "",
    academicYear: "2024-2025",
    term: "",
    commonSubjects: ["Mathematics", "English", "Somali", "Science"]
  });

  // Grade calculation settings
  const [gradeSettings, setGradeSettings] = useState({
    passMark: 50,
    gradeScale: {
      "A+": 95,
      "A": 90,
      "A-": 85,
      "B+": 80,
      "B": 75,
      "B-": 70,
      "C+": 65,
      "C": 60,
      "D+": 55,
      "D": 50,
      "F": 0
    }
  });

  // Filter and sort results
  const filteredAndSortedResults = useMemo(() => {
    let filtered = results.filter(result => {
      const matchesSearch = result.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           result.id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesClass = selectedClass === "all" || result.className === selectedClass;
      const matchesYear = selectedYear === "all" || result.academicYear === selectedYear;
      const matchesTerm = selectedTerm === "all" || result.term === selectedTerm;

      return matchesSearch && matchesClass && matchesYear && matchesTerm;
    });

    // Sort results
    filtered.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case "name":
          comparison = a.name.localeCompare(b.name);
          break;
        case "average":
          comparison = a.average - b.average;
          break;
        case "grade":
          comparison = a.grade.localeCompare(b.grade);
          break;
        case "class":
          comparison = a.className.localeCompare(b.className);
          break;
      }
      return sortOrder === "asc" ? comparison : -comparison;
    });

    return filtered;
  }, [results, searchTerm, selectedClass, selectedYear, selectedTerm, sortBy, sortOrder]);

  // Calculate grade based on average
  const calculateGrade = (average: number): string => {
    const { gradeScale } = gradeSettings;
    for (const [grade, minScore] of Object.entries(gradeScale)) {
      if (average >= minScore) return grade;
    }
    return "F";
  };

  // Calculate pass/fail
  const calculatePassFail = (average: number): boolean => {
    return average >= gradeSettings.passMark;
  };

  // Add new result
  const handleAddResult = () => {
    if (!newResult.name || !newResult.className || !newResult.term) {
      alert(t("Please fill in all required fields", "Fadlan buuxi dhammaan goobaha loo baahan yahay"));
      return;
    }

    const average = newResult.subjects.reduce((sum, sub) => sum + sub.mark, 0) / newResult.subjects.length;
    const grade = calculateGrade(average);
    const passFail = calculatePassFail(average);

    const result: StudentResult = {
      id: `DU-${new Date().getFullYear()}-${String(results.length + 1).padStart(3, '0')}`,
      ...newResult,
      average: Math.round(average),
      grade,
      passFail
    };

    setResults([...results, result]);
    setNewResult({
      name: "",
      className: "",
      academicYear: "2024-2025",
      term: "",
      parentEmail: "",
      subjects: [{ subject: "", mark: 0 }]
    });
    setIsAddDialogOpen(false);
  };

  // Edit result
  const handleEditResult = () => {
    if (!editingResult) return;

    const updatedResults = results.map(r => 
      r.id === editingResult.id ? editingResult : r
    );
    setResults(updatedResults);
    setIsEditDialogOpen(false);
    setEditingResult(null);
  };

  // Delete result
  const handleDeleteResult = (id: string) => {
    if (confirm(t("Are you sure you want to delete this result?", "Ma hubtaa inaad tirtirto natiijadan?"))) {
      setResults(results.filter(r => r.id !== id));
    }
  };

  // Add subject to new result
  const addSubject = () => {
    setNewResult({
      ...newResult,
      subjects: [...newResult.subjects, { subject: "", mark: 0 }]
    });
  };

  // Update subject in new result
  const updateSubject = (index: number, field: keyof SubjectMark, value: string | number) => {
    const updatedSubjects = [...newResult.subjects];
    updatedSubjects[index] = { ...updatedSubjects[index], [field]: value };
    setNewResult({ ...newResult, subjects: updatedSubjects });
  };

  // Remove subject from new result
  const removeSubject = (index: number) => {
    if (newResult.subjects.length > 1) {
      setNewResult({
        ...newResult,
        subjects: newResult.subjects.filter((_, i) => i !== index)
      });
    }
  };

  // Bulk add functions
  const handleBulkAddStudents = () => {
    if (bulkStudents.length === 0) {
      alert(t("Please add at least one student", "Fadlan ku dar ugu yaraan hal arday"));
      return;
    }

    const newResults: StudentResult[] = bulkStudents.map((student, index) => {
      const average = student.subjects?.reduce((sum, sub) => sum + sub.mark, 0) / student.subjects?.length || 0;
      const grade = calculateGrade(average);
      const passFail = calculatePassFail(average);

      return {
        id: `DU-${new Date().getFullYear()}-${String(results.length + index + 1).padStart(3, '0')}`,
        name: student.name || "",
        className: student.className || bulkFormData.className,
        academicYear: student.academicYear || bulkFormData.academicYear,
        term: student.term || bulkFormData.term,
        subjects: student.subjects || [],
        average: Math.round(average),
        grade,
        passFail,
        parentEmail: student.parentEmail || ""
      };
    });

    setResults([...results, ...newResults]);
    setBulkStudents([]);
    setIsBulkAddDialogOpen(false);
    alert(t(`${newResults.length} students added successfully!`, `${newResults.length} arday ayaa si guul leh loogu daray!`));
  };

  const addBulkStudent = () => {
    const newStudent: Partial<StudentResult> = {
      name: "",
      className: bulkFormData.className,
      academicYear: bulkFormData.academicYear,
      term: bulkFormData.term,
      subjects: bulkFormData.commonSubjects.map(subject => ({ subject, mark: 0 })),
      parentEmail: ""
    };
    setBulkStudents([...bulkStudents, newStudent]);
  };

  const updateBulkStudent = (index: number, field: keyof StudentResult, value: any) => {
    const updatedStudents = [...bulkStudents];
    updatedStudents[index] = { ...updatedStudents[index], [field]: value };
    setBulkStudents(updatedStudents);
  };

  const updateBulkStudentSubject = (studentIndex: number, subjectIndex: number, field: keyof SubjectMark, value: string | number) => {
    const updatedStudents = [...bulkStudents];
    if (updatedStudents[studentIndex].subjects) {
      const updatedSubjects = [...updatedStudents[studentIndex].subjects!];
      updatedSubjects[subjectIndex] = { ...updatedSubjects[subjectIndex], [field]: value };
      updatedStudents[studentIndex] = { ...updatedStudents[studentIndex], subjects: updatedSubjects };
      setBulkStudents(updatedStudents);
    }
  };

  const removeBulkStudent = (index: number) => {
    setBulkStudents(bulkStudents.filter((_, i) => i !== index));
  };

  // Email results to parents
  const handleEmailResults = () => {
    alert(t("Email functionality would be implemented here", "Habka email-ka waa la hirgelin doonaa halkan"));
  };

  // Export results
  const handleExportResults = () => {
    const csvContent = [
      ["Student ID", "Name", "Class", "Academic Year", "Term", "Average", "Grade", "Pass/Fail", "Parent Email"],
      ...filteredAndSortedResults.map(result => [
        result.id,
        result.name,
        result.className,
        result.academicYear,
        result.term,
        result.average,
        result.grade,
        result.passFail ? "Pass" : "Fail",
        result.parentEmail || ""
      ])
    ].map(row => row.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "student-results.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Import results (simplified)
  const handleImportResults = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".csv";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        alert(t("Import functionality would be implemented here", "Habka soo gelinta waa la hirgelin doonaa halkan"));
      }
    };
    input.click();
  };

  const getGradeColor = (grade: string) => {
    if (grade.includes("A")) return "bg-green-100 text-green-800";
    if (grade.includes("B")) return "bg-blue-100 text-blue-800";
    if (grade.includes("C")) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  const getMarkColor = (mark: number) => {
    if (mark >= 90) return "text-green-600 font-semibold";
    if (mark >= 80) return "text-blue-600 font-semibold";
    if (mark >= 70) return "text-yellow-600 font-semibold";
    return "text-red-600 font-semibold";
  };

  const uniqueClasses = Array.from(new Set(results.map(r => r.className)));
  const uniqueYears = Array.from(new Set(results.map(r => r.academicYear)));
  const uniqueTerms = Array.from(new Set(results.map(r => r.term)));

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
            <h2 className="text-3xl font-bold tracking-tight">
              {t("Results Management", "Maamulka Natiijooyinka")} 📊
            </h2>
            <p className="text-muted-foreground mt-1">
              {t("Manage student results with advanced filtering and analysis", "Maamul natiijooyinka ardayda leh shaandhayn iyo falanqeynta horumarinta")}
            </p>
          </div>
        </div>

        {/* Search and Filter Controls */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              {t("Search & Filter", "Raadi & Shaandhayn")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
              {/* Search */}
              <div className="lg:col-span-2">
                <Label htmlFor="search">{t("Search Student", "Raadi Arday")}</Label>
                <Input
                  id="search"
                  placeholder={t("Name or ID...", "Magac ama aqoonsi...")}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="mt-1"
                />
              </div>

              {/* Class Filter */}
              <div>
                <Label htmlFor="class-filter">{t("Class", "Fasalka")}</Label>
                <Select value={selectedClass} onValueChange={setSelectedClass}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder={t("All Classes", "Dhammaan Fasallada")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t("All Classes", "Dhammaan Fasallada")}</SelectItem>
                    {uniqueClasses.map(cls => (
                      <SelectItem key={cls} value={cls}>{cls}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Year Filter */}
              <div>
                <Label htmlFor="year-filter">{t("Academic Year", "Sanadka Waxbarashada")}</Label>
                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder={t("All Years", "Dhammaan Sanadaha")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t("All Years", "Dhammaan Sanadaha")}</SelectItem>
                    {uniqueYears.map(year => (
                      <SelectItem key={year} value={year}>{year}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Term Filter */}
              <div>
                <Label htmlFor="term-filter">{t("Term", "Qeybta")}</Label>
                <Select value={selectedTerm} onValueChange={setSelectedTerm}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder={t("All Terms", "Dhammaan Qeybaha")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t("All Terms", "Dhammaan Qeybaha")}</SelectItem>
                    {uniqueTerms.map(term => (
                      <SelectItem key={term} value={term}>{term}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Sort */}
              <div>
                <Label htmlFor="sort">{t("Sort By", "Kala saar")}</Label>
                <Select value={`${sortBy}-${sortOrder}`} onValueChange={(value) => {
                  const [field, order] = value.split('-');
                  setSortBy(field as any);
                  setSortOrder(order as any);
                }}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name-asc">{t("Name A-Z", "Magac A-Z")}</SelectItem>
                    <SelectItem value="name-desc">{t("Name Z-A", "Magac Z-A")}</SelectItem>
                    <SelectItem value="average-desc">{t("Highest Average", "Celceliska Ugu Sarreeya")}</SelectItem>
                    <SelectItem value="average-asc">{t("Lowest Average", "Celceliska Ugu Hooseeya")}</SelectItem>
                    <SelectItem value="grade-desc">{t("Best Grade", "Heerka Ugu Fiican")}</SelectItem>
                    <SelectItem value="grade-asc">{t("Worst Grade", "Heerka Ugu Xun")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3">
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                {t("Add Result", "Ku dar Natiijo")}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{t("Add New Result", "Ku dar Natiijo Cusub")}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">{t("Student Name", "Magaca Ardayga")} *</Label>
                    <Input
                      id="name"
                      value={newResult.name}
                      onChange={(e) => setNewResult({...newResult, name: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="className">{t("Class", "Fasalka")} *</Label>
                    <Select value={newResult.className} onValueChange={(value) => setNewResult({...newResult, className: value})}>
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
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="academicYear">{t("Academic Year", "Sanadka Waxbarashada")}</Label>
                    <Input
                      id="academicYear"
                      value={newResult.academicYear}
                      onChange={(e) => setNewResult({...newResult, academicYear: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="term">{t("Term", "Qeybta")} *</Label>
                    <Input
                      id="term"
                      value={newResult.term}
                      onChange={(e) => setNewResult({...newResult, term: e.target.value})}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="parentEmail">{t("Parent Email", "Email-ka Waalidka")}</Label>
                  <Input
                    id="parentEmail"
                    type="email"
                    value={newResult.parentEmail}
                    onChange={(e) => setNewResult({...newResult, parentEmail: e.target.value})}
                  />
                </div>
                
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label>{t("Subjects & Marks", "Mawduucyada & Dhibcaha")}</Label>
                    <Button type="button" variant="outline" size="sm" onClick={addSubject}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  {newResult.subjects.map((subject, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                      <Input
                        placeholder={t("Subject", "Mawduuca")}
                        value={subject.subject}
                        onChange={(e) => updateSubject(index, "subject", e.target.value)}
                      />
                      <Input
                        type="number"
                        placeholder={t("Mark", "Dhibcaha")}
                        value={subject.mark}
                        onChange={(e) => updateSubject(index, "mark", parseInt(e.target.value) || 0)}
                        min="0"
                        max="100"
                      />
                      {newResult.subjects.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeSubject(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
                
                <Button onClick={handleAddResult} className="w-full">
                  {t("Add Result", "Ku dar Natiijo")}
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Button variant="outline" className="gap-2" onClick={handleExportResults}>
            <Download className="h-4 w-4" />
            {t("Export CSV", "Soo saar CSV")}
          </Button>

          <Button variant="outline" className="gap-2" onClick={handleImportResults}>
            <Upload className="h-4 w-4" />
            {t("Import CSV", "Soo geli CSV")}
          </Button>

          <Dialog open={isBulkAddDialogOpen} onOpenChange={setIsBulkAddDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Plus className="h-4 w-4" />
                {t("Bulk Add Students", "Ku dar Ardayda Badan")}
              </Button>
            </DialogTrigger>
          </Dialog>

          <Button variant="outline" className="gap-2" onClick={handleEmailResults}>
            <Mail className="h-4 w-4" />
            {t("Email Parents", "Email Waalidka")}
          </Button>
        </div>

        {/* Results Display */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {t("Student Results", "Natiijooyinka Ardayda")} ({filteredAndSortedResults.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredAndSortedResults.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  {t("No Results Found", "Natiijooyin lama helin")}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {t("Try adjusting your search or filter criteria.", "Isku day inaad wax ka badasho raadinta ama shaandhaynta.")}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredAndSortedResults.map((result) => (
                  <Card key={result.id} className="p-6 border-l-4 border-l-blue-500">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-xl">{result.name}</h3>
                          <Badge variant="outline">{result.id}</Badge>
                          <Badge variant="secondary">{result.className}</Badge>
                          <Badge variant="outline">{result.academicYear}</Badge>
                          <Badge variant="outline">{result.term}</Badge>
                        </div>
                        {result.parentEmail && (
                          <p className="text-sm text-muted-foreground">
                            {t("Parent Email", "Email-ka Waalidka")}: {result.parentEmail}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-bold text-blue-600">{result.average}%</div>
                        <div className="flex items-center gap-2 justify-end">
                          <Badge className={`${getGradeColor(result.grade)} font-semibold`}>
                            {result.grade}
                          </Badge>
                          {result.passFail ? (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-500" />
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
                      {result.subjects.map((subject, index) => (
                        <div key={index} className="text-center p-3 bg-muted/50 rounded-lg border">
                          <div className="font-medium text-sm text-muted-foreground mb-1">
                            {subject.subject}
                          </div>
                          <div className={`text-xl font-bold ${getMarkColor(subject.mark)}`}>
                            {subject.mark}%
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditingResult({...result});
                          setIsEditDialogOpen(true);
                        }}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        {t("Edit", "Wax ka bedel")}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteResult(result.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        {t("Delete", "Tirtir")}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEmailResults()}
                        disabled={!result.parentEmail}
                      >
                        <Mail className="h-4 w-4 mr-1" />
                        {t("Email", "Email")}
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-600">{filteredAndSortedResults.length}</div>
              <div className="text-sm text-muted-foreground">{t("Total Students", "Wadarta Ardayda")}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">
                {filteredAndSortedResults.length > 0 
                  ? Math.round(filteredAndSortedResults.reduce((sum, r) => sum + r.average, 0) / filteredAndSortedResults.length)
                  : 0}%
              </div>
              <div className="text-sm text-muted-foreground">{t("Average Score", "Celceliska Dhibcaha")}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-yellow-600">
                {filteredAndSortedResults.filter(r => r.passFail).length}
              </div>
              <div className="text-sm text-muted-foreground">{t("Passed Students", "Ardayda Li Doorteen")}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-red-600">
                {filteredAndSortedResults.filter(r => !r.passFail).length}
              </div>
              <div className="text-sm text-muted-foreground">{t("Failed Students", "Ardayda Li Doorteen")}</div>
            </CardContent>
          </Card>
        </div>

        {/* Grade Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              {t("Grade Calculation Settings", "Dejinta Xisaabinta Heerka")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="passMark">{t("Pass Mark (%)", "Dhibcaha Doortanka (%)")}</Label>
                <Input
                  id="passMark"
                  type="number"
                  value={gradeSettings.passMark}
                  onChange={(e) => setGradeSettings({
                    ...gradeSettings,
                    passMark: parseInt(e.target.value) || 50
                  })}
                  min="0"
                  max="100"
                />
              </div>
              <div>
                <Label>{t("Grade Scale", "Miyaarka Heerka")}</Label>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  {Object.entries(gradeSettings.gradeScale).map(([grade, minScore]) => (
                    <div key={grade} className="flex items-center gap-2 text-sm">
                      <Badge variant="outline" className="w-8 text-center">{grade}</Badge>
                      <span>{minScore}%+</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bulk Add Dialog */}
      <Dialog open={isBulkAddDialogOpen} onOpenChange={setIsBulkAddDialogOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t("Bulk Add Students", "Ku dar Ardayda Badan")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            {/* Common Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{t("Common Settings", "Dejinta Guud")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="bulk-class">{t("Class", "Fasalka")}</Label>
                    <Select value={bulkFormData.className} onValueChange={(value) => setBulkFormData({...bulkFormData, className: value})}>
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
                  <div>
                    <Label htmlFor="bulk-year">{t("Academic Year", "Sanadka Waxbarashada")}</Label>
                    <Input
                      id="bulk-year"
                      value={bulkFormData.academicYear}
                      onChange={(e) => setBulkFormData({...bulkFormData, academicYear: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="bulk-term">{t("Term", "Qeybta")}</Label>
                    <Input
                      id="bulk-term"
                      value={bulkFormData.term}
                      onChange={(e) => setBulkFormData({...bulkFormData, term: e.target.value})}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Students List */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">
                    {t("Students", "Ardayda")} ({bulkStudents.length})
                  </CardTitle>
                  <Button onClick={addBulkStudent} className="gap-2">
                    <Plus className="h-4 w-4" />
                    {t("Add Student", "Ku dar Arday")}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {bulkStudents.length === 0 ? (
                  <div className="text-center py-8">
                    <Plus className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">
                      {t("No Students Added", "Arday lama darin")}
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      {t("Click 'Add Student' to start adding students with their results.", "Guji 'Ku dar Arday' si aad u bilowdo ku darista ardayda iyo natiijooyinkooda.")}
                    </p>
                    <Button onClick={addBulkStudent} className="gap-2">
                      <Plus className="h-4 w-4" />
                      {t("Add First Student", "Ku dar Ardayga Koowaad")}
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {bulkStudents.map((student, studentIndex) => (
                      <Card key={studentIndex} className="p-4 border-l-4 border-l-blue-500">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="font-semibold">
                            {t("Student", "Arday")} {studentIndex + 1}
                          </h4>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removeBulkStudent(studentIndex)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          <div>
                            <Label htmlFor={`student-name-${studentIndex}`}>{t("Student Name", "Magaca Ardayga")}</Label>
                            <Input
                              id={`student-name-${studentIndex}`}
                              value={student.name || ""}
                              onChange={(e) => updateBulkStudent(studentIndex, "name", e.target.value)}
                              placeholder={t("Enter student name", "Geli magaca ardayga")}
                            />
                          </div>
                          <div>
                            <Label htmlFor={`student-email-${studentIndex}`}>{t("Parent Email", "Email-ka Waalidka")}</Label>
                            <Input
                              id={`student-email-${studentIndex}`}
                              type="email"
                              value={student.parentEmail || ""}
                              onChange={(e) => updateBulkStudent(studentIndex, "parentEmail", e.target.value)}
                              placeholder={t("Enter parent email", "Geli email-ka waalidka")}
                            />
                          </div>
                          <div>
                            <Label htmlFor={`student-class-${studentIndex}`}>{t("Class Override", "Ka badal Fasalka")}</Label>
                            <Select 
                              value={student.className || bulkFormData.className} 
                              onValueChange={(value) => updateBulkStudent(studentIndex, "className", value)}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder={t("Use common class", "Isticmaal fasalka guud")} />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value={bulkFormData.className}>{t("Use Common Class", "Isticmaal Fasalka Guud")}</SelectItem>
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

                        <div>
                          <Label className="mb-2 block">{t("Subjects & Marks", "Mawduucyada & Dhibcaha")}</Label>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {student.subjects?.map((subject, subjectIndex) => (
                              <div key={subjectIndex} className="flex gap-2">
                                <Input
                                  value={subject.subject}
                                  onChange={(e) => updateBulkStudentSubject(studentIndex, subjectIndex, "subject", e.target.value)}
                                  placeholder={t("Subject", "Mawduuca")}
                                  className="flex-1"
                                />
                                <Input
                                  type="number"
                                  value={subject.mark}
                                  onChange={(e) => updateBulkStudentSubject(studentIndex, subjectIndex, "mark", parseInt(e.target.value) || 0)}
                                  placeholder={t("Mark", "Dhibcaha")}
                                  min="0"
                                  max="100"
                                  className="w-20"
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setIsBulkAddDialogOpen(false)}>
                {t("Cancel", "Jooji")}
              </Button>
              <Button onClick={handleBulkAddStudents} disabled={bulkStudents.length === 0}>
                {t(`Add ${bulkStudents.length} Students`, `Ku dar ${bulkStudents.length} Arday`)}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t("Edit Result", "Wax ka bedel Natiijo")}</DialogTitle>
          </DialogHeader>
          {editingResult && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-name">{t("Student Name", "Magaca Ardayga")}</Label>
                  <Input
                    id="edit-name"
                    value={editingResult.name}
                    onChange={(e) => setEditingResult({...editingResult, name: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-class">{t("Class", "Fasalka")}</Label>
                  <Select value={editingResult.className} onValueChange={(value) => setEditingResult({...editingResult, className: value})}>
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
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-year">{t("Academic Year", "Sanadka Waxbarashada")}</Label>
                  <Input
                    id="edit-year"
                    value={editingResult.academicYear}
                    onChange={(e) => setEditingResult({...editingResult, academicYear: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-term">{t("Term", "Qeybta")}</Label>
                  <Input
                    id="edit-term"
                    value={editingResult.term}
                    onChange={(e) => setEditingResult({...editingResult, term: e.target.value})}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="edit-email">{t("Parent Email", "Email-ka Waalidka")}</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={editingResult.parentEmail || ""}
                  onChange={(e) => setEditingResult({...editingResult, parentEmail: e.target.value})}
                />
              </div>
              
              <div>
                <Label>{t("Subjects & Marks", "Mawduucyada & Dhibcaha")}</Label>
                <div className="space-y-2 mt-2">
                  {editingResult.subjects.map((subject, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={subject.subject}
                        onChange={(e) => {
                          const updatedSubjects = [...editingResult.subjects];
                          updatedSubjects[index] = {...updatedSubjects[index], subject: e.target.value};
                          setEditingResult({...editingResult, subjects: updatedSubjects});
                        }}
                      />
                      <Input
                        type="number"
                        value={subject.mark}
                        onChange={(e) => {
                          const updatedSubjects = [...editingResult.subjects];
                          updatedSubjects[index] = {...updatedSubjects[index], mark: parseInt(e.target.value) || 0};
                          setEditingResult({...editingResult, subjects: updatedSubjects});
                        }}
                        min="0"
                        max="100"
                      />
                    </div>
                  ))}
                </div>
              </div>
              
              <Button onClick={handleEditResult} className="w-full">
                {t("Save Changes", "Keydi Isbeddellada")}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}