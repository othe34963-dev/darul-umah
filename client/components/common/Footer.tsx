import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="mt-16 border-t bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:bg-background">
      <div className="container py-6 text-sm text-muted-foreground flex flex-col md:flex-row items-center justify-between gap-3">
        <p>© Darul Ummah School 2025 – All Rights Reserved.</p>
        <nav className="flex items-center gap-4">
          <Link to="/privacy" className="hover:text-foreground underline-offset-4 hover:underline">
            Privacy Policy
          </Link>
          <span className="text-muted-foreground">|</span>
          <Link to="/terms" className="hover:text-foreground underline-offset-4 hover:underline">
            Terms of Use
          </Link>
        </nav>
      </div>
    </footer>
  );
}
