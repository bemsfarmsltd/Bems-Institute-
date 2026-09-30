import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Graduate Outcomes — Admin",
  description: "Curate the public graduate outcomes page."
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
