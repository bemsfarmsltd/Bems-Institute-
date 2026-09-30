import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Community",
  description: "Chat with fellow BEMS FutureSkills students by track."
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
