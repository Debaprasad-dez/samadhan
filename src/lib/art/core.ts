// Art core helpers — ported from design-handoff/lib/art-core.js.
// Framework-agnostic (pure DOM/SVG); used via useEffect in React components.

export const NS = "http://www.w3.org/2000/svg";
export const ART_W = 390;
export const ART_H = 478;

export function svgEl(
  tag: string,
  attrs: Record<string, string | number>,
): Element {
  const e = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, String(v));
  return e;
}

export function seededRng(seed: number) {
  let s = (seed >>> 0) || 1;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

export function layer(scene: Element, depth: number): Element {
  const g = svgEl("g", { class: "layer" });
  (g as SVGElement & { dataset: DOMStringMap }).dataset.depth = String(depth);
  scene.appendChild(g);
  return g;
}

export function marigold(
  x: number,
  y: number,
  R: number,
  white: boolean,
): string {
  const c1 = white ? "#E7D8C0" : "#C8501E";
  const c2 = white ? "#F3ECDD" : "#E0782A";
  const c3 = white ? "#FBF6EC" : "#F2A640";
  const i = (x * 7) % 5;
  let m = `<g class="bloom" style="--i:${i}">`;
  m += `<ellipse cx="${x}" cy="${y + R * 0.8}" rx="${R * 0.9}" ry="${R * 0.4}" fill="#3A2410" opacity=".10"/>`;
  for (const [rr, col, n] of [
    [R, c1, 16],
    [R * 0.74, c2, 13],
    [R * 0.5, c3, 10],
  ] as [number, string, number][]) {
    for (let j = 0; j < n; j++) {
      const a = (j / n) * Math.PI * 2 + rr * 0.3;
      const px = x + Math.cos(a) * rr * 0.62;
      const py = y + Math.sin(a) * rr * 0.62;
      m += `<ellipse cx="${px}" cy="${py}" rx="${rr * 0.34}" ry="${rr * 0.26}" fill="${col}" transform="rotate(${a * 57.3} ${px} ${py})"/>`;
    }
  }
  m += `<circle cx="${x}" cy="${y}" r="${R * 0.28}" fill="${white ? "#E9C56A" : "#F4B747"}"/>`;
  m += `<circle cx="${x}" cy="${y}" r="${R * 0.16}" fill="${white ? "#D9A23B" : "#C8501E"}" opacity=".8"/></g>`;
  return m;
}

export function leaf(x: number, y: number): string {
  const i = (x * 3) % 5;
  return `<g class="bloom" style="--i:${i}">
  <path d="M${x} ${y - 2} q-9 6 -7 16 q9 -2 7 -16Z" fill="#5C8C3F"/>
  <path d="M${x} ${y - 2} q9 6 7 16 q-9 -2 -7 -16Z" fill="#4F7A36"/>
  <path d="M${x} ${y - 2} q-2 9 0 18" stroke="#3C5E29" stroke-width="0.8" fill="none" opacity=".6"/></g>`;
}

export function figure(
  x: number,
  y: number,
  col: string,
  sc: number = 1,
): string {
  return `<g opacity=".88">
  <ellipse cx="${x}" cy="${y - 1}" rx="${2.2 * sc}" ry="${sc}" fill="#3A2410" opacity=".2"/>
  <circle cx="${x}" cy="${y - 12 * sc}" r="${1.9 * sc}" fill="${col}"/>
  <path d="M${x - 2.4 * sc} ${y} q0 -8 ${2.4 * sc} -10 q${2.4 * sc} 2 ${2.4 * sc} 10 Z" fill="${col}"/></g>`;
}

export function sunRays(size: number, color: string, op: number): string {
  const cx = size / 2;
  const cy = size * 0.74;
  const n = 11;
  let p = "";
  for (let i = 0; i < n; i++) {
    const a = (-90 + (i - (n - 1) / 2) * 15) * (Math.PI / 180);
    p += `<line x1="${cx}" y1="${cy}" x2="${cx + Math.cos(a) * size * 0.66}" y2="${cy + Math.sin(a) * size * 0.66}" stroke="${color}" stroke-opacity="${op}" stroke-width="1.4" stroke-linecap="round"/>`;
  }
  p += `<path d="M${cx - size * 0.19} ${cy} a${size * 0.19} ${size * 0.19} 0 0 1 ${size * 0.38} 0Z" fill="${color}" fill-opacity="${op * 1.4}"/>`;
  p += `<line x1="${cx - size * 0.4}" y1="${cy}" x2="${cx + size * 0.4}" y2="${cy}" stroke="${color}" stroke-opacity="${op * 1.4}" stroke-width="1.4" stroke-linecap="round"/>`;
  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">${p}</svg>`;
}

export function lotusMandala(size: number, color: string, op: number): string {
  const c = size / 2;
  const R = size * 0.46;
  const n = 8;
  let p = "";
  for (let i = 0; i < n; i++)
    p += `<path d="M${c} ${c} q ${R * 0.2} -${R * 0.55} 0 -${R} q -${R * 0.2} ${R * 0.55} 0 ${R}Z" transform="rotate(${(i * 360) / n} ${c} ${c})" fill="none" stroke="${color}" stroke-opacity="${op}" stroke-width="1.2"/>`;
  for (let i = 0; i < n; i++)
    p += `<path d="M${c} ${c} q ${R * 0.16} -${R * 0.4} 0 -${R * 0.7} q -${R * 0.16} ${R * 0.4} 0 ${R * 0.7}Z" transform="rotate(${(i * 360) / n + 22.5} ${c} ${c})" fill="${color}" fill-opacity="${op * 0.7}"/>`;
  p += `<circle cx="${c}" cy="${c}" r="${R * 0.15}" fill="${color}" fill-opacity="${op}"/>`;
  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">${p}</svg>`;
}

export function setupMotion(
  scene: Element,
  heroEl: HTMLElement,
  scrollEl: HTMLElement | null,
): () => void {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce) return () => {};

  const layers = [...scene.querySelectorAll(".layer")] as SVGElement[];
  const rays = scene.querySelector("#rays") as SVGElement | null;
  const ripples = scene.querySelector("#ripples") as SVGElement | null;
  const sunC = scene.querySelector("#sunCenter");
  let cx = 302,
    cy = 238;
  if (sunC) {
    cx = +(sunC.getAttribute("data-x") ?? 302);
    cy = +(sunC.getAttribute("data-y") ?? 238);
  }

  if (rays)
    requestAnimationFrame(() => {
      rays.style.transition = "opacity 1.6s ease";
      rays.style.opacity = "1";
    });

  const t0 = performance.now();
  let ambientId = 0;
  function ambient(now: number) {
    const t = (now - t0) / 1000;
    if (rays) rays.setAttribute("transform", `rotate(${(t * 1.1) % 360} ${cx} ${cy})`);
    if (ripples) ripples.setAttribute("transform", `translate(${Math.sin(t * 0.6) * 2},0)`);
    ambientId = requestAnimationFrame(ambient);
  }
  ambientId = requestAnimationFrame(ambient);

  let px = 0, py = 0, tx = 0, ty = 0;
  let parallaxId = 0;

  function onMove(e: PointerEvent) {
    const r = heroEl.getBoundingClientRect();
    tx = ((e.clientX - r.left) / r.width - 0.5) * 2;
    ty = ((e.clientY - r.top) / r.height - 0.5) * 2;
  }
  function onLeave() { tx = 0; ty = 0; }
  function onScroll(e: Event) {
    const el = e.target as HTMLElement;
    layers.forEach((L) => {
      const d = parseFloat(L.dataset.depth ?? "0");
      const curX = parseFloat(L.style.transform.match(/translateX\(([^p]+)/)?.[1] ?? "0");
      L.style.transform = `translate3d(${curX.toFixed(2)}px,${(-el.scrollTop * d * 0.5).toFixed(2)}px,0)`;
    });
  }

  heroEl.addEventListener("pointermove", onMove);
  heroEl.addEventListener("pointerleave", onLeave);
  if (scrollEl) scrollEl.addEventListener("scroll", onScroll, { passive: true });

  function parax() {
    px += (tx - px) * 0.06;
    py += (ty - py) * 0.06;
    layers.forEach((L) => {
      const d = parseFloat(L.dataset.depth ?? "0");
      L.style.transform = `translate3d(${(px * d * 16).toFixed(2)}px,${(py * d * 10).toFixed(2)}px,0)`;
    });
    parallaxId = requestAnimationFrame(parax);
  }
  parallaxId = requestAnimationFrame(parax);

  const grain = document.querySelector(".art-grain") as HTMLElement | null;
  let grainTimer = 0;
  if (grain) {
    const ax = [0, 17, 34, 8, 23, 40];
    const ay = [0, 29, 9, 40, 17, 30];
    let gi = 0;
    grainTimer = window.setInterval(() => {
      gi = (gi + 1) % 6;
      grain.style.backgroundPosition = `${ax[gi]}px ${ay[gi]}px`;
    }, 90);
  }

  return () => {
    cancelAnimationFrame(ambientId);
    cancelAnimationFrame(parallaxId);
    clearInterval(grainTimer);
    heroEl.removeEventListener("pointermove", onMove);
    heroEl.removeEventListener("pointerleave", onLeave);
    if (scrollEl) scrollEl.removeEventListener("scroll", onScroll);
  };
}
