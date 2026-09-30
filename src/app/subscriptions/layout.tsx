import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Enroll Now",
  description: "Choose a payment plan and enroll in a BEMS FutureSkills Accelerator course."
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
