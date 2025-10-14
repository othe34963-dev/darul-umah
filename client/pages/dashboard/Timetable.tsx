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
import { Clock, Plus, Edit, Trash2, FileDown, ArrowLeft, Calendar } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface TimeSlot {
  id: string;
  day: string;
  period: number;
  startTime: string;
  endTime: string;
  subject: string;
  className: string;
  teacher: string;
  room: string;
}

export default function Timetable() {
  const { language, selectedAcademicYear, user } = useApp();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedClass, setSelectedClass] = useState("Grade 8A");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState<TimeSlot | null>(null);
  
  const t = (en: string, so: string) => (language === "en" ? en : so);
  const isAdmin = user.role === "admin";

  // Form state
  const [formData, setFormData] = useState({
    day: "Monday",
    period: 1,
    startTime: "08:00",
    endTime: "08:45",
    subject: "",
    className: "Grade 8A",
    teacher: "",
    room: ""
  });

  // Load timetable data from localStorage
  const [allTimeSlots, setAllTimeSlots] = useState<Record<string, TimeSlot[]>>(() => {
    try {
      const saved = localStorage.getItem("du_timetable_store_json");
      if (saved) return JSON.parse(saved);
    } catch {}
    
    // Default timetable for 2024-2025 with Somali classes
    return {
      "2024-2025": [
        // 8aad (Middle School) timetable
        { id: "1", day: "Monday", period: 1, startTime: "08:00", endTime: "08:45", subject: "Mathematics", className: "8aad", teacher: "Ahmed Hassan", room: "Room 201" },
        { id: "2", day: "Monday", period: 2, startTime: "08:50", endTime: "09:35", subject: "English", className: "8aad", teacher: "Fatima Omar", room: "Room 102" },
        { id: "3", day: "Monday", period: 3, startTime: "09:40", endTime: "10:25", subject: "Science", className: "8aad", teacher: "Ali Mohamed", room: "Room 203" },
        { id: "4", day: "Monday", period: 4, startTime: "10:30", endTime: "11:15", subject: "Somali", className: "8aad", teacher: "Hassan Ali", room: "Room 105" },
        
        // Form 1 (Secondary) timetable
        { id: "5", day: "Monday", period: 1, startTime: "08:00", endTime: "08:45", subject: "Mathematics", className: "Form 1", teacher: "Fatima Omar", room: "Room 301" },
        { id: "6", day: "Monday", period: 2, startTime: "08:50", endTime: "09:35", subject: "Physics", className: "Form 1", teacher: "Aisha Ahmed", room: "Room 302" },
        { id: "7", day: "Monday", period: 3, startTime: "09:40", endTime: "10:25", subject: "Chemistry", className: "Form 1", teacher: "Omar Mohamed", room: "Room 303" },
        { id: "8", day: "Monday", period: 4, startTime: "10:30", endTime: "11:15", subject: "Biology", className: "Form 1", teacher: "Maryan Farah", room: "Room 304" },
        
        // 5aad (Primary) timetable
        { id: "9", day: "Monday", period: 1, startTime: "08:00", endTime: "08:45", subject: "Mathematics", className: "5aad", teacher: "Mohamed Ali", room: "Room 105" },
        { id: "10", day: "Monday", period: 2, startTime: "08:50", endTime: "09:35", subject: "Science", className: "5aad", teacher: "Khadija Yusuf", room: "Room 106" },
        { id: "11", day: "Monday", period: 3, startTime: "09:40", endTime: "10:25", subject: "English", className: "5aad", teacher: "Hassan Omar", room: "Room 107" },
        { id: "12", day: "Monday", period: 4, startTime: "10:30", endTime: "11:15", subject: "Somali", className: "5aad", teacher: "Amina Hassan", room: "Room 108" },
      ]
    };
  });

  // Auto-save to localStorage
  useEffect(() => {
    localStorage.setItem("du_timetable_store_json", JSON.stringify(allTimeSlots));
  }, [allTimeSlots]);

  // Get timetable for selected year and class
  const timeSlots = (allTimeSlots[selectedAcademicYear] || []).filter(
    slot => slot.className === selectedClass
  );

  const days = ["Saturday", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  const periods = [1, 2, 3, 4, 5, 6, 7, 8];

  const classes = ["1aad", "2aad", "3aad", "4aad", "5aad", "6aad", "7aad", "8aad", "9aad", "Form 1", "Form 2", "Form 3", "Form 4"];

  const getSlot = (day: string, period: number) => {
    return timeSlots.find(slot => slot.day === day && slot.period === period);
  };

  const handleOpenAdd = (day: string, period: number) => {
    if (!isAdmin) return;
    
    setFormData({
      day,
      period,
      startTime: "08:00",
      endTime: "08:45",
      subject: "",
      className: selectedClass,
      teacher: "",
      room: ""
    });
    setEditingSlot(null);
    setIsAddDialogOpen(true);
  };

  const handleOpenEdit = (slot: TimeSlot) => {
    if (!isAdmin) return;
    
    setFormData({
      day: slot.day,
      period: slot.period,
      startTime: slot.startTime,
      endTime: slot.endTime,
      subject: slot.subject,
      className: slot.className,
      teacher: slot.teacher,
      room: slot.room
    });
    setEditingSlot(slot);
    setIsAddDialogOpen(true);
  };

  const handleSave = () => {
    if (!formData.subject || !formData.teacher) {
      toast({
        title: t("Error", "Qalad"),
        description: t("Please fill in required fields", "Fadlan buuxi goobaha loo baahan yahay"),
        variant: "destructive",
      });
      return;
    }

    const yearSlots = allTimeSlots[selectedAcademicYear] || [];

    if (editingSlot) {
      // Update existing slot
      const updatedSlots = yearSlots.map(s =>
        s.id === editingSlot.id ? { ...formData, id: s.id } : s
      );
      setAllTimeSlots({ ...allTimeSlots, [selectedAcademicYear]: updatedSlots });
    } else {
      // Add new slot
      const newSlot: TimeSlot = {
        id: Date.now().toString(),
        ...formData
      };
      setAllTimeSlots({ 
        ...allTimeSlots, 
        [selectedAcademicYear]: [...yearSlots, newSlot] 
      });
    }

    toast({
      title: t("Success", "Guul"),
      description: t("Timetable updated successfully", "Jadwalka waa la cusbooneysiiyay si guul leh"),
    });

    setIsAddDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    if (!isAdmin) return;
    
    if (confirm(t("Delete this time slot?", "Tirtir waqtigan?"))) {
      const yearSlots = allTimeSlots[selectedAcademicYear] || [];
      setAllTimeSlots({
        ...allTimeSlots,
        [selectedAcademicYear]: yearSlots.filter(s => s.id !== id)
      });
      
      toast({
        title: t("Deleted", "La tirtiray"),
        description: t("Time slot deleted", "Waqtiga waa la tirtiray"),
      });
    }
  };

  const handleExport = () => {
    try {
      // Create new PDF document
      const doc = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4"
      });

      // Add school header
      doc.setFontSize(20);
      doc.setFont("helvetica", "bold");
      doc.text("Darul Ummah School", 148, 15, { align: "center" });
      
      doc.setFontSize(16);
      doc.setFont("helvetica", "normal");
      doc.text("Class Timetable", 148, 25, { align: "center" });
      
      doc.setFontSize(12);
      doc.text(`Class: ${selectedClass}`, 148, 32, { align: "center" });
      doc.text(`Academic Year: ${selectedAcademicYear}`, 148, 38, { align: "center" });
      
      // Add generation date
      doc.setFontSize(9);
      doc.setTextColor(100);
      const today = new Date().toLocaleDateString();
      doc.text(`Generated on: ${today}`, 148, 44, { align: "center" });
      
      // Reset text color
      doc.setTextColor(0);

      // Prepare table data
      const days = ["Saturday", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
      const maxPeriods = 8;
      
      // Get all periods that have at least one class
      const usedPeriods = new Set(timeSlots.map(slot => slot.period));
      const periods = Array.from(usedPeriods).sort((a, b) => a - b);
      
      // If no slots exist, show all periods
      const displayPeriods = periods.length > 0 ? periods : [1, 2, 3, 4, 5, 6, 7, 8];

      // Create header row
      const headers = [["Period/Time", ...days]];

      // Create data rows
      const tableData = displayPeriods.map(period => {
        const firstSlot = timeSlots.find(s => s.period === period);
        const timeRange = firstSlot 
          ? `P${period}\n${firstSlot.startTime}-${firstSlot.endTime}`
          : `Period ${period}`;
        
        const row = [timeRange];
        
        days.forEach(day => {
          const slot = timeSlots.find(s => s.day === day && s.period === period);
          if (slot) {
            row.push(`${slot.subject}\n${slot.teacher}\n${slot.room}`);
          } else {
            row.push("-");
          }
        });
        
        return row;
      });

      // Generate table
      autoTable(doc, {
        head: headers,
        body: tableData,
        startY: 50,
        theme: "grid",
        headStyles: {
          fillColor: [41, 128, 185],
          textColor: 255,
          fontStyle: "bold",
          halign: "center",
          fontSize: 9
        },
        bodyStyles: {
          fontSize: 7,
          cellPadding: 2,
          valign: "middle",
          halign: "center"
        },
        columnStyles: {
          0: { 
            cellWidth: 22, 
            fontStyle: "bold",
            fillColor: [240, 248, 255],
            fontSize: 8
          },
          // Make all day columns equal width to fit 7 days
          1: { cellWidth: 33 },
          2: { cellWidth: 33 },
          3: { cellWidth: 33 },
          4: { cellWidth: 33 },
          5: { cellWidth: 33 },
          6: { cellWidth: 33 },
          7: { cellWidth: 33 }
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245]
        },
        styles: {
          overflow: "linebreak",
          cellWidth: "wrap",
          lineWidth: 0.1
        },
        margin: { top: 50, left: 8, right: 8 }
      });

      // Add footer
      const pageCount = doc.internal.pages.length - 1;
      doc.setFontSize(8);
      doc.setTextColor(100);
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.text(
          `Page ${i} of ${pageCount}`,
          148,
          doc.internal.pageSize.height - 10,
          { align: "center" }
        );
        doc.text(
          "Darul Ummah School Management System",
          10,
          doc.internal.pageSize.height - 10
        );
      }

      // Save the PDF
      const fileName = `Timetable_${selectedClass.replace(/\s+/g, "_")}_${selectedAcademicYear}.pdf`;
      doc.save(fileName);

      toast({
        title: t("Export Successful", "Dhoofisku waa guuleystay"),
        description: t(`Timetable exported as ${fileName}`, `Jadwalka waxaa loo dhoofiyay ${fileName}`),
      });
    } catch (error) {
      console.error("PDF export error:", error);
      toast({
        title: t("Export Failed", "Dhoofisku wuu fashilmay"),
        description: t("Could not generate PDF. Please try again.", "Lama samayn karin PDF. Fadlan isku day mar kale."),
        variant: "destructive",
      });
    }
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
                {t("Class Timetable", "Jadwalka Fasalka")} 📅
              </h2>
              <Badge variant="outline" className="text-sm">
                {selectedAcademicYear}
              </Badge>
            </div>
            <p className="text-muted-foreground mt-1">
              {isAdmin 
                ? t("Create and manage class schedules (Saturday to Friday)", "Abuur oo maamul jadwalka fasallada (Sabti ilaa Jimce)")
                : t("View your class schedule (Saturday to Friday)", "Eeg jadwalka fasalkaaga (Sabti ilaa Jimce)")
              }
            </p>
          </div>
        </div>

        {/* Controls */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-4">
                <Label className="text-sm font-medium">
                  {t("Select Class", "Dooro Fasalka")}:
                </Label>
                <Select value={selectedClass} onValueChange={setSelectedClass}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {classes.map((cls) => (
                      <SelectItem key={cls} value={cls}>
                        {cls}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleExport}>
                  <FileDown className="h-4 w-4 mr-2" />
                  {t("Export PDF", "Dhoofso PDF")}
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Timetable Grid */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              {t("Weekly Schedule (Sat-Fri)", "Jadwalka Toddobaadka (Sabti-Jimce)")} - {selectedClass}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">{t("Period", "Waqti")}</TableHead>
                    <TableHead className="w-[80px]">{t("Time", "Saacad")}</TableHead>
                    {days.map(day => (
                      <TableHead 
                        key={day} 
                        className={`text-center min-w-[150px] ${
                          day === "Friday" ? "bg-green-50 dark:bg-green-950/20 font-semibold" : ""
                        }`}
                      >
                        {t(
                          day,
                          day === "Saturday" ? "Sabti" :
                          day === "Sunday" ? "Axad" :
                          day === "Monday" ? "Isniin" :
                          day === "Tuesday" ? "Talaado" :
                          day === "Wednesday" ? "Arbaco" :
                          day === "Thursday" ? "Khamiis" :
                          "Jimce"
                        )}
                        {day === "Friday" && " 🕌"}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {periods.map(period => {
                    const firstSlot = timeSlots.find(s => s.period === period);
                    const timeRange = firstSlot 
                      ? `${firstSlot.startTime}-${firstSlot.endTime}`
                      : `${7 + period}:00`;

                    return (
                      <TableRow key={period}>
                        <TableCell className="font-medium">
                          {t("Period", "Waqti")} {period}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {timeRange}
                        </TableCell>
                        {days.map(day => {
                          const slot = getSlot(day, period);
                          
                          return (
                            <TableCell 
                              key={`${day}-${period}`} 
                              className={`p-2 ${day === "Friday" ? "bg-green-50/30 dark:bg-green-950/10" : ""}`}
                            >
                              {slot ? (
                                <div 
                                  className={`p-3 rounded-lg border-l-4 ${
                                    slot.subject.includes("Math") ? "border-blue-500 bg-blue-50 dark:bg-blue-950/30" :
                                    slot.subject.includes("English") ? "border-green-500 bg-green-50 dark:bg-green-950/30" :
                                    slot.subject.includes("Science") || slot.subject.includes("Physics") || slot.subject.includes("Chemistry") || slot.subject.includes("Biology") 
                                      ? "border-purple-500 bg-purple-50 dark:bg-purple-950/30" :
                                    slot.subject.includes("Islamic") || slot.subject.includes("Arabic") 
                                      ? "border-yellow-500 bg-yellow-50 dark:bg-yellow-950/30" :
                                    "border-gray-500 bg-gray-50 dark:bg-gray-950/30"
                                  } ${isAdmin ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}`}
                                  onClick={() => isAdmin && handleOpenEdit(slot)}
                                >
                                  <div className="font-semibold text-sm line-clamp-1">
                                    {slot.subject}
                                  </div>
                                  <div className="text-xs text-muted-foreground mt-1">
                                    {slot.teacher}
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    {slot.room}
                                  </div>
                                  {isAdmin && (
                                    <div className="flex gap-1 mt-2">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-6 px-2 text-xs"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleDelete(slot.id);
                                        }}
                                      >
                                        <Trash2 className="h-3 w-3" />
                                      </Button>
                                    </div>
                                  )}
                                </div>
                              ) : (
                                isAdmin ? (
                                  <button
                                    className="w-full p-3 rounded-lg border-2 border-dashed hover:border-primary hover:bg-accent/50 transition-colors text-xs text-muted-foreground"
                                    onClick={() => handleOpenAdd(day, period)}
                                  >
                                    + {t("Add", "Ku dar")}
                                  </button>
                                ) : (
                                  <div className="p-3 text-center text-xs text-muted-foreground">
                                    {t("Free", "Xor")}
                                  </div>
                                )
                              )}
                            </TableCell>
                          );
                        })}
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            {/* Legend */}
            <div className="mt-6 space-y-3">
              <div className="flex flex-wrap gap-4 text-xs">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded border-l-4 border-blue-500 bg-blue-50"></div>
                  <span>{t("Mathematics", "Xisaabta")}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded border-l-4 border-green-500 bg-green-50"></div>
                  <span>{t("Languages", "Luqadaha")}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded border-l-4 border-purple-500 bg-purple-50"></div>
                  <span>{t("Sciences", "Sayniska")}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded border-l-4 border-yellow-500 bg-yellow-50"></div>
                  <span>{t("Islamic Studies", "Waxbarashada Diinta")}</span>
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-xs text-muted-foreground">
                  💡 {t("Tip: Week starts Saturday and ends Friday (Sat-Fri)", "Talooyin: Toddobaadku wuxuu ka bilaabmaa Sabti oo uu ku dhammaanayo Jimce (Sabti-Jimce)")}
                </div>
                <div className="text-xs text-muted-foreground">
                  🕌 {t("Friday is highlighted as the holy day", "Jimcaha waa la muujiyay sida maalinta barakeysan")}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Add/Edit Dialog */}
        {isAdmin && (
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {editingSlot 
                    ? t("Edit Time Slot", "Wax ka beddel Waqtiga")
                    : t("Add Time Slot", "Ku dar Waqti")
                  }
                </DialogTitle>
                <DialogDescription>
                  {t("Configure the class schedule", "Habeey jadwalka fasalka")}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>{t("Day", "Maalinta")}</Label>
                    <Select 
                      value={formData.day}
                      onValueChange={(value) => setFormData({ ...formData, day: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {days.map(day => (
                          <SelectItem key={day} value={day}>{day}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label>{t("Period", "Waqti")}</Label>
                    <Select 
                      value={formData.period.toString()}
                      onValueChange={(value) => setFormData({ ...formData, period: parseInt(value) })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {periods.map(p => (
                          <SelectItem key={p} value={p.toString()}>Period {p}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>{t("Start Time", "Waqtiga Bilowga")}</Label>
                    <Input
                      type="time"
                      value={formData.startTime}
                      onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>{t("End Time", "Waqtiga Dhammaadka")}</Label>
                    <Input
                      type="time"
                      value={formData.endTime}
                      onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label>{t("Subject", "Maaddo")} *</Label>
                  <Input
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder={t("e.g., Mathematics", "tusaale, Xisaabta")}
                  />
                </div>

                <div className="grid gap-2">
                  <Label>{t("Teacher", "Macallin")} *</Label>
                  <Input
                    value={formData.teacher}
                    onChange={(e) => setFormData({ ...formData, teacher: e.target.value })}
                    placeholder={t("Teacher name", "Magaca macallinka")}
                  />
                </div>

                <div className="grid gap-2">
                  <Label>{t("Room", "Qolka")}</Label>
                  <Input
                    value={formData.room}
                    onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                    placeholder={t("e.g., Room 201", "tusaale, Qol 201")}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  {t("Cancel", "Ka noqo")}
                </Button>
                <Button onClick={handleSave}>
                  {editingSlot 
                    ? t("Update", "Cusboonaysii")
                    : t("Add", "Ku dar")
                  }
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </DashboardLayout>
  );
}

