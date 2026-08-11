"use client";

import * as React from "react";
import { 
  CheckCircle2, 
  Clock, 
  Sparkles, 
  RotateCcw, 
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  Brain,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface SubjectItem {
  id: string;
  name: string;
  weight: number; // percentage of exam
  status: "mastered" | "reviewing" | "weak";
  firstPass: boolean;
  qbankScore: number;
}

const PRESET_DATA: Record<string, { examName: string; daysLeft: number; subjects: SubjectItem[] }> = {
  ple: {
    examName: "Physician Licensure Exam (PLE)",
    daysLeft: 64,
    subjects: [
      { id: "1", name: "Anatomy & Histology", weight: 10, status: "mastered", firstPass: true, qbankScore: 88 },
      { id: "2", name: "Pharmacology & Therapeutics", weight: 10, status: "reviewing", firstPass: true, qbankScore: 74 },
      { id: "3", name: "Internal Medicine", weight: 15, status: "mastered", firstPass: true, qbankScore: 91 },
      { id: "4", name: "Pathology & Histopathology", weight: 10, status: "weak", firstPass: false, qbankScore: 58 },
      { id: "5", name: "Pediatrics & Child Health", weight: 10, status: "reviewing", firstPass: true, qbankScore: 78 },
    ],
  },
  cpa: {
    examName: "CPA Licensure Exam (CPALE)",
    daysLeft: 42,
    subjects: [
      { id: "1", name: "Financial Accounting & Reporting", weight: 15, status: "mastered", firstPass: true, qbankScore: 92 },
      { id: "2", name: "Advanced Financial Accounting", weight: 15, status: "reviewing", firstPass: true, qbankScore: 76 },
      { id: "3", name: "Auditing Theory & Practice", weight: 15, status: "weak", firstPass: false, qbankScore: 62 },
      { id: "4", name: "Taxation Laws & Regulations", weight: 15, status: "mastered", firstPass: true, qbankScore: 86 },
      { id: "5", name: "Management Advisory Services", weight: 15, status: "reviewing", firstPass: true, qbankScore: 80 },
    ],
  },
  ce: {
    examName: "Civil Engineering Board Exam",
    daysLeft: 88,
    subjects: [
      { id: "1", name: "Mathematics & Surveying", weight: 35, status: "mastered", firstPass: true, qbankScore: 94 },
      { id: "2", name: "Hydraulics & Geotechnical", weight: 30, status: "reviewing", firstPass: true, qbankScore: 72 },
      { id: "3", name: "Structural Design & Construction", weight: 35, status: "weak", firstPass: false, qbankScore: 65 },
    ],
  },
  nclex: {
    examName: "NCLEX-RN Nursing Boards",
    daysLeft: 30,
    subjects: [
      { id: "1", name: "Management of Care & Safety", weight: 20, status: "mastered", firstPass: true, qbankScore: 89 },
      { id: "2", name: "Pharmacological Therapies", weight: 18, status: "reviewing", firstPass: true, qbankScore: 75 },
      { id: "3", name: "Physiological Adaptation", weight: 20, status: "mastered", firstPass: true, qbankScore: 90 },
      { id: "4", name: "Reduction of Risk Potential", weight: 18, status: "weak", firstPass: false, qbankScore: 61 },
    ],
  },
};

export function HeroTrackerDemo() {
  const [selectedExam, setSelectedExam] = React.useState<string>("ple");
  const [subjects, setSubjects] = React.useState<SubjectItem[]>(PRESET_DATA.ple.subjects);
  const [daysLeft, setDaysLeft] = React.useState<number>(PRESET_DATA.ple.daysLeft);

  const handleTabChange = (val: string) => {
    setSelectedExam(val);
    setSubjects(PRESET_DATA[val].subjects);
    setDaysLeft(PRESET_DATA[val].daysLeft);
  };

  const toggleStatus = (id: string) => {
    setSubjects((prev) =>
      prev.map((sub) => {
        if (sub.id !== id) return sub;
        const nextStatus =
          sub.status === "weak"
            ? "reviewing"
            : sub.status === "reviewing"
            ? "mastered"
            : "weak";
        return { ...sub, status: nextStatus };
      })
    );
  };

  const toggleFirstPass = (id: string) => {
    setSubjects((prev) =>
      prev.map((sub) =>
        sub.id === id ? { ...sub, firstPass: !sub.firstPass } : sub
      )
    );
  };

  // Calculate weighted readiness score
  const readinessScore = React.useMemo(() => {
    let totalScore = 0;
    subjects.forEach((sub) => {
      let multiplier = 0.5;
      if (sub.status === "reviewing") multiplier = 0.75;
      if (sub.status === "mastered") multiplier = 1.0;
      if (sub.firstPass) multiplier += 0.05;
      totalScore += (sub.qbankScore * multiplier);
    });
    return Math.min(99, Math.round(totalScore / subjects.length));
  }, [subjects]);

  const masteredCount = subjects.filter((s) => s.status === "mastered").length;

  return (
    <Card className="w-full shadow-2xl border-primary/20 bg-card/95 backdrop-blur-sm overflow-hidden">
      <CardHeader className="bg-muted/40 pb-4 border-b border-border">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-background text-xs font-mono">
                <Sparkles className="size-3 text-primary mr-1" />
                Live Interactive Demo
              </Badge>
              <span className="text-xs text-muted-foreground font-medium">Click items to interact</span>
            </div>
            <CardTitle className="text-lg font-bold mt-1">
              {PRESET_DATA[selectedExam].examName}
            </CardTitle>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 bg-background px-3 py-1.5 rounded-lg border border-border text-xs font-medium">
              <Clock className="size-3.5 text-amber-500" />
              <span>{daysLeft} Days to Board Exam</span>
            </div>
            <div className="flex items-center gap-1.5 bg-primary/10 text-primary px-3 py-1.5 rounded-lg font-bold text-xs">
              <TrendingUp className="size-3.5" />
              <span>{readinessScore}% Readiness</span>
            </div>
          </div>
        </div>

        {/* Preset Selector */}
        <div className="mt-3">
          <Tabs value={selectedExam} onValueChange={handleTabChange}>
            <TabsList className="grid grid-cols-4 w-full h-8 text-xs">
              <TabsTrigger value="ple">PLE Med</TabsTrigger>
              <TabsTrigger value="cpa">CPALE</TabsTrigger>
              <TabsTrigger value="ce">Civil Eng</TabsTrigger>
              <TabsTrigger value="nclex">NCLEX</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-6 flex flex-col gap-4">
        {/* Progress Summary Bar */}
        <div className="flex flex-col gap-2 bg-muted/30 p-3 rounded-xl border border-border/50">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold flex items-center gap-1.5">
              <Brain className="size-3.5 text-primary" />
              Syllabus Coverage: {masteredCount} of {subjects.length} Subjects Mastered
            </span>
            <span className="text-muted-foreground font-mono">{Math.round((masteredCount / subjects.length) * 100)}% Complete</span>
          </div>
          <div className="w-full bg-muted h-2.5 rounded-full overflow-hidden flex">
            <div 
              className="bg-emerald-500 transition-all duration-500 h-full" 
              style={{ width: `${(subjects.filter(s => s.status === 'mastered').length / subjects.length) * 100}%` }}
            />
            <div 
              className="bg-amber-400 transition-all duration-500 h-full" 
              style={{ width: `${(subjects.filter(s => s.status === 'reviewing').length / subjects.length) * 100}%` }}
            />
            <div 
              className="bg-rose-400 transition-all duration-500 h-full" 
              style={{ width: `${(subjects.filter(s => s.status === 'weak').length / subjects.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Interactive Subject Matrix Table */}
        <div className="flex flex-col gap-2.5">
          <div className="grid grid-cols-12 text-[11px] font-semibold text-muted-foreground px-2">
            <span className="col-span-5">SUBJECT / MODULE</span>
            <span className="col-span-3 text-center">STATUS</span>
            <span className="col-span-2 text-center">1ST PASS</span>
            <span className="col-span-2 text-right">QBANK AVG</span>
          </div>

          <div className="flex flex-col gap-2">
            {subjects.map((sub) => (
              <div 
                key={sub.id}
                className="grid grid-cols-12 items-center p-2.5 rounded-xl border border-border/60 bg-background hover:border-primary/40 transition-all text-xs"
              >
                <div className="col-span-5 flex flex-col pr-2">
                  <span className="font-semibold text-foreground truncate">{sub.name}</span>
                  <span className="text-[10px] text-muted-foreground">Exam Weight: {sub.weight}%</span>
                </div>

                <div className="col-span-3 flex justify-center">
                  <button
                    onClick={() => toggleStatus(sub.id)}
                    className="focus:outline-none transition-transform active:scale-95"
                    title="Click to toggle status"
                  >
                    {sub.status === "mastered" && (
                      <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/20 cursor-pointer gap-1 px-2 py-0.5">
                        <CheckCircle2 className="size-3" />
                        Mastered
                      </Badge>
                    )}
                    {sub.status === "reviewing" && (
                      <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30 hover:bg-amber-500/20 cursor-pointer gap-1 px-2 py-0.5">
                        <Clock className="size-3" />
                        Reviewing
                      </Badge>
                    )}
                    {sub.status === "weak" && (
                      <Badge className="bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30 hover:bg-rose-500/20 cursor-pointer gap-1 px-2 py-0.5">
                        <AlertCircle className="size-3" />
                        Needs Focus
                      </Badge>
                    )}
                  </button>
                </div>

                <div className="col-span-2 flex justify-center">
                  <button
                    onClick={() => toggleFirstPass(sub.id)}
                    className={cn(
                      "size-5 rounded border flex items-center justify-center transition-colors cursor-pointer",
                      sub.firstPass 
                        ? "bg-primary text-primary-foreground border-primary" 
                        : "border-border hover:border-muted-foreground"
                    )}
                    title="Toggle First Pass completed"
                  >
                    {sub.firstPass && <CheckCircle2 className="size-3.5" />}
                  </button>
                </div>

                <div className="col-span-2 text-right font-mono font-semibold">
                  <span className={sub.qbankScore >= 80 ? "text-emerald-600 dark:text-emerald-400" : sub.qbankScore >= 70 ? "text-amber-600 dark:text-amber-400" : "text-rose-600 dark:text-rose-400"}>
                    {sub.qbankScore}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>

      <CardFooter className="bg-muted/20 px-6 py-3 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="size-4 text-emerald-500" />
          <span>Syllabi auto-synced with official 2026 Board Table of Specifications.</span>
        </div>
        <Button render={<Link href="/builder" />} size="xs" variant="default" className="gap-1">
          Customize This Template
          <ArrowRight className="size-3" />
        </Button>
      </CardFooter>
    </Card>
  );
}
