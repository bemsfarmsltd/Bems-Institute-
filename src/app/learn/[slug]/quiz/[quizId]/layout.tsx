import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Quiz",
  description: "Take a BEMS FutureSkills technical assessment."
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
