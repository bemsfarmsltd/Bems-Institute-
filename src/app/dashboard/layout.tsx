import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Your BEMS FutureSkills Accelerator student dashboard."
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
