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
  // forcedMode (logged-out pages) pins the mode and ignores storage / OS pref.
  const modeExpr = forcedMode
    ? `'${forcedMode}'`
    : `(function(){var m=localStorage.getItem('${mk}')||'light';return m==='system'?(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'):m;})()`;
  // Theme is derived from the resolved mode: light → Bharat Dawn, dark → Mughal
  // Indigo. Staff keep their locked professional theme across both modes.
  const themeExpr = lockedTheme
    ? `'${lockedTheme}'`
    : `(rm==='dark'?'mughal-indigo':'bharat-dawn')`;
  return `(function(){try{var rm=${modeExpr};var t=${themeExpr};var e=document.documentElement;e.setAttribute('data-theme',t);e.setAttribute('data-mode',rm);}catch(e){}})();`;
}
