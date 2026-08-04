// Cases hero — the charter limit as a physical ceiling. Each column is one case;
// its height is elapsed time divided by that category's SLA, so a 7-day case and
// a 24-hour case are directly comparable. The glass plane sits at 100%. Anything
// that breaks through it has breached and auto-escalated. Ported verbatim from
// samadhan-citizen-cases/samadhan-cases-mobile.html.

const C = Math.cos(Math.PI / 6);
const S = Math.sin(Math.PI / 6);

function seeded(s: number) {
  return () => ((s = Math.imul(s ^ (s >>> 15), 1 | s)) >>> 0) / 4294967296;
}

export interface YardCase {
  id: string;
  /** elapsed / limit — 1.0 is exactly at the charter ceiling. */
  frac: number;
}

export function limitYard(cases: YardCase[]): string {
  const W = 430, H = 306, u = 19.0, ox = 127, oy = 106;
  const rnd = seeded(3307);
  const P = (x: number, y: number, z: number): [number, number] => [
    ox + (x - y) * C * u,
    oy + (x + y) * S * u - z * u,
  ];
  const poly = (a: [number, number][]) =>
    a.map((q) => q[0].toFixed(2) + "," + q[1].toFixed(2)).join(" ");
  const LN = "var(--hline)";
  const LIMZ = 3.0; // the ceiling, in grid units
  const BW = 10.4, BD = 4.4; // base slab footprint

  let s = `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Your cases as columns. Height is elapsed time against each category's charter limit. The glass plane marks the limit; columns through it have escalated.">
   <defs>
    <linearGradient id="csky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="var(--h1)"/><stop offset=".5" stop-color="var(--h2)"/><stop offset="1" stop-color="var(--h3)"/></linearGradient>
    <radialGradient id="cgl" cx=".5" cy=".5" r=".5">
      <stop offset="0" stop-color="var(--hglow)" stop-opacity=".85"/>
      <stop offset=".45" stop-color="var(--hglow)" stop-opacity=".18"/>
      <stop offset="1" stop-color="var(--hglow)" stop-opacity="0"/></radialGradient>
    <linearGradient id="cfL" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#fff" stop-opacity=".12"/><stop offset="1" stop-color="#000" stop-opacity=".18"/></linearGradient>
    <linearGradient id="cfR" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#000" stop-opacity=".05"/><stop offset="1" stop-color="#000" stop-opacity=".28"/></linearGradient>
    <linearGradient id="csoil" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".3"/></linearGradient>
   </defs>
   <rect class="sky" width="${W}" height="${H}" fill="url(#csky)"/>`;

  let stars = "";
  for (let i = 0; i < 38; i++)
    stars += `<circle class="star" style="animation-delay:${(0.1 + rnd() * 0.6).toFixed(2)}s,${(2 + rnd() * 5).toFixed(1)}s" cx="${(rnd() * W).toFixed(1)}" cy="${(rnd() * 130).toFixed(1)}" r="${(rnd() * 0.8 + 0.3).toFixed(2)}" fill="var(--hglow)"/>`;
  s += `<g style="opacity:var(--hstar)">${stars}</g>`;
  s += `<g class="glow" style="transform-origin:352px 62px">
      <circle cx="352" cy="62" r="74" fill="url(#cgl)"/>
      <circle cx="352" cy="62" r="22" fill="var(--hglow)" opacity=".5"/>
      <circle cx="352" cy="62" r="22" fill="none" stroke="var(--hglow)" stroke-width="1"/></g>`;

  const box = (
    x: number, y: number, z: number, w: number, d: number, h: number,
    sw: number, top: string, left: string, right: string,
  ) =>
    `<polygon points="${poly([P(x, y + d, z), P(x, y + d, z + h), P(x + w, y + d, z + h), P(x + w, y + d, z)])}" fill="${left}" stroke="${LN}" stroke-width="${sw}" stroke-linejoin="round"/>`
    + `<polygon points="${poly([P(x, y + d, z), P(x, y + d, z + h), P(x + w, y + d, z + h), P(x + w, y + d, z)])}" fill="url(#cfL)"/>`
    + `<polygon points="${poly([P(x + w, y, z), P(x + w, y, z + h), P(x + w, y + d, z + h), P(x + w, y + d, z)])}" fill="${right}" stroke="${LN}" stroke-width="${sw}" stroke-linejoin="round"/>`
    + `<polygon points="${poly([P(x + w, y, z), P(x + w, y, z + h), P(x + w, y + d, z + h), P(x + w, y + d, z)])}" fill="url(#cfR)"/>`
    + `<polygon points="${poly([P(x, y, z + h), P(x + w, y, z + h), P(x + w, y + d, z + h), P(x, y + d, z + h)])}" fill="${top}" stroke="${LN}" stroke-width="${sw}" stroke-linejoin="round"/>`;

  /* ---- base slab ---- */
  s += `<g class="slab">
    <polygon points="${poly([P(0, BD, 0), P(0, BD, -1.3), P(BW, BD, -1.3), P(BW, BD, 0)])}" fill="var(--hsoil)" stroke="${LN}" stroke-width="1.5" stroke-linejoin="round"/>
    <polygon points="${poly([P(0, BD, 0), P(0, BD, -1.3), P(BW, BD, -1.3), P(BW, BD, 0)])}" fill="url(#csoil)"/>
    <polygon points="${poly([P(BW, 0, 0), P(BW, 0, -1.3), P(BW, BD, -1.3), P(BW, BD, 0)])}" fill="var(--hsoilD)" stroke="${LN}" stroke-width="1.5" stroke-linejoin="round"/>
    <polygon points="${poly([P(BW, 0, 0), P(BW, 0, -1.3), P(BW, BD, -1.3), P(BW, BD, 0)])}" fill="url(#csoil)"/>
    <polygon points="${poly([P(0, 0, 0), P(BW, 0, 0), P(BW, BD, 0), P(0, BD, 0)])}" fill="var(--hground)" stroke="${LN}" stroke-width="1.5" stroke-linejoin="round"/></g>`;

  /* measure rules across the yard, one per SLA quarter */
  let g = "";
  for (let q = 1; q <= 4; q++) {
    const z = (LIMZ * q) / 4;
    const a = P(0, BD, z), b = P(BW, BD, z);
    g += `<line x1="${a[0].toFixed(1)}" y1="${a[1].toFixed(1)}" x2="${b[0].toFixed(1)}" y2="${b[1].toFixed(1)}" stroke="${LN}" stroke-width=".6" stroke-dasharray="3 4"/>`;
  }
  s += `<g class="grid">${g}</g>`;

  /* ---- columns, back to front (all share y, so order by x) ---- */
  const CW = 1.05, CD = 1.05, y0 = 1.7;
  const cols = cases.slice(0, 6).map((c, i) => ({
    ...c,
    x: 0.72 + i * 1.62,
    h: Math.max(0.18, c.frac * LIMZ),
  }));
  const above: { c: (typeof cols)[number]; dly: string }[] = [];
  cols.forEach((c, i) => {
    const dly = (0.9 + i * 0.11).toFixed(2);
    const tone = c.frac >= 1 ? "var(--danger)" : c.frac >= 0.78 ? "var(--warn)" : "var(--ok)";
    // shadow on the slab
    s += `<g class="shadows"><polygon points="${poly([P(c.x, y0, 0), P(c.x + CW, y0, 0), P(c.x + CW + c.h * 0.12, y0 + c.h * 0.6, 0), P(c.x + CW + c.h * 0.12, y0 + CD + c.h * 0.6, 0), P(c.x + c.h * 0.12, y0 + CD + c.h * 0.6, 0), P(c.x, y0 + CD, 0)])}" fill="${LN}" opacity=".15"/></g>`;
    let inner = box(c.x, y0, 0, CW, CD, Math.min(c.h, LIMZ), 1.4, "var(--htop)", "var(--hleft)", "var(--hright)");
    // tick marks up the face, one per elapsed quarter
    for (let f = 1; f * 0.5 < Math.min(c.h, LIMZ); f++) {
      const z = f * 0.5;
      inner += `<polygon points="${poly([P(c.x, y0 + CD, z), P(c.x, y0 + CD, z + 0.05), P(c.x + CW, y0 + CD, z + 0.05), P(c.x + CW, y0 + CD, z)])}" fill="${LN}" opacity=".22"/>`;
    }
    inner += `<polygon points="${poly([P(c.x, y0 + CD, 0), P(c.x, y0 + CD, 0.3), P(c.x + CW, y0 + CD, 0.3), P(c.x + CW, y0 + CD, 0)])}" fill="${LN}" opacity=".13"/>`;
    s += `<g class="bldg" style="animation-delay:${dly}s">${inner}</g>`;
    if (c.frac >= 1) above.push({ c, dly });
    else {
      // cap disc sits on top of a compliant column
      const t = P(c.x + CW / 2, y0 + CD / 2, c.h);
      s += `<g class="detail" style="animation-delay:${(Number(dly) + 0.34).toFixed(2)}s">
        <ellipse cx="${t[0].toFixed(1)}" cy="${t[1].toFixed(1)}" rx="9.5" ry="5.4" fill="${tone}" opacity=".9" stroke="${LN}" stroke-width="1"/>
        <ellipse cx="${t[0].toFixed(1)}" cy="${(t[1] - 3.4).toFixed(1)}" rx="9.5" ry="5.4" fill="var(--surface)" stroke="${LN}" stroke-width="1.1"/>
        <path d="M${(t[0] - 3.4).toFixed(1)} ${(t[1] - 3.6).toFixed(1)} l2.4 2.4 l4.6-4.8" fill="none" stroke="${tone}" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/></g>`;
    }
  });

  /* ---- the charter limit: a glass plane across the whole yard ---- */
  const pz = LIMZ;
  s += `<g class="limitplane">
    <polygon points="${poly([P(-0.5, -0.5, pz), P(BW + 0.5, -0.5, pz), P(BW + 0.5, BD + 0.5, pz), P(-0.5, BD + 0.5, pz)])}"
      fill="var(--danger)" opacity=".10"/>
    <polygon points="${poly([P(-0.5, -0.5, pz), P(BW + 0.5, -0.5, pz), P(BW + 0.5, BD + 0.5, pz), P(-0.5, BD + 0.5, pz)])}"
      fill="none" stroke="var(--danger)" stroke-width="1.6" stroke-dasharray="7 5" opacity=".85"/>
    <g class="limlabel">
      <rect x="${(P(BW + 0.5, -0.5, pz)[0] - 2).toFixed(1)}" y="${(P(BW + 0.5, -0.5, pz)[1] - 9).toFixed(1)}" width="66" height="18" rx="9" fill="var(--danger)"/>
      <text x="${(P(BW + 0.5, -0.5, pz)[0] + 31).toFixed(1)}" y="${(P(BW + 0.5, -0.5, pz)[1] + 3.4).toFixed(1)}" text-anchor="middle"
        font-family="var(--font-jetbrains), monospace" font-size="9" fill="var(--on-danger)" letter-spacing=".08em">SLA LIMIT</text></g></g>`;

  /* ---- the part that broke through, drawn crisp above the glass ---- */
  above.forEach(({ c, dly }, i) => {
    const seg = box(c.x, y0, LIMZ, CW, CD, c.h - LIMZ, 1.5, "var(--danger-bg)", "var(--danger)", "var(--danger)");
    s += `<g class="bldg" style="animation-delay:${(Number(dly) + 0.06).toFixed(2)}s">${seg}</g>`;
    const t = P(c.x + CW / 2, y0 + CD / 2, c.h);
    s += `<g transform="translate(${t[0].toFixed(1)} ${t[1].toFixed(1)})"><g class="pin" style="animation-delay:${(2.5 + i * 0.18).toFixed(2)}s">
        <ellipse class="pinring" style="animation-delay:${(3.3 + i * 1.6).toFixed(1)}s" rx="12" ry="6.8" fill="none" stroke="var(--danger)" stroke-width="1.5"/>
        <line x1="0" y1="0" x2="0" y2="-22" stroke="var(--surface)" stroke-width="3.4" opacity=".9"/>
        <line x1="0" y1="0" x2="0" y2="-22" stroke="var(--danger)" stroke-width="1.6"/>
        <circle cy="-28" r="8.6" fill="var(--surface)"/>
        <circle cy="-28" r="6.9" fill="var(--danger)"/>
        <path d="M0 -31.4 v4.2 M0 -24.8 v.1" stroke="var(--surface)" stroke-width="1.8" stroke-linecap="round"/></g></g>`;
  });
  return s + `</svg>`;
}
