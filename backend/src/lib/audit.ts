// The audit log: who changed which payment, registration, account or
// setting, and when. Writing it never blocks the action itself.

import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export interface AuditInput {
  actor: { id: string; name: string } | null;
  action: string;
  targetType: string;
  targetId?: string | null;
  summary: string;
  details?: Prisma.InputJsonValue;
}

export async function audit(input: AuditInput): Promise<void> {
  try {
    await prisma.auditEvent.create({
      data: {
        actorId: input.actor?.id ?? null,
        actorName: input.actor?.name ?? "System",
        action: input.action,
        targetType: input.targetType,
        targetId: input.targetId ?? null,
        summary: input.summary.slice(0, 500),
        details: input.details
      }
    });
  } catch (err) {
    console.error("audit log write failed:", err);
  }
}

export async function listAudit(filter: { targetType?: string; targetId?: string; action?: string; before?: Date; limit?: number }) {
  const limit = Math.min(Math.max(filter.limit ?? 50, 1), 200);
  const rows = await prisma.auditEvent.findMany({
    where: {
      ...(filter.targetType ? { targetType: filter.targetType } : {}),
      ...(filter.targetId ? { targetId: filter.targetId } : {}),
      ...(filter.action ? { action: { startsWith: filter.action } } : {}),
      ...(filter.before ? { createdAt: { lt: filter.before } } : {})
    },
    orderBy: { createdAt: "desc" },
    take: limit + 1
  });
  return { events: rows.slice(0, limit), hasMore: rows.length > limit };
}
