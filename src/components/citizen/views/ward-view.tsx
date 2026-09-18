import Link from "next/link";
import { WARDS } from "@/lib/seed-data";
import { getWardExplorer } from "@/lib/ward-explorer";
import type { SessionUser } from "@/types";
import { WardExplorer } from "@/components/citizen/ward-explorer";
import { Slot } from "@/components/citizen/slot";

const IC = {
  back: <path d="M14.5 5.5 8 12l6.5 6.5" />,
  bell: <><path d="M6 10a6 6 0 1 1 12 0c0 4 1.5 5.5 1.5 5.5h-15S6 14 6 10Z" /><path d="M10 19a2 2 0 0 0 4 0" /></>,
} as const;

function Icon({ d, sw = 1.7 }: { d: keyof typeof IC; sw?: number }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
      {IC[d]}
    </svg>
  );
}

/** The 51-ward dataset, and the city-wide open count for the eyebrow. */
export async function loadWard(user: SessionUser | null) {
  const wards = await getWardExplorer(user?.wardCode);
  return { wards, total: wards.reduce((a, w) => a + w.open, 0) };
}

export type WardData = Awaited<ReturnType<typeof loadWard>>;

/**
 * The ward explorer. Rendered from loading.tsx with `data={null}`, when the 3D
 * block runs in ghost mode — the same 51 prisms, faint, breathing — until the
 * real heights arrive. See Slot.
 */
export function WardView({ data, code }: { data: Promise<WardData> | null; code: string }) {
  return (
    <div className="chome wardpage">
      <div className="shell">
        <header className="top">
          <div className="row">
            <Link href="/feed" className="backbtn" aria-label="Back">
              <Icon d="back" sw={1.9} />
            </Link>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="greet" style={{ fontSize: "17px" }}>Ward explorer</div>
              <div className="ward">Agartala · {WARDS.length} wards · drag to rotate</div>
            </div>
            <Link href="/notifications" className="bell" aria-label="Notifications">
              <Icon d="bell" />
            </Link>
          </div>
        </header>

        <Slot data={data} fallback={<WardExplorer wards={null} initial="" />}>
          {(d) => <WardExplorer wards={d.wards} initial={code} total={d.total} />}
        </Slot>
      </div>
    </div>
  );
}
