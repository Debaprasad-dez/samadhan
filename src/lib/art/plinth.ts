// Profile hero — the citizen's own footprint in the ward. Same isometric
// construction as the home island, but a round plinth instead of a square block:
// personal scale, not civic. The gold rim IS the tier progress. The planted
// markers ARE the confirmed fixes — one per resolved case. Ported verbatim from
// samadhan-citizen-profile/samadhan-profile-mobile.html.

const C = Math.cos(Math.PI / 6);
const S = Math.sin(Math.PI / 6);

function seeded(s: number) {
  return () => ((s = Math.imul(s ^ (s >>> 15), 1 | s)) >>> 0) / 4294967296;
}

export function plinth(o?: { fixes?: number; tier?: number; active?: number }): string {
  const { fixes = 11, tier = 61, active = 2 } = o || {};
  const W = 430, H = 310, u = 13.9, ox = 215, oy = 150;
  const rnd = seeded(8821);
  const P = (x: number, y: number, z: number): [number, number] => [
    ox + (x - y) * C * u,
    oy + (x + y) * S * u - z * u,
  ];
  const poly = (a: [number, number][]) =>
    a.map((q) => q[0].toFixed(2) + "," + q[1].toFixed(2)).join(" ");
  const LN = "var(--hline)";
  const R = 5.1, RX = Math.SQRT2 * R * C * u, RY = Math.SQRT2 * R * S * u, TH = 1.5 * u;
  // any point on the ground disc, in screen space
  const gp = (r: number, t: number): [number, number] => [
    ox + Math.SQRT2 * r * C * u * Math.cos(t),
    oy + Math.SQRT2 * r * S * u * Math.sin(t),
  ];

  let s = `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Your record in the ward: ${fixes} confirmed fixes planted around your building, ${active} cases still open, tier ring ${tier} per cent complete.">
   <defs>
    <linearGradient id="psky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="var(--h1)"/><stop offset=".5" stop-color="var(--h2)"/><stop offset="1" stop-color="var(--h3)"/></linearGradient>
    <radialGradient id="pgl" cx=".5" cy=".5" r=".5">
      <stop offset="0" stop-color="var(--hglow)" stop-opacity=".9"/>
      <stop offset=".42" stop-color="var(--hglow)" stop-opacity=".2"/>
      <stop offset="1" stop-color="var(--hglow)" stop-opacity="0"/></radialGradient>
    <linearGradient id="pfL" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#fff" stop-opacity=".10"/><stop offset="1" stop-color="#000" stop-opacity=".16"/></linearGradient>
    <linearGradient id="pfR" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#000" stop-opacity=".04"/><stop offset="1" stop-color="#000" stop-opacity=".26"/></linearGradient>
    <linearGradient id="prim" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".32"/></linearGradient>
    <clipPath id="discClip"><ellipse cx="${ox}" cy="${oy}" rx="${RX.toFixed(1)}" ry="${RY.toFixed(1)}"/></clipPath>
   </defs>
   <rect class="sky" width="${W}" height="${H}" fill="url(#psky)"/>`;

  let stars = "";
  for (let i = 0; i < 40; i++)
    stars += `<circle class="star" style="animation-delay:${(0.1 + rnd() * 0.6).toFixed(2)}s,${(2 + rnd() * 5).toFixed(1)}s" cx="${(rnd() * W).toFixed(1)}" cy="${(rnd() * 130).toFixed(1)}" r="${(rnd() * 0.8 + 0.3).toFixed(2)}" fill="var(--hglow)"/>`;
  s += `<g style="opacity:var(--hstar)">${stars}</g>`;
  s += `<g class="glow" style="transform-origin:344px 70px">
      <circle cx="344" cy="70" r="80" fill="url(#pgl)"/>
      <circle cx="344" cy="70" r="24" fill="var(--hglow)" opacity=".5"/>
      <circle cx="344" cy="70" r="24" fill="none" stroke="var(--hglow)" stroke-width="1"/></g>`;

  /* ---- plinth: side wall, top disc ---- */
  s += `<g class="slab">
    <path d="M${(ox - RX).toFixed(1)} ${oy.toFixed(1)} a${RX.toFixed(1)} ${RY.toFixed(1)} 0 0 0 ${(RX * 2).toFixed(1)} 0 v${TH.toFixed(1)} a${RX.toFixed(1)} ${RY.toFixed(1)} 0 0 1 ${(-RX * 2).toFixed(1)} 0 Z"
       fill="var(--hsoil)" stroke="${LN}" stroke-width="1.5" stroke-linejoin="round"/>
    <path d="M${(ox - RX).toFixed(1)} ${oy.toFixed(1)} a${RX.toFixed(1)} ${RY.toFixed(1)} 0 0 0 ${(RX * 2).toFixed(1)} 0 v${TH.toFixed(1)} a${RX.toFixed(1)} ${RY.toFixed(1)} 0 0 1 ${(-RX * 2).toFixed(1)} 0 Z" fill="url(#prim)"/>
    <ellipse cx="${ox}" cy="${oy}" rx="${RX.toFixed(1)}" ry="${RY.toFixed(1)}" fill="var(--hground)" stroke="${LN}" stroke-width="1.5"/></g>`;

  /* ---- concentric measure rings on the disc ---- */
  let rings = "";
  [0.42, 0.68, 0.9].forEach((f) => {
    rings += `<ellipse cx="${ox}" cy="${oy}" rx="${(RX * f).toFixed(1)}" ry="${(RY * f).toFixed(1)}" fill="none" stroke="${LN}" stroke-width=".6"/>`;
  });
  s += `<g class="grid">${rings}</g>`;

  /* ---- the rim IS the tier bar: a gold arc, drawn on ---- */
  const arcR = RX + 4.5, arcRY = RY + 2.6;
  let arc = "";
  const t0 = -Math.PI / 2, steps = 90, span = (tier / 100) * Math.PI * 2;
  for (let i = 0; i <= steps; i++) {
    const t = t0 + span * (i / steps);
    const x = ox + arcR * Math.cos(t), y = oy + arcRY * Math.sin(t);
    arc += (i ? "L" : "M") + x.toFixed(1) + " " + y.toFixed(1) + " ";
  }
  const arcLen =
    Math.PI * (3 * (arcR + arcRY) - Math.sqrt((3 * arcR + arcRY) * (arcR + 3 * arcRY))) * (tier / 100);
  s += `<ellipse cx="${ox}" cy="${oy}" rx="${arcR.toFixed(1)}" ry="${arcRY.toFixed(1)}" fill="none" stroke="${LN}" stroke-width="2.6" opacity=".18" class="grid"/>`;
  s += `<path class="tierarc" style="--len:${arcLen.toFixed(0)}" d="${arc}" fill="none" stroke="var(--gold)" stroke-width="3.4" stroke-linecap="round"/>`;

  /* ---- draw list, sorted by screen depth ---- */
  const D: { d: number; html: string }[] = [];
  const box = (x: number, y: number, z: number, w: number, d: number, h: number, sw: number) =>
    `<polygon points="${poly([P(x, y + d, z), P(x, y + d, z + h), P(x + w, y + d, z + h), P(x + w, y + d, z)])}" fill="var(--hleft)" stroke="${LN}" stroke-width="${sw}" stroke-linejoin="round"/>`
    + `<polygon points="${poly([P(x, y + d, z), P(x, y + d, z + h), P(x + w, y + d, z + h), P(x + w, y + d, z)])}" fill="url(#pfL)"/>`
    + `<polygon points="${poly([P(x + w, y, z), P(x + w, y, z + h), P(x + w, y + d, z + h), P(x + w, y + d, z)])}" fill="var(--hright)" stroke="${LN}" stroke-width="${sw}" stroke-linejoin="round"/>`
    + `<polygon points="${poly([P(x + w, y, z), P(x + w, y, z + h), P(x + w, y + d, z + h), P(x + w, y + d, z)])}" fill="url(#pfR)"/>`
    + `<polygon points="${poly([P(x, y, z + h), P(x + w, y, z + h), P(x + w, y + d, z + h), P(x, y + d, z + h)])}" fill="var(--htop)" stroke="${LN}" stroke-width="${sw}" stroke-linejoin="round"/>`;

  /* her building, centred on the plinth */
  const bw = 2.0, bd = 2.0, bh = 3.0, bx = -bw / 2, by = -bd / 2;
  let b = "";
  const shDx = bh * 0.14, shDy = bh * 0.66;
  s += `<g class="shadows" clip-path="url(#discClip)"><polygon points="${poly([P(bx, by, 0), P(bx + bw, by, 0), P(bx + bw + shDx, by + shDy, 0), P(bx + bw + shDx, by + bd + shDy, 0), P(bx + shDx, by + bd + shDy, 0), P(bx, by + bd, 0)])}" fill="${LN}" opacity=".17"/></g>`;
  b += box(bx, by, 0, bw, bd, bh, 1.5);
  for (let f = 1; f * 0.62 < bh; f++) {
    const z = f * 0.62;
    b += `<polygon points="${poly([P(bx, by + bd, z), P(bx, by + bd, z + 0.07), P(bx + bw, by + bd, z + 0.07), P(bx + bw, by + bd, z)])}" fill="${LN}" opacity=".26"/>`;
    b += `<polygon points="${poly([P(bx + bw, by, z), P(bx + bw, by, z + 0.07), P(bx + bw, by + bd, z + 0.07), P(bx + bw, by + bd, z)])}" fill="${LN}" opacity=".2"/>`;
  }
  b += box(bx, by, bh, bw, bd, 0.14, 1);
  b += `<polygon points="${poly([P(bx, by + bd, 0), P(bx, by + bd, 0.34), P(bx + bw, by + bd, 0.34), P(bx + bw, by + bd, 0)])}" fill="${LN}" opacity=".14"/>`;
  /* rooftop tank */
  const tx = bx + bw * 0.3, ty = by + bd * 0.3;
  b += `<polygon points="${poly([P(tx, ty + 0.6, bh + 0.14), P(tx, ty + 0.6, bh + 0.62), P(tx + 0.7, ty + 0.6, bh + 0.62), P(tx + 0.7, ty + 0.6, bh + 0.14)])}" fill="var(--htankD)" stroke="${LN}" stroke-width="1"/>`;
  b += `<polygon points="${poly([P(tx + 0.7, ty, bh + 0.14), P(tx + 0.7, ty, bh + 0.62), P(tx + 0.7, ty + 0.6, bh + 0.62), P(tx + 0.7, ty + 0.6, bh + 0.14)])}" fill="var(--htankD)" stroke="${LN}" stroke-width="1"/>`;
  b += `<polygon points="${poly([P(tx, ty, bh + 0.62), P(tx + 0.7, ty, bh + 0.62), P(tx + 0.7, ty + 0.6, bh + 0.62), P(tx, ty + 0.6, bh + 0.62)])}" fill="var(--htank)" stroke="${LN}" stroke-width="1"/>`;
  /* windows — one of them is hers, and it stays lit */
  let wi = 0, wins = "";
  const cols = Math.max(1, Math.floor(bw / 0.78)), rows = Math.max(1, Math.floor(bh / 0.62));
  for (let r2 = 0; r2 < rows; r2++)
    for (let c2 = 0; c2 < cols; c2++) {
      const wx = bx + 0.26 + c2 * 0.78, wz = 0.22 + r2 * 0.62, mine = r2 === 1 && c2 === 0;
      const frame = poly([P(wx - 0.05, by + bd, wz - 0.04), P(wx + 0.49, by + bd, wz - 0.04), P(wx + 0.49, by + bd, wz + 0.38), P(wx - 0.05, by + bd, wz + 0.38)]);
      const pane = poly([P(wx, by + bd, wz), P(wx + 0.44, by + bd, wz), P(wx + 0.44, by + bd, wz + 0.34), P(wx, by + bd, wz + 0.34)]);
      wins += `<polygon points="${frame}" fill="${LN}" opacity=".22"/>`;
      const on = mine || rnd() < 0.55;
      wins += on
        ? `<polygon class="win${mine ? " fl" : ""}" style="--o:${mine ? 1 : (0.6 + rnd() * 0.3).toFixed(2)};animation-delay:${(1.36 + wi * 0.05).toFixed(2)}s${mine ? ",4.4s" : ""}" points="${pane}" fill="var(--hlit)"/>`
        : `<polygon points="${pane}" fill="${LN}" opacity=".3"/>`;
      wi++;
    }
  D.push({ d: oy + bd * S * u, html: `<g class="bldg" style="animation-delay:.86s">${b}${wins}</g>` });

  /* ---- confirmed fixes: one planted marker each ---- */
  for (let i = 0; i < fixes; i++) {
    const t = -Math.PI / 2 + (i / fixes) * Math.PI * 2 + 0.24, r = 3.15 + ((i % 3) - 1) * 0.5;
    const [px, py] = gp(r, t);
    D.push({
      d: py,
      html: `<g class="fixmk" style="animation-delay:${(1.74 + i * 0.075).toFixed(2)}s">
        <ellipse cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" rx="5.2" ry="2.8" fill="${LN}" opacity=".16"/>
        <line x1="${px.toFixed(1)}" y1="${py.toFixed(1)}" x2="${px.toFixed(1)}" y2="${(py - 13).toFixed(1)}" stroke="var(--ok)" stroke-width="1.5" stroke-linecap="round"/>
        <circle cx="${px.toFixed(1)}" cy="${(py - 16).toFixed(1)}" r="5.4" fill="var(--surface)"/>
        <circle cx="${px.toFixed(1)}" cy="${(py - 16).toFixed(1)}" r="4.6" fill="var(--ok)"/>
        <path d="M${(px - 2.2).toFixed(1)} ${(py - 16).toFixed(1)} l1.6 1.7 l3-3.4" fill="none" stroke="var(--surface)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></g>`,
    });
  }

  /* ---- still-open cases: tall pins, same as home ---- */
  ([[3.9, -Math.PI / 2 + 2.1, "var(--warn)"], [4.1, -Math.PI / 2 + 4.4, "var(--danger)"]] as [number, number, string][])
    .slice(0, active)
    .forEach(([r, t, c], i) => {
      const [px, py] = gp(r, t);
      D.push({
        d: py + 400,
        html: `<g transform="translate(${px.toFixed(1)} ${py.toFixed(1)})"><g class="pin" style="animation-delay:${(2.62 + i * 0.16).toFixed(2)}s">
        <ellipse class="pinring" style="animation-delay:${(3.4 + i * 1.7).toFixed(1)}s" rx="13" ry="7.2" fill="none" stroke="${c}" stroke-width="1.5"/>
        <ellipse rx="5.2" ry="2.9" fill="${c}" opacity=".3"/>
        <line x1="0" y1="0" x2="0" y2="-28" stroke="var(--surface)" stroke-width="3.4" opacity=".9"/>
        <line x1="0" y1="0" x2="0" y2="-28" stroke="${c}" stroke-width="1.6"/>
        <circle cy="-34" r="8.4" fill="var(--surface)"/>
        <circle cy="-34" r="6.7" fill="${c}"/><circle cy="-34" r="2.6" fill="var(--surface)"/></g></g>`,
      });
    });

  /* two trees for life on the plinth */
  ([[4.3, -Math.PI / 2 + 1.1], [4.3, -Math.PI / 2 + 5.3]] as [number, number][]).forEach(([r, t], i) => {
    const [px, py] = gp(r, t);
    D.push({
      d: py,
      html: `<ellipse class="detail" style="animation-delay:${(2.2 + i * 0.1).toFixed(2)}s" cx="${(px + 4).toFixed(1)}" cy="${(py + 3).toFixed(1)}" rx="8" ry="4" fill="${LN}" opacity=".15"/>
       <g class="tree" style="animation-delay:${(2.2 + i * 0.1).toFixed(2)}s,${(3.4 + i * 1.4).toFixed(1)}s">
        <line x1="${px.toFixed(1)}" y1="${py.toFixed(1)}" x2="${px.toFixed(1)}" y2="${(py - 12).toFixed(1)}" stroke="${LN}" stroke-width="1.8" stroke-linecap="round"/>
        <ellipse cx="${(px - 4).toFixed(1)}" cy="${(py - 12).toFixed(1)}" rx="5.4" ry="4.1" fill="var(--htree)" stroke="${LN}" stroke-width="1.1"/>
        <ellipse cx="${(px + 4.4).toFixed(1)}" cy="${(py - 12.6).toFixed(1)}" rx="5" ry="3.8" fill="var(--htree)" stroke="${LN}" stroke-width="1.1"/>
        <ellipse cx="${px.toFixed(1)}" cy="${(py - 16.6).toFixed(1)}" rx="8.2" ry="6" fill="var(--htree)" stroke="${LN}" stroke-width="1.2"/>
        <ellipse cx="${(px - 2.4).toFixed(1)}" cy="${(py - 18.6).toFixed(1)}" rx="4" ry="2.6" fill="#fff" opacity=".16"/></g>`,
    });
  });

  D.sort((a, b2) => a.d - b2.d).forEach((e) => {
    s += e.html;
  });
  return s + `</svg>`;
}
