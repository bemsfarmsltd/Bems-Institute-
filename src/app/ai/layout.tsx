import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Tutor",
  description: "24/7 AI technical tutoring, quizzes, and capstone pre-review for BEMS FutureSkills students."
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
