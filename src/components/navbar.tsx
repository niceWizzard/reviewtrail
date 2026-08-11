"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  GraduationCap,
  Menu,
  Sparkles,
  Layers,
  Info,
  BookOpen,
  CheckCircle2,
  LogIn,
  UserPlus,
} from "lucide-react";

import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/src/components/ui/sheet";
import { cn } from "@/src/lib/utils";

const navItems = [
  { name: "Home", href: "/", icon: BookOpen },
  { name: "Exam Templates", href: "/templates", icon: Layers },
  { name: "Tracker Builder", href: "/builder", icon: Sparkles },
  { name: "About", href: "/about", icon: Info },
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/80 backdrop-blur-md transition-colors">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <div className="flex items-center gap-6">
          <Link
            href="/"
            className="flex items-center gap-2.5 transition-opacity hover:opacity-90 focus-visible:outline-none"
          >
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
              <GraduationCap className="size-5" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-lg leading-none tracking-tight">
                  Review<span className="text-primary">Trail</span>
                </span>
                <Badge
                  variant="secondary"
                  className="px-1.5 py-0 text-[10px] font-semibold uppercase"
                >
                  Board Exam
                </Badge>
              </div>
              <span className="text-[11px] text-muted-foreground font-medium">
                Passer-Grade Tracker Hub
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                    isActive
                      ? "bg-accent text-accent-foreground font-semibold"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <Icon className="size-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right CTA and Actions */}
        <div className="flex items-center gap-2.5">
          <Button
            render={<Link href="/login" />}
            size="sm"
            className="max-md:hidden gap-1.5"
            variant="ghost"
            nativeButton={false}
          >
            <LogIn className="size-4" />
            Log In
          </Button>

          <Button
            render={<Link href="/register" />}
            size="sm"
            className="max-md:hidden gap-1.5 shadow-sm"
            nativeButton={false}
          >
            <UserPlus className="size-4" />
            Register
          </Button>

          {/* Mobile Sheet Navigation */}
          <Sheet>
            <SheetTrigger
              render={
                <Button
                  variant="outline"
                  size="icon-sm"
                  className="md:hidden"
                  aria-label="Open Navigation Menu"
                >
                  <Menu className="size-4" />
                </Button>
              }
            />
            <SheetContent side="right" className="w-[300px] sm:w-[350px] p-6">
              <SheetHeader className="text-left pb-4 border-b border-border">
                <SheetTitle className="flex items-center gap-2.5">
                  <div className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                    <GraduationCap className="size-4" />
                  </div>
                  <span className="font-bold text-base">ReviewTrail</span>
                </SheetTitle>
              </SheetHeader>
              <div className="flex flex-col gap-6 py-6">
                <div className="flex flex-col gap-1">
                  {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;
                    return (
                      <SheetClose
                        key={item.href}
                        render={
                          <Link
                            href={item.href}
                            className={cn(
                              "flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors",
                              isActive
                                ? "bg-primary text-primary-foreground"
                                : "text-muted-foreground hover:bg-muted hover:text-foreground"
                            )}
                          >
                            <Icon className="size-4" />
                            <span>{item.name}</span>
                          </Link>
                        }
                      />
                    );
                  })}
                </div>

                <div className="flex flex-col gap-2 pt-4 border-t border-border">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground px-1 mb-2">
                    <CheckCircle2 className="size-3.5 text-primary" />
                    <span>Free templates for all examinees</span>
                  </div>

                  <SheetClose
                    render={
                      <Button
                        render={<Link href="/login" />}
                        variant="outline"
                        size="default"
                        className="w-full justify-center gap-2"
                        nativeButton={false}
                      >
                        <LogIn className="size-4" />
                        Log In
                      </Button>
                    }
                  />

                  <SheetClose
                    render={
                      <Button
                        render={<Link href="/register" />}
                        size="default"
                        className="w-full justify-center gap-2"
                        nativeButton={false}
                      >
                        <UserPlus className="size-4" />
                        Register
                      </Button>
                    }
                  />
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
