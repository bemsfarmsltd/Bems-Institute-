import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Capstone Project",
  description: "Submit your BEMS FutureSkills capstone project for grading."
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
