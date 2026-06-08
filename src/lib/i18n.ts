import en from "../../messages/en.json";
import hi from "../../messages/hi.json";
import bn from "../../messages/bn.json";
import mr from "../../messages/mr.json";
import gu from "../../messages/gu.json";
import ta from "../../messages/ta.json";
import te from "../../messages/te.json";

// Registered translation dictionaries. A locale with no dictionary here falls
// back to English per-key (see translate + getDict), so every option in LOCALES
// stays usable while its messages/<code>.json is still being authored.
export const dictionaries: Record<string, typeof en> = {
  en,
  hi,
  bn,
  mr,
  gu,
  ta,
  te,
};
export type Locale = string;
export type Dict = typeof en;

// The 22 languages of the Eighth Schedule of the Constitution of India + English.
// `native` is the endonym (own script); `english` the English name.
export type LocaleInfo = { code: string; native: string; english: string };
export const LOCALES: LocaleInfo[] = [
  { code: "en", native: "English", english: "English" },
  { code: "hi", native: "हिन्दी", english: "Hindi" },
  { code: "bn", native: "বাংলা", english: "Bengali" },
  { code: "mr", native: "मराठी", english: "Marathi" },
  { code: "te", native: "తెలుగు", english: "Telugu" },
  { code: "ta", native: "தமிழ்", english: "Tamil" },
  { code: "gu", native: "ગુજરાતી", english: "Gujarati" },
  { code: "ur", native: "اردو", english: "Urdu" },
  { code: "kn", native: "ಕನ್ನಡ", english: "Kannada" },
  { code: "or", native: "ଓଡ଼ିଆ", english: "Odia" },
  { code: "ml", native: "മലയാളം", english: "Malayalam" },
  { code: "pa", native: "ਪੰਜਾਬੀ", english: "Punjabi" },
  { code: "as", native: "অসমীয়া", english: "Assamese" },
  { code: "mai", native: "मैथिली", english: "Maithili" },
  { code: "sat", native: "ᱥᱟᱱᱛᱟᱲᱤ", english: "Santali" },
  { code: "ks", native: "کٲشُر", english: "Kashmiri" },
  { code: "ne", native: "नेपाली", english: "Nepali" },
  { code: "kok", native: "कोंकणी", english: "Konkani" },
  { code: "sd", native: "سنڌي", english: "Sindhi" },
  { code: "doi", native: "डोगरी", english: "Dogri" },
  { code: "mni", native: "ꯃꯩꯇꯩꯂꯣꯟ", english: "Manipuri" },
  { code: "brx", native: "बर'", english: "Bodo" },
  { code: "sa", native: "संस्कृतम्", english: "Sanskrit" },
];

// Right-to-left scripts among the set (for dir handling).
export const RTL_LOCALES = new Set(["ur", "ks", "sd"]);

export function getDict(locale: string): Dict {
  return dictionaries[locale] ?? en;
}

/** Resolve a dotted key path, falling back to the key itself. */
export function translate(dict: Dict, key: string): string {
  const value = key
    .split(".")
    .reduce<unknown>(
      (o, k) =>
        o && typeof o === "object"
          ? (o as Record<string, unknown>)[k]
          : undefined,
      dict,
    );
  return typeof value === "string" ? value : key;
}
