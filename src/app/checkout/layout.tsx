import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Complete your enrollment and payment for a BEMS FutureSkills Accelerator course."
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
