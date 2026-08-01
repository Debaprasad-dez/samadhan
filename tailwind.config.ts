import type { Config } from "tailwindcss";

// Colours map to CSS variables (themes.css) as `hsl(var(--token) / <alpha-value>)`
// so opacity utilities work and every theme×mode recolours automatically.
// See themes.css for the accent (saturated, art) vs accent-muted (shadcn hover) split.
const config: Config = {
  darkMode: ["selector", '[data-mode="dark"]'],
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "1rem",
      screens: { "2xl": "1280px" },
    },
    extend: {
      colors: {
        // shadcn-conventional (aliased to design tokens in themes.css)
        border: "hsl(var(--border) / <alpha-value>)",
        "border-strong": "hsl(var(--border-strong) / <alpha-value>)",
        input: "hsl(var(--input) / <alpha-value>)",
        ring: "hsl(var(--ring) / <alpha-value>)",
        background: "hsl(var(--background) / <alpha-value>)",
        foreground: "hsl(var(--foreground) / <alpha-value>)",
        primary: {
          DEFAULT: "hsl(var(--primary) / <alpha-value>)",
          foreground: "hsl(var(--primary-foreground) / <alpha-value>)",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary) / <alpha-value>)",
          foreground: "hsl(var(--secondary-foreground) / <alpha-value>)",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive) / <alpha-value>)",
          foreground: "hsl(var(--destructive-foreground) / <alpha-value>)",
        },
        muted: {
          DEFAULT: "hsl(var(--muted) / <alpha-value>)",
          foreground: "hsl(var(--muted-foreground) / <alpha-value>)",
        },
        popover: {
          DEFAULT: "hsl(var(--popover) / <alpha-value>)",
          foreground: "hsl(var(--popover-foreground) / <alpha-value>)",
        },
        card: {
          DEFAULT: "hsl(var(--card) / <alpha-value>)",
          foreground: "hsl(var(--card-foreground) / <alpha-value>)",
        },
        // shadcn muted hover surface (was `accent`, renamed to avoid the clash)
        "accent-muted": {
          DEFAULT: "hsl(var(--accent-muted) / <alpha-value>)",
          foreground: "hsl(var(--accent-muted-foreground) / <alpha-value>)",
        },

        // ---- design tokens (source of truth) ----
        text: {
          DEFAULT: "hsl(var(--text) / <alpha-value>)",
          muted: "hsl(var(--text-muted) / <alpha-value>)",
          subtle: "hsl(var(--text-subtle) / <alpha-value>)",
        },
        surface: {
          DEFAULT: "hsl(var(--surface) / <alpha-value>)",
          muted: "hsl(var(--surface-muted) / <alpha-value>)",
        },
        brand: {
          DEFAULT: "hsl(var(--brand) / <alpha-value>)",
          hover: "hsl(var(--brand-hover) / <alpha-value>)",
          soft: "hsl(var(--brand-soft) / <alpha-value>)",
          foreground: "hsl(var(--primary-foreground) / <alpha-value>)",
        },
        // design's SATURATED cultural accent (art utilities)
        accent: {
          DEFAULT: "hsl(var(--accent) / <alpha-value>)",
          soft: "hsl(var(--accent-soft) / <alpha-value>)",
        },
        "accent-soft": "hsl(var(--accent-soft) / <alpha-value>)",
        "accent-blue": "hsl(var(--accent-blue) / <alpha-value>)",
        success: {
          DEFAULT: "hsl(var(--success) / <alpha-value>)",
          soft: "hsl(var(--success-soft) / <alpha-value>)",
        },
        warning: {
          DEFAULT: "hsl(var(--warning) / <alpha-value>)",
          soft: "hsl(var(--warning-soft) / <alpha-value>)",
        },
        danger: {
          DEFAULT: "hsl(var(--danger) / <alpha-value>)",
          soft: "hsl(var(--danger-soft) / <alpha-value>)",
        },
        info: {
          DEFAULT: "hsl(var(--info) / <alpha-value>)",
          soft: "hsl(var(--info-soft) / <alpha-value>)",
        },
        // decorative motif colours (per theme)
        "motif-1": "hsl(var(--motif-1) / <alpha-value>)",
        "motif-2": "hsl(var(--motif-2) / <alpha-value>)",
        "motif-3": "hsl(var(--motif-3) / <alpha-value>)",
        "motif-gold": "hsl(var(--motif-gold) / <alpha-value>)",
      },
      borderRadius: {
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
        xl: "var(--radius-xl)",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "var(--font-mukta)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "Georgia", "serif"],
        mono: ["var(--font-jetbrains)", "ui-monospace", "monospace"],
        baloo: ["var(--font-baloo)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        "elev-1": "0 1px 2px rgba(0,0,0,.04), 0 1px 3px rgba(0,0,0,.03)",
        "elev-2": "0 4px 12px rgba(0,0,0,.06), 0 2px 4px rgba(0,0,0,.04)",
        "elev-3": "0 12px 32px rgba(0,0,0,.10), 0 4px 8px rgba(0,0,0,.06)",
        "elev-4": "0 24px 64px rgba(0,0,0,.16)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
        "pulse-dot": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.4" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.22s cubic-bezier(0.16,1,0.3,1)",
        "accordion-up": "accordion-up 0.22s cubic-bezier(0.16,1,0.3,1)",
        shimmer: "shimmer 1.5s infinite",
        "pulse-dot": "pulse-dot 1.5s ease-in-out infinite",
      },
      transitionTimingFunction: {
        snappy: "cubic-bezier(0.16, 1, 0.3, 1)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
