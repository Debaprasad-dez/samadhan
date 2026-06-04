// Monochrome line-art illustrations (§7.4.6). Inherit color via currentColor.

export function IntakeIllustration({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 120 120"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <rect x="28" y="20" width="64" height="80" rx="6" />
      <line x1="40" y1="40" x2="80" y2="40" />
      <line x1="40" y1="54" x2="80" y2="54" />
      <line x1="40" y1="68" x2="64" y2="68" />
      <circle cx="86" cy="86" r="16" />
      <line x1="86" y1="80" x2="86" y2="92" />
      <line x1="80" y1="86" x2="92" y2="86" />
    </svg>
  );
}

export function FeedIllustration({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 120 120"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <rect x="22" y="30" width="48" height="34" rx="5" />
      <rect x="50" y="56" width="48" height="34" rx="5" />
      <line x1="32" y1="42" x2="60" y2="42" />
      <line x1="60" y1="68" x2="88" y2="68" />
    </svg>
  );
}

export function InboxZeroIllustration({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 120 120"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M24 64 36 32h48l12 32" />
      <path d="M24 64v24h72V64H78a6 6 0 0 0-12 0H54a6 6 0 0 0-12 0H24z" />
      <path d="M48 100l8-8 8 8 8-8" />
    </svg>
  );
}
