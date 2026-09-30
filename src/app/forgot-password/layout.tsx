import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Forgot Password",
  description: "Reset your BEMS Institute account password."
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
