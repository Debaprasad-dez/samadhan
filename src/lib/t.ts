import { getDict, translate } from "./i18n";

/**
 * Server-side translator. Build once from the viewer's locale (e.g. in a Server
 * Component after fetching the user) and call `t("home.raiseVoice")`. Client
 * components use `useT()` from the locale provider instead.
 */
export function getT(locale: string) {
  const dict = getDict(locale);
  return (key: string) => translate(dict, key);
}
