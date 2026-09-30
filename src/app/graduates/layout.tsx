import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Graduate Outcomes",
  description: "Real BEMS FutureSkills graduates, hired and building careers in tech."
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
