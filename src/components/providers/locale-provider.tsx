"use client";

import { createContext, useContext, type ReactNode } from "react";
import { getDict, translate, type Dict } from "@/lib/i18n";

const LocaleContext = createContext<Dict>(getDict("en"));

export function LocaleProvider({
  locale,
  children,
}: {
  locale: string;
  children: ReactNode;
}) {
  return (
    <LocaleContext.Provider value={getDict(locale)}>
      {children}
    </LocaleContext.Provider>
  );
}

/** Translate a dotted key (e.g. "nav.home"). */
export function useT() {
  const dict = useContext(LocaleContext);
  return (key: string) => translate(dict, key);
}
