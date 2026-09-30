import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Live Classes",
  description: "Join live classes with BEMS FutureSkills instructors."
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
