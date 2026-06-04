import type { Metadata, Viewport } from "next";
import "./globals.css";
import { fontVariables } from "./fonts";
import { getCurrentUser } from "@/lib/auth";
import {
  ThemeProvider,
  themeNoFlashScript,
} from "@/components/providers/theme-provider";
import { QueryProvider } from "@/components/providers/query-provider";
import { SessionProvider } from "@/components/providers/session-provider";
import { LocaleProvider } from "@/components/providers/locale-provider";
import { Toaster } from "@/components/ui/sonner";
import { PWARegister } from "@/components/shared/pwa-register";

export const metadata: Metadata = {
  title: "Samadhan — Civic Resolution Network",
  description:
    "Every government complaint as a visible, trackable service journey with public accountability.",
  applicationName: "Samadhan",
  manifest: "/manifest.webmanifest",
  icons: { icon: "/icons/icon.svg", apple: "/icons/icon.svg" },
  appleWebApp: { capable: true, title: "Samadhan", statusBarStyle: "default" },
};

// NOTE: themeColor is static PWA chrome metadata (browser UI bar) — it cannot read
// runtime CSS variables, so these literal values are a documented exception
// (matches bharat-dawn default bg). See design addendum "Known exceptions".
export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FBF7EE" },
    { media: "(prefers-color-scheme: dark)", color: "#15100B" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  return (
    <html lang="en" suppressHydrationWarning className={fontVariables}>
      <head>
        {/* No-flash: set data-theme/data-mode before first paint (design §2.2). */}
        <script dangerouslySetInnerHTML={{ __html: themeNoFlashScript }} />
      </head>
      <body className="min-h-dvh bg-background text-foreground font-sans antialiased">
        <ThemeProvider>
          <QueryProvider>
            <SessionProvider user={user}>
              <LocaleProvider locale={user?.language ?? "en"}>
                {children}
                <Toaster richColors position="top-right" />
                <PWARegister />
              </LocaleProvider>
            </SessionProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
