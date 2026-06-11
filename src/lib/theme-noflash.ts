// Server-safe no-flash script generator (design §2.2). Kept OUT of the
// "use client" theme-provider module so RootLayout (a Server Component) can call
// it directly. Sets data-theme/data-mode before first paint.
//
// Keys are role-scoped (samadhan-theme-<role> / samadhan-mode-<role>) so each
// role's theme+mode are independent. When `lockedTheme` is given (staff roles),
// the theme is hardcoded and the stored theme key is ignored — only the
// light/dark mode is read from storage.

export function themeNoFlashScript(
  role = "citizen",
  lockedTheme?: string,
  forcedMode?: "light" | "dark",
): string {
  const mk = `samadhan-mode-${role}`;
  const themeExpr = lockedTheme
    ? `'${lockedTheme}'`
    : `localStorage.getItem('samadhan-theme-${role}')||'bharat-dawn'`;
  // forcedMode (logged-out pages) pins the mode and ignores storage / OS pref.
  const modeExpr = forcedMode
    ? `'${forcedMode}'`
    : `(function(){var m=localStorage.getItem('${mk}')||'system';return m==='system'?(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'):m;})()`;
  return `(function(){try{var t=${themeExpr};var rm=${modeExpr};var e=document.documentElement;e.setAttribute('data-theme',t);e.setAttribute('data-mode',rm);}catch(e){}})();`;
}
