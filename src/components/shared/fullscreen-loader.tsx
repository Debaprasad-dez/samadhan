interface LoaderDetail {
  name: string;
  role: string;
}

// Full-screen loading overlay for client transitions that outlast a button
// spinner — e.g. picking a persona or signing in while the destination route
// compiles/streams. Native-app feel: a pulsing brand orb, the persona's
// details when known, and an indeterminate progress bar. Held until unmount.
export function FullscreenLoader({
  label = "Loading…",
  detail,
}: {
  label?: string;
  detail?: LoaderDetail;
}) {
  const initial = detail?.name.trim().charAt(0).toUpperCase() || "S";
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={detail ? `Signing in as ${detail.name}` : label}
      className="bg-background/85 fixed inset-0 z-[100] flex flex-col items-center justify-center gap-7 backdrop-blur-md"
    >
      {/* pulsing brand orb — concentric rings expand outward (reuses voice-ring) */}
      <div className="relative grid h-24 w-24 place-items-center">
        <span className="voice-ring bg-brand/25 absolute inset-0 rounded-full" />
        <span
          className="voice-ring bg-brand/15 absolute inset-0 rounded-full"
          style={{ animationDelay: "0.6s" }}
        />
        <span
          className="voice-ring bg-brand/10 absolute inset-0 rounded-full"
          style={{ animationDelay: "1.2s" }}
        />
        <div className="brand-float bg-brand text-brand-foreground shadow-elev-2 font-display relative grid h-16 w-16 place-items-center rounded-full text-2xl font-semibold">
          {initial}
        </div>
      </div>

      {/* persona details when available */}
      <div className="flex flex-col items-center gap-1 text-center">
        {detail && (
          <>
            <p className="font-display text-lg font-semibold">{detail.name}</p>
            <p className="text-brand text-sm">{detail.role}</p>
          </>
        )}
        <p className="text-muted-foreground mt-0.5 text-sm">{label}</p>
      </div>

      {/* indeterminate progress bar */}
      <div className="bg-border relative h-1 w-52 overflow-hidden rounded-full">
        <span className="loader-indeterminate bg-brand absolute inset-y-0 rounded-full" />
      </div>
    </div>
  );
}
