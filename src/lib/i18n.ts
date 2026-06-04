import en from "../../messages/en.json";
import hi from "../../messages/hi.json";

// v1 ships en + hi (§11.2). More locales: drop a JSON in /messages and register here.
export const dictionaries = { en, hi };
export type Locale = keyof typeof dictionaries;
export type Dict = typeof en;

export function getDict(locale: string): Dict {
  return (dictionaries as Record<string, Dict>)[locale] ?? en;
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
