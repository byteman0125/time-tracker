import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { LeftNav } from "@/components/LeftNav";
import { GlobalHeaderProvider } from "@/components/GlobalHeaderProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Interview OS - Time Tracker",
  description: "Track and manage your interview process with professional tools",
  icons: {
    icon: "/icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden">
          <LeftNav />
          <div className="flex flex-1 flex-col overflow-hidden min-w-0">
            <GlobalHeaderProvider />
            <main className="flex-1 overflow-hidden min-w-0">{children}</main>
          </div>
        </div>
      </body>
    </html>
  );
}

