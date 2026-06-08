import en from "../../messages/en.json";
import hi from "../../messages/hi.json";
import bn from "../../messages/bn.json";
import mr from "../../messages/mr.json";
import gu from "../../messages/gu.json";
import ta from "../../messages/ta.json";
import te from "../../messages/te.json";
import ur from "../../messages/ur.json";
import kn from "../../messages/kn.json";
import ml from "../../messages/ml.json";
import or from "../../messages/or.json";
import pa from "../../messages/pa.json";
import as from "../../messages/as.json";
import ne from "../../messages/ne.json";
import sa from "../../messages/sa.json";
import mai from "../../messages/mai.json";
import kok from "../../messages/kok.json";
import doi from "../../messages/doi.json";

// Registered translation dictionaries. A locale with no dictionary here falls
// back to English per-key (see translate + getDict), so every option in LOCALES
// stays usable while its messages/<code>.json is still being authored.
// Typed loosely: dictionaries may be partial (missing keys fall back to English
// via translate), so they need not all match the English shape exactly.
export const dictionaries: Record<string, unknown> = {
  en,
  hi,
  bn,
  mr,
  gu,
  ta,
  te,
  ur,
  kn,
  ml,
  or,
  pa,
  as,
  ne,
  sa,
  mai,
  kok,
  doi,
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
  return (dictionaries[locale] as Dict) ?? en;
}

function resolve(dict: unknown, key: string): unknown {
  return key
    .split(".")
    .reduce<unknown>(
      (o, k) =>
        o && typeof o === "object"
          ? (o as Record<string, unknown>)[k]
          : undefined,
      dict,
    );
}

/**
 * Resolve a dotted key path. Falls back to the English value when the active
 * dictionary lacks the key (so partial translations show English, never a raw
 * key), and finally to the key itself.
 */
export function translate(dict: Dict, key: string): string {
  const value = resolve(dict, key);
  if (typeof value === "string") return value;
  const fallback = resolve(en, key);
  return typeof fallback === "string" ? fallback : key;
}
