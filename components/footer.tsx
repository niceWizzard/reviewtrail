import Link from "next/link";
import { GraduationCap, Heart, Globe, Share2, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

export function Footer() {
  return (
    <footer className="border-t border-border/80 bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-5">
          {/* Brand Col */}
          <div className="flex flex-col gap-4 lg:col-span-2">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                <GraduationCap className="size-5" />
              </div>
              <span className="font-bold text-xl tracking-tight">
                Review<span className="text-primary">Trail</span>
              </span>
            </Link>
            <p className="max-w-sm text-sm text-muted-foreground leading-relaxed">
              Empowering board exam candidates across Medicine, Engineering, Accountancy, Law, and Nursing with structured study templates and custom review tracking.
            </p>
            <div className="flex items-center gap-2 pt-2 text-muted-foreground">
              <Button render={<a href="https://github.com" target="_blank" rel="noreferrer" aria-label="Website" />} variant="ghost" size="icon-sm">
                <Globe className="size-4" />
              </Button>
              <Button render={<a href="https://twitter.com" target="_blank" rel="noreferrer" aria-label="Share" />} variant="ghost" size="icon-sm">
                <Share2 className="size-4" />
              </Button>
              <Button render={<a href="mailto:support@reviewtrail.com" aria-label="Email support" />} variant="ghost" size="icon-sm">
                <Mail className="size-4" />
              </Button>
            </div>
          </div>

          {/* Quick Links */}
          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-semibold text-foreground">Navigation</h3>
            <ul className="flex flex-col gap-2 text-sm text-muted-foreground">
              <li>
                <Link href="/" className="hover:text-foreground transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/templates" className="hover:text-foreground transition-colors">
                  Template Hub
                </Link>
              </li>
              <li>
                <Link href="/builder" className="hover:text-foreground transition-colors">
                  Custom Tracker Builder
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-foreground transition-colors">
                  About ReviewTrail
                </Link>
              </li>
            </ul>
          </div>

          {/* Popular Categories */}
          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-semibold text-foreground">Board Exam Tracks</h3>
            <ul className="flex flex-col gap-2 text-sm text-muted-foreground">
              <li>
                <Link href="/templates?cat=medical" className="hover:text-foreground transition-colors">
                  Medical Boards (PLE / USMLE)
                </Link>
              </li>
              <li>
                <Link href="/templates?cat=cpa" className="hover:text-foreground transition-colors">
                  CPA Accountancy
                </Link>
              </li>
              <li>
                <Link href="/templates?cat=engineering" className="hover:text-foreground transition-colors">
                  Civil & Structural Engg.
                </Link>
              </li>
              <li>
                <Link href="/templates?cat=nursing" className="hover:text-foreground transition-colors">
                  NCLEX & Nursing Boards
                </Link>
              </li>
              <li>
                <Link href="/templates?cat=bar" className="hover:text-foreground transition-colors">
                  Bar Exam Syllabi
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-semibold text-foreground">Review Digest</h3>
            <p className="text-xs text-muted-foreground">
              Get monthly study techniques, high-yield review schedules, and new syllabus templates.
            </p>
            <div className="flex flex-col gap-2">
              <Input 
                type="email" 
                placeholder="examinee@university.edu" 
                className="h-8 text-xs"
              />
              <Button size="xs" className="w-full">
                Subscribe
              </Button>
            </div>
          </div>
        </div>

        <Separator className="my-8" />

        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} ReviewTrail. Designed for Board Exam Success.</p>
          <div className="flex items-center gap-1">
            <span>Crafted with</span>
            <Heart className="size-3.5 fill-primary text-primary" />
            <span>for future licensed professionals</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
