export type ActiveAdderForm = "section" | "subject" | "chapter" | "topic" | null;

export type LeaveTarget =
  | { type: "dashboard" }
  | { type: "step1" }
  | { type: "href"; href: string };

export interface Step1Values {
  examName: string;
  examDate: string;
  description: string;
  prepopulateColumns: boolean;
}
