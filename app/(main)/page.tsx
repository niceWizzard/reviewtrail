import Link from "next/link";
import { 
  Plus, 
  Layers, 
  Sparkles, 
  CheckCircle2, 
  TrendingUp, 
  Brain, 
  Calendar, 
  Users, 
  Award, 
  ArrowRight,
  ShieldCheck,
  FileSpreadsheet,
  Zap,
  BookOpen,
  GraduationCap,
  ChevronRight,
  Check,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { HeroTrackerDemo } from "@/components/hero-tracker-demo";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";

const POPULAR_TEMPLATES = [
  {
    id: "ple-2026",
    category: "Medical",
    title: "Physician Licensure Exam (PLE) Master Syllabus",
    description: "Complete 12-subject Board Table of Specifications (TOS) with 1st Pass, 2nd Pass, and QBank score tracking.",
    topicsCount: 144,
    duration: "6 Months",
    passRate: "94.8% Pass Rate",
    badge: "Most Popular",
    color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  },
  {
    id: "cpale-2026",
    category: "Accountancy",
    title: "CPA Licensure Exam (CPALE) 6-Subject Tracker",
    description: "FAR, AFAR, Auditing, Tax, MAS, and RFBT syllabus breakdown mapped to PRC board weightings.",
    topicsCount: 118,
    duration: "5 Months",
    passRate: "92.1% Pass Rate",
    badge: "Topnotcher Choice",
    color: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20",
  },
  {
    id: "ce-2026",
    category: "Engineering",
    title: "Civil Engineering Board Exam Review Trail",
    description: "Math & Surveying, Hydraulics & Geotechnical, and Structural Design & Construction topic logs.",
    topicsCount: 96,
    duration: "4 Months",
    passRate: "95.4% Pass Rate",
    badge: "High Yield",
    color: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  },
  {
    id: "nclex-2026",
    category: "Nursing",
    title: "NCLEX-RN Next-Gen Clinical Judgment Tracker",
    description: "Client Needs categories, NGN Case Studies, and CAT readiness scoring matrix.",
    topicsCount: 82,
    duration: "3 Months",
    passRate: "97.2% Pass Rate",
    badge: "NextGen Ready",
    color: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
  },
  {
    id: "bar-2026",
    category: "Law",
    title: "Philippine Bar Exam 8-Subject Syllabi Trail",
    description: "Remedial, Civil, Criminal, Political, Commercial, Tax, Labor, and Legal Ethics case laws tracker.",
    topicsCount: 210,
    duration: "7 Months",
    passRate: "91.0% Pass Rate",
    badge: "Comprehensive",
    color: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20",
  },
  {
    id: "let-2026",
    category: "Teaching",
    title: "Licensure Exam for Teachers (LET) GenEd & Majorship",
    description: "General Education, Professional Education, and Specialization subject mastery tracker.",
    topicsCount: 75,
    duration: "3 Months",
    passRate: "96.5% Pass Rate",
    badge: "Verified",
    color: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
  },
];

const TESTIMONIALS = [
  {
    quote: "Standard Notion templates kept cluttering up. ReviewTrail gave me the exact board exam weightings for the PLE. I could see my weak spots in Pharmacology immediately.",
    name: "Dr. Marianne Santos, MD",
    role: "PLE Oct 2025 Passer (Top 4)",
    avatar: "MS",
    exam: "PLE Medicine",
  },
  {
    quote: "Creating my own CPALE tracker with custom review center phases (First Pass, Intensive Review, Pre-Board Mocks) was seamless. I knew exactly where I stood 30 days before exam day.",
    name: "Carlos Reyes, CPA",
    role: "CPA Licensure Passer",
    avatar: "CR",
    exam: "CPALE Accountancy",
  },
  {
    quote: "The weighted readiness score feature is a lifesaver. Instead of stressing about arbitrary checkmarks, ReviewTrail computed my actual readiness based on Math & Structural weights.",
    name: "Engr. David Tan, CE",
    role: "Civil Engg Board Passer",
    avatar: "DT",
    exam: "Civil Engineering",
  },
];

export default function Home() {
  return (
    <div className="flex flex-col gap-16 md:gap-24 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 md:pt-20 pb-8 bg-gradient-to-b from-background via-muted/20 to-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Hero Text */}
            <div className="lg:col-span-6 flex flex-col gap-6 text-left">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3.5 py-1 text-xs font-semibold text-primary w-fit">
                <Sparkles className="size-3.5" />
                <span>2026 Board Exam Review Platform</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground leading-[1.1]">
                Master Your Board Exam with <span className="text-primary underline underline-offset-4 decoration-primary/40">Structured</span> Review Tracking.
              </h1>

              <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
                Ditch messy spreadsheets. Create your own custom review trail or clone topnotcher-verified templates for <strong className="text-foreground font-semibold">Medical, CPA, Engineering, NCLEX, & Bar</strong> exams.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Button render={<Link href="/builder" />} size="lg" className="gap-2 text-base font-semibold shadow-md"
                  nativeButton={false}
                >
                  <Plus data-icon="inline-start" />
                  Create Custom Tracker
                </Button>
                <Button render={<Link href="/templates" />} variant="outline" size="lg" className="gap-2 text-base font-medium"
                  nativeButton={false}
                >
                  <Layers className="size-4" />
                  Explore 350+ Syllabi
                </Button>
              </div>

              {/* Trust Badges */}
              <div className="pt-4 flex flex-wrap items-center gap-6 text-xs text-muted-foreground border-t border-border/60 mt-2">
                <div className="flex items-center gap-1.5 font-medium">
                  <CheckCircle2 className="size-4 text-emerald-500" />
                  <span>Official PRC & Board Syllabi</span>
                </div>
                <div className="flex items-center gap-1.5 font-medium">
                  <CheckCircle2 className="size-4 text-emerald-500" />
                  <span>Spaced Repetition Engine</span>
                </div>
                <div className="flex items-center gap-1.5 font-medium">
                  <CheckCircle2 className="size-4 text-emerald-500" />
                  <span>100% Free for Examinees</span>
                </div>
              </div>
            </div>

            {/* Hero Interactive Widget */}
            <div className="lg:col-span-6 w-full">
              <HeroTrackerDemo />
            </div>
          </div>
        </div>
      </section>

      {/* Quick Stats Banner */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 rounded-2xl bg-card border border-border/80 shadow-sm text-center">
          <div className="flex flex-col gap-1 p-2">
            <span className="text-3xl sm:text-4xl font-extrabold text-foreground font-mono">45,000+</span>
            <span className="text-xs sm:text-sm text-muted-foreground font-medium">Active Board Examinees</span>
          </div>
          <div className="flex flex-col gap-1 p-2 border-l border-border/60">
            <span className="text-3xl sm:text-4xl font-extrabold text-primary font-mono">350+</span>
            <span className="text-xs sm:text-sm text-muted-foreground font-medium">Ready Board Exam Syllabi</span>
          </div>
          <div className="flex flex-col gap-1 p-2 border-l border-border/60">
            <span className="text-3xl sm:text-4xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">94.2%</span>
            <span className="text-xs sm:text-sm text-muted-foreground font-medium">Average Board Pass Rate</span>
          </div>
          <div className="flex flex-col gap-1 p-2 border-l border-border/60">
            <span className="text-3xl sm:text-4xl font-extrabold text-amber-500 font-mono">4.9 / 5</span>
            <span className="text-xs sm:text-sm text-muted-foreground font-medium">Rating by Topnotchers</span>
          </div>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex flex-col items-center text-center gap-3 mb-12">
          <Badge variant="secondary" className="px-3 py-1 text-xs">Designed For Serious Reviewees</Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            How ReviewTrail Transforms Board Prep
          </h2>
          <p className="max-w-2xl text-muted-foreground text-sm sm:text-base">
            Whether you are enrolled in a review center or self-studying, build a review system tailored to your exact pace and exam syllabus.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="flex flex-col justify-between border-border/80 hover:border-primary/40 transition-all hover:shadow-md">
            <CardHeader className="gap-3">
              <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                <Brain className="size-5" />
              </div>
              <CardTitle className="text-lg font-bold">Custom Syllabus Builder</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground leading-relaxed">
              Create your own subject hierarchy, set review phases (1st Pass, Recall, Mock Exam), and assign specific question bank targets per module.
            </CardContent>
            <CardFooter className="pt-2">
              <Link href="/builder" className="text-xs font-semibold text-primary flex items-center gap-1 hover:underline">
                Build your template <ChevronRight className="size-3" />
              </Link>
            </CardFooter>
          </Card>

          <Card className="flex flex-col justify-between border-border/80 hover:border-primary/40 transition-all hover:shadow-md">
            <CardHeader className="gap-3">
              <div className="size-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                <Calendar className="size-5" />
              </div>
              <CardTitle className="text-lg font-bold">Spaced Repetition Schedule</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground leading-relaxed">
              Automatic interval alerts trigger reviews for topics you completed 14, 30, and 60 days ago so knowledge stays fresh on exam day.
            </CardContent>
            <CardFooter className="pt-2">
              <Link href="/about" className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 hover:underline">
                Learn the science <ChevronRight className="size-3" />
              </Link>
            </CardFooter>
          </Card>

          <Card className="flex flex-col justify-between border-border/80 hover:border-primary/40 transition-all hover:shadow-md">
            <CardHeader className="gap-3">
              <div className="size-10 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center font-bold">
                <TrendingUp className="size-5" />
              </div>
              <CardTitle className="text-lg font-bold">Weighted Readiness Index</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground leading-relaxed">
              Don't treat all topics equally. ReviewTrail calculates readiness based on official Board exam weightings (e.g. 35% Math vs 10% Ethics).
            </CardContent>
            <CardFooter className="pt-2">
              <Link href="/templates" className="text-xs font-semibold text-cyan-600 dark:text-cyan-400 flex items-center gap-1 hover:underline">
                See exam weights <ChevronRight className="size-3" />
              </Link>
            </CardFooter>
          </Card>

          <Card className="flex flex-col justify-between border-border/80 hover:border-primary/40 transition-all hover:shadow-md">
            <CardHeader className="gap-3">
              <div className="size-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
                <Users className="size-5" />
              </div>
              <CardTitle className="text-lg font-bold">Passer Template Hub</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground leading-relaxed">
              Browse pre-configured tracker templates shared by recent topnotchers, review centers, and study groups. Clone in 1-click.
            </CardContent>
            <CardFooter className="pt-2">
              <Link href="/templates" className="text-xs font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-1 hover:underline">
                Explore template hub <ChevronRight className="size-3" />
              </Link>
            </CardFooter>
          </Card>
        </div>
      </section>

      {/* Popular Templates Gallery */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <Badge variant="outline" className="mb-2">Exam Syllabi Library</Badge>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Popular Board Exam Templates</h2>
            <p className="text-sm text-muted-foreground mt-1">Pre-loaded with official board exam syllabi and topic weightings.</p>
          </div>
          <Button render={<Link href="/templates" />} variant="outline" size="sm"
            nativeButton={false}
          >
            View All 350+ Templates <ArrowRight className="size-3.5 ml-1" />
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {POPULAR_TEMPLATES.map((tmpl) => (
            <Card key={tmpl.id} className="flex flex-col justify-between border-border/80 hover:border-primary/40 transition-all hover:shadow-md">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <Badge variant="secondary" className="text-[11px] font-semibold">{tmpl.category}</Badge>
                  <Badge variant="outline" className={`text-[10px] ${tmpl.color}`}>{tmpl.badge}</Badge>
                </div>
                <CardTitle className="text-lg font-bold leading-snug">{tmpl.title}</CardTitle>
                <CardDescription className="text-xs leading-relaxed mt-1">{tmpl.description}</CardDescription>
              </CardHeader>
              <CardContent className="pb-3 pt-0">
                <div className="flex items-center justify-between text-xs text-muted-foreground py-2 border-y border-border/50">
                  <span className="font-medium">{tmpl.topicsCount} Topics</span>
                  <span>Target: {tmpl.duration}</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">{tmpl.passRate}</span>
                </div>
              </CardContent>
              <CardFooter className="pt-2 gap-2">
                <Button render={<Link href={`/builder?preset=${tmpl.id}`} />} size="sm" variant="default" className="w-full"
                  nativeButton={false}
                >
                  Use This Tracker
                </Button>
                <Button render={<Link href="/templates" />} size="sm" variant="outline" className="w-full"
                  nativeButton={false}
                >
                  Preview Syllabus
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </section>

      {/* Spreadsheet vs ReviewTrail Comparison */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full">
        <div className="p-8 sm:p-12 rounded-3xl bg-card border border-border/80 shadow-md">
          <div className="text-center max-w-2xl mx-auto flex flex-col gap-3 mb-10">
            <Badge variant="secondary" className="w-fit mx-auto">Why Upgrade?</Badge>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Generic Spreadsheets vs. ReviewTrail</h2>
            <p className="text-sm text-muted-foreground">Standard Excel sheets lack spaced repetition, board weighting formulas, and interactive readiness calculations.</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-border text-muted-foreground text-xs uppercase tracking-wider">
                  <th className="py-3 px-4 font-semibold">FEATURE / CAPABILITY</th>
                  <th className="py-3 px-4 font-semibold text-muted-foreground">EXCEL / NOTION SHEETS</th>
                  <th className="py-3 px-4 font-semibold text-primary">REVIEWTRAIL PLATFORM</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                <tr>
                  <td className="py-3.5 px-4 font-medium text-foreground">Official Board Exam Syllabi Templates</td>
                  <td className="py-3.5 px-4 text-muted-foreground flex items-center gap-1.5">
                    <X className="size-4 text-rose-500" /> Manual copy-paste required
                  </td>
                  <td className="py-3.5 px-4 text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1.5">
                    <Check className="size-4 text-emerald-500" /> 350+ pre-loaded 2026 syllabi
                  </td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-medium text-foreground">Weighted Exam Readiness Index</td>
                  <td className="py-3.5 px-4 text-muted-foreground flex items-center gap-1.5">
                    <X className="size-4 text-rose-500" /> Basic average only
                  </td>
                  <td className="py-3.5 px-4 text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1.5">
                    <Check className="size-4 text-emerald-500" /> Weighted by Board Exam TOS %
                  </td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-medium text-foreground">Spaced Repetition & Recall Reminders</td>
                  <td className="py-3.5 px-4 text-muted-foreground flex items-center gap-1.5">
                    <X className="size-4 text-rose-500" /> None / Manual calendar tracking
                  </td>
                  <td className="py-3.5 px-4 text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1.5">
                    <Check className="size-4 text-emerald-500" /> Automatic interval schedule
                  </td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-medium text-foreground">Custom Tracker Template Creation</td>
                  <td className="py-3.5 px-4 text-muted-foreground flex items-center gap-1.5">
                    <X className="size-4 text-rose-500" /> Complex formula writing
                  </td>
                  <td className="py-3.5 px-4 text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1.5">
                    <Check className="size-4 text-emerald-500" /> Drag, drop & custom fields
                  </td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-medium text-foreground">Mock Exam Score Correlation</td>
                  <td className="py-3.5 px-4 text-muted-foreground flex items-center gap-1.5">
                    <X className="size-4 text-rose-500" /> Static score logs
                  </td>
                  <td className="py-3.5 px-4 text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1.5">
                    <Check className="size-4 text-emerald-500" /> Interactive QBank Analytics
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex flex-col items-center text-center gap-2 mb-10">
          <Badge variant="secondary">Success Stories</Badge>
          <h2 className="text-3xl font-extrabold">Loved by Recent Board Exam Passers</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t, idx) => (
            <Card key={idx} className="flex flex-col justify-between border-border/80">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-[10px] text-primary">{t.exam}</Badge>
                  <div className="flex gap-0.5 text-amber-400 text-xs">★★★★★</div>
                </div>
              </CardHeader>
              <CardContent className="text-xs sm:text-sm text-muted-foreground leading-relaxed italic">
                "{t.quote}"
              </CardContent>
              <CardFooter className="flex items-center gap-3 pt-4 border-t border-border/50">
                <div className="size-9 rounded-full bg-primary/20 text-primary font-bold flex items-center justify-center text-xs">
                  {t.avatar}
                </div>
                <div className="flex flex-col">
                  <span className="font-semibold text-xs text-foreground">{t.name}</span>
                  <span className="text-[11px] text-muted-foreground">{t.role}</span>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      </section>

      {/* FAQ Accordion */}
      <section className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex flex-col items-center text-center gap-2 mb-8">
          <Badge variant="outline">Got Questions?</Badge>
          <h2 className="text-2xl sm:text-3xl font-bold">Frequently Asked Questions</h2>
        </div>

        <Accordion className="w-full flex flex-col gap-3">
          <AccordionItem value="faq-1" className="border rounded-xl px-4 bg-card">
            <AccordionTrigger className="text-sm font-semibold hover:no-underline">
              Can I customize an existing template for my review center's schedule?
            </AccordionTrigger>
            <AccordionContent className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Yes! Every template in ReviewTrail can be cloned and fully customized. You can add topics, adjust subject weightings to match your review center’s mock exams, rename review phases, and set custom target dates.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="faq-2" className="border rounded-xl px-4 bg-card">
            <AccordionTrigger className="text-sm font-semibold hover:no-underline">
              How does the weighted readiness score work?
            </AccordionTrigger>
            <AccordionContent className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Unlike simple checklists, ReviewTrail weights your progress based on the official Board Table of Specifications (TOS). For example, if a subject accounts for 35% of your board exam score, mastering it increases your overall readiness score proportionally more than a 5% subject.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="faq-3" className="border rounded-xl px-4 bg-card">
            <AccordionTrigger className="text-sm font-semibold hover:no-underline">
              Is ReviewTrail free for examinees?
            </AccordionTrigger>
            <AccordionContent className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Yes! ReviewTrail is 100% free for individual examinees to browse templates, create custom trackers, and monitor their review progress.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="faq-4" className="border rounded-xl px-4 bg-card">
            <AccordionTrigger className="text-sm font-semibold hover:no-underline">
              Can study groups share a single tracker template?
            </AccordionTrigger>
            <AccordionContent className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Absolutely. You can export your custom tracker configuration code or generate a shareable link so your study buddies and review batchmates can clone your exact syllabus schedule.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </section>

      {/* Call To Action Banner */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full">
        <div className="relative overflow-hidden rounded-3xl bg-primary text-primary-foreground p-8 sm:p-12 text-center flex flex-col items-center gap-6 shadow-xl">
          <Badge className="bg-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/30 border-none">
            Start Your Review Trail Today
          </Badge>

          <h2 className="text-3xl sm:text-5xl font-extrabold max-w-3xl leading-tight">
            Turn Board Exam Stress into Measured Progress.
          </h2>

          <p className="max-w-xl text-sm sm:text-base text-primary-foreground/90 leading-relaxed">
            Join thousands of examinees pacing their review with structured syllabi, active recall logs, and real-time score analytics.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button render={<Link href="/builder" />} variant="secondary" size="lg" className="font-bold text-foreground"
              nativeButton={false}
            >
              <Plus data-icon="inline-start" />
              Build Custom Tracker
            </Button>
            <Button render={<Link href="/templates" />} variant="outline" size="lg" className="border-primary-foreground/40 text-primary-foreground hover:bg-primary-foreground/10"
              nativeButton={false}
            >
              Browse Exam Syllabi
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
