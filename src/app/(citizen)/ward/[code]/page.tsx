import Link from "next/link";
import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { WARDS } from "@/lib/seed-data";
import { getWardExplorer } from "@/lib/ward-explorer";
import { WardExplorer } from "@/components/citizen/ward-explorer";

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

export default async function WardPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  if (!WARDS.some((w) => w.code === code)) notFound();

  const user = await getCurrentUser();
  const wards = await getWardExplorer(user?.wardCode);
  const total = wards.reduce((a, w) => a + w.open, 0);

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
              <div className="ward">MCGM · {wards.length} wards · drag to rotate</div>
            </div>
            <Link href="/notifications" className="bell" aria-label="Notifications">
              <Icon d="bell" />
            </Link>
          </div>
        </header>

        <WardExplorer wards={wards} initial={code.toLowerCase()} total={total} />
      </div>

    </div>
  );
}
