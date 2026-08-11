import React from "react";
import { redirect } from "next/navigation";
import { User, ShieldCheck, Sparkles, BookOpen, Clock } from "lucide-react";
import { createClient } from "@/src/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { SignOutButton } from "./sign-out-button";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const username = user.user_metadata?.username || user.user_metadata?.full_name || "Examinee";

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Welcome back, {username}!
            </h1>
            <Badge variant="outline" className="gap-1 border-primary/40 text-primary">
              <ShieldCheck className="size-3" />
              Authenticated
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Manage your board exam review trackers and study progress.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <SignOutButton />
        </div>
      </div>

      {/* Account Info Shell Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <User className="size-4 text-primary" />
              User Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div>
              <span className="text-xs text-muted-foreground block font-medium">Email</span>
              <span className="font-semibold">{user.email}</span>
            </div>
            <div>
              <span className="text-xs text-muted-foreground block font-medium">User ID</span>
              <span className="font-mono text-xs text-muted-foreground truncate block">
                {user.id}
              </span>
            </div>
            <div>
              <span className="text-xs text-muted-foreground block font-medium">Last Sign In</span>
              <span className="text-xs text-muted-foreground">
                {user.last_sign_in_at
                  ? new Date(user.last_sign_in_at).toLocaleString()
                  : "Just now"}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Empty Shell Tracker Area */}
        <Card className="md:col-span-2 shadow-sm border-dashed border-2 flex flex-col justify-center items-center text-center p-8">
          <div className="size-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-4">
            <Sparkles className="size-6" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Review Tracker Dashboard Shell</h3>
          <p className="text-sm text-muted-foreground max-w-md mb-6">
            Your auth setup is active! This empty dashboard shell is ready for integrating active
            syllabus trackers, spaced repetition cards, and progress analytics.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <BookOpen className="size-3.5 text-primary" /> Active Syllabi
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Clock className="size-3.5 text-primary" /> Spaced Repetition Schedule
            </span>
          </div>
        </Card>
      </div>
    </div>
  );
}
