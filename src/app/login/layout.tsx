import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Log In",
  description: "Sign in to your BEMS Institute student, instructor, or admin account."
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
