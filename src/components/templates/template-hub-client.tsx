"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/src/components/ui/tabs";
import { Layers, Plus, Search } from "lucide-react";
import { cn } from "@/src/lib/utils";
import type { TrackerTemplate } from "@/src/lib/types/template";
import { TemplateCard } from "./template-card";
import { InstantiateTemplateModal } from "./instantiate-template-modal";
import { TemplatePreviewModal } from "./template-preview-modal";

const CATEGORIES = ["All", "Medical", "Engineering", "Accountancy", "Law", "Nursing", "Custom"];

interface TemplateHubClientProps {
  publicTemplates: TrackerTemplate[];
  userTemplates: TrackerTemplate[];
  currentUserId?: string | null;
}

export function TemplateHubClient({
  publicTemplates: initialPublic,
  userTemplates: initialUser,
  currentUserId,
}: TemplateHubClientProps) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  const [activeTab, setActiveTab] = useState<"community" | "my-templates">("community");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const [selectedTemplate, setSelectedTemplate] = useState<TrackerTemplate | null>(null);
  const [previewingTemplate, setPreviewingTemplate] = useState<TrackerTemplate | null>(null);

  const handleRefresh = () => {
    startTransition(() => {
      router.refresh();
    });
  };

  const filterTemplates = (templates: TrackerTemplate[]) =>
    templates.filter((tmpl) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        tmpl.title.toLowerCase().includes(q) ||
        (tmpl.description && tmpl.description.toLowerCase().includes(q));
      const matchesCategory =
        selectedCategory === "All" || tmpl.category.toLowerCase() === selectedCategory.toLowerCase();
      return matchesSearch && matchesCategory;
    });

  const filteredCommunity = filterTemplates(initialPublic);
  const filteredMyTemplates = filterTemplates(initialUser);

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground flex items-center gap-2">
            <Layers className="size-5 text-primary" />
            Template Hub
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Browse community syllabi templates or create and share your own.
          </p>
        </div>

        <Button render={<Link href="/templates/new" />} size="sm" nativeButton={false} className="gap-1.5 shrink-0">
          <Plus className="size-4" /> Create Template
        </Button>
      </div>

      {/* Filter toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search templates…"
            className="pl-9 h-9 text-sm"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={cn(
                "shrink-0 rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                selectedCategory === cat
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border text-muted-foreground hover:border-foreground/40 hover:text-foreground"
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="community" value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
        <TabsList className="h-9 mb-5">
          <TabsTrigger value="community" className="text-xs">
            Community ({initialPublic.length})
          </TabsTrigger>
          <TabsTrigger value="my-templates" className="text-xs">
            My Templates ({initialUser.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="community">
          {filteredCommunity.length === 0 ? (
            <EmptyState
              icon={<Layers className="size-8 text-muted-foreground" />}
              heading="No templates found"
              body={
                searchQuery || selectedCategory !== "All"
                  ? "Try clearing your search or category filter."
                  : "Be the first to share a public review template with the community."
              }
              action={<Button render={<Link href="/templates/new" />} variant="outline" size="sm" nativeButton={false} className="gap-1.5 text-xs">
                <Plus className="size-3.5" /> Create Template
              </Button>}
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredCommunity.map((tmpl) => (
                <TemplateCard
                  key={tmpl.id}
                  template={tmpl}
                  currentUserId={currentUserId}
                  onUseTemplate={(t) => setSelectedTemplate(t)}
                  onPreviewTemplate={(t) => setPreviewingTemplate(t)}
                  onRefresh={handleRefresh}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="my-templates">
          {!currentUserId ? (
            <EmptyState
              heading="Sign in to view your templates"
              body="Log in to create and manage your own review templates."
              action={<Button render={<Link href="/auth/login" />} size="sm" nativeButton={false}>Sign In</Button>}
            />
          ) : filteredMyTemplates.length === 0 ? (
            <EmptyState
              icon={<Layers className="size-8 text-muted-foreground" />}
              heading="No templates yet"
              body={
                searchQuery || selectedCategory !== "All"
                  ? "Try clearing your search or category filter."
                  : "Create a template from scratch or save one from an active tracker."
              }
              action={<Button render={<Link href="/templates/new" />} size="sm" nativeButton={false} className="gap-1.5 text-xs">
                <Plus className="size-3.5" /> Create Template
              </Button>}
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredMyTemplates.map((tmpl) => (
                <TemplateCard
                  key={tmpl.id}
                  template={tmpl}
                  currentUserId={currentUserId}
                  onUseTemplate={(t) => setSelectedTemplate(t)}
                  onPreviewTemplate={(t) => setPreviewingTemplate(t)}
                  onRefresh={handleRefresh}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <TemplatePreviewModal
        template={previewingTemplate}
        isOpen={!!previewingTemplate}
        onClose={() => setPreviewingTemplate(null)}
        onUseTemplate={(t) => {
          setPreviewingTemplate(null);
          setSelectedTemplate(t);
        }}
      />

      <InstantiateTemplateModal
        template={selectedTemplate}
        isOpen={!!selectedTemplate}
        onClose={() => setSelectedTemplate(null)}
      />
    </div>
  );
}

function EmptyState({
  icon,
  heading,
  body,
  action,
}: {
  icon?: React.ReactNode;
  heading: string;
  body: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 border border-dashed border-border rounded-lg text-center">
      {icon}
      <p className="text-sm font-medium text-foreground">{heading}</p>
      <p className="text-xs text-muted-foreground max-w-xs">{body}</p>
      {action}
    </div>
  );
}
