import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Lesson",
  description: "Watch and complete a BEMS FutureSkills course lesson."
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
