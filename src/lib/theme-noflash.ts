// Server-safe no-flash script generator. Kept OUT of the "use client"
// theme-provider module so RootLayout (a Server Component) can call it directly.
// Sets data-theme/data-mode on <html> before first paint (a blocking inline
// <script>), so a stored theme/mode never flashes the default on load.
//
// Keys are role-scoped (samadhan-theme-<role> / samadhan-mode-<role>) so each
// role's preferences are independent. `forcedMode` (logged-out pages) pins the
// mode and also pins the theme to the role default (bright Bharat Dawn light).

export function themeNoFlashScript(
  role = "citizen",
  defaultTheme = "bharat-dawn",
  forcedMode?: "light" | "dark",
): string {
  const tk = `samadhan-theme-${role}`;
  const mk = `samadhan-mode-${role}`;
  const modeExpr = forcedMode
    ? `'${forcedMode}'`
    : `(function(){var m=localStorage.getItem('${mk}')||'light';return m==='system'?(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'):m;})()`;
  // Stored theme selection, or the role default. Logged-out pages force the
  // default so login/role-switch always render in bright Bharat Dawn light.
  const themeExpr = forcedMode
    ? `'${defaultTheme}'`
    : `(localStorage.getItem('${tk}')||'${defaultTheme}')`;
  return `(function(){try{var rm=${modeExpr};var t=${themeExpr};var e=document.documentElement;e.setAttribute('data-theme',t);e.setAttribute('data-mode',rm);}catch(e){}})();`;
}
