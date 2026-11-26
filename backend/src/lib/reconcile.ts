// Finance daily check: what Paystack says came in on a Lagos day, against
// what our ledger credited. Bank transfers confirmed by staff are listed
// separately, for ticking off against the bank statement.

import { prisma } from "@/lib/prisma";
import { listPaystackTransactions, paystackConfigured, verifyPaystackTransaction, type PaystackListedTransaction } from "@/lib/paystack";
import { lagosDate } from "@/lib/installments";

export interface ReconRow {
  reference: string;
  transactionId: string | null;
  amount: number;
  paystackAmount: number | null;
  status: string;
  paystackStatus: string | null;
  paidAt: string | null;
  studentName: string | null;
  email: string | null;
  courseTitle: string | null;
}

/** "YYYY-MM-DD" → the Lagos day as UTC instants. */
export function lagosDayRange(isoDate: string): { from: Date; to: Date } {
  const from = new Date(`${isoDate}T00:00:00.000+01:00`);
  return { from, to: new Date(from.getTime() + 24 * 60 * 60 * 1000 - 1) };
}

export function isIsoDate(s: unknown): s is string {
  return typeof s === "string" && /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(Date.parse(`${s}T00:00:00Z`));
}

const ledgerInclude = { user: { select: { name: true, email: true } }, course: { select: { title: true } } } as const;
type LedgerRow = Awaited<ReturnType<typeof prisma.paymentTransaction.findMany<{ include: typeof ledgerInclude }>>>[number];

function row(our: LedgerRow | undefined, ps: PaystackListedTransaction | undefined): ReconRow {
  return {
    reference: our?.reference ?? ps!.reference,
    transactionId: our?.id ?? null,
    amount: our ? our.amount : Math.round((ps?.amount ?? 0) / 100),
    paystackAmount: ps ? ps.amount / 100 : null,
    status: our?.status ?? "NOT_IN_LEDGER",
    paystackStatus: ps?.status ?? null,
    paidAt: (our?.paidAt ?? (ps?.paid_at ? new Date(ps.paid_at) : null) ?? our?.createdAt ?? null)?.toISOString() ?? null,
    studentName: our?.user.name ?? null,
    email: our?.user.email ?? ps?.customer?.email ?? null,
    courseTitle: our?.course.title ?? null
  };
}

export async function reconcileDay(isoDate: string = lagosDate(new Date())) {
  const { from, to } = lagosDayRange(isoDate);
  const inWindow = { OR: [{ paidAt: { gte: from, lte: to } }, { paidAt: null, createdAt: { gte: from, lte: to } }] };
  const ours = await prisma.paymentTransaction.findMany({ where: inWindow, include: ledgerInclude, orderBy: { createdAt: "asc" } });
  const sum = (rows: { amount: number }[]) => rows.reduce((s, r) => s + r.amount, 0);

  const bankTransfers = ours.filter((t) => t.reference.startsWith("bank_") && t.status === "SUCCESS");
  const refunds = ours.filter((t) => t.status === "REFUNDED");
  const ledgerPaystack = ours.filter((t) => t.reference.startsWith("bems_") && t.status === "SUCCESS");

  const base = {
    date: isoDate,
    bankTransfers: bankTransfers.map((t) => row(t, undefined)),
    matched: [] as ReconRow[],
    paystackOnly: [] as ReconRow[],
    ledgerOnly: [] as ReconRow[],
    amountMismatch: [] as ReconRow[]
  };
  if (!paystackConfigured()) {
    return { ...base, paystackConfigured: false, totals: { paystack: 0, ledgerPaystack: sum(ledgerPaystack), bank: sum(bankTransfers), refunds: sum(refunds) } };
  }

  const listed = await listPaystackTransactions(from, to);
  const successes = listed.filter((p) => p.status === "success");
  // Our rows for every Paystack reference, even ones created on another day.
  const byRef = new Map(ours.map((t) => [t.reference, t]));
  const extraRefs = successes.map((p) => p.reference).filter((r) => !byRef.has(r));
  if (extraRefs.length) {
    for (const t of await prisma.paymentTransaction.findMany({ where: { reference: { in: extraRefs } }, include: ledgerInclude })) byRef.set(t.reference, t);
  }

  for (const p of successes) {
    const our = byRef.get(p.reference);
    if (!our || our.status !== "SUCCESS") base.paystackOnly.push(row(our, p));
    else if (our.amount * 100 !== p.amount) base.amountMismatch.push(row(our, p));
    else base.matched.push(row(our, p));
  }
  const paystackSuccessRefs = new Set(successes.map((p) => p.reference));
  const listedByRef = new Map(listed.map((p) => [p.reference, p]));
  for (const t of ledgerPaystack) {
    if (paystackSuccessRefs.has(t.reference)) continue;
    // Paystack's list filters by when a charge was started, so a checkout
    // opened yesterday and paid today isn't in it: ask about that one directly.
    let checked: PaystackListedTransaction | undefined = listedByRef.get(t.reference);
    if (!checked) {
      try {
        const v = await verifyPaystackTransaction(t.reference);
        checked = { reference: t.reference, amount: v.amount, status: v.status, paid_at: v.paid_at, channel: v.channel, customer: v.customer };
      } catch {
        checked = undefined;
      }
    }
    if (checked?.status === "success" && checked.amount === t.amount * 100) base.matched.push(row(t, checked));
    else if (checked?.status === "success") base.amountMismatch.push(row(t, checked));
    else base.ledgerOnly.push(row(t, checked));
  }

  return {
    ...base,
    paystackConfigured: true,
    totals: {
      paystack: [...base.matched, ...base.paystackOnly, ...base.amountMismatch].reduce((s, r) => s + (r.paystackAmount ?? 0), 0),
      ledgerPaystack: sum(ledgerPaystack),
      bank: sum(bankTransfers),
      refunds: sum(refunds)
    }
  };
}
