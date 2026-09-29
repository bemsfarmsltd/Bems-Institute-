"use client";

import React from "react";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export function EduportNotFoundView() {
  return (
    <div className="min-h-screen flex flex-col bg-white text-[#24292D]">
      <Navbar />

      <main className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 py-12 sm:py-16 text-center">
        {/* Eduport 404 Vector Illustration (Matches media_1790712631095.png) */}
        <div className="w-full max-w-[540px] mx-auto">
          <svg
            viewBox="0 0 600 400"
            className="w-full h-auto select-none"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Soft Organic Cloud Blob Background */}
            <ellipse cx="195" cy="40" rx="8" ry="8" fill="#E8EEF7" />
            <path
              d="M215 32 H300 C308 32 314 38 314 46 C314 54 308 60 300 60 H280 C272 60 266 66 266 74 C266 82 272 88 280 88 H385 C396 88 405 97 405 108 C405 119 396 128 385 128 H345 C334 128 325 137 325 148 C325 159 334 168 345 168 H440 C465 168 485 188 485 213 C485 238 465 258 440 258 H420 C408 258 398 268 398 280 C398 292 408 302 420 302 H500 C522 302 540 320 540 342 C540 364 522 380 500 380 H155 C120 380 92 352 92 317 C92 287 113 262 141 256 C155 253 165 241 165 227 C165 211 152 198 136 198 H128 C100 198 78 176 78 148 C78 120 100 98 128 98 H185 C196 98 205 89 205 78 C205 67 196 58 185 58 H215 C223 58 229 52 229 44 C229 36 223 32 215 32 Z"
              fill="#E8EEF7"
            />

            {/* Decorative Plus Signs */}
            <g stroke="#90A4C4" strokeWidth="1.8" strokeLinecap="round">
              <path d="M135 142 V150 M131 146 H139" />
              <path d="M300 66 V74 M296 70 H304" />
              <path d="M375 62 V70 M371 66 H379" />
              <path d="M136 222 V230 M132 226 H140" />
              <path d="M180 355 V363 M176 359 H184" />
              <path d="M510 272 V280 M506 276 H514" />
            </g>

            {/* Decorative Gears */}
            <g
              transform="translate(222, 46)"
              fill="#CFD9EA"
              stroke="#CFD9EA"
              strokeWidth="1"
            >
              <circle cx="0" cy="0" r="9" />
              <circle cx="0" cy="0" r="4" fill="#E8EEF7" />
              <rect x="-2" y="-12" width="4" height="3" rx="1" />
              <rect x="-2" y="9" width="4" height="3" rx="1" />
              <rect x="-12" y="-2" width="3" height="4" rx="1" />
              <rect x="9" y="-2" width="3" height="4" rx="1" />
            </g>

            <g
              transform="translate(245, 95)"
              stroke="#B8C7E0"
              strokeWidth="1.5"
              fill="none"
            >
              <circle cx="0" cy="0" r="22" />
              <circle cx="0" cy="0" r="10" />
              <rect x="-3" y="-27" width="6" height="5" fill="#E8EEF7" />
              <rect x="-3" y="22" width="6" height="5" fill="#E8EEF7" />
              <rect x="-27" y="-3" width="5" height="6" fill="#E8EEF7" />
              <rect x="22" y="-3" width="5" height="6" fill="#E8EEF7" />
            </g>

            <g
              transform="translate(458, 162)"
              fill="#BDCBE2"
              stroke="#BDCBE2"
              strokeWidth="1"
            >
              <circle cx="0" cy="0" r="10" />
              <circle cx="0" cy="0" r="4.5" fill="#FFFFFF" />
              <rect x="-2" y="-13" width="4" height="3" rx="1" />
              <rect x="-2" y="10" width="4" height="3" rx="1" />
              <rect x="-13" y="-2" width="3" height="4" rx="1" />
              <rect x="10" y="-2" width="3" height="4" rx="1" />
            </g>

            <g
              transform="translate(565, 255)"
              stroke="#B8C7E0"
              strokeWidth="1.5"
              fill="none"
            >
              <circle cx="0" cy="0" r="18" />
              <circle cx="0" cy="0" r="8" />
              <rect x="-3" y="-22" width="6" height="4" fill="#FFFFFF" />
              <rect x="-3" y="18" width="6" height="4" fill="#FFFFFF" />
              <rect x="-22" y="-3" width="4" height="6" fill="#FFFFFF" />
              <rect x="18" y="-3" width="4" height="6" fill="#FFFFFF" />
            </g>

            {/* Decorative Lined Botanical Leaves Behind Right Desk */}
            <g stroke="#90A4C4" strokeWidth="1.3" fill="none">
              <path d="M375 305 C385 245, 435 205, 495 198 C485 255, 440 295, 375 305 Z" />
              <line x1="375" y1="305" x2="495" y2="198" />
              <line x1="415" y1="269" x2="405" y2="238" />
              <line x1="438" y1="248" x2="430" y2="218" />
              <line x1="462" y1="227" x2="455" y2="205" />
              <line x1="415" y1="269" x2="446" y2="274" />
              <line x1="438" y1="248" x2="468" y2="252" />
            </g>

            {/* Potted Green Plant (Left) */}
            <g>
              {/* Leaves */}
              <path
                d="M136 338 C115 312, 92 278, 98 258 C105 238, 130 268, 136 338 Z"
                fill="#7CB342"
              />
              <path
                d="M140 338 C134 290, 126 242, 138 228 C150 214, 156 268, 140 338 Z"
                fill="#8BC34A"
              />
              <path
                d="M144 338 C154 304, 174 276, 168 260 C162 245, 146 284, 144 338 Z"
                fill="#689F38"
              />
              {/* Pot */}
              <polygon points="122,338 158,338 152,378 128,378" fill="#3D435A" />
              <rect x="119" y="334" width="42" height="7" rx="2" fill="#2B3042" />
            </g>

            {/* Desk Lamp + Light Beam */}
            <g>
              {/* Light Cone */}
              <polygon
                points="204,148 265,132 255,205 180,205"
                fill="#FFFFFF"
                fillOpacity="0.65"
              />
              {/* Lamp Arm */}
              <polyline
                points="178,220 156,178 188,142"
                stroke="#2B3042"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {/* Red Lamp Shade */}
              <polygon points="184,136 206,146 194,162 178,144" fill="#D6293E" />
              {/* Red Lamp Base */}
              <rect
                x="162"
                y="217"
                width="48"
                height="6"
                rx="3"
                fill="#D6293E"
              />
            </g>

            {/* Stool Under Desk */}
            <g>
              <rect
                x="200"
                y="274"
                width="92"
                height="7"
                rx="2"
                fill="#BA6E28"
              />
              <line
                x1="212"
                y1="281"
                x2="212"
                y2="378"
                stroke="#3A2618"
                strokeWidth="4"
              />
              <line
                x1="280"
                y1="281"
                x2="280"
                y2="378"
                stroke="#3A2618"
                strokeWidth="4"
              />
              <line
                x1="212"
                y1="326"
                x2="280"
                y2="326"
                stroke="#3A2618"
                strokeWidth="3.5"
              />
              <line
                x1="212"
                y1="354"
                x2="280"
                y2="354"
                stroke="#3A2618"
                strokeWidth="3.5"
              />
            </g>

            {/* Person Sitting With Head Resting on Desk */}
            <g>
              {/* Legs & Trousers */}
              <path
                d="M222 252 L238 364 L248 364 L248 265 Z"
                fill="#1D2238"
              />
              <path
                d="M250 252 L288 364 L298 364 L276 252 Z"
                fill="#141829"
              />
              {/* Red Shoes */}
              <path
                d="M236 364 H250 L252 378 H232 C232 370 234 364 236 364 Z"
                fill="#E63946"
              />
              <path
                d="M286 364 H302 L322 378 H286 Z"
                fill="#E63946"
              />
              {/* Orange Shirt / Torso Bent Over Desk */}
              <path
                d="M214 223 C214 192, 245 178, 282 178 C312 178, 326 198, 326 223 Z"
                fill="#EB5E40"
              />
              {/* Folded Arms on Desk */}
              <rect
                x="218"
                y="209"
                width="106"
                height="14"
                rx="7"
                fill="#F28B72"
              />
              {/* Dark Hair / Head Resting on Arms */}
              <path
                d="M255 212 C252 190, 268 176, 286 178 C302 180, 308 196, 304 212 Z"
                fill="#181C2E"
              />
            </g>

            {/* Yellow "Error!" Speech Bubble Above Head */}
            <g>
              <rect
                x="262"
                y="108"
                width="58"
                height="38"
                rx="6"
                fill="#F7B500"
              />
              <polygon points="262,138 262,158 278,146" fill="#F7B500" />
              <text
                x="291"
                y="132"
                textAnchor="middle"
                className="fill-white text-[14px] font-extrabold font-sans"
              >
                Error!
              </text>
            </g>

            {/* Desktop Monitor on Desk (Right) */}
            <g>
              <rect
                x="320"
                y="124"
                width="92"
                height="64"
                rx="5"
                fill="#DCE4F2"
              />
              <rect
                x="326"
                y="130"
                width="80"
                height="46"
                rx="2"
                fill="#EEF3FA"
              />
              {/* Monitor UI Bars */}
              <rect x="332" y="136" width="38" height="16" fill="#CBD6E8" />
              <rect x="374" y="136" width="26" height="4" fill="#CBD6E8" />
              <rect x="374" y="143" width="26" height="4" fill="#CBD6E8" />
              <rect x="332" y="158" width="68" height="12" fill="#CBD6E8" />
              {/* Monitor Stand */}
              <polygon
                points="358,188 374,188 380,221 352,221"
                fill="#CBD6E8"
              />
              <rect
                x="342"
                y="219"
                width="48"
                height="4"
                rx="2"
                fill="#B8C6DC"
              />
            </g>

            {/* Wooden Desk + Dark Legs */}
            <g>
              {/* Desk Legs */}
              <polygon
                points="168,244 180,244 164,378 152,378"
                fill="#2E344E"
              />
              <polygon
                points="446,244 458,244 474,378 462,378"
                fill="#2E344E"
              />
              <rect x="166" y="238" width="294" height="10" fill="#2E344E" />
              {/* Wooden Tabletop */}
              <rect
                x="148"
                y="223"
                width="330"
                height="16"
                rx="5"
                fill="#BA6E28"
              />
              <line
                x1="150"
                y1="231"
                x2="476"
                y2="231"
                stroke="#3A2618"
                strokeWidth="2"
              />
            </g>

            {/* PC Tower on Floor (Right) */}
            <g>
              {/* Main Side Panel */}
              <rect
                x="356"
                y="286"
                width="74"
                height="92"
                rx="3"
                fill="#F1F5FA"
                stroke="#DCE4F2"
                strokeWidth="1.5"
              />
              {/* Side Window */}
              <rect
                x="365"
                y="296"
                width="38"
                height="42"
                rx="3"
                fill="#DCE4F2"
              />
              <line
                x1="370"
                y1="332"
                x2="398"
                y2="302"
                stroke="#FFFFFF"
                strokeWidth="4"
              />
              {/* Vents */}
              <rect x="365" y="346" width="26" height="3" fill="#CBD6E8" />
              <rect x="365" y="352" width="26" height="3" fill="#CBD6E8" />
              <rect x="365" y="358" width="26" height="3" fill="#CBD6E8" />
              <rect x="365" y="364" width="26" height="3" fill="#CBD6E8" />

              {/* Front Tower Bezel */}
              <rect
                x="430"
                y="286"
                width="38"
                height="92"
                rx="3"
                fill="#B8C7E0"
              />
              <rect
                x="436"
                y="296"
                width="26"
                height="4"
                rx="2"
                fill="#1D2238"
              />
              <rect
                x="436"
                y="304"
                width="26"
                height="4"
                rx="2"
                fill="#1D2238"
              />
              <rect
                x="436"
                y="312"
                width="26"
                height="4"
                rx="2"
                fill="#1D2238"
              />
              <rect
                x="436"
                y="320"
                width="26"
                height="4"
                rx="2"
                fill="#1D2238"
              />
              <rect
                x="436"
                y="328"
                width="26"
                height="4"
                rx="2"
                fill="#1D2238"
              />
              <rect
                x="436"
                y="342"
                width="26"
                height="26"
                rx="3"
                fill="#1D2238"
              />
              <circle cx="449" cy="355" r="6" fill="#4A5578" />
            </g>

            {/* Bottom Floor Line */}
            <line
              x1="96"
              y1="380"
              x2="105"
              y2="380"
              stroke="#181B24"
              strokeWidth="4.5"
              strokeLinecap="round"
            />
            <line
              x1="116"
              y1="380"
              x2="564"
              y2="380"
              stroke="#181B24"
              strokeWidth="4.5"
              strokeLinecap="round"
            />
            <line
              x1="578"
              y1="380"
              x2="596"
              y2="380"
              stroke="#181B24"
              strokeWidth="4.5"
              strokeLinecap="round"
            />
          </svg>
        </div>

        {/* 404 Text Block (Matches media_1790712631095.png & media_1790712631102.png) */}
        <h1 className="font-display text-[76px] sm:text-[96px] font-extrabold text-[#D6293E] leading-none tracking-tight mt-4">
          404
        </h1>
        <h2 className="font-display text-2xl sm:text-[34px] font-extrabold text-[#24292D] mt-2">
          Oh no, something went wrong!
        </h2>
        <p className="text-xs sm:text-[14px] text-[#747579] mt-2.5 max-w-md mx-auto">
          Either something went wrong or this page doesn&apos;t exist anymore.
        </p>

        <Link
          href="/"
          className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-[#7928CA] hover:bg-[#671FB0] text-white text-[13.5px] font-bold mt-6 transition-colors shadow-2xs"
        >
          Take me to Homepage
        </Link>
      </main>

      <Footer />
    </div>
  );
}

export default function NotFoundPage() {
  return <EduportNotFoundView />;
}
