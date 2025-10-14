import { ReactNode } from "react";
import { Link } from "react-router-dom";
import Footer from "@/components/common/Footer";
import Logo from "@/components/common/Logo";
import LanguageToggle from "@/components/common/LanguageToggle";
import { Button } from "@/components/ui/button";
import { LogIn } from "lucide-react";
import { useApp } from "@/context/AppContext";

export default function PublicLayout({ children }: { children: ReactNode }) {
  const { language } = useApp();
  
  return (
    <div className="min-h-screen flex flex-col">
      <header className="relative">
        <div className="h-[42vh] min-h-[220px] sm:min-h-[260px] w-full bg-gradient-to-b from-primary/20 to-primary/5">
          <img
            src="https://images.unsplash.com/photo-1580587771525-78b9dba3b914?q=80&w=2070&auto=format&fit=crop"
            alt="School campus"
            className="absolute inset-0 h-full w-full object-cover object-center opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-primary/50 via-primary/30 to-background/80" />
          <div className="relative container h-full flex items-center justify-center px-3 sm:px-6">
            <div className="absolute top-3 sm:top-6 right-3 sm:right-6 flex items-center gap-2 sm:gap-3">
              <Link to="/login">
                <Button 
                  variant="default" 
                  size="sm" 
                  className="bg-white/90 hover:bg-white text-primary shadow-lg text-xs sm:text-sm px-2 sm:px-4"
                >
                  <LogIn className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden xs:inline">
                    {language === "en" ? "Staff Login" : "Soo Gal Shaqaalaha"}
                  </span>
                  <span className="xs:hidden">Login</span>
                </Button>
              </Link>
              <LanguageToggle />
            </div>
            <div className="text-center max-w-full px-2">
              <Link to="/">
                <div className="mx-auto flex items-center justify-center bg-white/80 backdrop-blur rounded-full px-3 sm:px-5 py-2 sm:py-3 shadow-lg ring-1 ring-primary/10 hover:bg-white/90 transition-colors cursor-pointer">
                  <img 
                    src="/darul-umah-logo.svg" 
                    alt="Darul Ummah School" 
                    className="h-8 w-8 sm:h-10 sm:w-10 flex-shrink-0" 
                  />
                  <span className="ml-2 sm:ml-3 text-base sm:text-xl md:text-2xl lg:text-3xl font-extrabold tracking-tight text-primary-foreground drop-shadow-[0_1px_1px_rgba(0,0,0,0.25)] text-white leading-tight">
                    Darul Ummah School Management System
                  </span>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <Footer />
    </div>
  );
}
