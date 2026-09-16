// Server-safe no-flash script generator. Kept OUT of the "use client"
// theme-provider module so RootLayout (a Server Component) can call it directly.
// Sets data-theme/data-mode on <html> before first paint (a blocking inline
// <script>), so a stored theme/mode never flashes the default on load.
//
// Keys are role-scoped (samadhan-theme-<role> / samadhan-mode-<role>) so each
// role's preferences are independent.

/**
 * Themes whose citizen palette is dark.
 *
 * The citizen app and sign-in paint from `.chome` palettes that are fixed per
 * theme — there is no light Mughal Indigo or dark Civic Steel there. So on
 * those surfaces light/dark is not a separate choice: it follows the theme.
 * Letting it drift independently is what put a black loading screen under a
 * light Civic Steel page, because the Tailwind layer (body, skeletons, toasts,
 * loaders) does follow data-mode.
 */
export const DARK_THEMES: readonly string[] = ["mughal-indigo"];

export function modeForTheme(theme: string): "light" | "dark" {
  return DARK_THEMES.includes(theme) ? "dark" : "light";
}

export function themeNoFlashScript(
  role = "citizen",
  defaultTheme = "bharat-dawn",
  /** Citizens and signed-out visitors: derive the mode from the theme. Staff
   *  keep an independent light/dark preference. */
  modeFollowsTheme = false,
): string {
  const tk = `samadhan-theme-${role}`;
  const mk = `samadhan-mode-${role}`;
  // Stored theme selection, or the role default. Applies on signed-out pages
  // too: sign-in carries its own theme row.
  const themeExpr = `(localStorage.getItem('${tk}')||'${defaultTheme}')`;
  const modeExpr = modeFollowsTheme
    ? `(${JSON.stringify(DARK_THEMES)}.indexOf(t)>-1?'dark':'light')`
    : `(function(){var m=localStorage.getItem('${mk}')||'light';return m==='system'?(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'):m;})()`;
  return `(function(){try{var t=${themeExpr};var rm=${modeExpr};var e=document.documentElement;e.setAttribute('data-theme',t);e.setAttribute('data-mode',rm);}catch(e){}})();`;
}
