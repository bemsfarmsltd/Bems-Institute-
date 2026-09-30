import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Page Not Found",
  description: "The page you're looking for doesn't exist."
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
