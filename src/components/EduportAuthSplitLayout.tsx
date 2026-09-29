"use client";

import React from "react";
import Link from "next/link";

const COMMUNITY_AVATARS = [
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=160&q=80",
  "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=160&q=80",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=160&q=80",
];

function EduportCommunityIllustration() {
  return (
    <svg
      viewBox="0 0 560 410"
      className="w-full max-w-[500px] h-auto mx-auto drop-shadow-sm select-none"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Soft Ground Shadow */}
      <ellipse cx="285" cy="378" rx="225" ry="12" fill="#D5E3F0" />

      {/* Top-Left Wall Clock */}
      <g transform="translate(88, 38)">
        <circle cx="26" cy="26" r="24" fill="#20B486" />
        <circle cx="26" cy="26" r="19" fill="#FFFFFF" />
        <circle cx="26" cy="10" r="1.5" fill="#1D2026" />
        <circle cx="42" cy="26" r="1.5" fill="#1D2026" />
        <circle cx="26" cy="42" r="1.5" fill="#1D2026" />
        <circle cx="10" cy="26" r="1.5" fill="#1D2026" />
        <path
          d="M26 16V26L33 30"
          stroke="#1D2026"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>

      {/* Floating Yellow Lightbulb */}
      <g transform="translate(132, 92)">
        <line x1="20" y1="0" x2="20" y2="5" stroke="#F7C32E" strokeWidth="2.2" strokeLinecap="round" />
        <line x1="6" y1="8" x2="10" y2="11" stroke="#F7C32E" strokeWidth="2.2" strokeLinecap="round" />
        <line x1="34" y1="8" x2="30" y2="11" stroke="#F7C32E" strokeWidth="2.2" strokeLinecap="round" />
        <path
          d="M11 21C11 15.477 15.029 11 20 11C24.971 11 29 15.477 29 21C29 24.6 26.9 27.4 24.5 29.5L23.8 33H16.2L15.5 29.5C13.1 27.4 11 24.6 11 21Z"
          fill="#F7C32E"
        />
        <rect x="16" y="34" width="8" height="3.5" rx="1.5" fill="#24292D" />
        <rect x="17.5" y="38.5" width="5" height="2.5" rx="1.2" fill="#24292D" />
      </g>

      {/* Top-Right Heart Speech Bubble */}
      <g transform="translate(425, 22)">
        <rect x="0" y="0" width="46" height="36" rx="10" fill="#FFFFFF" />
        <path d="M12 36L8 44L20 36H12Z" fill="#FFFFFF" />
        <path
          d="M23 26.5C23 26.5 13.5 20.6 13.5 14.3C13.5 11.4 15.8 9.2 18.5 9.2C20.3 9.2 22 10.2 23 11.7C24 10.2 25.7 9.2 27.5 9.2C30.2 9.2 32.5 11.4 32.5 14.3C32.5 20.6 23 26.5 23 26.5Z"
          fill="#D6293E"
        />
      </g>

      {/* Center Large Desktop Monitor */}
      <g transform="translate(178, 62)">
        {/* Monitor Stand Base & Neck */}
        <path d="M98 214H146L154 256H90L98 214Z" fill="#B8C7D9" />
        <rect x="74" y="254" width="96" height="8" rx="4" fill="#9FB2C8" />

        {/* Monitor Outer Bezel */}
        <rect x="0" y="0" width="244" height="216" rx="14" fill="#1F242D" />
        {/* Monitor Inner Screen */}
        <rect x="9" y="9" width="226" height="174" rx="8" fill="#FFFDF9" />
        {/* Bottom Chin Bar */}
        <path d="M0 186H244V202C244 209.732 237.732 216 230 216H14C6.268 216 0 209.732 0 202V186Z" fill="#D5E1EE" />

        {/* Screen Top Status Pills: LIVE & Viewer Count */}
        <circle cx="24" cy="24" r="3.5" fill="#D6293E" />
        <text x="32" y="27" fill="#D6293E" fontSize="9" fontWeight="800" fontFamily="sans-serif">
          LIVE
        </text>
        <rect x="58" y="17" width="32" height="14" rx="4" fill="#EEF2F6" />
        <circle cx="66" cy="24" r="3" fill="#64748B" />
        <text x="73" y="27.5" fill="#475569" fontSize="8.5" fontWeight="700" fontFamily="sans-serif">
          80
        </text>

        {/* Soft Decorative Shapes Behind Instructor */}
        <path
          d="M32 162C32 118 68 88 122 88C176 88 208 118 208 162H32Z"
          fill="#FFF3D6"
        />

        {/* Whiteboard / Presentation Card on Screen Right */}
        <rect x="148" y="38" width="68" height="46" rx="5" fill="#F1F5F9" stroke="#CBD5E1" strokeWidth="1.5" />
        <line x1="156" y1="50" x2="196" y2="50" stroke="#94A3B8" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="156" y1="60" x2="204" y2="60" stroke="#CBD5E1" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="156" y1="70" x2="184" y2="70" stroke="#20B486" strokeWidth="2.5" strokeLinecap="round" />

        {/* Male Instructor Character Inside Screen */}
        <g transform="translate(66, 36)">
          {/* Hair & Head */}
          <path
            d="M36 18C36 8.5 44 2 54 2C64 2 71 8.5 71 18C71 24 68 30 68 30H39C39 30 36 24 36 18Z"
            fill="#1E232A"
          />
          <rect x="46" y="30" width="14" height="14" rx="5" fill="#F4A27E" />
          <ellipse cx="53" cy="22" rx="13" ry="15" fill="#F7B293" />
          {/* Hair top wave */}
          <path
            d="M40 16C40 9 46 4 55 4C63 4 68 8 68 14C63 12 56 12 49 14C44 15 41 18 40 16Z"
            fill="#1E232A"
          />
          {/* Beard / Smile */}
          <path d="M49 27C51 29 55 29 57 27" stroke="#1E232A" strokeWidth="1.6" strokeLinecap="round" />

          {/* Yellow Dress Shirt & Torso */}
          <path
            d="M22 62C22 48 34 40 53 40C72 40 84 48 84 62L92 126H14L22 62Z"
            fill="#F7C32E"
          />
          {/* White Collar & Dark Tie */}
          <path d="M44 40L53 50L62 40" fill="#FFFFFF" />
          <path d="M51 47H55L57 86L53 93L49 86L51 47Z" fill="#1E232A" />

          {/* Left Arm & Hand */}
          <path d="M22 54L8 96L22 102L30 68" fill="#F5B82E" />
          <circle cx="14" cy="100" r="6" fill="#F7B293" />

          {/* Right Arm Raised Holding Pointer Stick */}
          <path d="M80 52L108 74L98 86L74 68" fill="#F5B82E" />
          <circle cx="105" cy="77" r="6" fill="#F7B293" />
          {/* Pointer Stick */}
          <line x1="106" y1="75" x2="136" y2="38" stroke="#1E232A" strokeWidth="2.5" strokeLinecap="round" />
        </g>

        {/* Video Player Controls Bar */}
        <rect x="9" y="162" width="226" height="21" fill="#2A2F37" />
        {/* Red Progress Bar */}
        <rect x="9" y="160" width="226" height="3" fill="#475569" />
        <rect x="9" y="160" width="138" height="3" fill="#D6293E" />
        <circle cx="147" cy="161.5" r="4" fill="#D6293E" />
        {/* Play & Volume Icons */}
        <polygon points="22,169 22,177 29,173" fill="#FFFFFF" />
        <rect x="36" y="171" width="18" height="4" rx="2" fill="#94A3B8" />
        <rect x="214" y="170" width="10" height="6" rx="1" stroke="#FFFFFF" strokeWidth="1.2" />
      </g>

      {/* Left Foreground: Student Studying at Green Desk */}
      <g transform="translate(46, 172)">
        {/* Stool */}
        <ellipse cx="45" cy="148" rx="22" ry="6" fill="#24292D" />
        <line x1="34" y1="152" x2="22" y2="204" stroke="#7C5846" strokeWidth="4.5" strokeLinecap="round" />
        <line x1="45" y1="154" x2="45" y2="205" stroke="#7C5846" strokeWidth="4.5" strokeLinecap="round" />
        <line x1="56" y1="152" x2="68" y2="204" stroke="#7C5846" strokeWidth="4.5" strokeLinecap="round" />
        <line x1="28" y1="180" x2="62" y2="180" stroke="#7C5846" strokeWidth="3.5" strokeLinecap="round" />

        {/* Student Legs & Shoes */}
        <path
          d="M42 132L86 144L78 192"
          stroke="#F4A27E"
          strokeWidth="12"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M48 134L98 148L94 192"
          stroke="#E8926D"
          strokeWidth="12"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* White & Coral Sneakers */}
        <rect x="70" y="192" width="22" height="9" rx="4.5" fill="#D6293E" />
        <rect x="88" y="192" width="22" height="9" rx="4.5" fill="#D6293E" />

        {/* Dark Green Skirt */}
        <path d="M28 112H66L86 144H32L28 112Z" fill="#0F6E56" />

        {/* Coral / Red Sweater Torso */}
        <path d="M30 62C30 52 38 46 48 46C58 46 66 52 68 64L64 114H28L30 62Z" fill="#E0533C" />

        {/* Student Head & Ponytail */}
        <circle cx="24" cy="22" r="10" fill="#1E232A" />
        <ellipse cx="48" cy="28" rx="13" ry="14" fill="#F7B293" />
        <path d="M35 26C35 16 42 11 52 11C59 11 62 16 62 22C56 19 46 20 35 26Z" fill="#1E232A" />

        {/* Arms Reaching to Laptop */}
        <path
          d="M54 62L82 88L108 86"
          stroke="#E0533C"
          strokeWidth="11"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Laptop on Desk */}
        <g transform="translate(94, 58)">
          <path d="M20 32H54L64 4H30L20 32Z" fill="#24292D" />
          <rect x="4" y="30" width="52" height="4" rx="2" fill="#64748B" />
        </g>

        {/* Green Study Desk */}
        <g transform="translate(68, 92)">
          {/* Desk Legs */}
          <path d="M16 18L6 112" stroke="#1E232A" strokeWidth="3.5" strokeLinecap="round" />
          <path d="M30 18L22 112" stroke="#1E232A" strokeWidth="3.5" strokeLinecap="round" />
          <path d="M104 18L114 112" stroke="#1E232A" strokeWidth="3.5" strokeLinecap="round" />
          <path d="M90 18L98 112" stroke="#1E232A" strokeWidth="3.5" strokeLinecap="round" />
          {/* Green Desk Top Apron */}
          <rect x="0" y="0" width="122" height="22" rx="4" fill="#20B486" />
          <rect x="8" y="6" width="48" height="10" rx="2" fill="#15966E" />
          <rect x="64" y="6" width="48" height="10" rx="2" fill="#15966E" />
        </g>
      </g>

      {/* Right Foreground: Potted Plant on Stool */}
      <g transform="translate(418, 170)">
        {/* Lush Green Leaves */}
        <path
          d="M44 108C22 92 14 60 22 28C36 44 46 72 46 108H44Z"
          fill="#15966E"
        />
        <path
          d="M48 108C44 68 52 28 70 4C78 36 70 76 52 108H48Z"
          fill="#20B486"
        />
        <path
          d="M52 108C68 82 88 60 106 50C98 78 78 98 54 108H52Z"
          fill="#2CE5A7"
        />
        <path
          d="M42 108C20 88 4 74 -4 68C4 92 22 104 42 108Z"
          fill="#20B486"
        />

        {/* White Plant Pot */}
        <path d="M26 104H74L66 150H34L26 104Z" fill="#FFFFFF" stroke="#DCE6F2" strokeWidth="1.5" />

        {/* Dark Stool Base */}
        <rect x="18" y="148" width="64" height="12" rx="6" fill="#1D2B44" />
        <line x1="28" y1="160" x2="20" y2="206" stroke="#7C5846" strokeWidth="5" strokeLinecap="round" />
        <line x1="50" y1="160" x2="50" y2="206" stroke="#7C5846" strokeWidth="5" strokeLinecap="round" />
        <line x1="72" y1="160" x2="80" y2="206" stroke="#7C5846" strokeWidth="5" strokeLinecap="round" />
      </g>
    </svg>
  );
}

export default function EduportAuthSplitLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen w-full bg-white grid grid-cols-1 lg:grid-cols-2 font-sans text-[#1D2026]">
      {/* Left 50% Community Panel */}
      <div className="bg-[#E7EFF7] flex flex-col justify-between items-center px-6 sm:px-12 py-10 lg:py-14 relative overflow-hidden">
        {/* Top Brand Link */}
        <div className="w-full max-w-[520px] flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-[#F7C32E] flex items-center justify-center shadow-sm">
              <span className="font-display font-black text-[#1D2026] text-base leading-none">B</span>
            </div>
            <span className="font-display font-extrabold text-[20px] tracking-tight text-[#1D2026]">
              BEMS<span className="text-[#066AC9]">.</span>
            </span>
          </Link>
          <Link
            href="/"
            className="text-[13px] font-semibold text-[#475569] hover:text-[#066AC9] transition-colors lg:hidden"
          >
            ← Back to Home
          </Link>
        </div>

        {/* Center Heading + Illustration */}
        <div className="w-full max-w-[520px] my-auto py-6 text-center">
          <h2 className="font-display text-[28px] sm:text-[34px] font-extrabold text-[#1D2026] tracking-tight leading-[1.2] mb-2">
            Welcome to our largest community
          </h2>
          <p className="text-[#64748B] text-[15px] mb-8">
            Let&apos;s learn something new today!
          </p>

          <EduportCommunityIllustration />
        </div>

        {/* Bottom Avatar Stack + Community Count */}
        <div className="w-full max-w-[520px] flex flex-wrap items-center justify-center gap-4 pt-2">
          <div className="flex items-center -space-x-2.5">
            {COMMUNITY_AVATARS.map((src, idx) => (
              <img
                key={idx}
                src={src}
                alt="BEMS student"
                className="w-10 h-10 rounded-full object-cover ring-2 ring-white shadow-sm"
              />
            ))}
          </div>
          <p className="text-[14px] font-medium text-[#1D2026]">
            <span className="font-bold">4k+</span> Students joined us, now it&apos;s your turn.
          </p>
        </div>
      </div>

      {/* Right 50% Form Panel */}
      <div className="bg-white flex flex-col justify-between px-6 sm:px-12 lg:px-16 xl:px-24 py-10 lg:py-14">
        <div className="w-full max-w-[460px] mx-auto flex justify-end">
          <Link
            href="/"
            className="hidden lg:inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#64748B] hover:text-[#066AC9] transition-colors"
          >
            ← Back to Home
          </Link>
        </div>

        <div className="w-full max-w-[460px] mx-auto my-auto py-6">
          {children}
        </div>

        <div className="w-full max-w-[460px] mx-auto text-center lg:text-left text-[12px] text-[#94A3B8]">
          © {new Date().getFullYear()} BEMS Institute of Technology. All rights reserved.
        </div>
      </div>
    </div>
  );
}
