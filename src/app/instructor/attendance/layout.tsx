import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Attendance Tracking",
  description: "Create live sessions and mark BEMS FutureSkills student attendance."
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
