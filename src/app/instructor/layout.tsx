import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Instructor Studio",
  description: "BEMS FutureSkills instructor dashboard and student roster."
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
