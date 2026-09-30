import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Verify Certificate",
  description: "Instant cryptographic verification of certificates issued by BEMS Institute of Technology & Vocational Studies."
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
