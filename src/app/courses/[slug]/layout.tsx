import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Course Details",
  description: "Course curriculum, pricing, and enrollment details for a BEMS FutureSkills Accelerator track."
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
