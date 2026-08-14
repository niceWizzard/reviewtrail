"use server";

import { updateTag } from "next/cache";
import { createClient } from "@/src/lib/supabase/server";
import {
  convertDraftToTemplateStructure,
  transformTrackerToTemplateStructure,
  TemplateMetadataSchema,
  TemplateStructureSchema,
  validateTemplateDraft,
  type TrackerTemplate,
} from "../types/template";
import type { TrackerDraft } from "../types/builder-draft";
import type { Chapter, ExamTracker, Subject, Topic, TrackerChecklist } from "../types/database";

export async function fetchPublicTemplatesAction(): Promise<TrackerTemplate[]> {
  const supabase = await createClient();

  const { data: templates, error } = await supabase
    .from("tracker_templates")
    .select(`
      *,
      tracker_template_uses (id)
    `)
    .eq("is_public", true)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (templates || []).map((t: any) => ({
    id: t.id,
    user_id: t.user_id,
    title: t.title,
    description: t.description,
    category: t.category,
    is_public: t.is_public,
    source_tracker_id: t.source_tracker_id,
    structure: t.structure,
    use_count: Array.isArray(t.tracker_template_uses) ? t.tracker_template_uses.length : 0,
    created_at: t.created_at,
    updated_at: t.updated_at,
  }));
}

export async function fetchUserTemplatesAction(): Promise<TrackerTemplate[]> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return [];
  }

  const { data: templates, error } = await supabase
    .from("tracker_templates")
    .select(`
      *,
      tracker_template_uses (id)
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (templates || []).map((t: any) => ({
    id: t.id,
    user_id: t.user_id,
    title: t.title,
    description: t.description,
    category: t.category,
    is_public: t.is_public,
    source_tracker_id: t.source_tracker_id,
    structure: t.structure,
    use_count: Array.isArray(t.tracker_template_uses) ? t.tracker_template_uses.length : 0,
    created_at: t.created_at,
    updated_at: t.updated_at,
  }));
}

export async function createTemplateFromScratchAction(payload: {
  metadata: {
    title: string;
    description?: string | null;
    category: string;
    is_public: boolean;
  };
  draft: TrackerDraft;
}): Promise<TrackerTemplate> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error("You must be logged in to create a template.");
  }

  // Validate Metadata & Draft
  const metaResult = TemplateMetadataSchema.safeParse(payload.metadata);
  if (!metaResult.success) {
    throw new Error(metaResult.error.issues[0]?.message || "Invalid template metadata.");
  }

  const draftErr = validateTemplateDraft(payload.draft);
  if (draftErr) {
    throw new Error(draftErr);
  }

  const structure = convertDraftToTemplateStructure(payload.draft);
  const structResult = TemplateStructureSchema.safeParse(structure);
  if (!structResult.success) {
    throw new Error(structResult.error.issues[0]?.message || "Invalid template structure.");
  }

  const { data: template, error } = await supabase
    .from("tracker_templates")
    .insert({
      user_id: user.id,
      title: metaResult.data.title,
      description: metaResult.data.description || null,
      category: metaResult.data.category,
      is_public: metaResult.data.is_public,
      structure,
    })
    .select()
    .single();

  if (error || !template) {
    throw new Error(error?.message || "Failed to create template.");
  }

  updateTag("tracker_templates");
  return {
    ...template,
    use_count: 0,
  } as TrackerTemplate;
}

export async function createTemplateFromTrackerAction(payload: {
  trackerId: string;
  metadata: {
    title: string;
    description?: string | null;
    category: string;
    is_public: boolean;
  };
}): Promise<TrackerTemplate> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error("You must be logged in to create a template.");
  }

  const metaResult = TemplateMetadataSchema.safeParse(payload.metadata);
  if (!metaResult.success) {
    throw new Error(metaResult.error.issues[0]?.message || "Invalid template metadata.");
  }

  // Fetch target tracker structure
  const { data: tracker, error: trErr } = await supabase
    .from("exam_trackers")
    .select("*")
    .eq("id", payload.trackerId)
    .single();

  if (trErr || !tracker) {
    throw new Error("Tracker not found.");
  }

  const { data: dbCols } = await supabase
    .from("tracker_checklists")
    .select("*")
    .eq("exam_tracker_id", payload.trackerId);

  const { data: dbSubs } = await supabase
    .from("subjects")
    .select("*")
    .eq("exam_tracker_id", payload.trackerId);

  const { data: dbChs } = await supabase
    .from("chapters")
    .select("*")
    .eq("exam_tracker_id", payload.trackerId);

  const { data: dbTops } = await supabase
    .from("topics")
    .select("*")
    .eq("exam_tracker_id", payload.trackerId);

  const structure = transformTrackerToTemplateStructure(
    (dbSubs as Subject[]) || [],
    (dbChs as Chapter[]) || [],
    (dbTops as Topic[]) || [],
    (dbCols as TrackerChecklist[]) || []
  );

  const structResult = TemplateStructureSchema.safeParse(structure);
  if (!structResult.success) {
    throw new Error(structResult.error.issues[0]?.message || "Cannot create template from incomplete tracker.");
  }

  const { data: template, error } = await supabase
    .from("tracker_templates")
    .insert({
      user_id: user.id,
      title: metaResult.data.title,
      description: metaResult.data.description || null,
      category: metaResult.data.category,
      is_public: metaResult.data.is_public,
      source_tracker_id: payload.trackerId,
      structure,
    })
    .select()
    .single();

  if (error || !template) {
    throw new Error(error?.message || "Failed to create template from tracker.");
  }

  updateTag("tracker_templates");
  return {
    ...template,
    use_count: 0,
  } as TrackerTemplate;
}

export async function updateTemplateVisibilityAction(
  templateId: string,
  is_public: boolean
): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error("User must be authenticated.");
  }

  const { error } = await supabase
    .from("tracker_templates")
    .update({ is_public })
    .eq("id", templateId)
    .eq("user_id", user.id);

  if (error) {
    throw new Error(error.message);
  }

  updateTag("tracker_templates");
}

export async function deleteTemplateAction(templateId: string): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error("User must be authenticated.");
  }

  const { error } = await supabase
    .from("tracker_templates")
    .delete()
    .eq("id", templateId)
    .eq("user_id", user.id);

  if (error) {
    throw new Error(error.message);
  }

  updateTag("tracker_templates");
}

export async function fetchTemplateByIdAction(templateId: string): Promise<TrackerTemplate | null> {
  const supabase = await createClient();

  const { data: template, error } = await supabase
    .from("tracker_templates")
    .select(`
      *,
      tracker_template_uses (id)
    `)
    .eq("id", templateId)
    .single();

  if (error || !template) {
    return null;
  }

  return {
    id: template.id,
    user_id: template.user_id,
    title: template.title,
    description: template.description,
    category: template.category,
    is_public: template.is_public,
    source_tracker_id: template.source_tracker_id,
    structure: template.structure,
    use_count: Array.isArray(template.tracker_template_uses) ? template.tracker_template_uses.length : 0,
    created_at: template.created_at,
    updated_at: template.updated_at,
  };
}

export async function updateTemplateAction(payload: {
  templateId: string;
  metadata: {
    title: string;
    description?: string | null;
    category: string;
    is_public: boolean;
  };
  draft: TrackerDraft;
}): Promise<TrackerTemplate> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error("You must be logged in to update a template.");
  }

  const metaResult = TemplateMetadataSchema.safeParse(payload.metadata);
  if (!metaResult.success) {
    throw new Error(metaResult.error.issues[0]?.message || "Invalid template metadata.");
  }

  const draftErr = validateTemplateDraft(payload.draft);
  if (draftErr) {
    throw new Error(draftErr);
  }

  const structure = convertDraftToTemplateStructure(payload.draft);
  const structResult = TemplateStructureSchema.safeParse(structure);
  if (!structResult.success) {
    throw new Error(structResult.error.issues[0]?.message || "Invalid template structure.");
  }

  const { data: template, error } = await supabase
    .from("tracker_templates")
    .update({
      title: metaResult.data.title,
      description: metaResult.data.description || null,
      category: metaResult.data.category,
      is_public: metaResult.data.is_public,
      structure,
      updated_at: new Date().toISOString(),
    })
    .eq("id", payload.templateId)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error || !template) {
    throw new Error(error?.message || "Failed to update template.");
  }

  updateTag("tracker_templates");
  return {
    ...template,
    use_count: 0,
  } as TrackerTemplate;
}

export async function instantiateTrackerFromTemplateAction(payload: {
  templateId: string;
  exam_name: string;
  exam_date?: string | null;
}): Promise<ExamTracker> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error("User must be authenticated to create a tracker.");
  }

  const trimmedExamName = payload.exam_name.trim();
  if (!trimmedExamName) {
    throw new Error("Exam name is required.");
  }

  // 1. Fetch Template
  const { data: template, error: tmplErr } = await supabase
    .from("tracker_templates")
    .select("*")
    .eq("id", payload.templateId)
    .single();

  if (tmplErr || !template) {
    throw new Error("Template not found.");
  }

  // Security check: must be public or owned by user
  if (!template.is_public && template.user_id !== user.id) {
    throw new Error("You do not have access to this private template.");
  }

  const structure = template.structure as any;

  // 2. Insert new Exam Tracker
  const { data: tracker, error: trErr } = await supabase
    .from("exam_trackers")
    .insert({
      user_id: user.id,
      exam_name: trimmedExamName,
      exam_date: payload.exam_date || null,
      description: template.description || null,
    })
    .select()
    .single();

  if (trErr || !tracker) {
    throw new Error(trErr?.message || "Failed to instantiate tracker from template.");
  }

  // Clear default trigger checklists
  await supabase.from("tracker_checklists").delete().eq("exam_tracker_id", tracker.id);

  // 3. Copy Checklists
  const checklistRows = (structure.checklists || []).map((col: any, idx: number) => ({
    exam_tracker_id: tracker.id,
    name: col.name,
    position: col.position || idx + 1,
    color: col.color || null,
  }));
  if (checklistRows.length > 0) {
    const { error: colErr } = await supabase.from("tracker_checklists").insert(checklistRows);
    if (colErr) throw new Error(colErr.message);
  }

  // 4. Copy Subjects, Chapters, Topics
  for (let sIdx = 0; sIdx < (structure.subjects || []).length; sIdx++) {
    const sub = structure.subjects[sIdx];
    const { data: insertedSub, error: subErr } = await supabase
      .from("subjects")
      .insert({
        exam_tracker_id: tracker.id,
        name: sub.name,
        position: sub.position || sIdx + 1,
        color: sub.color || null,
      })
      .select("id")
      .single();

    if (subErr || !insertedSub) throw new Error(subErr?.message || "Failed to insert subject.");

    // Direct topics under subject
    if (sub.topics && sub.topics.length > 0) {
      const directTopicRows = sub.topics.map((t: any, tIdx: number) => ({
        exam_tracker_id: tracker.id,
        subject_id: insertedSub.id,
        chapter_id: null,
        name: t.name,
        position: t.position || tIdx + 1,
      }));
      await supabase.from("topics").insert(directTopicRows);
    }

    // Chapters under subject
    for (let cIdx = 0; cIdx < (sub.chapters || []).length; cIdx++) {
      const ch = sub.chapters[cIdx];
      const { data: insertedCh, error: chErr } = await supabase
        .from("chapters")
        .insert({
          exam_tracker_id: tracker.id,
          subject_id: insertedSub.id,
          name: ch.name,
          description: ch.description || null,
          position: ch.position || cIdx + 1,
        })
        .select("id")
        .single();

      if (chErr || !insertedCh) throw new Error(chErr?.message || "Failed to insert chapter.");

      if (ch.topics && ch.topics.length > 0) {
        const chTopicRows = ch.topics.map((t: any, tIdx: number) => ({
          exam_tracker_id: tracker.id,
          subject_id: insertedSub.id,
          chapter_id: insertedCh.id,
          name: t.name,
          position: t.position || tIdx + 1,
        }));
        await supabase.from("topics").insert(chTopicRows);
      }
    }
  }

  // 5. Log persistent usage record in tracker_template_uses
  await supabase.from("tracker_template_uses").insert({
    template_id: template.id,
    user_id: user.id,
    created_tracker_id: tracker.id,
  });

  updateTag("exam_trackers");
  updateTag("tracker_templates");
  return tracker as ExamTracker;
}
