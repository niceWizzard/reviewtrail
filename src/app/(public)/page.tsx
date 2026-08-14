import Link from "next/link";
import {
  Plus,
  Layers,
  CheckCircle2,
  Calendar,
  ListTodo,
  Columns3,
  BarChart2,
  Share2,
  ArrowRight,
  ChevronRight,
  Check,
  X,
} from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/src/components/ui/card";
import { HeroTrackerDemo } from "@/src/components/hero-tracker-demo";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/src/components/ui/accordion";

const POPULAR_TEMPLATES = [
  {
    id: "ple-2026",
    category: "Medical",
    title: "Physician Licensure Exam (PLE) Syllabus",
    description:
      "Complete 12-subject board breakdown with columns for 1st Pass, 2nd Pass, and Practice Questions.",
    topicsCount: 144,
    subjectsCount: 12,
  },
  {
    id: "cpale-2026",
    category: "Accountancy",
    title: "CPA Licensure Exam (CPALE) Tracker",
    description:
      "FAR, AFAR, Auditing, Tax, MAS, and RFBT subject outlines mapped for step-by-step review.",
    topicsCount: 118,
    subjectsCount: 6,
  },
  {
    id: "ce-2026",
    category: "Engineering",
    title: "Civil Engineering Board Exam Outline",
    description:
      "Math & Surveying, Hydraulics & Geotechnical, and Structural Design topic breakdown.",
    topicsCount: 96,
    subjectsCount: 3,
  },
  {
    id: "nclex-2026",
    category: "Nursing",
    title: "NCLEX-RN Review Outline",
    description:
      "Client Needs categories, NGN Clinical Judgment cases, and topic review checkpoints.",
    topicsCount: 82,
    subjectsCount: 4,
  },
  {
    id: "bar-2026",
    category: "Law",
    title: "Philippine Bar Exam 8-Subject Outline",
    description:
      "Civil, Criminal, Political, Commercial, Remedial, Tax, Labor, and Ethics syllabus tracker.",
    topicsCount: 210,
    subjectsCount: 8,
  },
  {
    id: "let-2026",
    category: "Teaching",
    title: "Licensure Exam for Teachers (LET) Outline",
    description:
      "General Education, Professional Education, and Majorship topic checklists.",
    topicsCount: 75,
    subjectsCount: 3,
  },
];

export default function Home() {
  return (
    <div className="flex flex-col gap-16 md:gap-24 pb-16">
      {/* Hero Section */}
      <section className="relative pt-12 md:pt-20 pb-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Hero Text */}
            <div className="lg:col-span-6 flex flex-col gap-6 text-left">
              <div className="inline-flex items-center rounded-md border border-border bg-muted/50 px-3 py-1 text-xs font-medium text-muted-foreground w-fit">
                Board Exam Study Tracker
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground leading-[1.15]">
                A structured study tracker for your board exam review.
              </h1>

              <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
                Organize your exam syllabus into subjects, chapters, and topics. Add custom checklist
                columns for your review stages, track what you’ve finished, and see your progress in
                one clean table.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Button
                  render={<Link href="/builder" />}
                  size="lg"
                  className="gap-2 text-base font-semibold shadow-sm"
                  nativeButton={false}
                >
                  <Plus className="size-4" />
                  Create Custom Tracker
                </Button>
                <Button
                  render={<Link href="/templates" />}
                  variant="outline"
                  size="lg"
                  className="gap-2 text-base font-medium"
                  nativeButton={false}
                >
                  <Layers className="size-4" />
                  Browse Templates
                </Button>
              </div>

              {/* Informative Badges */}
              <div className="pt-4 flex flex-wrap items-center gap-6 text-xs text-muted-foreground border-t border-border/80 mt-2">
                <div className="flex items-center gap-1.5 font-medium">
                  <CheckCircle2 className="size-4 text-primary" />
                  <span>Free to use</span>
                </div>
                <div className="flex items-center gap-1.5 font-medium">
                  <CheckCircle2 className="size-4 text-primary" />
                  <span>Custom review columns</span>
                </div>
                <div className="flex items-center gap-1.5 font-medium">
                  <CheckCircle2 className="size-4 text-primary" />
                  <span>Exam countdown</span>
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

      {/* How It Works (3 Steps) */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex flex-col items-center text-center gap-2 mb-10">
          <Badge variant="outline" className="text-xs">
            Simple Workflow
          </Badge>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
            How ReviewTrail Works
          </h2>
          <p className="max-w-xl text-sm text-muted-foreground">
            Three simple steps to organize your board exam review and stay on schedule.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-border/80">
            <CardHeader className="gap-2">
              <div className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                1
              </div>
              <CardTitle className="text-base font-bold">Add Your Subjects & Topics</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground leading-relaxed">
              Create your outline with subjects, chapters, and topics, or clone an existing template
              to get started immediately.
            </CardContent>
          </Card>

          <Card className="border-border/80">
            <CardHeader className="gap-2">
              <div className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                2
              </div>
              <CardTitle className="text-base font-bold">Choose Your Review Columns</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground leading-relaxed">
              Set up the stages you want to track for each topic—such as First Reading, Flashcard
              Recall, Notes, or Practice Questions.
            </CardContent>
          </Card>

          <Card className="border-border/80">
            <CardHeader className="gap-2">
              <div className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                3
              </div>
              <CardTitle className="text-base font-bold">Track Your Progress</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground leading-relaxed">
              Check off items in your table as you finish them each day and watch your overall
              completion percentage update.
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Core Features Grid */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex flex-col items-center text-center gap-2 mb-10">
          <Badge variant="outline" className="text-xs">
            Features
          </Badge>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Built for Focused Study
          </h2>
          <p className="max-w-xl text-sm text-muted-foreground">
            Everything you need to keep your review organized without unnecessary complexity.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-border/80 flex flex-col justify-between">
            <CardHeader className="gap-2.5">
              <div className="size-9 rounded-lg bg-muted text-foreground flex items-center justify-center">
                <ListTodo className="size-4 text-primary" />
              </div>
              <CardTitle className="text-base font-bold">Subject Hierarchy</CardTitle>
              <CardDescription className="text-xs leading-relaxed">
                Break down large exam syllabi into neat Subjects, Chapters, and individual Topics.
              </CardDescription>
            </CardHeader>
            <CardFooter className="pt-0">
              <Link
                href="/builder"
                className="text-xs font-semibold text-primary flex items-center gap-1 hover:underline"
              >
                Open Builder <ChevronRight className="size-3" />
              </Link>
            </CardFooter>
          </Card>

          <Card className="border-border/80 flex flex-col justify-between">
            <CardHeader className="gap-2.5">
              <div className="size-9 rounded-lg bg-muted text-foreground flex items-center justify-center">
                <Columns3 className="size-4 text-primary" />
              </div>
              <CardTitle className="text-base font-bold">Custom Columns</CardTitle>
              <CardDescription className="text-xs leading-relaxed">
                Add up to 10 checklist columns per tracker with names that match your study style.
              </CardDescription>
            </CardHeader>
            <CardFooter className="pt-0">
              <Link
                href="/builder"
                className="text-xs font-semibold text-primary flex items-center gap-1 hover:underline"
              >
                Customize columns <ChevronRight className="size-3" />
              </Link>
            </CardFooter>
          </Card>

          <Card className="border-border/80 flex flex-col justify-between">
            <CardHeader className="gap-2.5">
              <div className="size-9 rounded-lg bg-muted text-foreground flex items-center justify-center">
                <BarChart2 className="size-4 text-primary" />
              </div>
              <CardTitle className="text-base font-bold">Progress Summary</CardTitle>
              <CardDescription className="text-xs leading-relaxed">
                Get a clear view of how many topics you’ve completed and your total review progress.
              </CardDescription>
            </CardHeader>
            <CardFooter className="pt-0">
              <Link
                href="/builder"
                className="text-xs font-semibold text-primary flex items-center gap-1 hover:underline"
              >
                Try live demo <ChevronRight className="size-3" />
              </Link>
            </CardFooter>
          </Card>

          <Card className="border-border/80 flex flex-col justify-between">
            <CardHeader className="gap-2.5">
              <div className="size-9 rounded-lg bg-muted text-foreground flex items-center justify-center">
                <Share2 className="size-4 text-primary" />
              </div>
              <CardTitle className="text-base font-bold">Template Sharing</CardTitle>
              <CardDescription className="text-xs leading-relaxed">
                Save your outline as a template, browse ready-made outlines, or share with classmates.
              </CardDescription>
            </CardHeader>
            <CardFooter className="pt-0">
              <Link
                href="/templates"
                className="text-xs font-semibold text-primary flex items-center gap-1 hover:underline"
              >
                Browse templates <ChevronRight className="size-3" />
              </Link>
            </CardFooter>
          </Card>
        </div>
      </section>

      {/* Popular Templates Gallery */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <Badge variant="outline" className="mb-2 text-xs">
              Template Library
            </Badge>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Sample Board Exam Outlines
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Start with a pre-configured outline or customize it for your review center.
            </p>
          </div>
          <Button
            render={<Link href="/templates" />}
            variant="outline"
            size="sm"
            nativeButton={false}
          >
            View All Templates <ArrowRight className="size-3.5 ml-1" />
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {POPULAR_TEMPLATES.map((tmpl) => (
            <Card
              key={tmpl.id}
              className="flex flex-col justify-between border-border/80 hover:border-border transition-colors"
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <Badge variant="secondary" className="text-xs font-medium">
                    {tmpl.category}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {tmpl.subjectsCount} Subjects
                  </span>
                </div>
                <CardTitle className="text-base font-bold leading-snug">{tmpl.title}</CardTitle>
                <CardDescription className="text-xs leading-relaxed mt-1">
                  {tmpl.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-3 pt-0">
                <div className="flex items-center justify-between text-xs text-muted-foreground py-2 border-t border-border/60">
                  <span>{tmpl.topicsCount} total topics</span>
                  <span className="text-foreground font-medium">3 review columns</span>
                </div>
              </CardContent>
              <CardFooter className="pt-2 gap-2">
                <Button
                  render={<Link href={`/builder?preset=${tmpl.id}`} />}
                  size="sm"
                  variant="default"
                  className="w-full font-medium"
                  nativeButton={false}
                >
                  Use Outline
                </Button>
                <Button
                  render={<Link href="/templates" />}
                  size="sm"
                  variant="outline"
                  className="w-full font-medium"
                  nativeButton={false}
                >
                  Preview
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </section>

      {/* Spreadsheets vs ReviewTrail Comparison */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full">
        <div className="p-6 sm:p-10 rounded-2xl bg-card border border-border/80">
          <div className="text-center max-w-2xl mx-auto flex flex-col gap-2 mb-8">
            <Badge variant="secondary" className="w-fit mx-auto text-xs">
              Comparison
            </Badge>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Spreadsheets vs. ReviewTrail
            </h2>
            <p className="text-sm text-muted-foreground">
              Why a dedicated review table works better than generic spreadsheets.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-border text-muted-foreground text-xs uppercase tracking-wider">
                  <th className="py-3 px-4 font-semibold">Capability</th>
                  <th className="py-3 px-4 font-semibold text-muted-foreground">
                    Generic Spreadsheets
                  </th>
                  <th className="py-3 px-4 font-semibold text-primary">ReviewTrail</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                <tr>
                  <td className="py-3.5 px-4 font-medium text-foreground">
                    Subject, Chapter & Topic Structure
                  </td>
                  <td className="py-3.5 px-4 text-muted-foreground flex items-center gap-1.5">
                    <X className="size-4 text-muted-foreground" /> Manual row formatting
                  </td>
                  <td className="py-3.5 px-4 text-foreground font-medium flex items-center gap-1.5">
                    <Check className="size-4 text-primary" /> Built-in 3-level hierarchy
                  </td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-medium text-foreground">
                    Click-to-check Progress
                  </td>
                  <td className="py-3.5 px-4 text-muted-foreground flex items-center gap-1.5">
                    <X className="size-4 text-muted-foreground" /> Requires formulas & checkbox setup
                  </td>
                  <td className="py-3.5 px-4 text-foreground font-medium flex items-center gap-1.5">
                    <Check className="size-4 text-primary" /> 1-click toggles with live summary
                  </td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-medium text-foreground">
                    Exam Date Countdown
                  </td>
                  <td className="py-3.5 px-4 text-muted-foreground flex items-center gap-1.5">
                    <X className="size-4 text-muted-foreground" /> None
                  </td>
                  <td className="py-3.5 px-4 text-foreground font-medium flex items-center gap-1.5">
                    <Check className="size-4 text-primary" /> Automatic days remaining display
                  </td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-medium text-foreground">
                    Ready-made Syllabi Templates
                  </td>
                  <td className="py-3.5 px-4 text-muted-foreground flex items-center gap-1.5">
                    <X className="size-4 text-muted-foreground" /> Manual copy-pasting
                  </td>
                  <td className="py-3.5 px-4 text-foreground font-medium flex items-center gap-1.5">
                    <Check className="size-4 text-primary" /> 1-click clone and customize
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ Accordion */}
      <section className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex flex-col items-center text-center gap-2 mb-8">
          <Badge variant="outline" className="text-xs">Questions</Badge>
          <h2 className="text-2xl sm:text-3xl font-bold">Frequently Asked Questions</h2>
        </div>

        <Accordion className="w-full flex flex-col gap-3">
          <AccordionItem value="faq-1" className="border border-border/80 rounded-xl px-4 bg-card">
            <AccordionTrigger className="text-sm font-semibold hover:no-underline">
              Can I customize my subjects and review columns?
            </AccordionTrigger>
            <AccordionContent className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Yes. You can add as many subjects, chapters, and topics as you need. You can also name
              your checklist columns whatever you prefer (such as 1st Pass, Active Recall, High Yield,
              or QBank).
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="faq-2" className="border border-border/80 rounded-xl px-4 bg-card">
            <AccordionTrigger className="text-sm font-semibold hover:no-underline">
              Is ReviewTrail free to use?
            </AccordionTrigger>
            <AccordionContent className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Yes. ReviewTrail is free for individual examinees to create trackers, browse templates,
              and track their board exam study progress.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="faq-3" className="border border-border/80 rounded-xl px-4 bg-card">
            <AccordionTrigger className="text-sm font-semibold hover:no-underline">
              Can I share my tracker template with study partners?
            </AccordionTrigger>
            <AccordionContent className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Yes. You can save your tracker outline as a template and share it so your study group
              or classmates can clone the exact same topic outline.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </section>

      {/* Call To Action Banner */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full">
        <div className="rounded-2xl bg-card border border-border/80 p-8 sm:p-12 text-center flex flex-col items-center gap-5 shadow-sm">
          <h2 className="text-2xl sm:text-4xl font-extrabold max-w-2xl leading-tight">
            Start organizing your board exam review today.
          </h2>

          <p className="max-w-lg text-sm text-muted-foreground leading-relaxed">
            Create a custom study table in minutes or start from a pre-made exam outline.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button
              render={<Link href="/builder" />}
              size="lg"
              className="font-semibold"
              nativeButton={false}
            >
              <Plus className="size-4" />
              Create Tracker
            </Button>
            <Button
              render={<Link href="/templates" />}
              variant="outline"
              size="lg"
              className="font-medium"
              nativeButton={false}
            >
              Browse Templates
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
