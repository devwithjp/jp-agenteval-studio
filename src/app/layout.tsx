import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { app } from "@/lib/site";
import { AppNav } from "@/components/app-nav";
import { liveModeAvailable } from "@/lib/anthropic";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: { default: `${app.name} — ${app.tagline}`, template: `%s — ${app.name}` },
  description: app.description,
};

const themeScript = `(function(){try{var t=localStorage.getItem('theme');if(t==='light'){document.documentElement.classList.add('light');}}catch(e){}})();`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const liveAvailable = liveModeAvailable();
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="flex min-h-full flex-col font-sans">
        <AppNav liveAvailable={liveAvailable} />
        <main className="flex-1">{children}</main>
        <footer className="mt-auto border-t border-line">
          <div className="mx-auto flex w-full max-w-6xl flex-col items-start justify-between gap-3 px-5 py-8 text-sm text-muted sm:flex-row sm:items-center sm:px-8">
            <span>{app.name} — part of JP&apos;s AI portfolio</span>
            <a href={app.githubUrl} target="_blank" rel="noopener noreferrer" className="hover:text-fg">
              Source on GitHub
            </a>
          </div>
        </footer>
      </body>
    </html>
  );
}
