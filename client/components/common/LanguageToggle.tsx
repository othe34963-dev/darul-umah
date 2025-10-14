import { Button } from "@/components/ui/button";
import { useApp } from "@/context/AppContext";

export default function LanguageToggle() {
  const { language, setLanguage } = useApp();
  const toggle = () => setLanguage(language === "en" ? "so" : "en");
  return (
    <Button variant="secondary" size="sm" onClick={toggle} aria-label="Toggle language">
      {language === "en" ? "SO" : "EN"}
    </Button>
  );
}
