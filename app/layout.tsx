import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "NQT Compass — 60-Day TCS NQT Aptitude Planner",
  description: "Complete TCS NQT aptitude syllabus, chapter-wise tests, a 60-day routine, and performance analytics.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-[#f6f7fb] text-slate-900 antialiased">{children}</body>
    </html>
  );
}
