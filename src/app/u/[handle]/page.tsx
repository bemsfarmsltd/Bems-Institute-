import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import type { PublicPortfolio } from "@/types/lms";
import {
  Award,
  ExternalLink,
  FolderGit2,
  GraduationCap,
  Sparkles,
  ArrowRight,
  CheckCircle2
} from "lucide-react";

export const dynamic = "force-dynamic";

function getBackendBaseUrl(): string {
  return (
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.API_URL ||
    "http://localhost:4000"
  ).replace(/\/+$/, "");
}

async function fetchPublicPortfolio(handle: string): Promise<PublicPortfolio | null> {
  const base = getBackendBaseUrl();
  try {
    const res = await fetch(`${base}/api/portfolio/${encodeURIComponent(handle)}`, {
      cache: "no-store"
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data?.portfolio ?? null;
  } catch {
    return null;
  }
}

function safeExternalUrl(raw: string | null | undefined): string | null {
  if (!raw) return null;
  try {
    const u = new URL(raw);
    return u.protocol === "https:" || u.protocol === "http:" ? u.toString() : null;
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ handle: string }>;
}): Promise<Metadata> {
  const { handle } = await params;
  const portfolio = await fetchPublicPortfolio(handle);
  if (!portfolio) {
    return {
      title: { absolute: "Portfolio not found · BEMS Institute" },
      description: "This portfolio page isn't available.",
      robots: { index: false, follow: false }
    };
  }
  const title = `${portfolio.name} · BEMS Institute`;
  const description =
    portfolio.headline ||
    `${portfolio.name}'s verified learning portfolio at BEMS Institute of Technology.`;
  // Open Graph tags give the link a proper preview when shared on WhatsApp/LinkedIn.
  return {
    title: { absolute: title },
    description,
    alternates: { canonical: `/u/${portfolio.handle}` },
    openGraph: {
      type: "profile",
      title,
      description,
      url: `/u/${portfolio.handle}`,
      siteName: "BEMS Institute of Technology",
      images: [{ url: "/images/bems-logo.jpg", alt: "BEMS Institute of Technology" }]
    },
    twitter: { card: "summary", title, description }
  };
}

export default async function PublicPortfolioPage({
  params
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await params;
  const portfolio = await fetchPublicPortfolio(handle);

  if (!portfolio) {
    return (
      <div className="min-h-screen flex flex-col bg-[#FAF8FF]">
        <Navbar />
        <main className="flex-1 flex items-center justify-center px-4 py-16">
          <div className="max-w-md w-full bg-white rounded-3xl border border-[#F1E2F5] p-8 text-center shadow-xs space-y-4">
            <GraduationCap className="w-10 h-10 text-[#AE54C6] mx-auto" />
            <h1 className="text-xl font-black text-[#303654]">This page isn&apos;t available.</h1>
            <p className="text-sm text-[#645F80]">
              This student portfolio may be turned off or the address may have changed.
            </p>
            <Link
              href="/courses"
              className="m-press inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#AE54C6] text-white text-sm font-bold"
            >
              Explore BEMS Courses <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const initials = portfolio.name
    .split(/\s+/)
    .map((p) => p[0])
    .filter(Boolean)
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8FF]">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-8 sm:py-12 space-y-8">
        {/* Header Card */}
        <section className="m-lift bg-white rounded-3xl border border-[#F1E2F5] p-6 sm:p-8 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center gap-5">
            {portfolio.avatarUrl ? (
              <img
                src={portfolio.avatarUrl}
                alt={portfolio.name}
                className="w-20 h-20 rounded-full object-cover ring-4 ring-[#F7EDF9] shrink-0"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#AE54C6] to-[#303654] text-white font-black text-2xl flex items-center justify-center ring-4 ring-[#F7EDF9] shrink-0">
                {initials || "B"}
              </div>
            )}
            <div className="min-w-0 space-y-1.5">
              <div className="text-xs font-extrabold uppercase tracking-wider text-[#AE54C6]">
                BEMS Institute Portfolio
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-[#303654] break-words">
                {portfolio.name}
              </h1>
              {portfolio.headline && (
                <p className="text-sm sm:text-base text-[#4A4568] font-medium">
                  {portfolio.headline}
                </p>
              )}
            </div>
          </div>

          {portfolio.tracks.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-5 pt-5 border-t border-[#F7EDF9]">
              {portfolio.tracks.map((track) => (
                <span
                  key={track.slug}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-white"
                  style={{ backgroundColor: track.color || "#9C3FB5" }}
                >
                  {track.status === "COMPLETED" && <CheckCircle2 className="w-3.5 h-3.5" />}
                  {track.title}
                </span>
              ))}
            </div>
          )}
        </section>

        {/* Badges */}
        {portfolio.badges.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-lg font-black text-[#303654] flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#AE54C6]" /> Milestone Badges ({portfolio.badges.length})
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {portfolio.badges.map((badge) => (
                <div
                  key={badge.id}
                  className="m-lift bg-white rounded-2xl border border-[#F1E2F5] p-4 flex items-start gap-3 shadow-xs"
                >
                  <div className="w-9 h-9 rounded-xl bg-[#AE54C6] text-white flex items-center justify-center shrink-0">
                    <Award className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-extrabold text-[#303654]">{badge.title}</h3>
                    <p className="text-xs text-[#645F80] mt-0.5">{badge.description}</p>
                    {badge.earnedAt && (
                      <p className="text-[11px] font-bold text-[#AE54C6] mt-1">
                        {new Date(badge.earnedAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Graded Projects */}
        {portfolio.projects.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-lg font-black text-[#303654] flex items-center gap-2">
              <FolderGit2 className="w-5 h-5 text-[#AE54C6]" /> Verified Projects
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {portfolio.projects.map((proj, idx) => {
                const githubHref = safeExternalUrl(proj.githubUrl);
                const demoHref = safeExternalUrl(proj.liveDemoUrl);
                return (
                  <div
                    key={`${proj.title}-${idx}`}
                    className="m-lift bg-white rounded-2xl border border-[#F1E2F5] p-5 shadow-xs flex flex-col justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10.5px] font-extrabold uppercase tracking-wider text-[#AE54C6]">
                          {proj.courseTitle} · {proj.type}
                        </span>
                        {proj.score !== null && (
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-extrabold">
                            {proj.score}/100
                          </span>
                        )}
                      </div>
                      <h3 className="text-base font-extrabold text-[#303654] mt-1">
                        {proj.title}
                      </h3>
                    </div>

                    {(githubHref || demoHref) && (
                      <div className="flex flex-wrap gap-2 pt-1">
                        {githubHref && (
                          <a
                            href={githubHref}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="m-press inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-[#303654] hover:bg-slate-50"
                          >
                            GitHub <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                        {demoHref && (
                          <a
                            href={demoHref}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="m-press inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#AE54C6] text-white text-xs font-bold hover:opacity-95"
                          >
                            Live demo <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Certificates */}
        {portfolio.certificates.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-lg font-black text-[#303654] flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-emerald-600" /> Verified Certificates
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {portfolio.certificates.map((cert) => (
                <Link
                  key={cert.certNumber}
                  href={cert.href}
                  className="m-lift bg-white rounded-2xl border border-[#F1E2F5] p-5 shadow-xs flex items-center justify-between gap-3 hover:border-[#AE54C6]"
                >
                  <div className="min-w-0">
                    <h3 className="text-sm font-extrabold text-[#303654] truncate">
                      {cert.courseTitle}
                    </h3>
                    <p className="text-xs text-[#645F80] mt-0.5">
                      {cert.gradeTitle} · #{cert.certNumber}
                    </p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-[#AE54C6] shrink-0" />
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Learn with BEMS CTA */}
        <section className="m-lift rounded-3xl bg-[#303654] text-white p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg sm:text-xl font-black">Learn with BEMS</h2>
            <p className="text-xs sm:text-sm text-[#C6BDD3] mt-1">
              Build real projects with live mentorship in Umuahia or online.
            </p>
          </div>
          <Link
            href="/courses"
            className="m-press self-start sm:self-auto inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#AE54C6] hover:bg-[#9B42B3] text-white text-sm font-bold shrink-0"
          >
            Explore Tracks <ArrowRight className="w-4 h-4" />
          </Link>
        </section>
      </main>

      <Footer />
    </div>
  );
}
