// Procedural, animated hero scenes per theme — ported verbatim from the design
// mockup (samadhan-directions-full.html heroDawn/Mughal/Steel/Nilgiri). Each
// returns an SVG string (viewBox 700×290) whose animated bits carry `an-*`
// classes styled in mockup.css. Rendered client-side, so Math.random is fine.

const R = Math.random;
const W = 700;
const H = 290;

function heroDawn(): string {
  let o = `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">`;
  o += `<defs><linearGradient id="dsky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F4B357"/><stop offset=".45" stop-color="#E88B4B"/><stop offset="1" stop-color="#C4623A"/></linearGradient></defs>`;
  o += `<rect width="${W}" height="${H}" fill="url(#dsky)"/>`;
  o += `<g class="an-sun" style="transform-origin:470px 132px"><circle cx="470" cy="132" r="52" fill="#FFE7B0" fill-opacity=".92"/></g>`;
  o += `<g class="an-rays" style="transform-origin:470px 132px">`;
  for (let i = 0; i < 26; i++) {
    const a = i * ((Math.PI * 2) / 26);
    o += `<line x1="470" y1="132" x2="${(470 + Math.cos(a) * 300).toFixed(1)}" y2="${(132 + Math.sin(a) * 300).toFixed(1)}" stroke="#FFE7B0" stroke-opacity=".10" stroke-width="9"/>`;
  }
  o += `</g>`;
  const sil = (y: number, col: string, op: number) => {
    let d = `M0 ${H} L0 ${y + 40} `;
    const tw = [[36, 26], [92, 44], [150, 18], [196, 52], [262, 30], [318, 60], [392, 24], [440, 46], [512, 20], [566, 50], [634, 28], [680, 42]];
    tw.forEach(([x, h]) => {
      d += `L${x - 16} ${y + 40 - h * 0.4} L${x - 16} ${y + 40 - h} L${x} ${y + 40 - h - 13} L${x + 16} ${y + 40 - h} L${x + 16} ${y + 40 - h * 0.4} `;
    });
    d += `L${W} ${y + 40} L${W} ${H} Z`;
    return `<path d="${d}" fill="${col}" fill-opacity="${op}"/>`;
  };
  o += sil(112, "#8A3E22", 0.5);
  o += sil(146, "#5E2716", 0.72);
  for (let s = 0; s < 7; s++) {
    o += `<rect x="${-20 + s * 8}" y="${208 + s * 12}" width="${W + 40}" height="12" fill="#43200F" fill-opacity="${(0.42 + s * 0.07).toFixed(2)}"/>`;
  }
  o += `<rect x="0" y="272" width="${W}" height="18" fill="#7A3A20" fill-opacity=".6"/>`;
  for (let i = 0; i < 34; i++) {
    const x = R() * W, y = 273 + R() * 15, w = 8 + R() * 30;
    o += `<rect class="an-rip" style="animation-delay:-${(R() * 9).toFixed(2)}s;animation-duration:${(7 + R() * 6).toFixed(1)}s" x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${w.toFixed(1)}" height="1.6" rx=".8" fill="#FFD9A0" fill-opacity="${(0.15 + R() * 0.4).toFixed(2)}"/>`;
  }
  [[120, 246], [300, 258], [540, 250], [640, 262]].forEach(([x, y], k) => {
    o += `<ellipse cx="${x}" cy="${y}" rx="9" ry="3.4" fill="#2E1508" fill-opacity=".8"/>`;
    o += `<path class="an-flame" style="transform-origin:${x}px ${y - 3}px;animation-delay:-${(k * 0.43).toFixed(2)}s" d="M${x} ${y - 11} q4 5 0 8 q-4-3 0-8" fill="#FFCF7A"/>`;
    o += `<circle class="an-glow" style="animation-delay:-${(k * 0.61).toFixed(2)}s" cx="${x}" cy="${y - 7}" r="10" fill="#FFCF7A" fill-opacity=".18"/>`;
  });
  return o + `</svg>`;
}

function heroMughal(): string {
  const g = "#C9A24A";
  let o = `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">`;
  o += `<defs><linearGradient id="msky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#101736"/><stop offset="1" stop-color="#070B1B"/></linearGradient><clipPath id="arch"><path d="M110 260 L110 120 Q110 46 202 46 Q294 46 294 120 L294 260 Z"/></clipPath></defs>`;
  o += `<rect width="${W}" height="${H}" fill="url(#msky)"/>`;
  for (let i = 0; i < 90; i++) {
    o += `<circle class="an-tw" style="animation-delay:-${(R() * 5).toFixed(2)}s;animation-duration:${(3.5 + R() * 5).toFixed(1)}s" cx="${(R() * W).toFixed(1)}" cy="${(R() * 200).toFixed(1)}" r="${(R() * 1.1 + 0.3).toFixed(2)}" fill="#DCE3FF" fill-opacity="${(0.2 + R() * 0.6).toFixed(2)}"/>`;
  }
  o += `<g class="an-moon"><circle cx="556" cy="86" r="34" fill="#E9EDFB" fill-opacity=".9"/><circle cx="544" cy="78" r="30" fill="#0C1128"/></g>`;
  let jal = "";
  const u = 34;
  for (let r = 0; r < 9; r++) for (let c = 0; c < 22; c++) {
    const cx = c * u + (r % 2 ? u / 2 : 0), cy = r * u * 0.86 + 18, s = u * 0.46;
    let p = "";
    for (let k = 0; k < 8; k++) {
      const a = (k * Math.PI) / 4, rad = k % 2 ? s * 0.52 : s;
      p += `${(cx + Math.cos(a) * rad).toFixed(1)},${(cy + Math.sin(a) * rad).toFixed(1)} `;
    }
    jal += `<polygon points="${p}" fill="none" stroke="${g}" stroke-width="1"/>`;
    jal += `<circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="${(s * 0.2).toFixed(1)}" fill="${g}" fill-opacity=".5"/>`;
  }
  o += `<g class="an-jali" opacity=".2">${jal}</g>`;
  o += `<g clip-path="url(#arch)"><rect x="100" y="30" width="210" height="240" fill="#0A0F24"/><g opacity=".55">${jal}</g></g>`;
  o += `<path d="M110 260 L110 120 Q110 46 202 46 Q294 46 294 120 L294 260" fill="none" stroke="${g}" stroke-width="2.4"/>`;
  o += `<path d="M122 260 L122 124 Q122 58 202 58 Q282 58 282 124 L282 260" fill="none" stroke="${g}" stroke-width="1" stroke-opacity=".55"/>`;
  [[430, 180], [520, 190], [610, 176]].forEach(([x, y]) => {
    o += `<path d="M${x - 30} ${y} q30 -42 60 0 Z" fill="#151C3A" stroke="${g}" stroke-width="1.2" stroke-opacity=".7"/>`;
    o += `<line x1="${x}" y1="${y - 38}" x2="${x}" y2="${y - 50}" stroke="${g}" stroke-width="1.6"/>`;
    o += `<circle class="an-finial" style="animation-delay:-${(x % 7) * 0.6}s" cx="${x}" cy="${y - 52}" r="3" fill="${g}" fill-opacity=".9"/>`;
    o += `<rect x="${x - 34}" y="${y}" width="68" height="80" fill="#111834" stroke="${g}" stroke-width="1" stroke-opacity=".45"/>`;
  });
  o += `<rect x="0" y="258" width="${W}" height="32" fill="#0A0E20"/>`;
  o += `<line x1="0" y1="258" x2="${W}" y2="258" stroke="${g}" stroke-width="1" stroke-opacity=".5"/>`;
  return o + `</svg>`;
}

function heroSteel(): string {
  const u = 15, ox = 352, oy = 76, b = "#1F5FD0";
  const P = (x: number, y: number, z: number): [number, number] => [ox + (x - y) * 0.866 * u, oy + (x + y) * 0.5 * u - z * u];
  const pt = (a: [number, number][]) => a.map((p) => p.map((n) => n.toFixed(1)).join(",")).join(" ");
  let o = `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">`;
  o += `<rect width="${W}" height="${H}" fill="#EEF1F6"/>`;
  for (let i = 0; i <= 14; i++) { const a = P(i, 0, 0), z = P(i, 12, 0); o += `<line x1="${a[0].toFixed(1)}" y1="${a[1].toFixed(1)}" x2="${z[0].toFixed(1)}" y2="${z[1].toFixed(1)}" stroke="${b}" stroke-opacity=".13"/>`; }
  for (let j = 0; j <= 12; j++) { const a = P(0, j, 0), z = P(14, j, 0); o += `<line x1="${a[0].toFixed(1)}" y1="${a[1].toFixed(1)}" x2="${z[0].toFixed(1)}" y2="${z[1].toFixed(1)}" stroke="${b}" stroke-opacity=".13"/>`; }
  const B = [[1.4, 1.4, 3, 2.6, 2.4], [5.4, 0.8, 3, 2.2, 3.6], [9.8, 1.4, 2.6, 3, 1.8], [1, 7.4, 2.8, 3, 3], [9, 5.6, 3.4, 2.4, 4.4], [5, 8, 2.6, 2.6, 2.2], [10.6, 8.4, 2.2, 2.2, 3.2]];
  B.sort((a, z) => (a[0] + a[1]) - (z[0] + z[1])).forEach(([x, y, w, d, h]) => {
    o += `<polygon points="${pt([P(x, y + d, 0), P(x, y + d, h), P(x + w, y + d, h), P(x + w, y + d, 0)])}" fill="#D5DDEA" stroke="${b}" stroke-opacity=".4"/>`;
    o += `<polygon points="${pt([P(x + w, y, 0), P(x + w, y, h), P(x + w, y + d, h), P(x + w, y + d, 0)])}" fill="#C4CFE0" stroke="${b}" stroke-opacity=".4"/>`;
    o += `<polygon points="${pt([P(x, y, h), P(x + w, y, h), P(x + w, y + d, h), P(x, y + d, h)])}" fill="#E8EDF5" stroke="${b}" stroke-opacity=".55"/>`;
  });
  const rib = (p: number[][], c: string, w: number, op: number) => `<polyline points="${p.map((q) => { const s = P(q[0], q[1], 0.05); return s[0].toFixed(1) + "," + s[1].toFixed(1); }).join(" ")}" fill="none" stroke="${c}" stroke-width="${w}" stroke-opacity="${op}" stroke-linecap="round"/>`;
  o += rib([[0, 6], [14, 6]], "#A9B6CA", 11, 1);
  o += rib([[7, 0], [7, 12]], "#A9B6CA", 11, 1);
  o += rib([[0.5, 6], [7, 6], [7, 11.5]], b, 2.2, 0.9).replace('fill="none"', 'fill="none" class="an-flow" stroke-dasharray="7 7"');
  ([[7, 6, b, "OPEN 14"], [2.6, 6, "#B45309", "SLA 3"], [11, 6, "#B42318", "ESC 2"]] as [number, number, string, string][]).forEach(([x, y, c, tx]) => {
    const gp = P(x, y, 0.1), tp = P(x, y, 2.1);
    o += `<line x1="${gp[0].toFixed(1)}" y1="${gp[1].toFixed(1)}" x2="${tp[0].toFixed(1)}" y2="${tp[1].toFixed(1)}" stroke="${c}" stroke-width="1.2"/>`;
    o += `<ellipse cx="${gp[0].toFixed(1)}" cy="${gp[1].toFixed(1)}" rx="10" ry="5.6" fill="none" stroke="${c}" stroke-width="1.2" stroke-opacity=".5"/>`;
    o += `<ellipse class="an-ping" style="animation-delay:-${(x * 0.7).toFixed(2)}s" cx="${gp[0].toFixed(1)}" cy="${gp[1].toFixed(1)}" rx="16" ry="9" fill="none" stroke="${c}" stroke-width="1.4"/>`;
    o += `<circle cx="${tp[0].toFixed(1)}" cy="${tp[1].toFixed(1)}" r="3.4" fill="${c}"/>`;
    o += `<rect x="${(tp[0] - 25).toFixed(1)}" y="${(tp[1] - 22).toFixed(1)}" width="50" height="14" rx="3" fill="${c}"/>`;
    o += `<text x="${tp[0].toFixed(1)}" y="${(tp[1] - 12).toFixed(1)}" font-family="JetBrains Mono, monospace" font-size="8" fill="#fff" text-anchor="middle">${tx}</text>`;
  });
  return o + `</svg>`;
}

function heroNilgiri(): string {
  let o = `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">`;
  o += `<defs><linearGradient id="nsk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#DCE7E3"/><stop offset="1" stop-color="#F1F5F3"/></linearGradient></defs>`;
  o += `<rect width="${W}" height="${H}" fill="url(#nsk)"/>`;
  o += `<circle cx="182" cy="84" r="30" fill="#F6F2E2" fill-opacity=".9"/>`;
  const ridge = (base: number, amp: number, col: string, op: number, seed: number) => {
    let d = `M0 ${H} L0 ${base}`;
    for (let x = 0; x <= W; x += 20) { const y = base - Math.sin((x + seed) / 120) * amp - Math.sin((x + seed) / 47) * amp * 0.4; d += ` L${x} ${y.toFixed(1)}`; }
    return `<path d="${d} L${W} ${H} Z" fill="${col}" fill-opacity="${op}"/>`;
  };
  o += ridge(150, 26, "#136F63", 0.16, 0);
  o += ridge(178, 22, "#136F63", 0.24, 220);
  o += ridge(206, 18, "#136F63", 0.36, 480);
  ([[142, 16, "an-mist", 0], [176, 12, "an-mist2", -18], [204, 10, "an-mist", -44]] as [number, number, string, number][]).forEach(([y, h, cls, d]) =>
    o += `<rect class="${cls}" style="animation-delay:${d}s" x="-60" y="${y}" width="${W + 120}" height="${h}" fill="#FFFFFF" fill-opacity=".42"/>`);
  o += ridge(238, 12, "#0F5B51", 0.5, 760);
  for (let i = 0; i < 9; i++) {
    let d = `M0 ${244 + i * 6}`;
    for (let x = 0; x <= W; x += 24) { const y = 244 + i * 6 - Math.sin((x + 760) / 140) * (10 - i) * 0.7; d += ` L${x} ${y.toFixed(1)}`; }
    o += `<path d="${d}" fill="none" stroke="#EFF4F2" stroke-opacity=".3" stroke-width="1.2"/>`;
  }
  for (let i = 0; i < 120; i++) { const x = R() * W, y = 246 + R() * 42; o += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${(2 + R() * 2.4).toFixed(1)}" fill="#0B4A42" fill-opacity="${(0.1 + R() * 0.22).toFixed(2)}"/>`; }
  ([[598, 236, 52], [634, 244, 40], [560, 242, 44]] as [number, number, number][]).forEach(([x, y, h], i) => {
    o += `<g class="an-sway" style="animation-delay:-${(i * 5.3).toFixed(1)}s;transform-origin:${x}px ${y}px">`;
    o += `<line x1="${x}" y1="${y}" x2="${x}" y2="${y - h}" stroke="#123F39" stroke-opacity=".55" stroke-width="2"/>`;
    for (let k = 0; k < 5; k++) o += `<ellipse cx="${x}" cy="${y - h + 8 + k * 7}" rx="${13 - k * 1.6}" ry="5" fill="#134F46" fill-opacity=".4"/>`;
    o += `</g>`;
  });
  return o + `</svg>`;
}

const SCENES: Record<string, () => string> = {
  "bharat-dawn": heroDawn,
  "mughal-indigo": heroMughal,
  "civic-steel": heroSteel,
  "nilgiri-mist": heroNilgiri,
};

/** SVG hero scene string for a theme (falls back to Bharat Dawn). */
export function heroFor(theme: string): string {
  return (SCENES[theme] ?? heroDawn)();
}
