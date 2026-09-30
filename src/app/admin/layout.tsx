import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Console",
  description: "BEMS Institute administrative console."
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
