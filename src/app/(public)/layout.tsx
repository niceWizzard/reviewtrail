import React, { Suspense } from "react";
import { PublicNavbar } from "@/src/components/public-navbar";
import { Footer } from "@/src/components/footer";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-full flex flex-col">
      <Suspense fallback={<header className="h-16 w-full border-b border-border/60 bg-background/80" />}>
        <PublicNavbar />
      </Suspense>
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
