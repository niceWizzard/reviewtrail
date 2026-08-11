import React, { Suspense } from "react";
import { Navbar } from "@/src/components/navbar";
import { Footer } from "@/src/components/footer";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-full flex flex-col">
      <Suspense fallback={<header className="h-16 w-full border-b border-border/60 bg-background/80" />}>
        <Navbar />
      </Suspense>
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
