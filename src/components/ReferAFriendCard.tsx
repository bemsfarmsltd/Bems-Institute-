"use client";

import React, { useEffect, useState } from "react";
import { Gift, Copy, Check, Users } from "lucide-react";
import { apiFetch } from "@/lib/api-client";

interface ReferralRow {
  id: string;
  refereeName: string;
  status: "SIGNED_UP" | "CREDITED";
  creditNaira: number;
  createdAt: string;
}

interface ReferralData {
  referralCode: string;
  creditBalanceNaira: number;
  referrals: ReferralRow[];
}

export function ReferAFriendCard() {
  const [data, setData] = useState<ReferralData | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let cancelled = false;
    apiFetch("/api/referrals/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (!cancelled && json) setData(json);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  if (!data) return null;

  const referralUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/login?ref=${data.referralCode}`
      : `/login?ref=${data.referralCode}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(referralUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard unavailable — nothing to do
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 p-5 sm:p-7">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 mb-5 border-b border-slate-200/80">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-lg bg-[#F7EDF9] flex items-center justify-center shrink-0">
            <Gift className="w-5 h-5 text-[#AE54C6]" />
          </div>
          <div>
            <h3 className="text-lg font-extrabold text-[#24292D]">Refer a Friend</h3>
            <p className="text-xs text-[#747579]">
              Earn ₦5,000 credit for every friend who enrolls using your link.
            </p>
          </div>
        </div>
        <div className="text-right shrink-0">
          <div className="text-2xl font-extrabold text-[#AE54C6]">
            ₦{data.creditBalanceNaira.toLocaleString()}
          </div>
          <div className="text-[11px] text-[#747579] font-medium">Credit earned</div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch gap-2.5">
        <div className="flex-1 min-w-0 flex items-center gap-2 bg-[#F5F7F9] rounded-lg px-4 py-2.5">
          <code className="text-xs sm:text-[13px] text-[#24292D] font-mono truncate">{referralUrl}</code>
        </div>
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg bg-[#AE54C6] hover:bg-[#A03BBC] text-white text-xs font-bold transition-colors cursor-pointer shrink-0"
        >
          {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? "Copied!" : "Copy Link"}</span>
        </button>
      </div>

      {data.referrals.length > 0 && (
        <div className="mt-5 pt-4 border-t border-slate-200/80">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#747579] flex items-center gap-1.5 mb-3">
            <Users className="w-3.5 h-3.5" /> Your Referrals ({data.referrals.length})
          </span>
          <div className="space-y-2">
            {data.referrals.map((r) => (
              <div key={r.id} className="flex items-center justify-between text-xs sm:text-[13px]">
                <span className="text-[#24292D] font-medium">{r.refereeName}</span>
                {r.status === "CREDITED" ? (
                  <span className="text-[#AE54C6] font-bold">
                    +₦{r.creditNaira.toLocaleString()} earned
                  </span>
                ) : (
                  <span className="text-[#747579]">Signed up — awaiting enrollment</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
