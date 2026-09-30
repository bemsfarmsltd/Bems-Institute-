import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cohort Leaderboard",
  description: "See top-performing students in your BEMS FutureSkills cohort."
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
