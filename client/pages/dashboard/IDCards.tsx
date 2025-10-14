import DashboardLayout from "@/components/layout/DashboardLayout";
import { useApp } from "@/context/AppContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Download, Printer, QrCode, Search, IdCard as IdCardIcon, Edit, Save, Upload, X } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import jsPDF from "jspdf";
import QRCodeLib from "qrcode";

interface Student {
  id: string;
  name: string;
  studentId: string;
  class: string;
  gender: "male" | "female";
  photoUrl?: string;
  dateOfBirth?: string;
  bloodGroup?: string;
  parentPhone?: string;
}

export default function IDCards() {
  const { language, selectedAcademicYear } = useApp();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedClass, setSelectedClass] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  
  const t = (en: string, so: string) => (language === "en" ? en : so);
  
  // Load students from localStorage (same source as Students page)
  const [allStudents, setAllStudents] = useState<Student[]>(() => {
    try {
      const saved = localStorage.getItem("du_students_store_json");
      if (saved) {
        const students = JSON.parse(saved);
        // Convert to ID Card format
        return students.map((s: any) => ({
          id: s.id,
          name: s.name,
          studentId: s.studentId,
          class: s.className,
          gender: s.gender,
          dateOfBirth: s.dateOfBirth || "",
          bloodGroup: s.bloodGroup || "",
          parentPhone: s.parentPhone || s.phone || "",
          photoUrl: s.photoUrl || ""
        }));
      }
    } catch {}
    
    // Default data
    return [
      { id: "1", name: "Fatima Ahmed Ali", studentId: "DU-2025-001", class: "Grade 8A", gender: "female", dateOfBirth: "2010-05-15", bloodGroup: "A+", parentPhone: "+252 61 234 5678" },
      { id: "2", name: "Mohamed Hassan Abdi", studentId: "DU-2025-002", class: "Grade 8A", gender: "male", dateOfBirth: "2010-08-22", bloodGroup: "B+", parentPhone: "+252 61 345 6789" },
      { id: "3", name: "Amina Omar Said", studentId: "DU-2025-003", class: "Grade 8B", gender: "female", dateOfBirth: "2010-03-10", bloodGroup: "O+", parentPhone: "+252 61 456 7890" },
      { id: "4", name: "Hassan Ali Mohamed", studentId: "DU-2025-004", class: "Grade 9A", gender: "male", dateOfBirth: "2009-11-30", bloodGroup: "AB+", parentPhone: "+252 61 567 8901" },
      { id: "5", name: "Khadija Yusuf Ali", studentId: "DU-2025-005", class: "Grade 9A", gender: "female", dateOfBirth: "2009-07-18", bloodGroup: "A-", parentPhone: "+252 61 678 9012" },
    ];
  });

  // Save back to localStorage when students change
  useEffect(() => {
    try {
      const saved = localStorage.getItem("du_students_store_json");
      if (saved) {
        const existingStudents = JSON.parse(saved);
        // Update existing students with our changes
        const updated = existingStudents.map((s: any) => {
          const found = allStudents.find(st => st.id === s.id);
          if (found) {
            return {
              ...s,
              name: found.name,
              studentId: found.studentId,
              className: found.class,
              gender: found.gender,
              dateOfBirth: found.dateOfBirth,
              bloodGroup: found.bloodGroup,
              parentPhone: found.parentPhone,
            };
          }
          return s;
        });
        localStorage.setItem("du_students_store_json", JSON.stringify(updated));
      }
    } catch {}
  }, [allStudents]);

  const classes = ["all", "Grade 7A", "Grade 7B", "Grade 8A", "Grade 8B", "Grade 9A", "Grade 9B", "Grade 10A"];

  // Filter students
  const filteredStudents = allStudents.filter(student => {
    const matchesClass = selectedClass === "all" || student.class === selectedClass;
    const matchesSearch = student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         student.studentId.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesClass && matchesSearch;
  });

  const handleSelectStudent = (studentId: string) => {
    setSelectedStudents(prev => 
      prev.includes(studentId) 
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  const handleSelectAll = () => {
    if (selectedStudents.length === filteredStudents.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(filteredStudents.map(s => s.id));
    }
  };

  const generateIDCard = async (student: Student): Promise<string> => {
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 250;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return '';

    // Background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 400, 250);
    
    // Header with school colors
    const gradient = ctx.createLinearGradient(0, 0, 400, 0);
    gradient.addColorStop(0, '#1e3a8a');
    gradient.addColorStop(1, '#3b82f6');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 400, 50);
    
    // School name
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 18px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('DARUL UMAH SCHOOL', 200, 30);
    
    // Student photo - with border and better styling
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(18, 68, 104, 124); // White border
    ctx.fillStyle = '#e5e7eb';
    ctx.fillRect(20, 70, 100, 120); // Photo area
    
    // If student has photo, try to load it
    if (student.photoUrl) {
      try {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        await new Promise((resolve, reject) => {
          img.onload = () => {
            ctx.drawImage(img, 20, 70, 100, 120);
            resolve(null);
          };
          img.onerror = reject;
          img.src = student.photoUrl;
        });
      } catch {
        // If image fails, show placeholder with initials
        ctx.fillStyle = '#9ca3af';
        ctx.font = 'bold 32px Arial';
        ctx.textAlign = 'center';
        const initials = student.name.split(' ').map(n => n[0]).join('').slice(0, 2);
        ctx.fillText(initials, 70, 140);
      }
    } else {
      // Show initials as placeholder
      ctx.fillStyle = '#1e3a8a';
      ctx.font = 'bold 32px Arial';
      ctx.textAlign = 'center';
      const initials = student.name.split(' ').map(n => n[0]).join('').slice(0, 2);
      ctx.fillText(initials, 70, 140);
    }
    
    // Student information
    ctx.fillStyle = '#000000';
    ctx.textAlign = 'left';
    ctx.font = 'bold 16px Arial';
    ctx.fillText(student.name, 140, 85);
    
    ctx.font = '12px Arial';
    ctx.fillStyle = '#4b5563';
    ctx.fillText(`ID: ${student.studentId}`, 140, 110);
    ctx.fillText(`Class: ${student.class}`, 140, 130);
    ctx.fillText(`Year: ${selectedAcademicYear}`, 140, 150);
    if (student.bloodGroup) {
      ctx.fillText(`Blood: ${student.bloodGroup}`, 140, 170);
    }
    
    // Generate REAL QR code with unique student data
    try {
      const qrData = JSON.stringify({
        studentId: student.studentId,
        name: student.name,
        class: student.class,
        year: selectedAcademicYear
      });
      
      const qrCodeDataUrl = await QRCodeLib.toDataURL(qrData, {
        errorCorrectionLevel: 'M',
        margin: 1,
        width: 80,
        color: {
          dark: '#1e3a8a',
          light: '#ffffff'
        }
      });
      
      const qrImg = new Image();
      await new Promise((resolve, reject) => {
        qrImg.onload = () => {
          ctx.drawImage(qrImg, 300, 70, 80, 80);
          resolve(null);
        };
        qrImg.onerror = reject;
        qrImg.src = qrCodeDataUrl;
      });
    } catch (error) {
      // Fallback to placeholder if QR generation fails
      ctx.fillStyle = '#e5e7eb';
      ctx.fillRect(300, 70, 80, 80);
      ctx.fillStyle = '#9ca3af';
      ctx.font = '10px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('QR CODE', 340, 110);
    }
    
    // Footer
    ctx.fillStyle = '#1e3a8a';
    ctx.fillRect(0, 200, 400, 50);
    ctx.fillStyle = '#ffffff';
    ctx.font = '10px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('In case of emergency, please contact:', 200, 220);
    if (student.parentPhone) {
      ctx.fillText(student.parentPhone, 200, 235);
    }
    
    return canvas.toDataURL('image/png');
  };

  const handlePrintSelected = async () => {
    if (selectedStudents.length === 0) {
      toast({
        title: t("No Selection", "Ma la dooran"),
        description: t("Please select students to print ID cards", "Fadlan dooro ardayda si loo daabaco kaadhadhka"),
        variant: "destructive",
      });
      return;
    }

    const selectedStudentData = allStudents.filter(s => selectedStudents.includes(s.id));
    
    toast({
      title: t("Generating...", "Waa la sameynayaa..."),
      description: t("Creating ID cards with QR codes...", "Waxaa la abuurayaa kaadhadhka QR-ka leh..."),
    });

    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4"
    });

    let yOffset = 10;
    const cardWidth = 85;
    const cardHeight = 54;
    const margin = 10;
    let cardsOnPage = 0;

    for (let index = 0; index < selectedStudentData.length; index++) {
      const student = selectedStudentData[index];
      
      if (cardsOnPage >= 8) {
        doc.addPage();
        yOffset = 10;
        cardsOnPage = 0;
      }

      const xOffset = (index % 2) * (cardWidth + margin) + margin;
      const currentY = yOffset + Math.floor(cardsOnPage / 2) * (cardHeight + margin);

      const cardImage = await generateIDCard(student);
      doc.addImage(cardImage, 'PNG', xOffset, currentY, cardWidth, cardHeight);

      cardsOnPage++;
    }

    doc.save(`ID_Cards_${selectedAcademicYear}.pdf`);

    toast({
      title: t("Success", "Guul"),
      description: t(`Generated ${selectedStudents.length} ID cards with unique QR codes`, `Waxaa la sameeyay ${selectedStudents.length} kaadhka aqoonsi oo leh QR gaar ah`),
    });
  };

  const handleDownloadSingle = async (student: Student, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    
    toast({
      title: t("Generating...", "Waa la sameynayaa..."),
      description: t("Creating ID card with QR code...", "Waxaa la abuurayaa kaadhka QR-ka leh..."),
    });

    const cardImage = await generateIDCard(student);
    const link = document.createElement('a');
    link.href = cardImage;
    link.download = `ID_Card_${student.studentId}.png`;
    link.click();

    toast({
      title: t("Downloaded", "La soo dejiyay"),
      description: t(`ID card for ${student.name} with unique QR code`, `Kaadhka ${student.name} oo leh QR gaar ah`),
    });
  };

  const handleEditStudent = (student: Student, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    setEditingStudent(student);
    setIsEditDialogOpen(true);
  };

  const handleSaveEdit = () => {
    if (!editingStudent) return;

    setAllStudents(prevStudents =>
      prevStudents.map(s =>
        s.id === editingStudent.id ? editingStudent : s
      )
    );

    toast({
      title: t("Success", "Guul"),
      description: t("Student information updated", "Xogta ardayga waa la cusbooneysiiyay"),
    });

    setIsEditDialogOpen(false);
    setEditingStudent(null);
  };

  const handleRowClick = (student: Student) => {
    handleEditStudent(student);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: t("Error", "Qalad"),
        description: t("Photo size must be less than 2MB", "Cabbirka sawirku waa inuu ka yar yahay 2MB"),
        variant: "destructive",
      });
      return;
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: t("Error", "Qalad"),
        description: t("Please upload an image file", "Fadlan soo rar faylka sawirka"),
        variant: "destructive",
      });
      return;
    }

    // Convert to base64
    const reader = new FileReader();
    reader.onloadend = () => {
      if (editingStudent) {
        setEditingStudent({
          ...editingStudent,
          photoUrl: reader.result as string
        });
        toast({
          title: t("Photo Added", "Sawirka la daray"),
          description: t("Photo will appear on ID card", "Sawirka ayaa ka muuqan doona kaadhka"),
        });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    if (editingStudent) {
      setEditingStudent({
        ...editingStudent,
        photoUrl: ""
      });
      toast({
        title: t("Photo Removed", "Sawirka la saaray"),
        description: t("Initials will be shown instead", "Xarfaha magaca ayaa la tusiin doonaa beddelkeeda"),
      });
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
                {t("Student ID Cards", "Kaadhadhka Aqoonsiga Ardayda")} 🪪
              </h2>
              <Badge variant="outline" className="text-sm">
                {selectedAcademicYear}
              </Badge>
            </div>
            <p className="text-muted-foreground mt-1">
              {t("Upload photos, edit info, generate ID cards with unique QR codes", "Soo rar sawirro, wax ka beddel xogta, samee kaadhadhka QR gaar ah")}
            </p>
          </div>
        </div>

        {/* Filters and Actions */}
        <Card>
          <CardHeader>
            <CardTitle>{t("Generate ID Cards", "Samee Kaadhadhka")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-2">
                <Label>{t("Filter by Class", "Dooro Fasalka")}</Label>
                <Select value={selectedClass} onValueChange={setSelectedClass}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {classes.map(cls => (
                      <SelectItem key={cls} value={cls}>
                        {cls === "all" ? t("All Classes", "Dhammaan Fasallada") : cls}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>{t("Search Student", "Raadi Arday")}</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder={t("Name or ID...", "Magaca ama ID...")}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>

              <div className="flex items-end gap-2 md:col-span-2">
                <Button 
                  onClick={handlePrintSelected} 
                  disabled={selectedStudents.length === 0}
                  className="flex-1"
                >
                  <Printer className="h-4 w-4 mr-2" />
                  {t("Print Selected", "Daabaco Kuwa La Doortay")} ({selectedStudents.length})
                </Button>
                <Button variant="outline" onClick={handleSelectAll}>
                  {selectedStudents.length === filteredStudents.length 
                    ? t("Deselect All", "Ka saar Dhammaan")
                    : t("Select All", "Dooro Dhammaan")
                  }
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Student List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IdCardIcon className="h-5 w-5" />
              {t("Students", "Ardayda")} ({filteredStudents.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-3 text-sm text-muted-foreground flex items-center gap-2">
              <Edit className="h-4 w-4" />
              {t("Tip: Click on any row to edit student information", "Talooyin: Guji sadar kasta si aad u beddesho xogta ardayga")}
            </div>
            <div className="space-y-3">
              {filteredStudents.map(student => (
                <div 
                  key={student.id}
                  onClick={() => handleRowClick(student)}
                  className="flex items-center gap-4 p-4 rounded-lg border hover:bg-accent/50 transition-colors cursor-pointer"
                >
                  <Checkbox
                    checked={selectedStudents.includes(student.id)}
                    onCheckedChange={() => handleSelectStudent(student.id)}
                    onClick={(e) => e.stopPropagation()}
                  />
                  
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold flex-shrink-0">
                    {student.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="font-semibold truncate">{student.name}</div>
                    <div className="text-sm text-muted-foreground flex items-center gap-3 flex-wrap">
                      <span>{student.studentId}</span>
                      <span>•</span>
                      <span>{student.class}</span>
                      {student.bloodGroup && (
                        <>
                          <span>•</span>
                          <span>Blood: {student.bloodGroup}</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => handleEditStudent(student, e)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => handleDownloadSingle(student, e)}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      {t("Download", "Soo dejiso")}
                    </Button>
                  </div>
                </div>
              ))}

              {filteredStudents.length === 0 && (
                <div className="text-center py-12">
                  <QrCode className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="font-medium">{t("No students found", "Lama helin ardayda")}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {t("Try adjusting your filters", "Isku day inaad beddesho shaandhada")}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="bg-blue-50 dark:bg-blue-950/30 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                <QrCode className="h-5 w-5 text-white" />
              </div>
              <div className="space-y-1">
                <h4 className="font-semibold text-blue-900 dark:text-blue-100">
                  {t("ID Card Features", "Astaamaha Kaadhka")}
                </h4>
                <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                  <li>✅ {t("Student photo or initials display", "Sawirka ardayga ama xarfaha magaca")}</li>
                  <li>✅ {t("Real scannable QR code (unique per student)", "QR dhabta ah oo la akhrisan karo (gaar ah oo arday kasta)")}</li>
                  <li>✅ {t("QR contains: ID, Name, Class, Year", "QR-ku waxa ku jira: ID, Magaca, Fasalka, Sanadka")}</li>
                  <li>✅ {t("Emergency contact information", "Xogta xaaladda deg degga ah")}</li>
                  <li>✅ {t("Professional card design", "Naqshadda kaadhka xirfadeed")}</li>
                  <li>✅ {t("Print-ready format (CR80 standard)", "Qaab daabacaad diyaar (CR80 caadi)")}</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Edit Student Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{t("Edit Student Information", "Wax ka beddel Xogta Ardayga")}</DialogTitle>
              <DialogDescription>
                {t("Update student details for ID card generation", "Cusboonaysii faahfaahinta ardayga kaadka aqoonsiga")}
              </DialogDescription>
            </DialogHeader>
            {editingStudent && (
              <div className="grid gap-4 py-4">
                {/* Photo Upload Section */}
                <div className="grid gap-2">
                  <Label>{t("Student Photo", "Sawirka Ardayga")}</Label>
                  <div className="flex items-center gap-4">
                    <div className="h-24 w-24 rounded-lg border-2 border-dashed border-primary/20 bg-muted/30 flex items-center justify-center overflow-hidden">
                      {editingStudent.photoUrl ? (
                        <img 
                          src={editingStudent.photoUrl} 
                          alt={editingStudent.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="text-center">
                          <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-1" />
                          <span className="text-xs text-muted-foreground">
                            {t("No Photo", "Sawir ma jiro")}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 space-y-2">
                      <div>
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={handlePhotoUpload}
                          className="cursor-pointer"
                          id="photo-upload"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          {t("Max 2MB, JPG/PNG", "Ugu badan 2MB, JPG/PNG")}
                        </p>
                      </div>
                      {editingStudent.photoUrl && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleRemovePhoto}
                          className="w-full"
                        >
                          <X className="h-4 w-4 mr-2" />
                          {t("Remove Photo", "Saar Sawirka")}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="edit-name">{t("Full Name", "Magaca Buuxa")} *</Label>
                  <Input
                    id="edit-name"
                    value={editingStudent.name}
                    onChange={(e) => setEditingStudent({ ...editingStudent, name: e.target.value })}
                    placeholder={t("Enter student name", "Geli magaca ardayga")}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="edit-studentId">{t("Student ID", "Aqoonsiga")} *</Label>
                    <Input
                      id="edit-studentId"
                      value={editingStudent.studentId}
                      onChange={(e) => setEditingStudent({ ...editingStudent, studentId: e.target.value })}
                      placeholder="DU-2025-001"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-class">{t("Class", "Fasalka")} *</Label>
                    <Input
                      id="edit-class"
                      value={editingStudent.class}
                      onChange={(e) => setEditingStudent({ ...editingStudent, class: e.target.value })}
                      placeholder="Grade 8A"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="edit-dob">{t("Date of Birth", "Taariikhda Dhalashada")}</Label>
                    <Input
                      id="edit-dob"
                      type="date"
                      value={editingStudent.dateOfBirth || ""}
                      onChange={(e) => setEditingStudent({ ...editingStudent, dateOfBirth: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-blood">{t("Blood Group", "Kooxda Dhiigga")}</Label>
                    <Select
                      value={editingStudent.bloodGroup || ""}
                      onValueChange={(value) => setEditingStudent({ ...editingStudent, bloodGroup: value })}
                    >
                      <SelectTrigger id="edit-blood">
                        <SelectValue placeholder={t("Select", "Dooro")} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="A+">A+</SelectItem>
                        <SelectItem value="A-">A-</SelectItem>
                        <SelectItem value="B+">B+</SelectItem>
                        <SelectItem value="B-">B-</SelectItem>
                        <SelectItem value="O+">O+</SelectItem>
                        <SelectItem value="O-">O-</SelectItem>
                        <SelectItem value="AB+">AB+</SelectItem>
                        <SelectItem value="AB-">AB-</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="edit-phone">{t("Emergency Contact", "Xiriirka Degdegga")}</Label>
                  <Input
                    id="edit-phone"
                    value={editingStudent.parentPhone || ""}
                    onChange={(e) => setEditingStudent({ ...editingStudent, parentPhone: e.target.value })}
                    placeholder="+252 61 234 5678"
                  />
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                {t("Cancel", "Ka noqo")}
              </Button>
              <Button onClick={handleSaveEdit}>
                <Save className="h-4 w-4 mr-2" />
                {t("Save Changes", "Keydi Isbeddelka")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}

