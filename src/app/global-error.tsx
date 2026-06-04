"use client";

// Global error boundary — replaces the root layout when an error occurs there,
// so it must render its own <html>/<body> and CANNOT rely on the theme token
// pipeline (globals.css / themes.css / Tailwind may be unavailable at this point).
// DOCUMENTED EXCEPTION to the "never hardcode a colour" rule: a minimal inline
// fallback palette is used here on purpose. See design addendum "Known exceptions".
export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "system-ui, sans-serif",
          background: "#FBFAF6",
          color: "#1A1D24",
        }}
      >
        <div style={{ textAlign: "center", padding: 24, maxWidth: 420 }}>
          <h1 style={{ fontSize: 24, marginBottom: 8 }}>Something went wrong</h1>
          <p style={{ color: "#5A6170", marginBottom: 20 }}>
            An unexpected error occurred. Please try again.
          </p>
          <button
            onClick={reset}
            style={{
              background: "#C25527",
              color: "#fff",
              border: 0,
              borderRadius: 10,
              padding: "10px 18px",
              fontSize: 15,
              cursor: "pointer",
            }}
          >
            Reload
          </button>
        </div>
      </body>
    </html>
  );
}
