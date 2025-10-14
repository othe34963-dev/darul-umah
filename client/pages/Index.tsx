import PublicLayout from "@/components/layout/PublicLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useApp, StudentResult } from "@/context/AppContext";
import { useMemo, useState } from "react";

const t = {
  title: { en: "Check Exam Results", so: "Hubi Natiijooyinka Imtixaanka" },
  subtitle: {
    en: "Enter your Student ID to view results (if published).",
    so: "Gali Aqoonsiga Ardayga si aad u aragto natiijooyinka (haddii la daabacay).",
  },
  inputPlaceholder: { en: "Enter Student ID (e.g. DU-2025-001)", so: "Geli Aqoonsiga Ardayga" },
  search: { en: "Search", so: "Raadi" },
  resultsClosed: {
    en: "Results not yet available. Please contact the school.",
    so: "Natiijo weli lama heli karo. Fadlan kala xidhiidh dugsiga.",
  },
  notFound: { en: "No results found for this ID.", so: "Lama helin natiijo Aqoonsigan." },
  student: { en: "Student", so: "Arday" },
  class: { en: "Class", so: "Fasalka" },
  year: { en: "Year", so: "Sannadka" },
  subject: { en: "Subject", so: "Maaddo" },
  mark: { en: "Mark", so: "Darajo" },
  total: { en: "Total", so: "Wadar" },
  percentage: { en: "Average %", so: "Celcelis %" },
};

function computeTotalAndPercentage(res: StudentResult) {
  const total = res.subjects.reduce((s, a) => s + a.mark, 0);
  const avg = total / res.subjects.length;
  const percentage = Math.round(avg);
  return { total, percentage };
}

export default function Index() {
  const { language, resultsPublished, isCurrentYear, selectedAcademicYear, results } = useApp();
  const [studentId, setStudentId] = useState("");
  const [searched, setSearched] = useState(false);

  const CURRENT_YEAR = "2024-2025";
  
  // Only show results if current year AND results are published
  const canShowResults = resultsPublished;
  
  const result = useMemo(() => (studentId ? results[studentId.trim()] : undefined), [studentId, results]);

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearched(true);
  };

  const labels = t;

  return (
    <PublicLayout>
      <section className="container -mt-20">
        <Card className="mx-auto max-w-2xl shadow-lg">
          <CardHeader>
            <CardTitle className="text-center text-2xl">
              {labels.title[language]}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-muted-foreground mb-4">
              {labels.subtitle[language]}
            </p>
            <form onSubmit={onSearch} className="flex flex-col sm:flex-row gap-3">
              <Input
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                placeholder={labels.inputPlaceholder[language]}
              />
              <Button type="submit" className="whitespace-nowrap">{labels.search[language]}</Button>
            </form>

            <div className="mt-6">
              {!canShowResults ? (
                <div className="rounded-md bg-yellow-50 text-yellow-900 px-4 py-3 border border-yellow-200">
                  <p className="font-medium mb-1">{labels.resultsClosed[language]}</p>
                  <p className="text-sm">
                    {language === "en" 
                      ? `Results for ${CURRENT_YEAR} are not yet published.`
                      : `Natiijooyinka ${CURRENT_YEAR} weli lama daabicin.`
                    }
                  </p>
                </div>
              ) : searched ? (
                result ? (
                  <div className="mt-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                      <div><span className="font-medium">{labels.student[language]}:</span> {result.name}</div>
                      <div><span className="font-medium">{labels.class[language]}:</span> {result.className}</div>
                      <div><span className="font-medium">{labels.year[language]}:</span> {result.year}</div>
                    </div>
                    <div className="mt-4 overflow-x-auto">
                      <table className="w-full text-sm border rounded-md overflow-hidden">
                        <thead className="bg-accent/50">
                          <tr>
                            <th className="text-left p-2 border-b">{labels.subject[language]}</th>
                            <th className="text-left p-2 border-b">{labels.mark[language]}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {result.subjects.map((s) => (
                            <tr key={s.subject} className="odd:bg-muted/30">
                              <td className="p-2 border-b">{s.subject}</td>
                              <td className="p-2 border-b">{s.mark}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="mt-3 flex items-center justify-end gap-6 text-sm">
                      {(() => {
                        const { total, percentage } = computeTotalAndPercentage(result);
                        return (
                          <>
                            <div><span className="font-semibold">{labels.total[language]}:</span> {total}</div>
                            <div>
                              <span className="font-semibold">{labels.percentage[language]}:</span>{" "}
                              <span className={`text-lg font-bold ${
                                percentage >= 85 ? 'text-green-600' : 
                                percentage >= 70 ? 'text-blue-600' : 
                                percentage >= 50 ? 'text-yellow-600' : 
                                'text-red-600'
                              }`}>
                                {percentage}%
                              </span>
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  </div>
                ) : (
                  <div className="rounded-md bg-red-50 text-red-900 px-4 py-3 border border-red-200">
                    {labels.notFound[language]}
                  </div>
                )
              ) : null}
            </div>
          </CardContent>
        </Card>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-xl border p-6 bg-white">
            <h3 className="font-semibold text-primary mb-2">Bilingual</h3>
            <p className="text-sm text-muted-foreground">Somali + English labels and content for inclusivity.</p>
          </div>
          <div className="rounded-xl border p-6 bg-white">
            <h3 className="font-semibold text-primary mb-2">Responsive</h3>
            <p className="text-sm text-muted-foreground">Optimized for phones, tablets, and desktop.</p>
          </div>
          <div className="rounded-xl border p-6 bg-white">
            <h3 className="font-semibold text-primary mb-2">Modern UI</h3>
            <p className="text-sm text-muted-foreground">Clean, warm colors inspired by Google Classroom.</p>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
