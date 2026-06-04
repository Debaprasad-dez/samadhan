// Fonts (design §4.5). Devanagari + Latin where applicable. Inter/Fraunces removed.
import {
  Tiro_Devanagari_Sanskrit,
  Mukta,
  JetBrains_Mono,
  Yatra_One,
  Baloo_2,
} from "next/font/google";

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
  tiro.variable,
  yatra.variable,
  mukta.variable,
  jetbrains.variable,
  baloo.variable,
].join(" ");
