import { useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";

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

interface DatabaseAcademicYearSelectorProps {
  selectedYear: string;
  onYearChange: (year: string) => void;
  language: "en" | "so";
}

export default function DatabaseAcademicYearSelector({ 
  selectedYear, 
  onYearChange, 
  language 
}: DatabaseAcademicYearSelectorProps) {
  
  // Fetch academic years
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
  });

  // Find current year
  const currentYear = academicYears.find((year: AcademicYear) => year.isCurrent);
  const isCurrentYear = selectedYear === currentYear?.name;

  if (isLoading) {
    return (
      <div className="flex items-center gap-2">
        <Select disabled>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Loading..." />
          </SelectTrigger>
        </Select>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Select value={selectedYear} onValueChange={onYearChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder={language === "en" ? "Select Year" : "Dooro Sanad"} />
        </SelectTrigger>
        <SelectContent>
          {academicYears.map((year: AcademicYear) => (
            <SelectItem key={year.id} value={year.name}>
              <div className="flex items-center gap-2">
                <span>{year.name}</span>
                {year.isCurrent && (
                  <Badge variant="default" className="text-xs">
                    {language === "en" ? "Current" : "Hadda"}
                  </Badge>
                )}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {isCurrentYear && (
        <Badge variant="default" className="text-xs">
          {language === "en" ? "Current" : "Hadda"}
        </Badge>
      )}
    </div>
  );
}
