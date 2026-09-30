import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Grading Studio",
  description: "Grade BEMS FutureSkills capstone submissions."
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
