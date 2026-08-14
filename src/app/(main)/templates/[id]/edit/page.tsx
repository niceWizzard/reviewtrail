import { notFound, redirect } from "next/navigation";
import { createClient } from "@/src/lib/supabase/server";
import { fetchTemplateByIdAction } from "@/src/lib/actions/templates";
import { TemplateEditorClient } from "@/src/components/templates/template-editor-client";

export const instant = false;

interface EditTemplatePageProps {
  params: Promise<{ id: string }>;
}

export default async function EditTemplatePage({ params }: EditTemplatePageProps) {
  const { id } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const template = await fetchTemplateByIdAction(id);

  if (!template) {
    notFound();
  }

  // Security check: only the owner can edit the template
  if (template.user_id !== user.id) {
    redirect("/templates");
  }

  return <TemplateEditorClient initialTemplate={template} />;
}
