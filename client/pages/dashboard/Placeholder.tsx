import DashboardLayout from "@/components/layout/DashboardLayout";
import { useApp } from "@/context/AppContext";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function PlaceholderPage({ titleEN, titleSO, descriptionEN, descriptionSO }: { titleEN: string; titleSO: string; descriptionEN?: string; descriptionSO?: string; }) {
  const { language } = useApp();
  const navigate = useNavigate();
  
  const t = (en: string, so: string) => (language === "en" ? en : so);
  
  return (
    <DashboardLayout>
      <div className="max-w-3xl space-y-6">
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
            <h2 className="text-3xl font-bold tracking-tight">{language === "en" ? titleEN : titleSO}</h2>
            {descriptionEN ? (
              <p className="text-muted-foreground mt-1">{language === "en" ? descriptionEN : descriptionSO}</p>
            ) : null}
          </div>
        </div>
        <div className="mt-6 rounded-lg border p-6 bg-muted/30">
          <p className="text-sm text-muted-foreground">
            {language === "en"
              ? "This section is a placeholder. Ask to build it next to add forms, tables and actions."
              : "Qaybtani waa meel-ku-sheeg. Weydii si loo dhiso si loo daro foomam, miisas iyo ficillo."}
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}
