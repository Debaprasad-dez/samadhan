import Link from "next/link";
import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { WARDS } from "@/lib/seed-data";
import { getWardExplorer } from "@/lib/ward-explorer";
import { WardExplorer } from "@/components/citizen/ward-explorer";

const IC = {
  back: <path d="M14.5 5.5 8 12l6.5 6.5" />,
  bell: <><path d="M6 10a6 6 0 1 1 12 0c0 4 1.5 5.5 1.5 5.5h-15S6 14 6 10Z" /><path d="M10 19a2 2 0 0 0 4 0" /></>,
  home: <path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-9.5Z" />,
  feed: <><rect x="3.5" y="4.5" width="17" height="15" rx="2" /><path d="M7 9h6M7 13h10M7 16h7" /></>,
  plus: <path d="M12 5v14M5 12h14" />,
  list: <path d="M9 6.5h11M9 12h11M9 17.5h11M4.5 6.5h.01M4.5 12h.01M4.5 17.5h.01" />,
  user: <><circle cx="12" cy="8.5" r="3.8" /><path d="M4.8 20.2a7.4 7.4 0 0 1 14.4 0" /></>,
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

      <nav className="nav">
        <Link href="/" className="nb"><Icon d="home" /><b>Home</b></Link>
        <Link href="/feed" className="nb on"><Icon d="feed" /><b>Feed</b></Link>
        <Link href="/file" className="nb fab" aria-label="File a complaint">
          <div className="f"><Icon d="plus" sw={2.2} /></div>
        </Link>
        <Link href="/cases" className="nb"><Icon d="list" /><b>Cases</b></Link>
        <Link href="/profile" className="nb"><Icon d="user" /><b>Profile</b></Link>
      </nav>
    </div>
  );
}
