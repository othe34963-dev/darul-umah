import { ReactNode, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Home, Users, GraduationCap, CalendarRange, FileSpreadsheet, IdCard, FolderArchive, Settings, LogOut, BookOpen, CalendarCheck, FileEdit, TrendingUp, User, Clock, Menu, X, Calendar, DollarSign } from "lucide-react";
import LanguageToggle from "@/components/common/LanguageToggle";
import Logo from "@/components/common/Logo";
import AcademicYearSelector from "@/components/common/AcademicYearSelector";
import { useApp } from "@/context/AppContext";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

const adminItems = [
  { to: "/dashboard", icon: Home, label: { en: "Dashboard", so: "Golaha" } },
  { to: "/dashboard/students", icon: GraduationCap, label: { en: "Students", so: "Ardayda" } },
  { to: "/dashboard/teachers", icon: Users, label: { en: "Teachers", so: "Macallimiinta" } },
  { to: "/dashboard/classes", icon: BookOpen, label: { en: "Classes", so: "Fasallada" } },
  { to: "/dashboard/subjects", icon: FileEdit, label: { en: "Subjects", so: "Maadooyinka" } },
  { to: "/dashboard/attendance", icon: CalendarCheck, label: { en: "Attendance", so: "Hoyga" } },
  { to: "/dashboard/exam-schedule", icon: Calendar, label: { en: "Exam Schedule", so: "Jadwalka Imtixaanada" } },
  { to: "/dashboard/marks", icon: FileEdit, label: { en: "Marks Approval", so: "Ansixinta Dhibcaha" } },
  { to: "/dashboard/timetable", icon: Clock, label: { en: "Timetable", so: "Jadwalka" } },
  { to: "/dashboard/results", icon: FileSpreadsheet, label: { en: "Results", so: "Natiijooyinka" } },
  { to: "/dashboard/id-cards", icon: IdCard, label: { en: "ID Cards", so: "Kaadhadhka" } },
  { to: "/dashboard/fees", icon: DollarSign, label: { en: "Fees Management", so: "Maamulka Lacagta" } },
  { to: "/dashboard/settings", icon: Settings, label: { en: "Settings", so: "Dejinta" } },
] as const;

const teacherItems = [
  { to: "/dashboard", icon: Home, label: { en: "Dashboard", so: "Golaha" } },
  { to: "/dashboard/my-classes", icon: BookOpen, label: { en: "My Classes", so: "Fasalladayda" } },
  { to: "/dashboard/timetable", icon: Clock, label: { en: "Timetable", so: "Jadwalka" } },
  { to: "/dashboard/attendance", icon: CalendarCheck, label: { en: "Attendance", so: "Hoyga" } },
  { to: "/dashboard/marks", icon: FileEdit, label: { en: "Marks Entry", so: "Gelitaanka Dhibcaha" } },
  { to: "/dashboard/profile", icon: User, label: { en: "Profile", so: "Profile" } },
] as const;

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { language, user, setUser } = useApp();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const logout = () => {
    setUser({ role: null });
    navigate("/login");
  };
  
  const items = user.role === "admin" ? adminItems : teacherItems;
  
  const NavigationMenu = ({ onClick }: { onClick?: () => void }) => (
    <nav className="p-3 space-y-1">
      {items.map((it) => {
        const Icon = it.icon;
        return (
          <NavLink
            key={it.to}
            to={it.to}
            end={it.to === "/dashboard"}
            onClick={onClick}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-md px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground transition-colors ${
                isActive ? "bg-primary text-primary-foreground hover:bg-primary" : ""
              }`
            }
          >
            <Icon className="h-4 w-4 flex-shrink-0" />
            <span className="truncate">{it.label[language]}</span>
          </NavLink>
        );
      })}
    </nav>
  );
  
  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:flex-col border-r bg-sidebar/60 backdrop-blur supports-[backdrop-filter]:bg-sidebar/40 w-[260px] h-screen sticky top-0">
        <div className="h-16 border-b flex items-center px-4 justify-between flex-shrink-0">
          <Link to="/dashboard" className="hover:opacity-90">
            <Logo />
          </Link>
          <LanguageToggle />
        </div>
        <div className="flex-1 overflow-y-auto sidebar-scroll">
          <NavigationMenu />
        </div>
      </aside>
      
      {/* Main Content Area */}
      <div className="flex-1 min-h-screen flex flex-col">
        {/* Mobile/Tablet Header */}
        <header className="h-16 border-b bg-background/60 backdrop-blur supports-[backdrop-filter]:bg-background/40 flex items-center justify-between px-3 sm:px-6 sticky top-0 z-40">
          <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
            {/* Mobile Menu Button */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="md:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[260px] p-0 flex flex-col">
                <SheetHeader className="h-16 border-b flex items-center px-4 justify-between flex-row space-y-0 flex-shrink-0">
                  <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)} className="hover:opacity-90">
                    <Logo />
                  </Link>
                  <LanguageToggle />
                </SheetHeader>
                <div className="flex-1 overflow-y-auto sidebar-scroll">
                  <NavigationMenu onClick={() => setMobileMenuOpen(false)} />
                </div>
              </SheetContent>
            </Sheet>
            
            <Link to="/dashboard" className="hover:opacity-90">
              <h1 className="text-base sm:text-xl font-semibold tracking-tight truncate">
                Darul Ummah School
              </h1>
            </Link>
            {user.role === "admin" && (
              <div className="hidden sm:block">
                <AcademicYearSelector />
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="text-xs sm:text-sm text-muted-foreground hidden lg:inline">
              {user.role === "admin" ? "Admin" : "Teacher"}
            </span>
            <Button variant="outline" size="sm" onClick={logout} className="gap-1 sm:gap-2 text-xs sm:text-sm">
              <LogOut className="h-3 w-3 sm:h-4 sm:w-4" /> 
              <span className="hidden sm:inline">Logout</span>
              <span className="sm:hidden">Out</span>
            </Button>
          </div>
        </header>
        
        {/* Mobile Academic Year Selector */}
        {user.role === "admin" && (
          <div className="sm:hidden border-b bg-muted/50 px-3 py-2">
            <AcademicYearSelector />
          </div>
        )}
        
        {/* Main Content */}
        <main className="p-3 sm:p-4 md:p-6 flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
