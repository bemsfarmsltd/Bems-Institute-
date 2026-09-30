import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Apply as Instructor",
  description: "Apply to teach at BEMS Institute of Technology & Vocational Studies."
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
