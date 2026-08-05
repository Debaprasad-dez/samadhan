// File-a-complaint hero — a desk that accumulates. Step 1 puts a mic and a
// half-written sheet on it. Step 2 plants the department signpost. Step 3 leans
// in the photos and drops the location pin. Step 4 stamps it and issues the
// number. The illustration builds the complaint as the citizen does. Ported
// verbatim from samadhan-citizen-file-complaint/samadhan-file-mobile.html.

const C = Math.cos(Math.PI / 6);
const S = Math.sin(Math.PI / 6);

function seeded(s: number) {
  return () => ((s = Math.imul(s ^ (s >>> 15), 1 | s)) >>> 0) / 4294967296;
}

export function deskScene(
  step: number,
  opts?: { dept?: string; confidence?: number; number?: string },
): string {
  const dept = opts?.dept ?? "DEPT";
  const conf = opts?.confidence ?? 0;
  const ackNo = opts?.number ?? "SMD-000000";
  const W = 430, H = 300, u = 35.7, ox = 188, oy = 37;
  const rnd = seeded(2214);
  const P = (x: number, y: number, z: number): [number, number] => [
    ox + (x - y) * C * u,
    oy + (x + y) * S * u - z * u,
  ];
  const poly = (a: [number, number][]) =>
    a.map((q) => q[0].toFixed(2) + "," + q[1].toFixed(2)).join(" ");
  const LN = "var(--hline)";
  const plane = (x: number, y: number, z: number, w: number, d: number, fill: string, sw = 1.3) =>
    `<polygon points="${poly([P(x, y, z), P(x + w, y, z), P(x + w, y + d, z), P(x, y + d, z)])}" fill="${fill}" stroke="${LN}" stroke-width="${sw}" stroke-linejoin="round"/>`;
  const rule = (x: number, y: number, z: number, len: number, col: string, t = 0.07) =>
    `<polygon points="${poly([P(x, y, z), P(x + len, y, z), P(x + len, y + t, z), P(x, y + t, z)])}" fill="${col}"/>`;

  let s = `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="A desk assembling the complaint: step ${step} of 4.">
   <defs>
    <linearGradient id="dsky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="var(--h1)"/><stop offset=".5" stop-color="var(--h2)"/><stop offset="1" stop-color="var(--h3)"/></linearGradient>
    <radialGradient id="dgl" cx=".5" cy=".5" r=".5">
      <stop offset="0" stop-color="var(--hglow)" stop-opacity=".8"/>
      <stop offset=".45" stop-color="var(--hglow)" stop-opacity=".16"/>
      <stop offset="1" stop-color="var(--hglow)" stop-opacity="0"/></radialGradient>
    <linearGradient id="dfL" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#fff" stop-opacity=".1"/><stop offset="1" stop-color="#000" stop-opacity=".17"/></linearGradient>
    <linearGradient id="dfR" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#000" stop-opacity=".04"/><stop offset="1" stop-color="#000" stop-opacity=".26"/></linearGradient>
    <linearGradient id="drim" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".3"/></linearGradient>
   </defs>
   <rect class="sky" width="${W}" height="${H}" fill="url(#dsky)"/>`;

  let stars = "";
  for (let i = 0; i < 32; i++)
    stars += `<circle class="star" style="animation-delay:${(0.1 + rnd() * 0.5).toFixed(2)}s,${(2 + rnd() * 5).toFixed(1)}s" cx="${(rnd() * W).toFixed(1)}" cy="${(rnd() * 104).toFixed(1)}" r="${(rnd() * 0.8 + 0.3).toFixed(2)}" fill="var(--hglow)"/>`;
  s += `<g style="opacity:var(--hstar)">${stars}</g>`;
  s += `<g class="glow" style="transform-origin:362px 48px">
      <circle cx="362" cy="48" r="60" fill="url(#dgl)"/>
      <circle cx="362" cy="48" r="17" fill="var(--hglow)" opacity=".5"/>
      <circle cx="362" cy="48" r="17" fill="none" stroke="var(--hglow)" stroke-width="1"/></g>`;

  /* ---- desk ---- */
  const DW = 6.4, DD = 4.6;
  s += `<g class="slab">
    <polygon points="${poly([P(0, DD, 0), P(0, DD, -0.85), P(DW, DD, -0.85), P(DW, DD, 0)])}" fill="var(--hsoil)" stroke="${LN}" stroke-width="1.4" stroke-linejoin="round"/>
    <polygon points="${poly([P(0, DD, 0), P(0, DD, -0.85), P(DW, DD, -0.85), P(DW, DD, 0)])}" fill="url(#drim)"/>
    <polygon points="${poly([P(DW, 0, 0), P(DW, 0, -0.85), P(DW, DD, -0.85), P(DW, DD, 0)])}" fill="var(--hsoilD)" stroke="${LN}" stroke-width="1.4" stroke-linejoin="round"/>
    <polygon points="${poly([P(0, 0, 0), P(DW, 0, 0), P(DW, DD, 0), P(0, DD, 0)])}" fill="var(--hground)" stroke="${LN}" stroke-width="1.4" stroke-linejoin="round"/></g>`;

  const D: { d: number; html: string }[] = []; // depth-sorted props

  /* ---- the complaint sheet ---- */
  const SX = 1.5, SY = 1.0, SW = 3.4, SD = 2.7;
  const lines = [2, 4, 5, 5][Math.min(3, Math.max(0, step - 1))];
  let sheet =
    `<polygon points="${poly([P(SX + 0.12, SY + 0.14, 0.01), P(SX + SW + 0.12, SY + 0.14, 0.01), P(SX + SW + 0.12, SY + SD + 0.14, 0.01), P(SX + 0.12, SY + SD + 0.14, 0.01)])}" fill="${LN}" opacity=".16"/>`
    + plane(SX, SY, 0.02, SW, SD, "var(--surface)");
  sheet += rule(SX + 0.34, SY + 0.4, 0.03, 1.5, "var(--brand)", 0.12);
  for (let i = 0; i < lines; i++)
    sheet += `<g class="prop" style="animation-delay:${(1.15 + i * 0.09).toFixed(2)}s">${rule(SX + 0.34, SY + 0.82 + i * 0.36, 0.03, i === lines - 1 ? 1.7 : 2.7, LN)}</g>`;
  if (step >= 2)
    sheet += `<g class="prop" style="animation-delay:1.6s">
      <polygon points="${poly([P(SX + 0.34, SY + 2.24, 0.03), P(SX + 1.9, SY + 2.24, 0.03), P(SX + 1.9, SY + 2.5, 0.03), P(SX + 0.34, SY + 2.5, 0.03)])}" fill="var(--brand-soft)" stroke="var(--brand)" stroke-width="1"/></g>`;
  if (step >= 4) {
    const c = P(SX + 2.55, SY + 0.95, 0.04);
    sheet += `<g class="prop" style="animation-delay:1.9s" transform="rotate(-12 ${c[0].toFixed(1)} ${c[1].toFixed(1)})">
      <ellipse cx="${c[0].toFixed(1)}" cy="${c[1].toFixed(1)}" rx="24" ry="13.6" fill="none" stroke="var(--ok)" stroke-width="2.4"/>
      <ellipse cx="${c[0].toFixed(1)}" cy="${c[1].toFixed(1)}" rx="19" ry="10.6" fill="none" stroke="var(--ok)" stroke-width="1" opacity=".6"/>
      <text x="${c[0].toFixed(1)}" y="${(c[1] + 3).toFixed(1)}" text-anchor="middle" font-family="var(--font-jetbrains), monospace" font-size="8.5" fill="var(--ok)" letter-spacing=".1em">READY</text></g>`;
  }
  D.push({ d: P(SX + SW / 2, SY + SD / 2, 0)[1], html: sheet });

  /* ---- step 1: the mic ---- */
  const mb = P(5.5, 1.0, 0);
  D.push({
    d: mb[1],
    html: `<g class="prop" style="animation-delay:1.0s">
    <ellipse cx="${mb[0].toFixed(1)}" cy="${mb[1].toFixed(1)}" rx="9" ry="4.8" fill="${LN}" opacity=".18"/>
    <line x1="${mb[0].toFixed(1)}" y1="${mb[1].toFixed(1)}" x2="${mb[0].toFixed(1)}" y2="${(mb[1] - 26).toFixed(1)}" stroke="${LN}" stroke-width="2"/>
    <ellipse cx="${mb[0].toFixed(1)}" cy="${(mb[1] - 2).toFixed(1)}" rx="7" ry="3.6" fill="var(--htop)" stroke="${LN}" stroke-width="1.3"/>
    <rect x="${(mb[0] - 6).toFixed(1)}" y="${(mb[1] - 52).toFixed(1)}" width="12" height="24" rx="6" fill="var(--brand)" stroke="${LN}" stroke-width="1.4"/>
    <path d="M${(mb[0] - 3.4).toFixed(1)} ${(mb[1] - 46).toFixed(1)} h6.8 M${(mb[0] - 3.4).toFixed(1)} ${(mb[1] - 41).toFixed(1)} h6.8 M${(mb[0] - 3.4).toFixed(1)} ${(mb[1] - 36).toFixed(1)} h6.8" stroke="var(--surface)" stroke-width="1" opacity=".65"/>
    ${[13, 21, 29].map((r, i) => `
      <path class="wave${i}" d="M${(mb[0] - r).toFixed(1)} ${(mb[1] - 40 - r * 0.28).toFixed(1)} a${r} ${r} 0 0 0 0 ${(r * 1.15).toFixed(1)}" fill="none" stroke="var(--brand)" stroke-width="1.7" stroke-linecap="round" opacity="${(0.75 - i * 0.2).toFixed(2)}"/>
      <path class="wave${i}" d="M${(mb[0] + r).toFixed(1)} ${(mb[1] - 40 - r * 0.28).toFixed(1)} a${r} ${r} 0 0 1 0 ${(r * 1.15).toFixed(1)}" fill="none" stroke="var(--brand)" stroke-width="1.7" stroke-linecap="round" opacity="${(0.75 - i * 0.2).toFixed(2)}"/>`).join("")}
    </g>`,
  });

  /* ---- step 2: the department signpost ---- */
  if (step >= 2) {
    const sb = P(0.75, 3.5, 0);
    D.push({
      d: sb[1],
      html: `<g class="prop" style="animation-delay:1.45s">
      <ellipse cx="${sb[0].toFixed(1)}" cy="${sb[1].toFixed(1)}" rx="8" ry="4.2" fill="${LN}" opacity=".18"/>
      <line x1="${sb[0].toFixed(1)}" y1="${sb[1].toFixed(1)}" x2="${sb[0].toFixed(1)}" y2="${(sb[1] - 42).toFixed(1)}" stroke="${LN}" stroke-width="2"/>
      <path d="M${(sb[0] - 34).toFixed(1)} ${(sb[1] - 52).toFixed(1)} h52 l10 8 l-10 8 h-52 Z" fill="var(--brand)" stroke="${LN}" stroke-width="1.4" stroke-linejoin="round"/>
      <text x="${(sb[0] - 8).toFixed(1)}" y="${(sb[1] - 41).toFixed(1)}" text-anchor="middle" font-family="var(--font-jetbrains), monospace" font-size="8" fill="var(--surface)" letter-spacing=".05em">${dept}</text>
      <path d="M${(sb[0] - 34).toFixed(1)} ${(sb[1] - 31).toFixed(1)} h38 l8 6 l-8 6 h-38 Z" fill="var(--surface)" stroke="${LN}" stroke-width="1.2" stroke-linejoin="round"/>
      <text x="${(sb[0] - 13).toFixed(1)}" y="${(sb[1] - 21.5).toFixed(1)}" text-anchor="middle" font-family="var(--font-jetbrains), monospace" font-size="7" fill="var(--ink)" opacity=".75" letter-spacing=".04em">${conf ? `${conf}% SURE` : "PICK ONE"}</text></g>`,
    });
  }

  /* ---- step 3: photos and the location pin ---- */
  if (step >= 3) {
    const pb = P(5.9, 4.0, 0);
    D.push({
      d: pb[1],
      html: `<g class="prop" style="animation-delay:1.5s">
      <ellipse cx="${pb[0].toFixed(1)}" cy="${pb[1].toFixed(1)}" rx="15" ry="7" fill="${LN}" opacity=".18"/>
      <g transform="rotate(-9 ${pb[0].toFixed(1)} ${pb[1].toFixed(1)})">
        <rect x="${(pb[0] - 19).toFixed(1)}" y="${(pb[1] - 33).toFixed(1)}" width="26" height="32" rx="2.5" fill="var(--surface)" stroke="${LN}" stroke-width="1.4"/>
        <rect x="${(pb[0] - 16).toFixed(1)}" y="${(pb[1] - 30).toFixed(1)}" width="20" height="20" fill="var(--track)"/>
        <circle cx="${(pb[0] - 10).toFixed(1)}" cy="${(pb[1] - 24).toFixed(1)}" r="2.6" fill="var(--warn)"/>
        <path d="M${(pb[0] - 16).toFixed(1)} ${(pb[1] - 14).toFixed(1)} l6-7 l5 5 l4-3 l5 5 v4 h-20 Z" fill="var(--htree)" opacity=".8"/></g>
      <g transform="rotate(7 ${pb[0].toFixed(1)} ${pb[1].toFixed(1)})">
        <rect x="${(pb[0] - 2).toFixed(1)}" y="${(pb[1] - 30).toFixed(1)}" width="24" height="30" rx="2.5" fill="var(--surface)" stroke="${LN}" stroke-width="1.4"/>
        <rect x="${(pb[0] + 1).toFixed(1)}" y="${(pb[1] - 27).toFixed(1)}" width="18" height="18" fill="var(--track)"/>
        <path d="M${(pb[0] + 1).toFixed(1)} ${(pb[1] - 12).toFixed(1)} l5-6 l4 4 l4-4 l5 6 Z" fill="var(--hsoil)" opacity=".8"/></g></g>`,
    });
    const lb = P(1.1, 0.5, 0);
    D.push({
      d: lb[1],
      html: `<g class="prop" style="animation-delay:1.72s">
      <ellipse cx="${lb[0].toFixed(1)}" cy="${lb[1].toFixed(1)}" rx="8" ry="4" fill="${LN}" opacity=".18"/>
      <ellipse class="pinring" style="animation-delay:3.2s" cx="${lb[0].toFixed(1)}" cy="${lb[1].toFixed(1)}" rx="14" ry="7.4" fill="none" stroke="var(--danger)" stroke-width="1.4"/>
      <path d="M${lb[0].toFixed(1)} ${lb[1].toFixed(1)} L${lb[0].toFixed(1)} ${(lb[1] - 22).toFixed(1)}" stroke="var(--danger)" stroke-width="1.7"/>
      <circle cx="${lb[0].toFixed(1)}" cy="${(lb[1] - 28).toFixed(1)}" r="8" fill="var(--danger)"/>
      <circle cx="${lb[0].toFixed(1)}" cy="${(lb[1] - 28).toFixed(1)}" r="3" fill="var(--surface)"/></g>`,
    });
  }

  /* ---- step 4: the acknowledgement ribbon ---- */
  if (step >= 4) {
    const rb = P(3.2, 5.7, 0);
    D.push({
      d: rb[1] + 500,
      html: `<g class="prop" style="animation-delay:2.1s">
      <rect x="${(rb[0] - 72).toFixed(1)}" y="${(rb[1] - 4).toFixed(1)}" width="144" height="24" rx="12" fill="var(--ok)"/>
      <text x="${rb[0].toFixed(1)}" y="${(rb[1] + 12).toFixed(1)}" text-anchor="middle" font-family="var(--font-jetbrains), monospace" font-size="10" fill="var(--surface)" letter-spacing=".06em">${ackNo}</text></g>`,
    });
  }

  D.sort((a, b) => a.d - b.d).forEach((e) => {
    s += e.html;
  });
  return s + `</svg>`;
}
