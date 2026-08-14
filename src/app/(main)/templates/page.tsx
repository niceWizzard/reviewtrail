import { createClient } from "@/src/lib/supabase/server";
import { fetchPublicTemplatesAction, fetchUserTemplatesAction } from "@/src/lib/actions/templates";
import { TemplateHubClient } from "@/src/components/templates/template-hub-client";

export const metadata = {
  title: "Examinee Template Hub - ReviewTrail",
  description: "Browse and create review tracker templates shared by examinees and topnotchers.",
};

export const instant = false;

export default async function TemplateListPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const publicTemplates = await fetchPublicTemplatesAction().catch(() => []);
  const userTemplates = user ? await fetchUserTemplatesAction().catch(() => []) : [];

  return (
    <TemplateHubClient
      publicTemplates={publicTemplates}
      userTemplates={userTemplates}
      currentUserId={user?.id || null}
    />
  );
}
