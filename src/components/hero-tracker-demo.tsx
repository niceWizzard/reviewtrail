"use client";

import * as React from "react";
import { Check, ArrowRight, Calendar, Layers } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import { cn } from "@/src/lib/utils";
import Link from "next/link";

interface TopicItem {
  id: string;
  name: string;
  firstPass: boolean;
  recall: boolean;
  practice: boolean;
}

interface ChapterGroup {
  id: string;
  name: string;
  topics: TopicItem[];
}

interface SubjectItem {
  id: string;
  name: string;
  chapters: ChapterGroup[];
}

const DEMO_EXAM = {
  examName: "Physician Licensure Exam (PLE)",
  daysLeft: 64,
  subjects: [
    {
      id: "pharmacology",
      name: "Pharmacology",
      chapters: [
        {
          id: "pharm-ans",
          name: "Autonomic Nervous System",
          topics: [
            { id: "p1", name: "Cholinergic Agonists & Antagonists", firstPass: true, recall: true, practice: true },
            { id: "p2", name: "Adrenergic Agonists & Sympatholytics", firstPass: true, recall: true, practice: false },
          ],
        },
        {
          id: "pharm-cv",
          name: "Cardiovascular & Renal Pharmacology",
          topics: [
            { id: "p3", name: "Antihypertensive Agents & RAS Blockers", firstPass: true, recall: false, practice: false },
            { id: "p4", name: "Antiarrhythmics, Nitrates & Diuretics", firstPass: false, recall: false, practice: false },
          ],
        },
        {
          id: "pharm-anti",
          name: "Antimicrobial Chemotherapy",
          topics: [
            { id: "p5", name: "Cell Wall Inhibitors (Beta-Lactams)", firstPass: true, recall: true, practice: true },
            { id: "p6", name: "Protein Synthesis Inhibitors & Resistance", firstPass: false, recall: false, practice: false },
          ],
        },
      ],
    },
    {
      id: "medicine",
      name: "Internal Medicine",
      chapters: [
        {
          id: "med-cardio",
          name: "Cardiology",
          topics: [
            { id: "m1", name: "Ischemic Heart Disease & ACS", firstPass: true, recall: true, practice: true },
            { id: "m2", name: "Heart Failure & Valvular Lesions", firstPass: true, recall: false, practice: false },
            { id: "m3", name: "ECG Interpretation & Arrhythmias", firstPass: true, recall: true, practice: false },
          ],
        },
        {
          id: "med-pulmo",
          name: "Pulmonology",
          topics: [
            { id: "m4", name: "Asthma, COPD & Obstructive Diseases", firstPass: true, recall: false, practice: false },
            { id: "m5", name: "Community-Acquired Pneumonia & TB", firstPass: false, recall: false, practice: false },
          ],
        },
        {
          id: "med-endo",
          name: "Endocrinology & Nephrology",
          topics: [
            { id: "m6", name: "Diabetes Mellitus & Thyroid Disorders", firstPass: true, recall: true, practice: true },
            { id: "m7", name: "Acute Kidney Injury & Glomerulonephritis", firstPass: false, recall: false, practice: false },
          ],
        },
      ],
    },
    {
      id: "surgery",
      name: "Surgery",
      chapters: [
        {
          id: "surg-gi",
          name: "General & Gastrointestinal Surgery",
          topics: [
            { id: "s1", name: "Acute Abdomen & Appendicitis", firstPass: true, recall: true, practice: true },
            { id: "s2", name: "Gallbladder & Biliary Tract Diseases", firstPass: true, recall: false, practice: false },
            { id: "s3", name: "Intestinal Obstruction & Hernias", firstPass: false, recall: false, practice: false },
          ],
        },
        {
          id: "surg-trauma",
          name: "Trauma & Perioperative Care",
          topics: [
            { id: "s4", name: "Advanced Trauma Life Support (ATLS)", firstPass: true, recall: true, practice: false },
            { id: "s5", name: "Surgical Infection, Sepsis & Burns", firstPass: false, recall: false, practice: false },
          ],
        },
      ],
    },
  ] as SubjectItem[],
};

export function HeroTrackerDemo() {
  const [selectedSubjectId, setSelectedSubjectId] = React.useState<string>("pharmacology");
  const [subjects, setSubjects] = React.useState<SubjectItem[]>(DEMO_EXAM.subjects);

  const currentSubject = subjects.find((s) => s.id === selectedSubjectId) || subjects[0];

  const toggleCheck = (
    subjectId: string,
    chapterId: string,
    topicId: string,
    column: "firstPass" | "recall" | "practice"
  ) => {
    setSubjects((prev) =>
      prev.map((sub) => {
        if (sub.id !== subjectId) return sub;
        const nextChapters = sub.chapters.map((ch) => {
          if (ch.id !== chapterId) return ch;
          const nextTopics = ch.topics.map((t) => {
            if (t.id !== topicId) return t;
            return { ...t, [column]: !t[column] };
          });
          return { ...ch, topics: nextTopics };
        });
        return { ...sub, chapters: nextChapters };
      })
    );
  };

  // Calculate total checks completed across the entire exam tracker
  const allTopics = subjects.flatMap((s) => s.chapters.flatMap((c) => c.topics));
  const totalSlots = allTopics.length * 3;
  const completedSlots = allTopics.reduce((acc, t) => {
    let count = 0;
    if (t.firstPass) count++;
    if (t.recall) count++;
    if (t.practice) count++;
    return acc + count;
  }, 0);

  const percentage = Math.round((completedSlots / (totalSlots || 1)) * 100);

  const selectItems = subjects.map((sub) => {
    const count = sub.chapters.reduce((acc, c) => acc + c.topics.length, 0);
    return {
      value: sub.id,
      label: `${sub.name} (${count} topics)`,
    };
  });

  return (
    <Card className="w-full shadow-lg border border-border bg-card overflow-hidden">
      <CardHeader className="bg-muted/30 pb-0 border-b border-border/80">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3">
          <div>
            <Badge variant="outline" className="text-xs font-medium text-muted-foreground mb-1">
              Live Preview
            </Badge>
            <CardTitle className="text-base sm:text-lg font-bold">
              {DEMO_EXAM.examName}
            </CardTitle>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 bg-background px-2.5 py-1 rounded-md border border-border text-xs font-medium text-muted-foreground">
              <Calendar className="size-3.5 text-primary" />
              <span>{DEMO_EXAM.daysLeft} days left</span>
            </div>
            <div className="flex items-center gap-1.5 bg-primary/10 text-primary px-2.5 py-1 rounded-md font-semibold text-xs">
              <span>{percentage}% Done</span>
            </div>
          </div>
        </div>

        {/* Mobile: Shadcn Select Subject Dropdown */}
        <div className="sm:hidden pb-3">
          <Select
            items={selectItems}
            value={selectedSubjectId}
            onValueChange={(val) => val && setSelectedSubjectId(val)}
          >
            <SelectTrigger className="w-full bg-background border-border">
              <SelectValue placeholder="Choose subject..." />
            </SelectTrigger>
            <SelectContent>
              {subjects.map((sub) => {
                const count = sub.chapters.reduce((acc, c) => acc + c.topics.length, 0);
                return (
                  <SelectItem
                    key={sub.id}
                    value={sub.id}
                    label={`${sub.name} (${count} topics)`}
                  >
                    {sub.name} ({count} topics)
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>

        {/* Desktop / Tablet: Tab Bar */}
        <div className="hidden sm:flex items-center gap-1 overflow-x-auto max-w-full -mb-px" role="tablist">
          {subjects.map((sub) => {
            const isActive = sub.id === selectedSubjectId;
            const topicCount = sub.chapters.reduce((acc, c) => acc + c.topics.length, 0);
            return (
              <button
                key={sub.id}
                role="tab"
                aria-selected={isActive}
                onClick={() => setSelectedSubjectId(sub.id)}
                className={cn(
                  "relative flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-t-lg transition-all border-t border-x cursor-pointer shrink-0",
                  isActive
                    ? "bg-card text-foreground border-border shadow-xs z-10 font-bold -mb-[1px] bg-clip-padding border-b-transparent"
                    : "bg-muted/50 text-muted-foreground border-transparent hover:bg-muted hover:text-foreground border-b border-b-border"
                )}
              >
                <span>{sub.name}</span>
                <span
                  className={cn(
                    "text-[10px] px-1 py-0.2 rounded-full font-normal",
                    isActive
                      ? "bg-primary/10 text-primary font-medium"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {topicCount}
                </span>
              </button>
            );
          })}
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-5 flex flex-col gap-4">
        {/* Progress Bar */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Overall Exam Progress</span>
            <span className="font-medium text-foreground">
              {completedSlots} of {totalSlots} checklist steps
            </span>
          </div>
          <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
            <div
              className="bg-primary h-full transition-all duration-300 rounded-full"
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>

        {/* Interactive Table */}
        <div className="border border-border/80 rounded-lg overflow-hidden text-xs">
          {/* Table Header */}
          <div className="grid grid-cols-12 bg-muted/50 p-2.5 font-semibold text-muted-foreground border-b border-border/80">
            <span className="col-span-6">CHAPTER / TOPIC</span>
            <span className="col-span-2 text-center">1ST PASS</span>
            <span className="col-span-2 text-center">RECALL</span>
            <span className="col-span-2 text-center">PRACTICE</span>
          </div>

          {/* Table Body */}
          <div className="divide-y divide-border/60">
            {currentSubject.chapters.map((chapter) => (
              <div key={chapter.id} className="flex flex-col">
                {/* Chapter Subhead */}
                <div className="bg-muted/30 px-3 py-2 font-semibold text-xs text-foreground flex items-center gap-1.5 border-b border-border/40">
                  <Layers className="size-3.5 text-primary shrink-0" />
                  <span>{chapter.name}</span>
                </div>

                {/* Topics under Chapter */}
                {chapter.topics.map((t) => (
                  <div
                    key={t.id}
                    className="grid grid-cols-12 items-center p-2.5 hover:bg-muted/30 transition-colors"
                  >
                    <span className="col-span-6 font-medium text-foreground truncate pr-2 pl-4">
                      {t.name}
                    </span>

                    {/* Column 1: 1st Pass */}
                    <div className="col-span-2 flex justify-center">
                      <button
                        type="button"
                        onClick={() =>
                          toggleCheck(currentSubject.id, chapter.id, t.id, "firstPass")
                        }
                        className={cn(
                          "size-5 rounded border flex items-center justify-center transition-colors cursor-pointer",
                          t.firstPass
                            ? "bg-primary text-primary-foreground border-primary"
                            : "border-border hover:border-foreground/40 bg-background"
                        )}
                        aria-label={`Toggle 1st Pass for ${t.name}`}
                      >
                        {t.firstPass && <Check className="size-3.5 stroke-[2.5]" />}
                      </button>
                    </div>

                    {/* Column 2: Recall */}
                    <div className="col-span-2 flex justify-center">
                      <button
                        type="button"
                        onClick={() =>
                          toggleCheck(currentSubject.id, chapter.id, t.id, "recall")
                        }
                        className={cn(
                          "size-5 rounded border flex items-center justify-center transition-colors cursor-pointer",
                          t.recall
                            ? "bg-primary text-primary-foreground border-primary"
                            : "border-border hover:border-foreground/40 bg-background"
                        )}
                        aria-label={`Toggle Recall for ${t.name}`}
                      >
                        {t.recall && <Check className="size-3.5 stroke-[2.5]" />}
                      </button>
                    </div>

                    {/* Column 3: Practice */}
                    <div className="col-span-2 flex justify-center">
                      <button
                        type="button"
                        onClick={() =>
                          toggleCheck(currentSubject.id, chapter.id, t.id, "practice")
                        }
                        className={cn(
                          "size-5 rounded border flex items-center justify-center transition-colors cursor-pointer",
                          t.practice
                            ? "bg-primary text-primary-foreground border-primary"
                            : "border-border hover:border-foreground/40 bg-background"
                        )}
                        aria-label={`Toggle Practice for ${t.name}`}
                      >
                        {t.practice && <Check className="size-3.5 stroke-[2.5]" />}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </CardContent>

      <CardFooter className="bg-muted/10 px-4 sm:px-5 py-3 border-t border-border/80 flex items-center justify-between gap-3 text-xs text-muted-foreground">
        <span>Click tabs to switch subjects, and click checkboxes to log progress.</span>
        <Button
          render={<Link href="/builder" />}
          size="xs"
          variant="default"
          className="gap-1 font-medium"
          nativeButton={false}
        >
          Create Tracker
          <ArrowRight className="size-3" />
        </Button>
      </CardFooter>
    </Card>
  );
}
