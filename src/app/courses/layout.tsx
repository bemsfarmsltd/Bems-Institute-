import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Courses",
  description: "Browse BEMS FutureSkills Accelerator tracks: AI & Automation, Web Development, Product Design, Cybersecurity, and Mobile App Engineering."
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
