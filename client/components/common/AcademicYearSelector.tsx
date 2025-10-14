import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useApp } from "@/context/AppContext";
import { CalendarRange } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";

interface AcademicYear {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  isActive: boolean;
}

interface AcademicYearSelectorProps {
  className?: string;
}

export default function AcademicYearSelector({ className }: AcademicYearSelectorProps) {
  const { language, selectedAcademicYear, setSelectedAcademicYear, user } = useApp();

  const t = (en: string, so: string) => (language === "en" ? en : so);

  // Fetch academic years from database
  const { data: academicYears = [], isLoading } = useQuery({
    queryKey: ["academic-years"],
    queryFn: async () => {
      const token = localStorage.getItem("du_token");
      if (!token) return [];
      
      const response = await fetch("/api/academic-years", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) return [];
      return response.json();
    },
    enabled: !!user.token,
  });

  if (isLoading) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <CalendarRange className="h-4 w-4 text-muted-foreground" />
        <Select disabled>
          <SelectTrigger className="w-[180px] h-9 border-dashed">
            <SelectValue placeholder="Loading..." />
          </SelectTrigger>
        </Select>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <CalendarRange className="h-4 w-4 text-muted-foreground" />
      <Select value={selectedAcademicYear} onValueChange={setSelectedAcademicYear}>
        <SelectTrigger className="w-[180px] h-9 border-dashed">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {academicYears.map((year: AcademicYear) => (
            <SelectItem key={year.id} value={year.name}>
              <div className="flex items-center gap-2">
                <span>{year.name}</span>
                {year.isCurrent && (
                  <Badge variant="default" className="text-xs px-1 py-0 h-4">
                    {t("Current", "Hadda")}
                  </Badge>
                )}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

