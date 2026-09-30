import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Certificate",
  description: "View a verified BEMS Institute certificate of competence."
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
