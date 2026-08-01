// Fonts (design §4.5 + mockup): Fraunces display + Inter UI + JetBrains Mono,
// with Devanagari (Tiro/Mukta) fallbacks so Hindi still renders.
import {
  Fraunces,
  Inter,
  Tiro_Devanagari_Sanskrit,
  Mukta,
  JetBrains_Mono,
  Yatra_One,
  Baloo_2,
} from "next/font/google";

// Display — editorial serif (mockup: Fraunces 500 for display).
export const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
});

// UI sans — Inter for everything functional (mockup default).
export const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

// Display — dignified, official (default for most themes)
export const tiro = Tiro_Devanagari_Sanskrit({
  subsets: ["latin", "devanagari"],
  weight: ["400"],
  variable: "--font-tiro",
  display: "swap",
});

// Display — warm, characterful (mithila-bloom, coromandel-pattachitra)
export const yatra = Yatra_One({
  subsets: ["latin", "devanagari"],
  weight: ["400"],
  variable: "--font-yatra",
  display: "swap",
});

// Body — highly legible Devanagari + Latin
export const mukta = Mukta({
  subsets: ["latin", "devanagari"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-mukta",
  display: "swap",
});

// Mono — case numbers, timestamps
export const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

// Accent numerals — celebratory/gamified moments only
export const baloo = Baloo_2({
  subsets: ["latin", "devanagari"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-baloo",
  display: "swap",
});

export const fontVariables = [
  fraunces.variable,
  inter.variable,
  tiro.variable,
  yatra.variable,
  mukta.variable,
  jetbrains.variable,
  baloo.variable,
].join(" ");
