import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Code Sandbox",
  description: "Practice coding in the BEMS FutureSkills interactive sandbox."
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
