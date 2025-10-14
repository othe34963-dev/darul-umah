import { createContext, useContext, useMemo, useState, ReactNode, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";

export type Role = "admin" | "teacher" | null;
export type Language = "en" | "so";

export interface UserState {
  role: Role;
  id?: string;
  token?: string;
}

export interface SubjectMark { subject: string; mark: number; }
export interface StudentResult {
  id: string;
  name: string;
  className: string;
  year: string;
  subjects: SubjectMark[];
}

export interface AppContextState {
  user: UserState;
  setUser: (user: UserState) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  selectedAcademicYear: string;
  setSelectedAcademicYear: (year: string) => void;
  resultsPublished: boolean; // controls public results visibility for CURRENT year only
  setResultsPublished: (v: boolean) => void;
  isCurrentYear: boolean; // true if selected year is current
  currentAcademicYear: string | null; // current year from database
  results: Record<string, StudentResult>;
  upsertResult: (res: StudentResult) => void;
  removeResult: (id: string) => void;
}

const AppContext = createContext<AppContextState | undefined>(undefined);

const LS_KEYS = {
  lang: "du_lang",
  role: "du_role",
  token: "du_token",
  academicYear: "du_academic_year",
  results: "du_results_published",
  resultsStore: "du_results_store_json",
  studentsStore: "du_students_store_json",
  marksStore: "du_marks_store_json",
  attendanceStore: "du_attendance_store_json",
  // Year-specific data storage
  yearData: "du_year_data_json",
};

// Available academic years
export const ACADEMIC_YEARS = [
  "2017-2018", "2018-2019", "2019-2020", "2020-2021", 
  "2021-2022", "2022-2023", "2023-2024", "2024-2025", "2025-2026"
];

// Initialize sample data for each academic year
const initializeYearData = () => {
  try {
    const existing = localStorage.getItem(LS_KEYS.yearData);
    if (existing) return JSON.parse(existing);
  } catch {}

  const yearData: Record<string, any> = {};
  
  ACADEMIC_YEARS.forEach((year, index) => {
    const yearNum = year.split('-')[0];
    const isCurrentYear = year === "2024-2025";
    const isFutureYear = year === "2025-2026";
    
    // Generate sample students for each year
    const sampleStudents = [];
    const studentCount = isCurrentYear ? 8 : Math.floor(Math.random() * 15) + 5; // 5-20 students per year
    
    for (let i = 1; i <= studentCount; i++) {
      const studentId = `DU-${yearNum}-${String(i).padStart(3, '0')}`;
      const names = [
        "Ahmed Hassan Ali", "Fatima Omar Mohamed", "Hassan Ahmed Yusuf", "Khadija Yusuf Hassan",
        "Mohamed Ali Omar", "Aisha Ahmed Hassan", "Omar Yusuf Ali", "Hawa Mohamed Hassan",
        "Ibrahim Hassan Omar", "Maryam Ahmed Yusuf", "Yusuf Omar Hassan", "Amina Ali Mohamed",
        "Abdi Hassan Ahmed", "Sahra Omar Yusuf", "Ali Mohamed Hassan", "Fadumo Ahmed Omar",
        "Hassan Yusuf Ali", "Khadra Mohamed Hassan", "Omar Ahmed Yusuf", "Zahra Hassan Omar"
      ];
      
      const classes = ["1aad", "2aad", "3aad", "4aad", "5aad", "6aad", "7aad", "8aad", "Form 1", "Form 2", "Form 3", "Form 4"];
      
      sampleStudents.push({
        id: `${year}-${i}`,
        studentId,
        name: names[(i - 1) % names.length],
        gender: i % 2 === 0 ? "female" : "male",
        className: classes[Math.floor(Math.random() * classes.length)],
        email: `student${i}@${year.replace('-', '')}.edu`,
        phone: `+252 61 ${String(Math.floor(Math.random() * 900) + 100).padStart(3, '0')} ${String(Math.floor(Math.random() * 9000) + 1000)}`,
        parentPhone: `+252 61 ${String(Math.floor(Math.random() * 900) + 100).padStart(3, '0')} ${String(Math.floor(Math.random() * 9000) + 1000)}`,
        academicYear: year,
        photoUrl: ""
      });
    }
    
    yearData[year] = {
      students: sampleStudents,
      isActive: !isFutureYear, // Future years are inactive by default
      isCurrent: isCurrentYear,
      createdAt: new Date().toISOString()
    };
  });
  
  localStorage.setItem(LS_KEYS.yearData, JSON.stringify(yearData));
  return yearData;
};

export function AppProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>(() => {
    const v = localStorage.getItem(LS_KEYS.lang) as Language | null;
    return v ?? "en";
  });
  const [user, setUser] = useState<UserState>(() => {
    const role = (localStorage.getItem(LS_KEYS.role) as Role | null) ?? null;
    const token = localStorage.getItem(LS_KEYS.token) ?? undefined;
    return { role, token };
  });
  const [selectedAcademicYear, setSelectedAcademicYear] = useState<string>(() => {
    const v = localStorage.getItem(LS_KEYS.academicYear);
    return v ?? "2024-2025";
  });

  // Fetch current academic year from database
  const { data: currentYearData } = useQuery({
    queryKey: ["current-academic-year"],
    queryFn: async () => {
      const response = await fetch("/api/academic-years/current");
      if (!response.ok) return null;
      return response.json();
    },
    enabled: !!user.token,
  });

  const currentAcademicYear = currentYearData?.name || "2024-2025";
  const isCurrentYear = selectedAcademicYear === currentAcademicYear;

  
  // Results published ONLY applies to current year
  const [resultsPublished, setResultsPublished] = useState<boolean>(() => {
    const v = localStorage.getItem(LS_KEYS.results);
    return v ? v === "1" : false;
  });

  const defaultResults: Record<string, StudentResult> = {
    "DU-2025-001": {
      id: "DU-2025-001",
      name: "Ayaan Ali",
      className: "8aad",
      year: "2024-2025",
      subjects: [
        { subject: "Mathematics", mark: 88 },
        { subject: "English", mark: 81 },
        { subject: "Somali", mark: 90 },
        { subject: "Physics", mark: 79 },
        { subject: "Chemistry", mark: 84 },
      ],
    },
    "DU-2025-002": {
      id: "DU-2025-002",
      name: "Fatima Omar",
      className: "8aad",
      year: "2024-2025",
      subjects: [
        { subject: "Mathematics", mark: 92 },
        { subject: "English", mark: 85 },
        { subject: "Somali", mark: 88 },
        { subject: "Biology", mark: 90 },
        { subject: "History", mark: 87 },
      ],
    },
    "DU-2025-003": {
      id: "DU-2025-003",
      name: "Hassan Ahmed",
      className: "Form 1",
      year: "2024-2025",
      subjects: [
        { subject: "Mathematics", mark: 75 },
        { subject: "English", mark: 78 },
        { subject: "Somali", mark: 82 },
        { subject: "Physics", mark: 73 },
        { subject: "Chemistry", mark: 80 },
      ],
    },
    "DU-2025-004": {
      id: "DU-2025-004",
      name: "Khadija Yusuf",
      className: "Form 1",
      year: "2024-2025",
      subjects: [
        { subject: "Mathematics", mark: 95 },
        { subject: "English", mark: 89 },
        { subject: "Somali", mark: 91 },
        { subject: "Biology", mark: 93 },
        { subject: "Geography", mark: 88 },
      ],
    },
    "DU-2025-005": {
      id: "DU-2025-005",
      name: "Mohamed Hassan",
      className: "5aad",
      year: "2024-2025",
      subjects: [
        { subject: "Mathematics", mark: 72 },
        { subject: "English", mark: 68 },
        { subject: "Somali", mark: 85 },
        { subject: "Biology", mark: 75 },
        { subject: "Geography", mark: 70 },
      ],
    },
  };

  const [results, setResults] = useState<Record<string, StudentResult>>(() => {
    try {
      const raw = localStorage.getItem(LS_KEYS.resultsStore);
      if (raw) return JSON.parse(raw);
    } catch {}
    return defaultResults;
  });

  useEffect(() => {
    localStorage.setItem(LS_KEYS.lang, language);
  }, [language]);

  useEffect(() => {
    localStorage.setItem(LS_KEYS.role, user.role ?? "");
    if (user.token) {
      localStorage.setItem(LS_KEYS.token, user.token);
    } else {
      localStorage.removeItem(LS_KEYS.token);
    }
  }, [user.role, user.token]);

  useEffect(() => {
    localStorage.setItem(LS_KEYS.academicYear, selectedAcademicYear);
  }, [selectedAcademicYear]);

  useEffect(() => {
    localStorage.setItem(LS_KEYS.results, resultsPublished ? "1" : "0");
  }, [resultsPublished]);

  useEffect(() => {
    try {
      localStorage.setItem(LS_KEYS.resultsStore, JSON.stringify(results));
    } catch {}
  }, [results]);

  const upsertResult = (res: StudentResult) => {
    setResults((prev) => ({ ...prev, [res.id]: res }));
  };
  const removeResult = (id: string) => {
    setResults((prev) => {
      const n = { ...prev };
      delete n[id];
      return n;
    });
  };

  const value = useMemo(
    () => ({ user, setUser, language, setLanguage, selectedAcademicYear, setSelectedAcademicYear, isCurrentYear, currentAcademicYear, resultsPublished, setResultsPublished, results, upsertResult, removeResult }),
    [user, language, selectedAcademicYear, isCurrentYear, currentAcademicYear, resultsPublished, results]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
