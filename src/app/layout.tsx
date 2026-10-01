import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { LMSProvider } from "@/context/LMSContext";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "BEMS Institute of Technology & Vocational Studies | FutureSkills Accelerator",
    template: "%s | BEMS Institute of Technology"
  },
  description: "BEMS FutureSkills Accelerator 2026: Hands-on tech training in AI & Automation, Web Development, UI/UX, and Cybersecurity in Umuahia & Online.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "BEMS LMS"
  },
  icons: {
    icon: "/images/bems-logo.jpg",
    apple: "/images/bems-logo.jpg"
  }
};

export const viewport: Viewport = {
  themeColor: "#303654",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased scroll-smooth`}
    >
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
      </head>
      <body className="min-h-full flex flex-col font-sans bg-white text-[#303654]">
        <LMSProvider>{children}</LMSProvider>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').then(
                    function(registration) {
                      console.log('BEMS PWA ServiceWorker registered with scope: ', registration.scope);
                    },
                    function(err) {
                      console.log('BEMS PWA ServiceWorker registration failed: ', err);
                    }
                  );
                });
              }
            `
          }}
        />
      </body>
    </html>
  );
}
