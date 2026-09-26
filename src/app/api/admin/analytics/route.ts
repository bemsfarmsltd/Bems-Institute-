import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser, isStaff } from "@/lib/api-auth";
import { computeAdminRoster } from "@/lib/admin-roster";
import { DELIVERY_MODE_LABEL } from "@/lib/lms-mappers";
import type { AnalyticsSummary } from "@/types/lms";

export async function GET(req: NextRequest) {
  const session = await getSessionUser(req);
  if (!isStaff(session)) {
    return NextResponse.json({ error: "Staff access required." }, { status: 403 });
  }

  const [roster, courses, cohort, certificatesIssued, scans] = await Promise.all([
    computeAdminRoster(),
    prisma.course.findMany({ include: { enrollments: true } }),
    prisma.cohort.findFirst({ orderBy: { createdAt: "desc" } }),
    prisma.certificate.count(),
    prisma.qrScan.groupBy({ by: ["source"], _count: { _all: true } })
  ]);

  const totalStudents = roster.length;
  const totalRevenue = roster.reduce((sum, s) => sum + s.amountPaid, 0);
  const completionRate =
    totalStudents === 0
      ? 0
      : Math.round((roster.filter((s) => s.progressPercent === 100).length / totalStudents) * 100);

  const trackDistribution = courses
    .filter((c) => c.enrollments.length > 0)
    .map((c) => ({
      track: c.title,
      count: c.enrollments.length,
      revenue: c.enrollments.reduce((sum, e) => sum + e.amountPaid, 0),
      color: c.color
    }));

  const deliveryCounts = new Map<string, number>();
  for (const s of roster) {
    deliveryCounts.set(s.deliveryMode, (deliveryCounts.get(s.deliveryMode) || 0) + 1);
  }
  const deliveryDistribution = Object.values(DELIVERY_MODE_LABEL)
    .filter((mode, idx, arr) => arr.indexOf(mode) === idx)
    .map((mode) => {
      const count = deliveryCounts.get(mode) || 0;
      return {
        mode,
        count,
        percentage: totalStudents === 0 ? 0 : Math.round((count / totalStudents) * 100)
      };
    })
    .filter((d) => d.count > 0);

  const registrationsBySource = new Map<string, { count: number; revenue: number }>();
  for (const s of roster) {
    const entry = registrationsBySource.get(s.qrSource) || { count: 0, revenue: 0 };
    entry.count += 1;
    entry.revenue += s.amountPaid;
    registrationsBySource.set(s.qrSource, entry);
  }
  const scansBySource = new Map(scans.map((s) => [s.source, s._count._all]));
  const allSources = new Set([...registrationsBySource.keys(), ...scansBySource.keys()]);
  const bannerChannelYield = [...allSources].map((source) => {
    const reg = registrationsBySource.get(source) || { count: 0, revenue: 0 };
    const scanCount = scansBySource.get(source) || 0;
    return {
      source,
      location: source,
      scans: scanCount,
      registrations: reg.count,
      revenue: reg.revenue,
      conversionRate: scanCount === 0 ? 0 : Math.round((reg.count / scanCount) * 1000) / 10
    };
  });

  const summary: AnalyticsSummary = {
    totalStudents,
    targetStudents: cohort?.targetStudents ?? 0,
    totalRevenue,
    targetRevenue: cohort?.targetRevenue ?? 0,
    completionRate,
    certificatesIssued,
    trackDistribution,
    deliveryDistribution,
    bannerChannelYield
  };

  return NextResponse.json(summary);
}
