import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Teach at BEMS",
  description:
    "Teach a tech course at BEMS Institute of Technology in Umuahia or online. See what tutors do and apply."
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
