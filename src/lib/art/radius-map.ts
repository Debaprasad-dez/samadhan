// Feed hero — what's near you, and who is behind it. The disc is the 500 m
// radius. Each marker is an open case at its bearing and distance; the stack
// under it is one chip per four co-signers, so the tallest stack is the case
// with the most neighbours behind it. You are the ring at the centre. Ported
// verbatim from samadhan-citizen-feed/samadhan-feed-mobile.html.

const C = Math.cos(Math.PI / 6);
const S = Math.sin(Math.PI / 6);

function seeded(s: number) {
  return () => ((s = Math.imul(s ^ (s >>> 15), 1 | s)) >>> 0) / 4294967296;
}

export interface NearItem {
  id: string;
  /** distance as a fraction of the 500 m radius (0–1) */
  r: number;
  /** bearing, radians */
  t: number;
  /** co-sign count */
  co: number;
  st: "ok" | "warn" | "over";
}

export function radiusMap(items: NearItem[]): string {
  const W = 430, H = 306, u = 23.4, ox = 215, oy = 157;
  const rnd = seeded(6619);
  const LN = "var(--hline)";
  const R = 5.4, RX = Math.SQRT2 * R * C * u, RY = Math.SQRT2 * R * S * u, TH = 1.2 * u;
  const gp = (r: number, t: number): [number, number] => [
    ox + Math.SQRT2 * r * R * C * u * Math.cos(t),
    oy + Math.SQRT2 * r * R * S * u * Math.sin(t),
  ];

  let s = `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="A 500 metre radius around you. Open cases sit at their bearings; the stack under each is one chip per four neighbours who co-signed it.">
   <defs>
    <linearGradient id="fsky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="var(--h1)"/><stop offset=".5" stop-color="var(--h2)"/><stop offset="1" stop-color="var(--h3)"/></linearGradient>
    <radialGradient id="fgl" cx=".5" cy=".5" r=".5">
      <stop offset="0" stop-color="var(--hglow)" stop-opacity=".85"/>
      <stop offset=".45" stop-color="var(--hglow)" stop-opacity=".18"/>
      <stop offset="1" stop-color="var(--hglow)" stop-opacity="0"/></radialGradient>
    <radialGradient id="fctr" cx=".5" cy=".5" r=".5">
      <stop offset="0" stop-color="var(--brand)" stop-opacity=".24"/>
      <stop offset="1" stop-color="var(--brand)" stop-opacity="0"/></radialGradient>
    <linearGradient id="frim" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".3"/></linearGradient>
   </defs>
   <rect class="sky" width="${W}" height="${H}" fill="url(#fsky)"/>`;

  let stars = "";
  for (let i = 0; i < 38; i++)
    stars += `<circle class="star" style="animation-delay:${(0.1 + rnd() * 0.6).toFixed(2)}s,${(2 + rnd() * 5).toFixed(1)}s" cx="${(rnd() * W).toFixed(1)}" cy="${(rnd() * 118).toFixed(1)}" r="${(rnd() * 0.8 + 0.3).toFixed(2)}" fill="var(--hglow)"/>`;
  s += `<g style="opacity:var(--hstar)">${stars}</g>`;
  s += `<g class="glow" style="transform-origin:356px 58px">
      <circle cx="356" cy="58" r="68" fill="url(#fgl)"/>
      <circle cx="356" cy="58" r="20" fill="var(--hglow)" opacity=".5"/>
      <circle cx="356" cy="58" r="20" fill="none" stroke="var(--hglow)" stroke-width="1"/></g>`;

  /* ---- the ground disc ---- */
  s += `<g class="slab">
    <path d="M${(ox - RX).toFixed(1)} ${oy.toFixed(1)} a${RX.toFixed(1)} ${RY.toFixed(1)} 0 0 0 ${(RX * 2).toFixed(1)} 0 v${TH.toFixed(1)} a${RX.toFixed(1)} ${RY.toFixed(1)} 0 0 1 ${(-RX * 2).toFixed(1)} 0 Z"
      fill="var(--hsoil)" stroke="${LN}" stroke-width="1.5" stroke-linejoin="round"/>
    <path d="M${(ox - RX).toFixed(1)} ${oy.toFixed(1)} a${RX.toFixed(1)} ${RY.toFixed(1)} 0 0 0 ${(RX * 2).toFixed(1)} 0 v${TH.toFixed(1)} a${RX.toFixed(1)} ${RY.toFixed(1)} 0 0 1 ${(-RX * 2).toFixed(1)} 0 Z" fill="url(#frim)"/>
    <ellipse cx="${ox}" cy="${oy}" rx="${RX.toFixed(1)}" ry="${RY.toFixed(1)}" fill="var(--hground)" stroke="${LN}" stroke-width="1.5"/></g>`;
  s += `<ellipse class="grid" cx="${ox}" cy="${oy}" rx="${(RX * 0.5).toFixed(1)}" ry="${(RY * 0.5).toFixed(1)}" fill="url(#fctr)"/>`;

  /* ---- distance rings, drawn on in sequence ---- */
  ([[0.34, "100 m", 0], [0.62, "250 m", 1], [0.95, "500 m", 2]] as [number, string, number][]).forEach(([f, lbl, i]) => {
    const rx = RX * f, ry = RY * f;
    const len = Math.PI * (3 * (rx + ry) - Math.sqrt((3 * rx + ry) * (rx + 3 * ry)));
    s += `<ellipse class="ring" style="--len:${len.toFixed(0)};animation-delay:${(0.62 + i * 0.16).toFixed(2)}s"
        cx="${ox}" cy="${oy}" rx="${rx.toFixed(1)}" ry="${ry.toFixed(1)}"
        fill="none" stroke="${LN}" stroke-width="1" stroke-dasharray="${len.toFixed(0)}" opacity=".5"/>`;
    // labels ride the lower-right arc, which no marker occupies
    const lt = 1.0, lx = ox + rx * Math.cos(lt), ly = oy + ry * Math.sin(lt);
    s += `<g class="detail" style="animation-delay:${(1.1 + i * 0.12).toFixed(2)}s">
        <rect x="${(lx - 19).toFixed(1)}" y="${(ly - 7).toFixed(1)}" width="38" height="14" rx="7" fill="var(--hground)" opacity=".9"/>
        <text x="${lx.toFixed(1)}" y="${(ly + 3).toFixed(1)}" text-anchor="middle"
        font-family="var(--font-jetbrains), monospace" font-size="8" fill="${LN}" opacity=".7" letter-spacing=".06em">${lbl}</text></g>`;
  });

  /* ---- draw list, sorted by screen depth ---- */
  const D: { d: number; html: string }[] = [];

  /* you, at the centre */
  D.push({
    d: oy,
    html: `<g class="youmk" style="animation-delay:1.28s">
      <ellipse class="pinring" style="animation-delay:3.2s" cx="${ox}" cy="${oy}" rx="19" ry="11" fill="none" stroke="var(--brand)" stroke-width="1.5"/>
      <ellipse cx="${ox}" cy="${oy}" rx="10" ry="5.6" fill="var(--brand)" opacity=".22" stroke="var(--brand)" stroke-width="1.2"/>
      <path d="M${(ox - 6).toFixed(1)} ${(oy - 6).toFixed(1)} l6 -5 l6 5 v7 h-12 Z" fill="var(--surface)" stroke="var(--brand)" stroke-width="1.5" stroke-linejoin="round"/>
      <text x="${ox}" y="${(oy + 18).toFixed(1)}" text-anchor="middle" font-family="var(--font-jetbrains), monospace" font-size="8" fill="var(--brand)" letter-spacing=".1em">YOU</text></g>`,
  });

  /* one marker per nearby case */
  items.forEach((it, i) => {
    const [px, py] = gp(it.r, it.t);
    const chips = Math.max(1, Math.min(10, Math.round(it.co / 4)));
    const tone = it.st === "over" ? "var(--danger)" : it.st === "warn" ? "var(--warn)" : "var(--ok)";
    let stack = "";
    for (let c = 0; c < chips; c++) {
      const y = py - c * 3.5;
      stack += `<g class="chip" style="animation-delay:${(1.66 + i * 0.1 + c * 0.055).toFixed(3)}s">
        <path d="M${(px - 8).toFixed(1)} ${(y - 3.5).toFixed(1)} v3.5 a8 4.5 0 0 0 16 0 v-3.5 Z" fill="var(--brand)" opacity=".55"/>
        <ellipse cx="${px.toFixed(1)}" cy="${(y - 3.5).toFixed(1)}" rx="8" ry="4.5" fill="var(--brand-soft)" stroke="var(--brand)" stroke-width="1.1"/></g>`;
    }
    const topY = py - chips * 3.5 - 2;
    const head = `<g transform="translate(${px.toFixed(1)} ${topY.toFixed(1)})"><g class="pin" style="animation-delay:${(2.3 + i * 0.12).toFixed(2)}s">
        ${it.st === "over" ? `<ellipse class="pinring" style="animation-delay:${(3.4 + i * 0.9).toFixed(1)}s" rx="13" ry="7.2" fill="none" stroke="${tone}" stroke-width="1.5"/>` : ""}
        <line x1="0" y1="0" x2="0" y2="-15" stroke="var(--surface)" stroke-width="3.2" opacity=".9"/>
        <line x1="0" y1="0" x2="0" y2="-15" stroke="${tone}" stroke-width="1.6"/>
        <circle cy="-21" r="8.2" fill="var(--surface)"/>
        <circle cy="-21" r="6.6" fill="${tone}"/>
        <text y="-18" text-anchor="middle" font-family="var(--font-jetbrains), monospace" font-size="8" font-weight="500" fill="var(--surface)">${it.co}</text></g></g>`;
    D.push({
      d: py,
      html:
        `<ellipse class="detail" style="animation-delay:${(1.6 + i * 0.1).toFixed(2)}s" cx="${(px + 2).toFixed(1)}" cy="${(py + 1.5).toFixed(1)}" rx="10" ry="5" fill="${LN}" opacity=".16"/>`
        + stack + head,
    });
  });

  D.sort((a, b) => a.d - b.d).forEach((e) => {
    s += e.html;
  });
  return s + `</svg>`;
}
