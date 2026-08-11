import Link from "next/link";
import { 
  GraduationCap, 
  Target, 
  Brain, 
  Sparkles, 
  Layers, 
  ShieldCheck, 
  BookOpen, 
  Award, 
  CheckCircle2, 
  Heart,
  ArrowRight,
  TrendingUp
} from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/src/components/ui/card";
import { Separator } from "@/src/components/ui/separator";

export const metadata = {
  title: "About ReviewTrail — Built for Board Exam Candidates",
  description: "Learn about ReviewTrail's mission, spaced repetition tracking methodology, and how we help examinees pass their licensure exams.",
};

const TIMELINE = [
  {
    year: "2024",
    title: "The Spreadsheet Chaos",
    description: "Started as a single shared Google Sheet among study buddies preparing for the PLE and CPA board exams. We quickly realized generic columns couldn't calculate subject weightings or spaced repetition dates.",
  },
  {
    year: "2025",
    title: "Community Expansion",
    description: "Word spread across medical schools, engineering departments, and accountancy batches. We built pre-loaded syllabi for 50+ licensure exams and incorporated PRC Table of Specifications (TOS).",
  },
  {
    year: "2026",
    title: "ReviewTrail Platform",
    description: "Launched the full ReviewTrail web platform featuring an interactive custom tracker builder, spaced repetition intervals, QBank mock exam analytics, and a template hub for study groups.",
  },
];

const VALUES = [
  {
    title: "Autonomy First",
    description: "No two examinees study the exact same way. ReviewTrail lets you customize review phases, add custom subjects, and adapt to your review center schedule.",
    icon: Target,
  },
  {
    title: "Empirical Confidence",
    description: "Exam anxiety stems from uncertainty. We turn subjective feeling into weighted readiness metrics so you know exactly which topics need your attention today.",
    icon: TrendingUp,
  },
  {
    title: "Pedagogical Science",
    description: "Built around Active Recall, Spaced Repetition (Feynman/Leitner system), and QBank performance logs to maximize long-term memory retention.",
    icon: Brain,
  },
  {
    title: "Open & Accessible",
    description: "Board exam preparation is stressful enough. We keep ReviewTrail free for individual examinees so every candidate has access to high-yield review tools.",
    icon: ShieldCheck,
  },
];

export default function AboutPage() {
  return (
    <div className="flex flex-col gap-16 pb-16">
      {/* About Hero */}
      <section className="relative overflow-hidden pt-12 md:pt-20 pb-8 bg-gradient-to-b from-background via-muted/20 to-background border-b border-border/50">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center gap-6">
          <Badge variant="secondary" className="px-3.5 py-1 text-xs">
            <GraduationCap className="size-3.5 mr-1 text-primary" />
            Built by Examinees, for Examinees
          </Badge>

          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight max-w-3xl leading-tight">
            Replacing Board Exam Anxiety with <span className="text-primary underline underline-offset-4 decoration-primary/30">Empirical</span> Progress.
          </h1>

          <p className="max-w-2xl text-base sm:text-lg text-muted-foreground leading-relaxed">
            ReviewTrail was born from a simple realization: standard study planners don't understand the rigor, weightings, and spaced repetition needed to pass high-stakes board examinations.
          </p>

          <div className="flex items-center gap-4 pt-2">
            <Button render={<Link href="/builder" />} size="lg" className="gap-2 font-semibold">
              <Sparkles className="size-4" />
              Build Your Review Tracker
            </Button>
            <Button render={<Link href="/templates" />} variant="outline" size="lg">
              Browse Syllabi
            </Button>
          </div>
        </div>
      </section>

      {/* Mission & Story */}
      <section className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <div className="flex flex-col gap-4">
            <Badge variant="outline" className="w-fit">Our Mission</Badge>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Giving Every Candidate a Clear Path to Licensure
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Preparing for a licensure exam is one of the most intense periods of a professional's life. Reviewees spend hundreds of hours attending lectures, solving question banks, and memorizing vast syllabi.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Without structured tracking, it's easy to fall into the trap of re-reading familiar topics while unintentionally neglecting high-weight subjects. ReviewTrail provides the clarity examinees need to prioritize high-yield modules and track mastery systematically.
            </p>
          </div>

          <Card className="p-6 bg-muted/30 border-border/80 flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center font-bold">
                <Award className="size-5" />
              </div>
              <div>
                <h3 className="font-bold text-base">The ReviewTrail Method</h3>
                <span className="text-xs text-muted-foreground">3 Core Principles of Board Prep</span>
              </div>
            </div>
            <Separator />
            <ul className="flex flex-col gap-3 text-xs sm:text-sm text-foreground">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="size-4 text-emerald-500 shrink-0 mt-0.5" />
                <span><strong>Official TOS Weighting:</strong> Track progress relative to official exam percentage weightings.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="size-4 text-emerald-500 shrink-0 mt-0.5" />
                <span><strong>Multi-Pass Coverage:</strong> Log 1st Pass reading, 2nd Pass recall, and QBank practice scores separately.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="size-4 text-emerald-500 shrink-0 mt-0.5" />
                <span><strong>Smart Spaced Repetition:</strong> Automatic interval triggers so 1st-month subjects remain fresh.</span>
              </li>
            </ul>
          </Card>
        </div>
      </section>

      {/* Story Timeline */}
      <section className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex flex-col items-center text-center gap-2 mb-10">
          <Badge variant="secondary">Our Origin</Badge>
          <h2 className="text-2xl sm:text-3xl font-extrabold">From Study Group Sheet to Nationwide Platform</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TIMELINE.map((item, idx) => (
            <Card key={idx} className="relative flex flex-col justify-between border-border/80">
              <CardHeader className="gap-2">
                <Badge variant="outline" className="w-fit font-mono font-bold text-primary">{item.year}</Badge>
                <CardTitle className="text-lg font-bold">{item.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                {item.description}
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Core Values Grid */}
      <section className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex flex-col items-center text-center gap-2 mb-10">
          <Badge variant="outline">Guiding Principles</Badge>
          <h2 className="text-2xl sm:text-3xl font-extrabold">What Drives ReviewTrail</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {VALUES.map((val, idx) => {
            const Icon = val.icon;
            return (
              <Card key={idx} className="flex gap-4 p-6 items-start border-border/80">
                <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <Icon className="size-5" />
                </div>
                <div className="flex flex-col gap-1">
                  <h3 className="font-bold text-base">{val.title}</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{val.description}</p>
                </div>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Board Exam Tracks Supported */}
      <section className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 w-full">
        <div className="p-8 rounded-3xl bg-muted/40 border border-border/80 text-center flex flex-col items-center gap-6">
          <Badge variant="secondary">Supported Licensure Fields</Badge>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Syllabi Mapped For Top Board Exams</h2>
          <div className="flex flex-wrap justify-center gap-2 max-w-2xl">
            {[
              "Medicine (PLE / USMLE)",
              "Accountancy (CPA)",
              "Civil Engineering",
              "Nursing (NCLEX / NLE)",
              "Philippine Bar Exam",
              "Architecture (ALE)",
              "Electrical Engineering",
              "Mechanical Engineering",
              "Teaching (LET)",
              "Pharmacy (PhLE)",
              "Medical Technology (MTLE)",
              "Custom User Templates"
            ].map((track) => (
              <Badge key={track} variant="outline" className="px-3 py-1 text-xs bg-background">
                {track}
              </Badge>
            ))}
          </div>
          <Button render={<Link href="/templates" />} size="default" className="gap-2 font-semibold">
            Browse Syllabi Templates
            <ArrowRight className="size-4" />
          </Button>
        </div>
      </section>
    </div>
  );
}
