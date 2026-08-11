import React from "react";
import Link from "next/link";
import { GraduationCap } from "lucide-react";
import { Badge } from "@/src/components/ui/badge";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center bg-muted/30 px-4 py-12 sm:px-6 lg:px-8">
      {/* Background Decorative Pattern */}
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px]" />

      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center">
          <Link
            href="/"
            className="flex items-center gap-2.5 transition-opacity hover:opacity-90 focus-visible:outline-none"
          >
            <div className="flex size-11 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
              <GraduationCap className="size-6" />
            </div>
            <div className="flex flex-col items-start">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-xl leading-none tracking-tight">
                  Review<span className="text-primary">Trail</span>
                </span>
                <Badge variant="secondary" className="px-1.5 py-0 text-[10px] font-semibold uppercase">
                  Board Exam
                </Badge>
              </div>
              <span className="text-xs text-muted-foreground font-medium">
                Passer-Grade Tracker Hub
              </span>
            </div>
          </Link>
        </div>

        {/* Auth Card Container */}
        {children}

        {/* Footer info line */}
        <p className="text-center text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} ReviewTrail. All rights reserved.
        </p>
      </div>
    </div>
  );
}
