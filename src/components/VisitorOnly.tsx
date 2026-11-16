"use client";

import type { ReactNode } from "react";
import { useLMS } from "@/context/LMSContext";

// Marketing content for visitors and staff. A signed-in student's home page is
// their personal space only (the owner's call), so it's hidden for them. Rendered
// by default (server HTML, search engines, visitors) and removed once the session
// shows a student.
export function VisitorOnly({ children }: { children: ReactNode }) {
  const { user } = useLMS();
  if (user?.role === "STUDENT") return null;
  return <>{children}</>;
}
