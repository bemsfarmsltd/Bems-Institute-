import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Banner QR Studio",
  description: "Generate and track QR codes for BEMS outdoor banners and flyers."
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
