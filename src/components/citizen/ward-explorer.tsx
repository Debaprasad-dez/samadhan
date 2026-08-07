"use client";

import { useEffect, useState } from "react";
import { WardStage, type HeightBy, type ColourBy } from "@/components/citizen/ward-stage";
import type { ExplorerWard } from "@/lib/ward-explorer";

const IC = {
  down: <path d="M5.5 9.5 12 16l6.5-6.5" />,
  up2: <path d="M5.5 14.5 12 8l6.5 6.5" />,
  drop: <path d="M12 3.6c2.9 3.6 5.4 6.5 5.4 9.4a5.4 5.4 0 0 1-10.8 0c0-2.9 2.5-5.8 5.4-9.4Z" />,
  bolt: <path d="M13.4 3.2 6.2 13.4h5L10.6 20.8 17.8 10.6h-5l.6-7.4Z" />,
  road: <path d="M7.6 3.6 4.6 20.4M16.4 3.6l3 16.8M12 4.2v2.6M12 10.6v2.6M12 16.8v3" />,
  trash: <path d="M4.6 6.6h14.8M9.6 6.6V4.6h4.8v2M6.6 6.6l1 12a1.5 1.5 0 0 0 1.5 1.4h5.8a1.5 1.5 0 0 0 1.5-1.4l1-12" />,
  health: <path d="M12 5.5v13M5.5 12h13" />,
  book: <path d="M4.5 5.2h5.2a2.3 2.3 0 0 1 2.3 2.3v11a1.8 1.8 0 0 0-1.8-1.4H4.5Zm15 0h-5.2a2.3 2.3 0 0 0-2.3 2.3v11a1.8 1.8 0 0 1 1.8-1.4h5.7Z" />,
  shield: <path d="M12 3.6 5.4 6.2v5.2c0 4.2 2.8 7.6 6.6 9 3.8-1.4 6.6-4.8 6.6-9V6.2Z" />,
  works: <path d="M4.6 20.4h14.8M6.6 20.4V9.4l5.4-3.8 5.4 3.8v11M10.2 20.4v-4.8h3.6v4.8" />,
} as const;

function Icon({ d, sw = 1.7 }: { d: keyof typeof IC; sw?: number }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
      {IC[d]}
    </svg>
  );
}

const tone = (v: number, limit: number) =>
  v >= limit ? "danger" : v >= limit * 0.78 ? "warn" : "ok";

/** The limit marker sits at 78% of the track, so the fill is scaled to match. */
function Bar({ v, limit }: { v: number; limit: number }) {
  const pct = Math.min(100, (v / limit) * 78);
  return (
    <div className="trk" style={{ marginTop: 9 }}>
      <i style={{ width: `${pct.toFixed(0)}%`, background: `var(--${tone(v, limit)})` }} />
      <u style={{ left: "78%" }} />
    </div>
  );
}

const ord = (n: number) =>
  n % 10 === 1 && n !== 11
    ? "st"
    : n % 10 === 2 && n !== 12
      ? "nd"
      : n % 10 === 3 && n !== 13
        ? "rd"
        : "th";

const LEGLBL: Record<ColourBy, [string, string]> = {
  sla: ["GOOD", "POOR"],
  med: ["FAST", "SLOW"],
  open: ["FEW", "MANY"],
};

const RAMP = [
  "color-mix(in srgb, var(--ok) 80%, var(--hground))",
  "color-mix(in srgb, var(--ok) 45%, var(--hground))",
  "color-mix(in srgb, var(--warn) 50%, var(--hground))",
  "color-mix(in srgb, var(--warn) 85%, var(--hground))",
  "var(--danger)",
];

const HEIGHT_OPTS: [HeightBy, string][] = [
  ["open", "Open cases"],
  ["breach", "Past limit"],
  ["med", "Median days"],
];
const COLOUR_OPTS: [ColourBy, string][] = [
  ["sla", "Within limit"],
  ["med", "Median days"],
  ["open", "Open cases"],
];

export function WardExplorer({
  wards,
  initial,
  total,
}: {
  wards: ExplorerWard[];
  initial: string;
  total: number;
}) {
  const [sel, setSel] = useState(initial);
  const [heightBy, setHeightBy] = useState<HeightBy>("open");
  const [colourBy, setColourBy] = useState<ColourBy>("sla");
  const [open, setOpen] = useState(false);
  // The peek pill only exists once the sheet has been dismissed — before the
  // sheet's first arrival there is nothing to peek back at.
  const [peek, setPeek] = useState(false);

  const w = wards.find((x) => x.id === sel) ?? wards[0];

  // The sheet arrives on its own once the block has finished building, the
  // way the mockup lands it.
  useEffect(() => {
    const t = setTimeout(() => setOpen(true), 2200);
    return () => clearTimeout(t);
  }, []);

  function choose(id: string) {
    setSel(id);
    setOpen(true);
    setPeek(false);
  }
  function hide() {
    setOpen(false);
    setPeek(true);
  }

  const wtone = w.sla >= 75 ? "ok" : w.sla >= 55 ? "warn" : "danger";
  const [legLo, legHi] = LEGLBL[colourBy];

  return (
    <>
      <WardStage
        wards={wards}
        heightBy={heightBy}
        colourBy={colourBy}
        selected={sel}
        onSelect={choose}
      />

      <div className="wrap">
        <div className="reveal in" data-d="0">
          <div className="eyebrow">
            {wards.length} wards · n={total.toLocaleString("en-IN")} complaints
          </div>
          <h1 className="dspl">Busy is not the same as failing</h1>
          <p className="lede">
            Rotate the block to see behind the tall wards.{" "}
            <b>Height and colour are separate measures</b> — set them to whatever
            question you&rsquo;re asking.
          </p>

          <div className="cfg">
            <div className="cl">Height shows</div>
            <div className="segx">
              {HEIGHT_OPTS.map(([v, label]) => (
                <button
                  key={v}
                  aria-pressed={heightBy === v}
                  onClick={() => setHeightBy(v)}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="cfg">
            <div className="cl">Colour shows</div>
            <div className="segx">
              {COLOUR_OPTS.map(([v, label]) => (
                <button
                  key={v}
                  aria-pressed={colourBy === v}
                  onClick={() => setColourBy(v)}
                >
                  {label}
                </button>
              ))}
            </div>
            <div className="legend3">
              <span className="e">{legLo}</span>
              <span className="sc">
                {RAMP.map((c) => (
                  <i key={c} style={{ background: c }} />
                ))}
              </span>
              <span className="e">{legHi}</span>
            </div>
          </div>
        </div>
      </div>

      <div className={`sheet${open ? " open" : ""}`} role="region" aria-label="Selected ward detail">
        <div className="sheetbar">
          <span className="grab" />
          <button className="sclose" onClick={hide} aria-label="Hide ward detail">
            <Icon d="down" sw={2} />
          </button>
        </div>
        <div className="sheetbody">
          <div key={w.id}>
            <section className="fadein">
              <div className="wardhd">
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="wn">Ward {w.name}</div>
                  <div className="wz">{w.zone}</div>
                </div>
                {w.mine && (
                  <span
                    className="pill"
                    style={{
                      color: "var(--brand)",
                      background: "var(--brand-soft)",
                      border: "1px solid var(--brand-line)",
                      marginTop: 4,
                    }}
                  >
                    Your ward
                  </span>
                )}
              </div>
              <div className="stats" style={{ marginTop: 16 }}>
                <div>
                  <div className="sk">Open now</div>
                  <div className="sv">{w.open}</div>
                  <div className="sd">complaints</div>
                </div>
                <div>
                  <div className="sk">Within limit</div>
                  <div className="sv" style={{ color: `var(--${wtone})` }}>
                    {w.sla}
                    <small>%</small>
                  </div>
                  <div className="sd">charter time</div>
                </div>
                <div>
                  <div className="sk">Median</div>
                  <div className="sv">
                    {w.med}
                    <small>d</small>
                  </div>
                  <div className="sd">to close</div>
                </div>
              </div>
            </section>

            <section className="fadein" style={{ animationDelay: ".05s" }}>
              <div className="sh">
                <b>By department</b>
                <span>Median days vs limit</span>
              </div>
              {w.depts.length === 0 ? (
                <p className="lede" style={{ marginTop: 12 }}>
                  Nothing has been filed here yet.
                </p>
              ) : (
                w.depts.map((d) => (
                  <div className="drow" key={d.name}>
                    <div className="ic2">
                      <Icon d={(d.icon in IC ? d.icon : "works") as keyof typeof IC} />
                    </div>
                    <div className="mn2">
                      <div className="n2">{d.name}</div>
                      <div className="s7">Charter limit {d.limit} days</div>
                      <Bar v={d.med} limit={d.limit} />
                    </div>
                    <div className="r2">
                      <b style={{ color: `var(--${tone(d.med, d.limit)})` }}>{d.med}</b>
                      <span>
                        {d.med >= d.limit
                          ? `${(d.med - d.limit).toFixed(1)}d over`
                          : "on time"}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </section>

            {w.cells.length > 0 && (
              <section className="fadein" style={{ animationDelay: ".1s" }}>
                <div className="sh">
                  <b>Busiest categories</b>
                  <span>Open complaints</span>
                </div>
                {w.cells.map((c, i) => (
                  <div className="drow" key={c.name}>
                    <span className="rk">{i + 1}</span>
                    <div className="mn2">
                      <div className="n2">{c.name}</div>
                    </div>
                    <div className="r2">
                      <b
                        style={{
                          color: `var(--${c.open >= 30 ? "danger" : c.open >= 18 ? "warn" : "ink"})`,
                        }}
                      >
                        {c.open}
                      </b>
                      <span>open</span>
                    </div>
                  </div>
                ))}
              </section>
            )}

            <section className="fadein" style={{ animationDelay: ".15s" }}>
              <div className="sh">
                <b>Against other wards</b>
                <span>{wards.length} MCGM wards</span>
              </div>
              <div className="rankbox">
                <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
                  <div className="rv">
                    {w.rank}
                    <small>{ord(w.rank)}</small>
                  </div>
                  <span className={`pill ${w.rank <= 8 ? "ok" : w.rank <= 16 ? "wn" : "dg"}`}>
                    {w.rank <= 8 ? "Top third" : w.rank <= 16 ? "Middle third" : "Bottom third"}
                  </span>
                </div>
                <div className="trk" style={{ marginTop: 13 }}>
                  <i
                    style={{
                      width: `${((w.rank / wards.length) * 100).toFixed(0)}%`,
                      background: `var(--${wtone})`,
                    }}
                  />
                  <u style={{ left: "50%" }} />
                </div>
                <div className="cap">
                  <span>Best</span>
                  <span>Median ward</span>
                  <span>Worst</span>
                </div>
                <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 11, lineHeight: 1.55 }}>
                  Ranked on share closed within charter time, not on volume filed.
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>

      <div className={`peek${peek && !open ? " on" : ""}`}>
        <button onClick={() => { setOpen(true); setPeek(false); }}>
          <Icon d="up2" sw={2} />
          <span>Ward {w.name}</span>
        </button>
      </div>
    </>
  );
}
