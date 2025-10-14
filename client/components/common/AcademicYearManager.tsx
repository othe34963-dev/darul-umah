import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { CalendarRange, Plus, Trash2, Lock, Unlock, Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

interface AcademicYear {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  isActive: boolean;
  _count: {
    students: number;
    classes: number;
    marks: number;
    attendances: number;
    fees: number;
  };
}

interface AcademicYearManagerProps {
  language: "en" | "so";
  t: (en: string, so: string) => string;
}

export default function AcademicYearManager({ language, t }: AcademicYearManagerProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [newYearName, setNewYearName] = useState("");
  const [newYearStartDate, setNewYearStartDate] = useState("");
  const [newYearEndDate, setNewYearEndDate] = useState("");

  // Fetch academic years
  const { data: academicYears = [], isLoading } = useQuery({
    queryKey: ["academic-years"],
    queryFn: async () => {
      const token = localStorage.getItem("du_token");
      const response = await fetch("/api/academic-years", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error("Failed to fetch academic years");
      return response.json();
    },
  });

  // Create new academic year
  const createYearMutation = useMutation({
    mutationFn: async (data: { name: string; startDate: string; endDate: string }) => {
      const token = localStorage.getItem("du_token");
      const response = await fetch("/api/academic-years", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to create academic year");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["academic-years"] });
      toast({
        title: t("Success", "Guul"),
        description: t("Academic year created successfully", "Sanadka dugsiga waa la sameeyay"),
      });
      setNewYearName("");
      setNewYearStartDate("");
      setNewYearEndDate("");
    },
    onError: (error: any) => {
      toast({
        title: t("Error", "Qalad"),
        description: error.message || t("Failed to create academic year", "Khalad ayaa dhacay"),
        variant: "destructive",
      });
    },
  });

  // Update academic year
  const updateYearMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const token = localStorage.getItem("du_token");
      const response = await fetch(`/api/academic-years/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to update academic year");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["academic-years"] });
      toast({
        title: t("Success", "Guul"),
        description: t("Academic year updated successfully", "Sanadka dugsiga waa la cusboonaysiiyay"),
      });
    },
    onError: (error: any) => {
      toast({
        title: t("Error", "Qalad"),
        description: error.message || t("Failed to update academic year", "Khalad ayaa dhacay"),
        variant: "destructive",
      });
    },
  });

  // Set current academic year
  const setCurrentMutation = useMutation({
    mutationFn: async (id: string) => {
      const token = localStorage.getItem("du_token");
      const response = await fetch(`/api/academic-years/${id}/set-current`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error("Failed to set current academic year");
      return response.json();
    },
    onSuccess: () => {
      // Invalidate both academic years and current year queries
      queryClient.invalidateQueries({ queryKey: ["academic-years"] });
      queryClient.invalidateQueries({ queryKey: ["current-academic-year"] });
      toast({
        title: t("Success", "Guul"),
        description: t("Current academic year updated", "Sanadka dugsiga hadda waa la cusboonaysiiyay"),
      });
    },
    onError: (error: any) => {
      toast({
        title: t("Error", "Qalad"),
        description: error.message || t("Failed to set current academic year", "Khalad ayaa dhacay"),
        variant: "destructive",
      });
    },
  });

  // Delete academic year
  const deleteYearMutation = useMutation({
    mutationFn: async (id: string) => {
      const token = localStorage.getItem("du_token");
      const response = await fetch(`/api/academic-years/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error("Failed to delete academic year");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["academic-years"] });
      toast({
        title: t("Success", "Guul"),
        description: t("Academic year deleted successfully", "Sanadka dugsiga waa la tirtiray"),
      });
    },
    onError: (error: any) => {
      toast({
        title: t("Error", "Qalad"),
        description: error.message || t("Failed to delete academic year", "Khalad ayaa dhacay"),
        variant: "destructive",
      });
    },
  });

  const handleAddYear = () => {
    if (!newYearName || !newYearStartDate || !newYearEndDate) {
      toast({
        title: t("Error", "Qalad"),
        description: t("Please fill in all fields", "Fadlan buuxi dhammaan meelaha"),
        variant: "destructive",
      });
      return;
    }

    createYearMutation.mutate({
      name: newYearName,
      startDate: newYearStartDate,
      endDate: newYearEndDate,
    });
  };

  const handleToggleActive = (year: AcademicYear) => {
    updateYearMutation.mutate({
      id: year.id,
      data: { isActive: !year.isActive },
    });
  };

  const handleSetCurrent = (year: AcademicYear) => {
    if (!year.isActive) {
      toast({
        title: t("Error", "Qalad"),
        description: t("Cannot set inactive year as current", "Sanad aan firfircoonayn lama dhigikari karo"),
        variant: "destructive",
      });
      return;
    }
    setCurrentMutation.mutate(year.id);
  };

  const handleDelete = (year: AcademicYear) => {
    if (year._count.students > 0) {
      toast({
        title: t("Error", "Qalad"),
        description: t("Cannot delete academic year with students", "Sanadka dugsiga leh arday lama tirtiray karo"),
        variant: "destructive",
      });
      return;
    }
    
    if (year.isCurrent) {
      toast({
        title: t("Error", "Qalad"),
        description: t("Cannot delete current academic year", "Sanadka dugsiga hadda lama tirtiray karo"),
        variant: "destructive",
      });
      return;
    }

    deleteYearMutation.mutate(year.id);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarRange className="h-5 w-5" />
            {t("Academic Year Management", "Maamulka Sanadka Dugsiga")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p>{t("Loading...", "Waa la soo dajinayaa...")}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarRange className="h-5 w-5" />
          {t("Academic Year Management", "Maamulka Sanadka Dugsiga")}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Year Quick Actions */}
        {academicYears.length > 1 && (
          <div className="p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
            <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
              {t("Quick Actions", "Ficilka Degdeg ah")}
            </h4>
            <div className="flex flex-wrap gap-2">
              {academicYears
                .filter((year: AcademicYear) => !year.isCurrent && year.isActive)
                .map((year: AcademicYear) => (
                  <AlertDialog key={year.id}>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs"
                      >
                        <Star className="h-3 w-3 mr-1" />
                        {t("Switch to", "U gudub")} {year.name}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          {t("Switch Academic Year", "Beddel Sanadka Dugsiga")}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          {t(
                            `Switch from current year to "${year.name}"? This will make it the active year for all new operations.`,
                            `Ma beddeli kartaa sanadka hadda ilaa "${year.name}"? Tani waxay ka dhigaysaa sanadka firfircoon ee dhammaan shaqooyinka cusub.`
                          )}
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>
                          {t("Cancel", "Jooji")}
                        </AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleSetCurrent(year)}
                          disabled={setCurrentMutation.isPending}
                        >
                          {setCurrentMutation.isPending 
                            ? t("Switching...", "Waa la beddeliayaa...") 
                            : t("Switch to", "U gudub")} {year.name}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                ))}
            </div>
          </div>
        )}

        {/* Add New Year */}
        <div className="grid gap-4 p-4 border rounded-lg">
          <h4 className="font-medium">{t("Add New Academic Year", "Ku dar Sanad Dugsiga Cusub")}</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <div>
              <Label htmlFor="yearName">{t("Year Name", "Magaca Sanadka")}</Label>
              <Input
                id="yearName"
                placeholder="e.g., 2026-2027"
                value={newYearName}
                onChange={(e) => setNewYearName(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="startDate">{t("Start Date", "Taariikhda Billowga")}</Label>
              <Input
                id="startDate"
                type="date"
                value={newYearStartDate}
                onChange={(e) => setNewYearStartDate(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="endDate">{t("End Date", "Taariikhda Dhammayska")}</Label>
              <Input
                id="endDate"
                type="date"
                value={newYearEndDate}
                onChange={(e) => setNewYearEndDate(e.target.value)}
              />
            </div>
          </div>
          <Button 
            onClick={handleAddYear} 
            disabled={createYearMutation.isPending}
            className="w-fit"
          >
            <Plus className="h-4 w-4 mr-2" />
            {t("Add Year", "Ku dar Sanad")}
          </Button>
        </div>

        {/* Years List */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">
            {t("Academic Years", "Sanadaha Dugsiga")}
          </Label>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {academicYears.map((year: AcademicYear) => (
              <div
                key={year.id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{year.name}</span>
                    {year.isCurrent && (
                      <Badge variant="default" className="text-xs flex items-center gap-1">
                        <Star className="h-3 w-3" />
                        {t("Current", "Hadda")}
                      </Badge>
                    )}
                    {!year.isActive && (
                      <Badge variant="secondary" className="text-xs">
                        {t("Inactive", "Firfircoonayn")}
                      </Badge>
                    )}
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {year._count.students} {t("students", "arday")} • {year._count.classes} {t("classes", "fasalka")}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {!year.isCurrent && year.isActive && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="default"
                          size="sm"
                          className="h-8 px-3 text-xs"
                          disabled={setCurrentMutation.isPending}
                        >
                          <Star className="h-3 w-3 mr-1" />
                          {t("Set Current", "Dhig Hadda")}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            {t("Change Current Academic Year", "Beddel Sanadka Dugsiga Hadda")}
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            {t(
                              `Are you sure you want to set "${year.name}" as the current academic year? This will make it the active year for new enrollments and data entry.`,
                              `Ma hubtaa inaad doonaysid inaad "${year.name}" u dhigto sanadka dugsiga hadda? Tani waxay ka dhigaysaa sanadka firfircoon ee qorista cusub iyo xogta gelinta.`
                            )}
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>
                            {t("Cancel", "Jooji")}
                          </AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleSetCurrent(year)}
                            disabled={setCurrentMutation.isPending}
                          >
                            {setCurrentMutation.isPending 
                              ? t("Setting...", "Waa la dejiyayaa...") 
                              : t("Set as Current", "U dhig Hadda")
                            }
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                  {year.isCurrent && (
                    <div className="flex items-center gap-2">
                      <Badge variant="default" className="text-xs">
                        {t("Current Year", "Sanadka Hadda")}
                      </Badge>
                    </div>
                  )}
                  {!year.isCurrent && (
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={year.isActive}
                        onCheckedChange={() => handleToggleActive(year)}
                        disabled={updateYearMutation.isPending}
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(year)}
                        className="h-8 w-8 p-0 text-destructive"
                        disabled={deleteYearMutation.isPending || year._count.students > 0}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800">
          <p className="text-sm text-blue-900 dark:text-blue-100">
            💡 {t(
              "Only one academic year can be current at a time. Students can only be enrolled in active years.",
              "Sanad dugsiga kaliya ayaa noqon kara hadda. Ardayda waxaa lagu qori karaa sanadaha firfircoon ah kaliya."
            )}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
