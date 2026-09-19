import { WARDS, DEPARTMENTS } from "@/lib/seed-data";
import { LOCALES } from "@/lib/i18n";

const IC = {
  wards: (
    <>
      <path d="M4 20V9.4L12 4l8 5.4V20" />
      <path d="M9.4 20v-5.6h5.2V20" />
    </>
  ),
  depts: (
    <>
      <path d="M4.6 20V6.2h8.2V20" />
      <path d="M12.8 20V10.6h6.6V20" />
      <path d="M7.4 9.4h2.6M7.4 13h2.6M15.2 13.6h1.8M15.2 16.8h1.8" />
    </>
  ),
  langs: (
    <>
      <circle cx="12" cy="12" r="8" />
      <path d="M4 12h16M12 4c2.1 2.3 3.1 5 3.1 8s-1 5.7-3.1 8c-2.1-2.3-3.1-5-3.1-8S9.9 6.3 12 4Z" />
    </>
  ),
} as const;

/**
 * Three facts about the service, in the flag's own colours — the tricolour
 * reads as a claim to public service, which is exactly what these numbers are.
 * Counts come from the seed data, so they cannot drift from the app.
 */
const FACTS: { k: keyof typeof IC; n: string; label: string; short: string }[] = [
  { k: "wards", n: String(WARDS.length), label: "wards", short: "wards" },
  { k: "depts", n: String(DEPARTMENTS.length), label: "departments", short: "depts" },
  { k: "langs", n: String(LOCALES.length), label: "languages", short: "langs" },
];

export function CivicStrip() {
  return (
    <ul className="civicstrip fadeup" style={{ animationDelay: ".16s" }}>
      {FACTS.map((f, i) => (
        <li key={f.k} style={{ ["--i" as string]: i }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            {IC[f.k]}
          </svg>
          <b>{f.n}</b>
          {/* A number with no noun says nothing; the narrowest phones get the
              short word rather than none. */}
          <span className="full">{f.label}</span>
          <span className="short">{f.short}</span>
        </li>
      ))}
    </ul>
  );
}
