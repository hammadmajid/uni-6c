import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { ProgressHydrator } from "@/components/learning/ProgressHydrator";
import "./globals.css";

export const metadata: Metadata = {
  title: "6C · Semester Lab",
  description: "Interactive lessons for SZABIST 6th semester courses.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`dark ${GeistSans.variable} ${GeistMono.variable}`}>
      <body className="min-h-screen bg-background-100 font-sans text-gray-1000 antialiased">
        <ProgressHydrator />
        {children}
      </body>
    </html>
  );
}
