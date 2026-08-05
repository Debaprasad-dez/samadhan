// Case hero — the service journey as a road. Gate spacing is elapsed time, so a
// long empty stretch IS the time the case sat waiting. The barrier at the end is
// the charter limit; the marker is where the case stands right now. Ported
// verbatim from samadhan-citizen-case-page/samadhan-case-mobile.html.

const C = Math.cos(Math.PI / 6);
const S = Math.sin(Math.PI / 6);

function seeded(s: number) {
  return () => ((s = Math.imul(s ^ (s >>> 15), 1 | s)) >>> 0) / 4294967296;
}

export interface RoadStage {
  /** cumulative hours since filing */
  h: number;
  label: string;
  /** the leg that follows this gate, e.g. "2d 5h" */
  dur?: string;
}

export function journeyRoad(
  stages: RoadStage[],
  nowH: number,
  limitH: number,
  limitLabel = "LIMIT",
  nowLabel = "NOW",
): string {
  const W = 430, H = 306, u = 23.5, ox = 115, oy = 79;
  const rnd = seeded(9042);
  const P = (x: number, y: number, z: number): [number, number] => [
    ox + (x - y) * C * u,
    oy + (x + y) * S * u - z * u,
  ];
  const poly = (a: [number, number][]) =>
    a.map((q) => q[0].toFixed(2) + "," + q[1].toFixed(2)).join(" ");
  const LN = "var(--hline)";
  const LEN = 10.2; // road length = the full charter limit
  const raw = (h: number) => 0.3 + (h / limitH) * LEN; // hours -> position
  // 21 minutes is invisible on a 7-day scale, so gates get a floor of 0.9 units
  // between them. Exact durations are printed on the legs regardless.
  const GP: number[] = [];
  stages.forEach((st, i) => GP.push(i ? Math.max(raw(st.h), GP[i - 1] + 0.9) : raw(st.h)));
  const gx = (h: number) => {
    const i = stages.findIndex((s2) => s2.h === h);
    return i >= 0 ? GP[i] : raw(h);
  };
  const RY0 = 1.0, RW = 1.25; // road runs along y, this is its band

  let s = `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="The case journey as a road. Gate spacing is elapsed time; a long gap is time the case spent waiting. The barrier at the end is the charter limit.">
   <defs>
    <linearGradient id="jsky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="var(--h1)"/><stop offset=".5" stop-color="var(--h2)"/><stop offset="1" stop-color="var(--h3)"/></linearGradient>
    <radialGradient id="jgl" cx=".5" cy=".5" r=".5">
      <stop offset="0" stop-color="var(--hglow)" stop-opacity=".8"/>
      <stop offset=".45" stop-color="var(--hglow)" stop-opacity=".16"/>
      <stop offset="1" stop-color="var(--hglow)" stop-opacity="0"/></radialGradient>
    <linearGradient id="jrim" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".3"/></linearGradient>
   </defs>
   <rect class="sky" width="${W}" height="${H}" fill="url(#jsky)"/>`;

  let stars = "";
  for (let i = 0; i < 34; i++)
    stars += `<circle class="star" style="animation-delay:${(0.1 + rnd() * 0.6).toFixed(2)}s,${(2 + rnd() * 5).toFixed(1)}s" cx="${(rnd() * W).toFixed(1)}" cy="${(rnd() * 110).toFixed(1)}" r="${(rnd() * 0.8 + 0.3).toFixed(2)}" fill="var(--hglow)"/>`;
  s += `<g style="opacity:var(--hstar)">${stars}</g>`;
  s += `<g class="glow" style="transform-origin:360px 52px">
      <circle cx="360" cy="52" r="64" fill="url(#jgl)"/>
      <circle cx="360" cy="52" r="18" fill="var(--hglow)" opacity=".5"/>
      <circle cx="360" cy="52" r="18" fill="none" stroke="var(--hglow)" stroke-width="1"/></g>`;

  /* ---- ground strip under the road ---- */
  const GX0 = -0.2, GX1 = LEN + 0.9, GY0 = 0.1, GY1 = 3.1;
  s += `<g class="slab">
    <polygon points="${poly([P(GX0, GY1, 0), P(GX0, GY1, -0.9), P(GX1, GY1, -0.9), P(GX1, GY1, 0)])}" fill="var(--hsoil)" stroke="${LN}" stroke-width="1.4" stroke-linejoin="round"/>
    <polygon points="${poly([P(GX0, GY1, 0), P(GX0, GY1, -0.9), P(GX1, GY1, -0.9), P(GX1, GY1, 0)])}" fill="url(#jrim)"/>
    <polygon points="${poly([P(GX1, GY0, 0), P(GX1, GY0, -0.9), P(GX1, GY1, -0.9), P(GX1, GY1, 0)])}" fill="var(--hsoilD)" stroke="${LN}" stroke-width="1.4" stroke-linejoin="round"/>
    <polygon points="${poly([P(GX0, GY0, 0), P(GX1, GY0, 0), P(GX1, GY1, 0), P(GX0, GY1, 0)])}" fill="var(--hground)" stroke="${LN}" stroke-width="1.4" stroke-linejoin="round"/></g>`;

  /* ---- road segments, coloured by state, laid in sequence ---- */
  const segs: { a: RoadStage; b: RoadStage; i: number }[] = [];
  for (let i = 0; i < stages.length - 1; i++) segs.push({ a: stages[i], b: stages[i + 1], i });
  segs.push({ a: stages[stages.length - 1], b: { h: limitH, label: "Limit" }, i: stages.length - 1 });
  segs.forEach(({ a, b, i }) => {
    const x0 = gx(a.h), x1 = gx(b.h);
    const done = b.h <= nowH, live = a.h <= nowH && b.h > nowH;
    const fill = done ? "var(--ok)" : live ? "var(--warn)" : "var(--hroad)";
    const op = done ? 0.34 : live ? 0.3 : 0.8;
    s += `<g class="seg" style="animation-delay:${(0.72 + i * 0.13).toFixed(2)}s">
      <polygon points="${poly([P(x0, RY0, 0.02), P(x1, RY0, 0.02), P(x1, RY0 + RW, 0.02), P(x0, RY0 + RW, 0.02)])}" fill="var(--hroad)"/>
      <polygon points="${poly([P(x0, RY0, 0.03), P(x1, RY0, 0.03), P(x1, RY0 + RW, 0.03), P(x0, RY0 + RW, 0.03)])}" fill="${fill}" opacity="${op}"/>`;
    // centre dashes only on the stretch already travelled
    if (done || live) {
      for (let d = x0 + 0.22; d < x1 - 0.2; d += 0.62)
        s += `<polygon points="${poly([P(d, RY0 + RW / 2 - 0.05, 0.04), P(Math.min(d + 0.32, x1 - 0.1), RY0 + RW / 2 - 0.05, 0.04), P(Math.min(d + 0.32, x1 - 0.1), RY0 + RW / 2 + 0.05, 0.04), P(d, RY0 + RW / 2 + 0.05, 0.04)])}" fill="var(--hlit)" opacity=".55"/>`;
    }
    s += `</g>`;
    // how long this leg took, printed on it
    if (a.dur) {
      const m = P((x0 + x1) / 2, i % 2 ? RY0 - 0.42 : RY0 + RW + 0.38, 0.04);
      s += `<g class="detail" style="animation-delay:${(1.5 + i * 0.12).toFixed(2)}s">
        <rect x="${(m[0] - 21).toFixed(1)}" y="${(m[1] - 8).toFixed(1)}" width="42" height="15" rx="7.5" fill="var(--surface)" stroke="${LN}" stroke-width="1" opacity=".95"/>
        <text x="${m[0].toFixed(1)}" y="${(m[1] + 2.6).toFixed(1)}" text-anchor="middle" font-family="var(--font-jetbrains), monospace" font-size="8" fill="var(--ink)">${a.dur}</text></g>`;
    }
  });

  /* ---- gates ---- */
  stages.forEach((st, i) => {
    const x = gx(st.h), b = P(x, RY0 + RW / 2, 0.05);
    const done = st.h < nowH, tone = done ? "var(--ok)" : "var(--warn)";
    const post = i % 2 ? 46 : 16, head = post + 7; // stagger so labels clear
    s += `<g class="gate" style="animation-delay:${(1.0 + i * 0.14).toFixed(2)}s">
      <ellipse cx="${b[0].toFixed(1)}" cy="${b[1].toFixed(1)}" rx="7" ry="3.8" fill="${LN}" opacity=".18"/>
      <line x1="${b[0].toFixed(1)}" y1="${b[1].toFixed(1)}" x2="${b[0].toFixed(1)}" y2="${(b[1] - post).toFixed(1)}" stroke="${tone}" stroke-width="1.7" stroke-linecap="round"/>
      <circle cx="${b[0].toFixed(1)}" cy="${(b[1] - head).toFixed(1)}" r="8.4" fill="var(--surface)" stroke="${tone}" stroke-width="1.8"/>
      ${done
        ? `<path d="M${(b[0] - 3.4).toFixed(1)} ${(b[1] - head).toFixed(1)} l2.4 2.5 l4.6-5" fill="none" stroke="${tone}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`
        : `<circle cx="${b[0].toFixed(1)}" cy="${(b[1] - head).toFixed(1)}" r="3.4" fill="${tone}"/>`}
      <text x="${b[0].toFixed(1)}" y="${(b[1] - head - 12).toFixed(1)}" text-anchor="middle" font-family="var(--font-jetbrains), monospace" font-size="7.6" fill="${LN}" opacity=".8" letter-spacing=".06em">${st.label}</text></g>`;
  });

  /* ---- the charter-limit barrier at the far end ---- */
  const lx = gx(limitH);
  const p1 = P(lx, RY0 - 0.15, 0), p2 = P(lx, RY0 + RW + 0.15, 0);
  s += `<g class="limitgate" style="animation-delay:2.28s">
    <line x1="${p1[0].toFixed(1)}" y1="${p1[1].toFixed(1)}" x2="${p1[0].toFixed(1)}" y2="${(p1[1] - 26).toFixed(1)}" stroke="var(--danger)" stroke-width="2.2" stroke-linecap="round"/>
    <line x1="${p2[0].toFixed(1)}" y1="${p2[1].toFixed(1)}" x2="${p2[0].toFixed(1)}" y2="${(p2[1] - 26).toFixed(1)}" stroke="var(--danger)" stroke-width="2.2" stroke-linecap="round"/>
    <polygon points="${poly([[p1[0], p1[1] - 19], [p2[0], p2[1] - 19], [p2[0], p2[1] - 12], [p1[0], p1[1] - 12]])}" fill="var(--danger)" opacity=".85"/>
    <rect x="${(p1[0] - 16).toFixed(1)}" y="${(p1[1] - 42).toFixed(1)}" width="74" height="17" rx="8.5" fill="var(--danger)"/>
    <text x="${(p1[0] + 21).toFixed(1)}" y="${(p1[1] - 30.6).toFixed(1)}" text-anchor="middle" font-family="var(--font-jetbrains), monospace" font-size="8" fill="var(--on-danger)" letter-spacing=".07em">${limitLabel}</text></g>`;

  /* ---- where the case stands right now ---- */
  const nx = gx(nowH), n = P(nx, RY0 + RW / 2, 0.06);
  s += `<g transform="translate(${n[0].toFixed(1)} ${n[1].toFixed(1)})"><g class="pin" style="animation-delay:2.52s">
    <ellipse class="pinring" style="animation-delay:3.3s" rx="15" ry="8.4" fill="none" stroke="var(--warn)" stroke-width="1.6"/>
    <ellipse rx="6.4" ry="3.5" fill="var(--warn)" opacity=".32"/>
    <line x1="0" y1="0" x2="0" y2="-86" stroke="var(--surface)" stroke-width="3.6" opacity=".9"/>
    <line x1="0" y1="0" x2="0" y2="-86" stroke="var(--warn)" stroke-width="1.8"/>
    <rect x="-31" y="-108" width="62" height="20" rx="10" fill="var(--warn)"/>
    <text y="-94.4" text-anchor="middle" font-family="var(--font-jetbrains), monospace" font-size="8.6" fill="var(--surface)" letter-spacing=".05em">${nowLabel}</text>
    <circle cy="-86" r="4.6" fill="var(--warn)" stroke="var(--surface)" stroke-width="1.7"/></g></g>`;
  return s + `</svg>`;
}
