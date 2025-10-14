import DashboardLayout from "@/components/layout/DashboardLayout";
import { useApp } from "@/context/AppContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import AcademicYearManager from "@/components/common/AcademicYearManager";

export default function SettingsPage() {
  const { language, selectedAcademicYear, isCurrentYear, currentAcademicYear, resultsPublished, setResultsPublished } = useApp();
  const navigate = useNavigate();
  
  const t = (en: string, so: string) => (language === "en" ? en : so);
  const CURRENT_YEAR = currentAcademicYear || "2024-2025";
  
  return (
    <DashboardLayout>
      <div className="max-w-2xl space-y-6">
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
                {t("Settings", "Dejinta")} ⚙️
              </h2>
              <Badge variant="outline" className="text-sm">
                {selectedAcademicYear}
              </Badge>
            </div>
            <p className="text-muted-foreground mt-1">
              {t("System settings and configuration", "Dejinta nidaamka iyo habeynta")}
            </p>
          </div>
        </div>

        {/* Current Year Notice */}
        {!isCurrentYear && (
          <div className="p-4 rounded-lg bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800">
            <p className="text-sm text-yellow-900 dark:text-yellow-100">
              ⚠️ {t("You are viewing settings for", "Waxaad eegaysaa dejinta")} <strong>{selectedAcademicYear}</strong>. 
              {t(" Results publication only applies to current year", " Daabacaadda natiijooyinka waxay khusaysaa sanadka hadda kaliya")} ({currentAcademicYear}).
            </p>
          </div>
        )}

        {/* Result Visibility Setting */}
        <Card>
          <CardHeader>
            <CardTitle>{t("Results Publication", "Daabacaadda Natiijooyinka")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border p-4 flex items-center justify-between">
              <div className="flex-1">
                <p className="font-medium">
                  {t("Publish Results (Current Year Only)", "Daabac Natiijooyinka (Sanadka Hadda Kaliya)")}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {t(
                    `Make ${currentAcademicYear} results visible on the public page for students to check.`,
                    `Ka dhig natiijooyinka ${currentAcademicYear} in la arko bogga dadweynaha si ardaydu u hubiyaan.`
                  )}
                </p>
                {isCurrentYear && (
                  <div className="mt-2">
                    <Badge variant={resultsPublished ? "default" : "secondary"} className="text-xs">
                      {resultsPublished 
                        ? t("Currently Published", "Hadda waa la daabacay")
                        : t("Currently Hidden", "Hadda waa la qariyay")
                      }
                    </Badge>
                  </div>
                )}
              </div>
              <Switch 
                checked={resultsPublished} 
                onCheckedChange={setResultsPublished}
                disabled={!isCurrentYear}
              />
            </div>

            {!isCurrentYear && (
              <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800">
                <p className="text-sm text-blue-900 dark:text-blue-100">
                  💡 {t(
                    `To publish results, switch to ${currentAcademicYear} in the header dropdown.`,
                    `Si aad u daabacdo natiijooyinka, u gudub ${currentAcademicYear} liiska kore.`
                  )}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Academic Year Management */}
        <AcademicYearManager language={language} t={t} />

        {/* School Information */}
        <Card>
          <CardHeader>
            <CardTitle>{t("School Information", "Xogta Dugsiga")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label>{t("School Name", "Magaca Dugsiga")}</Label>
                <Input value="Darul Ummah School" disabled className="bg-muted" />
              </div>
              <div className="grid gap-2">
                <Label>{t("Current Academic Year", "Sanadka Dugsiga Hadda")}</Label>
                <Input value={currentAcademicYear} disabled className="bg-muted" />
              </div>
              <div className="grid gap-2">
                <Label>{t("System Version", "Nooca Nidaamka")}</Label>
                <Input value="1.0.0" disabled className="bg-muted" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
