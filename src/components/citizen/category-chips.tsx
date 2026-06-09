"use client";

import { useRouter } from "next/navigation";
import { useIntakeStore } from "@/store/intake";
import { useT } from "@/components/providers/locale-provider";

// Quick category chips under the CTA. Tapping one drops a "#Tag" into the draft
// description and opens the complaint form (step 1) with it pre-filled.
const CHIPS = [
  { tag: "Water",       key: "water",       icon: `<path d="M12 2c3 4 5 6.5 5 9a5 5 0 0 1-10 0c0-2.5 2-5 5-9Z" fill="currentColor"/>` },
  { tag: "Roads",       key: "roads",       icon: `<path d="M3 18h18M6 18l1.5-12h9L18 18M9 6v12M15 6v12" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" fill="none"/>` },
  { tag: "Garbage",     key: "garbage",     icon: `<path d="M6 9h12l-1 11H7L6 9Zm2-3h8l1 3H7l1-3Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" fill="none"/>` },
  { tag: "Power",       key: "power",       icon: `<path d="M13 2 4 14h7l-1 9 9-12h-7l1-9Z" fill="currentColor"/>` },
  { tag: "Streetlight", key: "streetlight", icon: `<path d="M12 3v3M12 18v3M5 12H2M22 12h-3" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><circle cx="12" cy="12" r="4" fill="currentColor"/>` },
];

export function CategoryChips() {
  const t = useT();
  const router = useRouter();
  const body = useIntakeStore((s) => s.body);
  const setField = useIntakeStore((s) => s.setField);

  function add(tag: string) {
    const hashtag = `#${tag}`;
    // Avoid duplicating a tag already present.
    const next = body.includes(hashtag)
      ? body
      : body.trim()
        ? `${body.trim()} ${hashtag}`
        : hashtag;
    setField("body", next);
    router.push("/file");
  }

  return (
    <div className="relative z-[1] -mb-1 mt-3 flex gap-1.5 overflow-x-auto pb-1 [scrollbar-width:none]">
      {CHIPS.map(({ tag, key, icon }) => (
        <button
          key={key}
          type="button"
          onClick={() => add(tag)}
          className="flex flex-none items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11.5px] font-semibold"
          style={{
            background: "var(--g-paper)",
            borderColor: "var(--g-line)",
            color: "var(--g-chip-ink)",
          }}
        >
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            style={{ color: "var(--g-primary)" }}
            dangerouslySetInnerHTML={{ __html: icon }}
          />
          {t(`chips.${key}`)}
        </button>
      ))}
    </div>
  );
}
