// Isometric ward island + ridgeline chart + streak emblem — ported verbatim from
// samadhan-citizen-home/samadhan-home-mobile.html. Every element carries a
// cinematic entrance delay derived from its depth, so the city builds
// back-to-front. Colours come from the `--h*` tokens in citizen-home.css, so the
// illustration reskins with the active theme.

const C = Math.cos(Math.PI / 6);
const S = Math.sin(Math.PI / 6);

/** Deterministic PRNG (mulberry-ish) so the scene is stable across renders. */
function seeded(s: number) {
  return () => ((s = Math.imul(s ^ (s >>> 15), 1 | s)) >>> 0) / 4294967296;
}

/** The isometric ward island. `pct` = share of windows lit (= resolved rate). */
export function island(pct: number): string {
  const W = 430, H = 310, u = 13.9, ox = 215, oy = 120;
  const rnd = seeded(4471);
  const P = (x: number, y: number, z: number): [number, number] => [
    ox + (x - y) * C * u,
    oy + (x + y) * S * u - z * u,
  ];
  const pt = (a: [number, number][]) =>
    a.map((q) => q.map((n) => n.toFixed(2)).join(",")).join(" ");
  const quad = (x: number, y: number, z: number, w: number, d: number) =>
    pt([P(x, y, z), P(x + w, y, z), P(x + w, y + d, z), P(x, y + d, z)]);
  const LN = "var(--hline)";

  // Sun sits upper-right, so shadows fall down-left: +y in grid space.
  const SH_Y = 0.66, SH_X = 0.14;

  let o = `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Isometric view of the ward. ${pct} per cent of windows are lit, matching the share of complaints resolved this month.">
  <defs>
   <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
     <stop offset="0" stop-color="var(--h1)"/><stop offset=".5" stop-color="var(--h2)"/><stop offset="1" stop-color="var(--h3)"/></linearGradient>
   <radialGradient id="gl" cx=".5" cy=".5" r=".5">
     <stop offset="0" stop-color="var(--hglow)" stop-opacity=".9"/>
     <stop offset=".42" stop-color="var(--hglow)" stop-opacity=".2"/>
     <stop offset="1" stop-color="var(--hglow)" stop-opacity="0"/></radialGradient>
   <radialGradient id="pool" cx=".5" cy=".5" r=".5">
     <stop offset="0" stop-color="var(--hlit)" stop-opacity=".55"/>
     <stop offset="1" stop-color="var(--hlit)" stop-opacity="0"/></radialGradient>
   <linearGradient id="fL" x1="0" y1="0" x2="0" y2="1">
     <stop offset="0" stop-color="#fff" stop-opacity=".10"/><stop offset="1" stop-color="#000" stop-opacity=".16"/></linearGradient>
   <linearGradient id="fR" x1="0" y1="0" x2="0" y2="1">
     <stop offset="0" stop-color="#000" stop-opacity=".04"/><stop offset="1" stop-color="#000" stop-opacity=".26"/></linearGradient>
   <linearGradient id="soilG" x1="0" y1="0" x2="0" y2="1">
     <stop offset="0" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".3"/></linearGradient>
   <clipPath id="slabClip"><polygon points="${quad(0, 0, 0, 12, 12)}"/></clipPath>
  </defs>
  <rect class="sky" width="${W}" height="${H}" fill="url(#sky)"/>`;

  let stars = "";
  for (let i = 0; i < 44; i++)
    stars += `<circle class="star" style="animation-delay:${(0.1 + rnd() * 0.6).toFixed(2)}s,${(2 + rnd() * 5).toFixed(1)}s" cx="${(rnd() * W).toFixed(1)}" cy="${(rnd() * 120).toFixed(1)}" r="${(rnd() * 0.8 + 0.3).toFixed(2)}" fill="var(--hglow)"/>`;
  o += `<g style="opacity:var(--hstar)">${stars}</g>`;
  o += `<g class="glow" style="transform-origin:340px 66px">
      <circle cx="340" cy="66" r="86" fill="url(#gl)"/>
      <circle cx="340" cy="66" r="26" fill="var(--hglow)" opacity=".55"/>
      <circle cx="340" cy="66" r="26" fill="none" stroke="var(--hglow)" stroke-width="1"/>
      <circle cx="340" cy="66" r="37" fill="none" stroke="var(--hglow)" stroke-width=".6" opacity=".4"/></g>`;

  const N = 12;
  // ---- slab: top plate, soil sides with a vertical falloff ----
  o += `<g class="slab">
    <polygon points="${pt([P(0, N, 0), P(0, N, -1.7), P(N, N, -1.7), P(N, N, 0)])}" fill="var(--hsoil)" stroke="${LN}" stroke-width="1.5" stroke-linejoin="round"/>
    <polygon points="${pt([P(0, N, 0), P(0, N, -1.7), P(N, N, -1.7), P(N, N, 0)])}" fill="url(#soilG)"/>
    <polygon points="${pt([P(N, 0, 0), P(N, 0, -1.7), P(N, N, -1.7), P(N, N, 0)])}" fill="var(--hsoilD)" stroke="${LN}" stroke-width="1.5" stroke-linejoin="round"/>
    <polygon points="${pt([P(N, 0, 0), P(N, 0, -1.7), P(N, N, -1.7), P(N, N, 0)])}" fill="url(#soilG)"/>
    <polygon points="${quad(0, 0, 0, N, N)}" fill="var(--hground)" stroke="${LN}" stroke-width="1.5" stroke-linejoin="round"/></g>`;

  let g = "";
  for (let i = 1; i < N; i++) {
    const a = P(i, 0, 0), b = P(i, N, 0), c = P(0, i, 0), d = P(N, i, 0);
    g += `<line x1="${a[0].toFixed(1)}" y1="${a[1].toFixed(1)}" x2="${b[0].toFixed(1)}" y2="${b[1].toFixed(1)}" stroke="${LN}" stroke-width=".5"/>`
      + `<line x1="${c[0].toFixed(1)}" y1="${c[1].toFixed(1)}" x2="${d[0].toFixed(1)}" y2="${d[1].toFixed(1)}" stroke="${LN}" stroke-width=".5"/>`;
  }
  o += `<g class="grid">${g}</g>`;

  // ---- roads as ground polygons, clipped to the slab. No strokes, so no wedges. ----
  o += `<g class="roads" clip-path="url(#slabClip)">
    <polygon points="${quad(0, 5.1, 0.01, N, 1.8)}" fill="var(--hroad)"/>
    <polygon points="${quad(5.1, 0, 0.02, 1.8, N)}" fill="var(--hroad)"/>
    <polygon points="${quad(0, 5.1, 0.03, N, 0.16)}" fill="${LN}" opacity=".28"/>
    <polygon points="${quad(0, 6.74, 0.03, N, 0.16)}" fill="${LN}" opacity=".28"/>
    <polygon points="${quad(5.1, 0, 0.03, 0.16, N)}" fill="${LN}" opacity=".28"/>
    <polygon points="${quad(6.74, 0, 0.03, 0.16, N)}" fill="${LN}" opacity=".28"/></g>`;
  let dash = "";
  for (let i = 0.5; i < N; i += 1.9) {
    if (i < 4.7 || i > 7.2) {
      dash += `<polygon points="${quad(i, 5.93, 0.04, 0.95, 0.14)}" fill="var(--hlit)" opacity=".6"/>`;
      dash += `<polygon points="${quad(5.93, i, 0.04, 0.14, 0.95)}" fill="var(--hlit)" opacity=".6"/>`;
    }
  }
  o += `<g class="detail" style="animation-delay:1.28s" clip-path="url(#slabClip)">${dash}</g>`;

  const B: [number, number, number, number, number, string, number][] = [
    [0.7, 0.7, 3.4, 3.0, 3.4, "block", 1.05], [4.0, 0.6, 1.0, 1.4, 1.2, "shop", 0.96],
    [7.4, 0.7, 3.0, 2.6, 4.6, "block", 0.97], [7.6, 3.6, 2.8, 1.2, 1.4, "shop", 1.04],
    [0.7, 7.5, 3.2, 3.6, 2.6, "block", 1.0], [4.1, 7.6, 1.0, 1.2, 1.0, "shop", 0.95],
    [7.4, 7.5, 3.2, 3.6, 3.8, "block", 1.06], [0.8, 4.0, 1.2, 1.0, 1.1, "shop", 1.02],
    [3.4, 3.3, 1.5, 1.5, 2.2, "dome", 1.0],
  ];

  // ---- cast shadows first, so everything else sits on top ----
  let shad = "";
  B.forEach(([x, y, w, d, h]) => {
    const dx = h * SH_X, dy = h * SH_Y;
    const A = P(x, y, 0), Bb = P(x + w, y, 0), D = P(x, y + d, 0);
    const B2 = P(x + w + dx, y + dy, 0), C2 = P(x + w + dx, y + d + dy, 0), D2 = P(x + dx, y + d + dy, 0);
    shad += `<polygon points="${pt([A, Bb, B2, C2, D2, D])}" fill="${LN}" opacity=".17"/>`;
  });
  o += `<g class="shadows" clip-path="url(#slabClip)">${shad}</g>`;

  const cells: { x: number; y: number; z: number; id: number }[] = [];
  // ---- one draw list for EVERYTHING on the ground, sorted back-to-front, so
  // trees and lamps never float on top of blocks standing in front of them. ----
  const DRAW: { k: number; html: string }[] = [];
  const sorted = B.map((b) => ({ b, k: b[0] + b[2] / 2 + (b[1] + b[3] / 2) })).sort((p, q) => p.k - q.k);
  const maxK = Math.max(...sorted.map((s) => s.k));

  const box = (x: number, y: number, z: number, w: number, d: number, h: number, sw: number) =>
    `<polygon points="${pt([P(x, y + d, z), P(x, y + d, z + h), P(x + w, y + d, z + h), P(x + w, y + d, z)])}" fill="var(--hleft)" stroke="${LN}" stroke-width="${sw}" stroke-linejoin="round"/>`
    + `<polygon points="${pt([P(x, y + d, z), P(x, y + d, z + h), P(x + w, y + d, z + h), P(x + w, y + d, z)])}" fill="url(#fL)"/>`
    + `<polygon points="${pt([P(x + w, y, z), P(x + w, y, z + h), P(x + w, y + d, z + h), P(x + w, y + d, z)])}" fill="var(--hright)" stroke="${LN}" stroke-width="${sw}" stroke-linejoin="round"/>`
    + `<polygon points="${pt([P(x + w, y, z), P(x + w, y, z + h), P(x + w, y + d, z + h), P(x + w, y + d, z)])}" fill="url(#fR)"/>`
    + `<polygon points="${pt([P(x, y, z + h), P(x + w, y, z + h), P(x + w, y + d, z + h), P(x, y + d, z + h)])}" fill="var(--htop)" stroke="${LN}" stroke-width="${sw}" stroke-linejoin="round"/>`;

  sorted.forEach(({ b, k }, idx) => {
    const [x, y, w, d, h, type, bright] = b;
    const dly = (0.88 + (k / maxK) * 0.6 + idx * 0.034).toFixed(3);
    let inner = "";
    if (type === "dome") {
      inner += box(x, y, 0, w, d, h * 0.55, 1.4);
      const c = P(x + w / 2, y + d / 2, h * 0.55), r = w * C * u * 0.62;
      inner += `<path d="M${(c[0] - r).toFixed(1)} ${c[1].toFixed(1)} a${r.toFixed(1)} ${(r * 1.06).toFixed(1)} 0 0 1 ${(r * 2).toFixed(1)} 0 Z" fill="var(--htop)" stroke="${LN}" stroke-width="1.4" stroke-linejoin="round"/>`;
      inner += `<path d="M${(c[0] - r).toFixed(1)} ${c[1].toFixed(1)} a${r.toFixed(1)} ${(r * 1.06).toFixed(1)} 0 0 1 ${(r * 2).toFixed(1)} 0 Z" fill="url(#fR)" opacity=".5"/>`;
      inner += `<line x1="${c[0].toFixed(1)}" y1="${(c[1] - r * 1.06).toFixed(1)}" x2="${c[0].toFixed(1)}" y2="${(c[1] - r * 1.06 - 9).toFixed(1)}" stroke="${LN}" stroke-width="1.3"/>`;
      inner += `<circle cx="${c[0].toFixed(1)}" cy="${(c[1] - r * 1.06 - 11.6).toFixed(1)}" r="2.3" fill="var(--hlit)" stroke="${LN}" stroke-width=".9"/>`;
    } else {
      inner += box(x, y, 0, w, d, h, 1.5);
      for (let f = 1; f * 0.62 < h; f++) {
        const z = f * 0.62;
        inner += `<polygon points="${pt([P(x, y + d, z), P(x, y + d, z + 0.07), P(x + w, y + d, z + 0.07), P(x + w, y + d, z)])}" fill="${LN}" opacity=".26"/>`;
        inner += `<polygon points="${pt([P(x + w, y, z), P(x + w, y, z + 0.07), P(x + w, y + d, z + 0.07), P(x + w, y + d, z)])}" fill="${LN}" opacity=".2"/>`;
      }
      inner += box(x, y, h, w, d, 0.14, 1);
      if (type !== "block")
        inner += `<polygon points="${pt([P(x, y + d, 0.5), P(x, y + d, 0.62), P(x + w, y + d, 0.62), P(x + w, y + d, 0.5)])}" fill="var(--brand)" opacity=".7"/>`;
      inner += `<polygon points="${pt([P(x, y + d, 0), P(x, y + d, 0.34), P(x + w, y + d, 0.34), P(x + w, y + d, 0)])}" fill="${LN}" opacity=".14"/>`;
    }
    // windows belong to this building and must paint with it
    if (type === "block") {
      const cols = Math.max(1, Math.floor(w / 0.78)), rows = Math.max(1, Math.floor(h / 0.62));
      for (let r2 = 0; r2 < rows; r2++)
        for (let c2 = 0; c2 < cols; c2++)
          cells.push({ x: x + 0.26 + c2 * 0.78, y: y + d, z: 0.22 + r2 * 0.62, id: DRAW.length });
    }
    let extra = "";
    if (type === "block") {
      const tx = x + w * 0.28, ty = y + d * 0.3;
      extra = `<g class="detail" style="animation-delay:${(Number(dly) + 0.4).toFixed(3)}s">`
        + `<polygon points="${pt([P(tx, ty + 0.62, h + 0.14), P(tx, ty + 0.62, h + 0.64), P(tx + 0.72, ty + 0.62, h + 0.64), P(tx + 0.72, ty + 0.62, h + 0.14)])}" fill="var(--htankD)" stroke="${LN}" stroke-width="1" stroke-linejoin="round"/>`
        + `<polygon points="${pt([P(tx + 0.72, ty, h + 0.14), P(tx + 0.72, ty, h + 0.64), P(tx + 0.72, ty + 0.62, h + 0.64), P(tx + 0.72, ty + 0.62, h + 0.14)])}" fill="var(--htankD)" stroke="${LN}" stroke-width="1" stroke-linejoin="round"/>`
        + `<polygon points="${quad(tx, ty, h + 0.64, 0.72, 0.62)}" fill="var(--htank)" stroke="${LN}" stroke-width="1" stroke-linejoin="round"/>`
        + box(x + w * 0.66, y + d * 0.62, h + 0.14, 0.58, 0.58, 0.4, 1) + `</g>`;
    }
    DRAW.push({ k, html: `<g class="bldg" style="animation-delay:${dly}s;filter:brightness(${bright})">${inner}<!--WIN${DRAW.length}--></g>${extra}` });
  });

  // windows rendered into their owning building's placeholder
  const total = cells.length, litN = Math.round((total * pct) / 100);
  const lit = new Set(
    cells.map((c, i) => [i, rnd()] as [number, number]).sort((p, q) => p[1] - q[1]).slice(0, litN).map((p) => p[0]),
  );
  const byB: Record<number, string[]> = {};
  cells.forEach((c, i) => {
    const frame = pt([P(c.x - 0.05, c.y, c.z - 0.04), P(c.x + 0.49, c.y, c.z - 0.04), P(c.x + 0.49, c.y, c.z + 0.38), P(c.x - 0.05, c.y, c.z + 0.38)]);
    const pane = pt([P(c.x, c.y, c.z), P(c.x + 0.44, c.y, c.z), P(c.x + 0.44, c.y, c.z + 0.34), P(c.x, c.y, c.z + 0.34)]);
    let h2 = `<polygon points="${frame}" fill="${LN}" opacity=".22"/>`;
    if (lit.has(i)) {
      const fl = rnd() < 0.11, op = fl ? 1 : (0.62 + rnd() * 0.34).toFixed(2);
      const dly2 = (1.6 + (c.x + c.y) * 0.028 + rnd() * 0.22).toFixed(3);
      h2 += `<polygon class="win${fl ? " fl" : ""}" style="--o:${op};animation-delay:${dly2}s${fl ? "," + (4 + rnd() * 4).toFixed(1) + "s" : ""}" points="${pane}" fill="var(--hlit)"/>`;
    } else h2 += `<polygon points="${pane}" fill="${LN}" opacity=".3"/>`;
    (byB[c.id] = byB[c.id] || []).push(h2);
  });
  DRAW.forEach((e, i) => {
    e.html = e.html.replace("<!--WIN" + i + "-->", (byB[i] || []).join(""));
  });

  // ---- scenery joins the same sorted list ----
  ([[4.85, 2.2], [4.85, 9.4], [7.2, 4.4]] as [number, number][]).forEach(([x, y], i) => {
    const b0 = P(x, y, 0), t0 = P(x, y, 1.6), a0 = P(x + 0.55, y, 1.6), pool = P(x + 0.55, y, 0);
    DRAW.push({
      k: x + y,
      html:
        `<ellipse class="lampglow" style="--o:1;animation-delay:${(2.62 + i * 0.09).toFixed(2)}s,${(3.4 + i * 0.5).toFixed(1)}s" cx="${pool[0].toFixed(1)}" cy="${pool[1].toFixed(1)}" rx="17" ry="9" fill="url(#pool)"/>`
        + `<g class="lamp" style="animation-delay:${(2.3 + i * 0.09).toFixed(2)}s">
        <ellipse cx="${b0[0].toFixed(1)}" cy="${b0[1].toFixed(1)}" rx="3.4" ry="1.8" fill="${LN}" opacity=".24"/>
        <line x1="${b0[0].toFixed(1)}" y1="${b0[1].toFixed(1)}" x2="${t0[0].toFixed(1)}" y2="${t0[1].toFixed(1)}" stroke="${LN}" stroke-width="1.7" stroke-linecap="round"/>
        <path d="M${t0[0].toFixed(1)} ${t0[1].toFixed(1)} Q${t0[0].toFixed(1)} ${(t0[1] - 7).toFixed(1)} ${a0[0].toFixed(1)} ${(a0[1] - 7).toFixed(1)}" fill="none" stroke="${LN}" stroke-width="1.6"/>
        <path d="M${(a0[0] - 3.4).toFixed(1)} ${(a0[1] - 6.6).toFixed(1)} h6.8 l-1.5 3.4 h-3.8 Z" fill="var(--hlit)" stroke="${LN}" stroke-width="1"/></g>`,
    });
  });

  ([[4.35, 4.35], [7.6, 10.5], [10.7, 5.9]] as [number, number][]).forEach(([x, y], i) => {
    const b1 = P(x, y, 0), sh = P(x + 0.5, y + 1.0, 0);
    DRAW.push({
      k: x + y,
      html:
        `<ellipse class="detail" style="animation-delay:${(2.14 + i * 0.1).toFixed(2)}s" cx="${sh[0].toFixed(1)}" cy="${sh[1].toFixed(1)}" rx="9" ry="4.6" fill="${LN}" opacity=".16"/>`
        + `<g class="tree" style="animation-delay:${(2.14 + i * 0.1).toFixed(2)}s,${(3.4 + i * 1.4).toFixed(1)}s">
        <line x1="${b1[0].toFixed(1)}" y1="${b1[1].toFixed(1)}" x2="${b1[0].toFixed(1)}" y2="${(b1[1] - 13).toFixed(1)}" stroke="${LN}" stroke-width="1.9" stroke-linecap="round"/>
        <ellipse cx="${(b1[0] - 4.4).toFixed(1)}" cy="${(b1[1] - 13).toFixed(1)}" rx="5.8" ry="4.4" fill="var(--htree)" stroke="${LN}" stroke-width="1.1"/>
        <ellipse cx="${(b1[0] + 4.8).toFixed(1)}" cy="${(b1[1] - 13.6).toFixed(1)}" rx="5.4" ry="4.1" fill="var(--htree)" stroke="${LN}" stroke-width="1.1"/>
        <ellipse cx="${b1[0].toFixed(1)}" cy="${(b1[1] - 18).toFixed(1)}" rx="8.8" ry="6.4" fill="var(--htree)" stroke="${LN}" stroke-width="1.2"/>
        <ellipse cx="${(b1[0] - 2.6).toFixed(1)}" cy="${(b1[1] - 20).toFixed(1)}" rx="4.4" ry="2.8" fill="#fff" opacity=".16"/></g>`,
    });
  });

  ([[3.0, 6.0, "var(--warn)"], [9.0, 6.0, "var(--danger)"]] as [number, number, string][]).forEach(([x, y, c], i) => {
    const b2 = P(x, y, 0.05);
    // NOTE: a CSS transform animation overrides the SVG transform attribute, so
    // positioning and animation must live on separate nested groups.
    DRAW.push({
      k: x + y + 4,
      html:
        `<g transform="translate(${b2[0].toFixed(1)} ${b2[1].toFixed(1)})"><g class="pin" style="animation-delay:${(2.54 + i * 0.16).toFixed(2)}s">
        <ellipse class="pinring" style="animation-delay:${(3.3 + i * 1.7).toFixed(1)}s" rx="14" ry="7.8" fill="none" stroke="${c}" stroke-width="1.6"/>
        <ellipse rx="5.6" ry="3.1" fill="${c}" opacity=".32"/>
        <line x1="0" y1="0" x2="0" y2="-31" stroke="var(--surface)" stroke-width="3.6" opacity=".9"/>
        <line x1="0" y1="0" x2="0" y2="-31" stroke="${c}" stroke-width="1.7"/>
        <circle cy="-37" r="9" fill="var(--surface)"/>
        <circle cy="-37" r="7.2" fill="${c}"/><circle cy="-37" r="2.8" fill="var(--surface)"/></g></g>`,
    });
  });

  DRAW.sort((p, q) => p.k - q.k).forEach((e) => {
    o += e.html;
  });
  return o + `</svg>`;
}

/** Filed-vs-closed 30-day ridgeline chart. */
export function ridgeline(filedTotal?: number, closedTotal?: number): string {
  const W = 390, H = 78, n = 30;
  const r = seeded(5521);
  const filed: number[] = [], closed: number[] = [];
  for (let i = 0; i < n; i++) {
    const b = 13 + Math.sin(i / 4.1) * 4 + r() * 5;
    filed.push(b + (i > 22 ? 4 : 0));
    closed.push(Math.max(2, b - 2.4 - r() * 3.4));
  }
  void filedTotal;
  void closedTotal;
  const mx = Math.max(...filed) * 1.18;
  const P2 = (a: number[], i: number): [number, number] => [(i / (n - 1)) * W, H - (a[i] / mx) * (H - 10) - 4];
  const area = (a: number[]) => {
    let d = `M0 ${H} `;
    for (let i = 0; i < n; i++) { const [x, y] = P2(a, i); d += `L${x.toFixed(1)} ${y.toFixed(1)} `; }
    return d + `L${W} ${H} Z`;
  };
  const line = (a: number[]) => {
    let d = "";
    for (let i = 0; i < n; i++) { const [x, y] = P2(a, i); d += (i ? "L" : "M") + x.toFixed(1) + " " + y.toFixed(1) + " "; }
    return d;
  };
  const [tx, ty] = P2(filed, n - 1);
  return `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Complaints filed versus closed over 30 days">
   <defs><linearGradient id="gF" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="var(--warn)" stop-opacity=".24"/><stop offset="1" stop-color="var(--warn)" stop-opacity="0"/></linearGradient>
   <linearGradient id="gC" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="var(--ok)" stop-opacity=".28"/><stop offset="1" stop-color="var(--ok)" stop-opacity="0"/></linearGradient></defs>
   <path d="${area(filed)}" fill="url(#gF)"/><path class="ln" d="${line(filed)}" fill="none" stroke="var(--warn)" stroke-width="1.7" stroke-linejoin="round"/>
   <path d="${area(closed)}" fill="url(#gC)"/><path class="ln" d="${line(closed)}" fill="none" stroke="var(--ok)" stroke-width="1.7" stroke-linejoin="round"/>
   <line x1="${tx.toFixed(1)}" y1="0" x2="${tx.toFixed(1)}" y2="${H}" stroke="var(--ink)" stroke-width="1" opacity=".16"/>
   <circle cx="${tx.toFixed(1)}" cy="${ty.toFixed(1)}" r="3.6" fill="var(--warn)"/></svg>`;
}

/** Day-ring streak emblem: `target` tapered segments, `days` of them filled. */
export function streakEmblem(days = 18, target = 30, size = 50): string {
  const Cc = 36;
  let seg = "";
  for (let i = 0; i < target; i++) {
    const a = (i / target) * Math.PI * 2 - Math.PI / 2, on = i < days;
    const x1 = Cc + Math.cos(a) * 27.5, y1 = Cc + Math.sin(a) * 27.5;
    const x2 = Cc + Math.cos(a) * 32.5, y2 = Cc + Math.sin(a) * 32.5;
    seg += `<line x1="${x1.toFixed(2)}" y1="${y1.toFixed(2)}" x2="${x2.toFixed(2)}" y2="${y2.toFixed(2)}" stroke="${on ? "var(--warn)" : "var(--line-2)"}" stroke-width="${on ? 2.6 : 1.8}" stroke-linecap="round" opacity="${on ? 1 : 0.5}"/>`;
  }
  return `<svg viewBox="0 0 72 72" width="${size}" height="${size}" aria-label="${days} day streak">
   <circle cx="36" cy="36" r="23" fill="var(--warn-bg)"/>${seg}
   <g transform="translate(36 36) scale(.6) translate(-20 -21.5)">
    <path d="M20 2C26 11 33 17 33 26a13 13 0 0 1-26 0c0-4.5 2.2-8.4 5-11.5.4 5 2.2 7.9 4.4 9.1C15.6 16.4 16.8 8.4 20 2Z" fill="var(--warn-bg)" stroke="var(--warn)" stroke-width="2.1" stroke-linejoin="round"/>
    <path d="M20 17.5c3.3 4.7 6.3 8.2 6.3 12.7a6.3 6.3 0 0 1-12.6 0c0-2.5 1.3-4.8 3-6.6.2 2.9 1.2 4.4 2.4 5-.4-3.9-.2-7.7.9-11.1Z" fill="var(--warn)"/></g></svg>`;
}

/** 24-cell "near you" density strip. */
export function heatCells(): { bg: string; o: number; delay: string }[] {
  const sc = ["var(--track)", "var(--brand-line)", "var(--brand-soft)", "var(--brand)", "var(--danger)"];
  const r = seeded(331);
  const out: { bg: string; o: number; delay: string }[] = [];
  for (let i = 0; i < 24; i++) {
    const v = Math.max(0, 1 - Math.abs(i - 9) / 6) + Math.max(0, 1 - Math.abs(i - 18) / 4) * 0.7 + (r() - 0.5) * 0.25;
    const l = v <= 0.08 ? 0 : Math.min(4, Math.floor(v * 4.4));
    out.push({ bg: sc[l], o: l === 0 ? 0.5 : 1, delay: `${(i * 0.024).toFixed(3)}s` });
  }
  return out;
}
