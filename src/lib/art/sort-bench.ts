/**
 * Notifications hero — a sorting bench.
 *
 * Left tray: things that need you, standing upright so they demand attention.
 * Right tray: things that merely happened, lying flat. The two counts are the
 * page's two tiers, drawn rather than stated.
 */
const C = Math.cos(Math.PI / 6),
  S = Math.sin(Math.PI / 6);

export function sortBench(needs: number, updates: number): string {
  const W = 430,
    H = 300,
    u = 31.1,
    ox = 186,
    oy = 74;
  const rnd = ((s: number) => () =>
    ((s = Math.imul(s ^ (s >>> 15), 1 | s)) >>> 0) / 4294967296)(5150);
  const P = (x: number, y: number, z: number): [number, number] => [
    ox + (x - y) * C * u,
    oy + (x + y) * S * u - z * u,
  ];
  const poly = (a: [number, number][]) =>
    a.map((q) => q[0].toFixed(2) + "," + q[1].toFixed(2)).join(" ");
  const LN = "var(--hline)";
  const box = (
    x: number,
    y: number,
    z: number,
    w: number,
    d: number,
    h: number,
    sw: number,
    top: string,
    left: string,
    right: string,
  ) =>
    `<polygon points="${poly([P(x, y + d, z), P(x, y + d, z + h), P(x + w, y + d, z + h), P(x + w, y + d, z)])}" fill="${left}" stroke="${LN}" stroke-width="${sw}" stroke-linejoin="round"/>` +
    `<polygon points="${poly([P(x, y + d, z), P(x, y + d, z + h), P(x + w, y + d, z + h), P(x + w, y + d, z)])}" fill="url(#nfL)"/>` +
    `<polygon points="${poly([P(x + w, y, z), P(x + w, y, z + h), P(x + w, y + d, z + h), P(x + w, y + d, z)])}" fill="${right}" stroke="${LN}" stroke-width="${sw}" stroke-linejoin="round"/>` +
    `<polygon points="${poly([P(x + w, y, z), P(x + w, y, z + h), P(x + w, y + d, z + h), P(x + w, y + d, z)])}" fill="url(#nfR)"/>` +
    `<polygon points="${poly([P(x, y, z + h), P(x + w, y, z + h), P(x + w, y + d, z + h), P(x, y + d, z + h)])}" fill="${top}" stroke="${LN}" stroke-width="${sw}" stroke-linejoin="round"/>`;

  let s = `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="A sorting bench. ${needs} notifications stand upright in the left tray because they need you; ${updates} lie flat in the right tray because they are only updates.">
   <defs>
    <linearGradient id="nsky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="var(--h1)"/><stop offset=".5" stop-color="var(--h2)"/><stop offset="1" stop-color="var(--h3)"/></linearGradient>
    <radialGradient id="ngl" cx=".5" cy=".5" r=".5">
      <stop offset="0" stop-color="var(--hglow)" stop-opacity=".8"/>
      <stop offset=".45" stop-color="var(--hglow)" stop-opacity=".16"/>
      <stop offset="1" stop-color="var(--hglow)" stop-opacity="0"/></radialGradient>
    <linearGradient id="nfL" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#fff" stop-opacity=".1"/><stop offset="1" stop-color="#000" stop-opacity=".18"/></linearGradient>
    <linearGradient id="nfR" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#000" stop-opacity=".04"/><stop offset="1" stop-color="#000" stop-opacity=".27"/></linearGradient>
    <linearGradient id="nrim" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".3"/></linearGradient>
   </defs>
   <rect class="sky" width="${W}" height="${H}" fill="url(#nsky)"/>`;

  let stars = "";
  for (let i = 0; i < 30; i++)
    stars += `<circle class="star" style="animation-delay:${(0.1 + rnd() * 0.5).toFixed(2)}s,${(2 + rnd() * 5).toFixed(1)}s" cx="${(rnd() * W).toFixed(1)}" cy="${(rnd() * 96).toFixed(1)}" r="${(rnd() * 0.8 + 0.3).toFixed(2)}" fill="var(--hglow)"/>`;
  s += `<g style="opacity:var(--hstar)">${stars}</g>`;
  s += `<g class="glow" style="transform-origin:372px 40px">
      <circle cx="372" cy="40" r="56" fill="url(#ngl)"/>
      <circle cx="372" cy="40" r="16" fill="var(--hglow)" opacity=".5"/>
      <circle cx="372" cy="40" r="16" fill="none" stroke="var(--hglow)" stroke-width="1"/></g>`;

  /* bench */
  const BW = 6.6,
    BD = 4.4;
  s += `<g class="slab">
    <polygon points="${poly([P(0, BD, 0), P(0, BD, -0.8), P(BW, BD, -0.8), P(BW, BD, 0)])}" fill="var(--hsoil)" stroke="${LN}" stroke-width="1.4" stroke-linejoin="round"/>
    <polygon points="${poly([P(0, BD, 0), P(0, BD, -0.8), P(BW, BD, -0.8), P(BW, BD, 0)])}" fill="url(#nrim)"/>
    <polygon points="${poly([P(BW, 0, 0), P(BW, 0, -0.8), P(BW, BD, -0.8), P(BW, BD, 0)])}" fill="var(--hsoilD)" stroke="${LN}" stroke-width="1.4" stroke-linejoin="round"/>
    <polygon points="${poly([P(BW, 0, 0), P(BW, 0, -0.8), P(BW, BD, -0.8), P(BW, BD, 0)])}" fill="url(#nrim)"/>
    <polygon points="${poly([P(0, 0, 0), P(BW, 0, 0), P(BW, BD, 0), P(0, BD, 0)])}" fill="var(--hground)" stroke="${LN}" stroke-width="1.4" stroke-linejoin="round"/></g>`;

  const D: { d: number; html: string }[] = [];
  /* ---- a tray: shallow base with a front and right lip ---- */
  const tray = (x: number, y: number, w: number, d: number, tint: string, dly: string) => {
    let t = box(x, y, 0, w, d, 0.16, 1.3, tint, tint, tint);
    t += box(x, y + d - 0.1, 0.16, w, 0.1, 0.3, 1.1, "var(--htop)", "var(--hleft)", "var(--hright)");
    t += box(x + w - 0.1, y, 0.16, 0.1, d, 0.3, 1.1, "var(--htop)", "var(--hleft)", "var(--hright)");
    return {
      d: P(x + w / 2, y + d / 2, 0)[1],
      html: `<g class="prop" style="animation-delay:${dly}s">${t}</g>`,
    };
  };
  D.push(tray(0.45, 0.6, 2.7, 3.2, "var(--warn-bg)", "0.86"));
  D.push(tray(3.5, 0.6, 2.7, 3.2, "var(--surface-2)", "0.96"));

  /* ---- needs-you: upright cards, filed like a tray of tasks ---- */
  for (let i = 0; i < needs; i++) {
    const y = 1.05 + i * 0.62,
      h = 1.25 - i * 0.06;
    D.push({
      d: P(1.75, y, 0)[1] + i * 0.01,
      html:
        `<g class="prop" style="animation-delay:${(1.24 + i * 0.12).toFixed(2)}s">` +
        box(0.78, y, 0.16, 2.0, 0.09, h, 1.3, "var(--warn)", "var(--warn-bg)", "var(--warn)") +
        `<polygon points="${poly([P(0.98, y, 0.16 + h * 0.62), P(1.86, y, 0.16 + h * 0.62), P(1.86, y, 0.16 + h * 0.7), P(0.98, y, 0.16 + h * 0.7)])}" fill="${LN}" opacity=".34"/>` +
        `<polygon points="${poly([P(0.98, y, 0.16 + h * 0.4), P(2.3, y, 0.16 + h * 0.4), P(2.3, y, 0.16 + h * 0.48), P(0.98, y, 0.16 + h * 0.48)])}" fill="${LN}" opacity=".22"/>` +
        `</g>`,
    });
  }

  /* ---- updates: flat cards, stacked and inert ---- */
  for (let i = 0; i < updates; i++) {
    const z = 0.16 + i * 0.085;
    const jx = (rnd() - 0.5) * 0.1,
      jy = (rnd() - 0.5) * 0.1;
    D.push({
      d: P(4.85, 2.2, 0)[1] + i * 0.02,
      html:
        `<g class="prop" style="animation-delay:${(0.98 + i * 0.055).toFixed(2)}s">` +
        box(3.72 + jx, 0.82 + jy, z, 2.26, 2.72, 0.085, 1.1, "var(--surface)", "var(--surface-2)", "var(--track)") +
        `</g>`,
    });
  }
  /* one ruled line on the top card so the stack reads as paper */
  const topz = 0.16 + updates * 0.085;
  D.push({
    d: P(4.85, 2.2, 0)[1] + 99,
    html: `<g class="prop" style="animation-delay:${(0.98 + updates * 0.055 + 0.1).toFixed(2)}s">
      <polygon points="${poly([P(4.0, 1.3, topz), P(5.6, 1.3, topz), P(5.6, 1.38, topz), P(4.0, 1.38, topz)])}" fill="${LN}" opacity=".28"/>
      <polygon points="${poly([P(4.0, 1.72, topz), P(5.2, 1.72, topz), P(5.2, 1.8, topz), P(4.0, 1.8, topz)])}" fill="${LN}" opacity=".18"/>
      <polygon points="${poly([P(4.0, 2.14, topz), P(5.5, 2.14, topz), P(5.5, 2.22, topz), P(4.0, 2.22, topz)])}" fill="${LN}" opacity=".18"/></g>`,
  });

  /* ---- the badge that says how many are waiting ---- */
  const b = P(1.78, 2.35, 2.05);
  D.push({
    d: 1e6,
    html: `<g transform="translate(${b[0].toFixed(1)} ${b[1].toFixed(1)})"><g class="pin" style="animation-delay:1.86s">
      <ellipse class="pinring" style="animation-delay:3.2s" rx="17" ry="9.4" fill="none" stroke="var(--warn)" stroke-width="1.6"/>
      <line x1="0" y1="0" x2="0" y2="-26" stroke="var(--surface)" stroke-width="3.4" opacity=".9"/>
      <line x1="0" y1="0" x2="0" y2="-26" stroke="var(--warn)" stroke-width="1.7"/>
      <circle cy="-34" r="13" fill="var(--surface)"/>
      <circle cy="-34" r="10.6" fill="var(--warn)"/>
      <text y="-30.2" text-anchor="middle" font-family="var(--font-jetbrains),monospace" font-size="12" font-weight="500" fill="var(--surface)">${needs}</text></g></g>`,
  });

  /* tray captions */
  const cap = (x: number, y: number, txt: string, tint: string, dly: string) => {
    const p = P(x, y, 0);
    return {
      d: 1e5,
      html: `<g class="detail" style="animation-delay:${dly}s">
      <rect x="${(p[0] - 38).toFixed(1)}" y="${(p[1] - 9).toFixed(1)}" width="76" height="18" rx="9" fill="${tint}"/>
      <text x="${p[0].toFixed(1)}" y="${(p[1] + 3.6).toFixed(1)}" text-anchor="middle" font-family="var(--font-jetbrains),monospace" font-size="8.4" fill="var(--surface)" letter-spacing=".07em">${txt}</text></g>`,
    };
  };
  D.push(cap(1.8, 4.5, "NEEDS YOU", "var(--warn)", "2.1"));
  D.push(cap(4.85, 4.5, "UPDATES", "var(--muted)", "2.2"));

  D.sort((a, b2) => a.d - b2.d).forEach((e) => {
    s += e.html;
  });
  return s + `</svg>`;
}
