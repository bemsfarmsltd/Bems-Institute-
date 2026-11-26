import type { Metadata } from "next";
import { PortalGuard } from "@/components/PortalGuard";

export const metadata: Metadata = {
  title: "Admin Console",
  description: "BEMS Institute administrative console."
};

// Only admins see the console. Office staff have their own portals
// (/finance, /admissions, /management) and the API refuses them here anyway.
export default function Layout({ children }: { children: React.ReactNode }) {
  return <PortalGuard requiredRole="ADMIN">{children}</PortalGuard>;
}
