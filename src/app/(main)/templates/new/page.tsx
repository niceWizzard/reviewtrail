import { TemplateBuilderClient } from "@/src/components/templates/template-builder-client";

export const metadata = {
  title: "Create Template - ReviewTrail",
  description: "Create a custom standalone exam tracker template.",
};

export default function NewTemplatePage() {
  return <TemplateBuilderClient />;
}
