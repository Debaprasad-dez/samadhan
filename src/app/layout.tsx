import type { Metadata, Viewport } from "next";
import "./globals.css";
import { fontVariables } from "./fonts";
import { getCurrentUser } from "@/lib/auth";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { themeNoFlashScript } from "@/lib/theme-noflash";
import { QueryProvider } from "@/components/providers/query-provider";
import { SessionProvider } from "@/components/providers/session-provider";
import { LocaleProvider } from "@/components/providers/locale-provider";
import { Toaster } from "@/components/ui/sonner";
import { PWARegister } from "@/components/shared/pwa-register";
import { OfflineBanner } from "@/components/shared/offline-banner";

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
  const role = user?.role?.toLowerCase() ?? "citizen";
  // All four themes are user-selectable; the role only sets the default —
  // staff start on Civic Steel, everyone else on Bharat Dawn.
  const defaultTheme =
    role === "officer" || role === "admin" ? "civic-steel" : "bharat-dawn";
  // Light/dark is a signed-in feature: logged-out pages (login, etc.) always
  // render in light mode regardless of stored preference or OS setting.
  const forcedMode: "light" | "dark" | undefined = user ? undefined : "light";

  // RTL for Urdu (spec §5): set dir on <html> so text and logical properties
  // mirror. Everything else defaults to ltr.
  const lang = user?.language ?? "en";
  const dir = lang === "ur" ? "rtl" : "ltr";

  return (
    <html
      lang={lang}
      dir={dir}
      suppressHydrationWarning
      className={fontVariables}
    >
      <head>
        {/* No-flash: set data-theme/data-mode before first paint (design §2.2).
            suppressHydrationWarning: browser extensions inject their own <script>
            into <head> before React hydrates, shifting this node's index and
            tripping a benign mismatch — same guard next-themes uses.
            Role-scoped keys keep citizen/officer/admin themes independent. */}
        <script
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html: themeNoFlashScript(role, defaultTheme, forcedMode),
          }}
        />
      </head>
      <body className="min-h-dvh bg-background text-foreground font-sans antialiased">
        <ThemeProvider
          role={role}
          defaultTheme={defaultTheme}
          forcedMode={forcedMode}
        >
          <QueryProvider>
            <SessionProvider user={user}>
              <LocaleProvider locale={user?.language ?? "en"}>
                <OfflineBanner />
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
