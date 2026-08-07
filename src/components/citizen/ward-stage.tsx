"use client";

import { useCallback, useEffect, useRef } from "react";
import type * as THREE from "three";
import type { ExplorerWard } from "@/lib/ward-explorer";

export type HeightBy = "open" | "breach" | "med";
export type ColourBy = "sla" | "med" | "open";

/**
 * The 24-ward block: one prism per ward, height and colour bound to separate
 * measures so the two questions stay legible apart.
 *
 * Flat isometric shading to match the SVG pages — no lights, no shadows. Each
 * face takes one baked tone from a fixed world light, so faces stay flat as the
 * camera orbits: the look of the 2D illustrations rather than a rendered scene.
 * BoxGeometry face order is +x, -x, +y, -y, +z, -z.
 */
const FACE = [0.72, 0.55, 1.0, 0.4, 0.87, 0.5];
const COLS = 6,
  ROWS = 4,
  PITCH = 1.0,
  SIZE = 0.86,
  OUT = 0.032; // world-space outline thickness

const metric = (w: ExplorerWard, k: HeightBy | ColourBy) =>
  k === "open" ? w.open : k === "breach" ? Math.round(w.open * (1 - w.sla / 100)) : w.med;

export function WardStage({
  wards,
  heightBy,
  colourBy,
  selected,
  onSelect,
}: {
  wards: ExplorerWard[];
  heightBy: HeightBy;
  colourBy: ColourBy;
  selected: string;
  onSelect: (id: string) => void;
}) {
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hudRef = useRef<HTMLDivElement>(null);

  // The scene is imperative; React only hands it new intent through these.
  const api = useRef<{
    setConfig: (h: HeightBy, c: ColourBy) => void;
    select: (id: string) => void;
    reset: () => void;
    applyTheme: () => void;
  } | null>(null);
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;

  useEffect(() => {
    let disposed = false;
    let raf = 0;
    const cleanups: (() => void)[] = [];

    (async () => {
      const T = await import("three");
      const stage = stageRef.current;
      const canvas = canvasRef.current;
      const hud = hudRef.current;
      if (disposed || !stage || !canvas || !hud) return;

      let HEIGHT_BY: HeightBy = heightBy;
      let COLOUR_BY: ColourBy = colourBy;
      let sel = selected;

      const span01 = (w: ExplorerWard, k: HeightBy | ColourBy) => {
        const v = wards.map((x) => metric(x, k)),
          lo = Math.min(...v),
          hi = Math.max(...v);
        return (metric(w, k) - lo) / (hi - lo || 1);
      };
      const slaBad = (w: ExplorerWard) => {
        const v = wards.map((x) => x.sla),
          lo = Math.min(...v),
          hi = Math.max(...v);
        return 1 - (w.sla - lo) / (hi - lo || 1);
      };
      const colourT = (w: ExplorerWard) =>
        COLOUR_BY === "sla" ? slaBad(w) : span01(w, COLOUR_BY);

      const cssVar = (n: string) =>
        getComputedStyle(document.documentElement).getPropertyValue(n).trim();
      let PAL: Record<string, THREE.Color> = {};
      const readPalette = () => {
        const c = (n: string) => new T.Color(cssVar(n) || "#888");
        PAL = {
          ok: c("--ok"),
          warn: c("--warn"),
          danger: c("--danger"),
          ground: c("--hground"),
          line: c("--hline"),
          brand: c("--brand"),
          ink: c("--ink"),
          surface: c("--surface"),
        };
      };
      const rampColour = (t: number) => {
        const m = (a: THREE.Color, b: THREE.Color, k: number) => a.clone().lerp(b, k);
        if (t < 0.2) return m(PAL.ground, PAL.ok, 0.8);
        if (t < 0.4) return m(PAL.ground, PAL.ok, 0.45);
        if (t < 0.6) return m(PAL.ground, PAL.warn, 0.5);
        if (t < 0.8) return m(PAL.ground, PAL.warn, 0.85);
        return PAL.danger.clone();
      };
      const shade = (base: THREE.Color, k: number) => base.clone().multiplyScalar(k);

      readPalette();
      const renderer = new T.WebGLRenderer({ canvas, antialias: true, alpha: true });
      renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
      const scene = new T.Scene();
      const camera = new T.OrthographicCamera(-1, 1, 1, -1, 0.1, 200);
      let azim = Math.PI * 0.25,
        polar = 0.92,
        zoom = 1,
        idle = true;
      const dist = 26;

      const root = new T.Group();
      scene.add(root);
      const mkFaces = (base: THREE.Color) =>
        FACE.map((k) => new T.MeshBasicMaterial({ color: shade(base, k) }));

      /* slab */
      const slabGeo = new T.BoxGeometry(COLS * PITCH + 0.5, 0.42, ROWS * PITCH + 0.5);
      const slabMats = mkFaces(PAL.ground);
      const slabHullMat = new T.MeshBasicMaterial({ color: PAL.line, side: T.BackSide });
      const slabHull = new T.Mesh(slabGeo, slabHullMat);
      slabHull.position.y = -0.21;
      slabHull.scale.set(
        1 + 0.064 / (COLS * PITCH + 0.5),
        1 + 0.064 / 0.42,
        1 + 0.064 / (ROWS * PITCH + 0.5),
      );
      root.add(slabHull);
      const slab = new T.Mesh(slabGeo, slabMats);
      slab.position.y = -0.21;
      root.add(slab);
      const slabEdge = new T.LineSegments(
        new T.EdgesGeometry(slabGeo),
        new T.LineBasicMaterial({ color: PAL.line }),
      );
      slabEdge.position.copy(slab.position);
      root.add(slabEdge);

      /* prisms */
      const geo = new T.BoxGeometry(SIZE, 1, SIZE),
        edgeGeo = new T.EdgesGeometry(geo);
      const cells = wards.map((w, i) => {
        const c = i % COLS,
          r = (i / COLS) | 0;
        const g = new T.Group();
        g.position.set((c - (COLS - 1) / 2) * PITCH, 0, (r - (ROWS - 1) / 2) * PITCH);
        const mats = mkFaces(new T.Color(0xffffff));
        const mesh = new T.Mesh(geo, mats);
        const hullMat = new T.MeshBasicMaterial({ color: PAL.line, side: T.BackSide });
        const hull = new T.Mesh(geo, hullMat);
        const edge = new T.LineSegments(edgeGeo, new T.LineBasicMaterial({ color: PAL.line }));
        g.add(hull);
        g.add(mesh);
        g.add(edge);
        root.add(g);
        return {
          w,
          g,
          mesh,
          hull,
          hullMat,
          edge,
          mats,
          h: 1,
          grow: 0,
          delay: (c + r) * 0.055,
          base: new T.Color(),
        };
      });

      const mineIdx = wards.findIndex((w) => w.mine);
      const dot = new T.Mesh(
        new T.SphereGeometry(0.13, 18, 14),
        new T.MeshBasicMaterial({ color: PAL.brand }),
      );
      root.add(dot);

      type Cell = (typeof cells)[number];
      const paintWard = (o: Cell) => {
        const lift = o.w.id === sel ? 0.04 : 0; // selected reads brighter, not glowing
        const c = o.base.clone().lerp(new T.Color(0xffffff), lift);
        o.mats.forEach((m, i) => m.color.copy(shade(c, FACE[i])));
      };
      const applyData = () => {
        const v = wards.map((x) => metric(x, HEIGHT_BY)),
          lo = Math.min(...v),
          hi = Math.max(...v);
        cells.forEach((o) => {
          o.h = 0.35 + ((metric(o.w, HEIGHT_BY) - lo) / (hi - lo || 1)) * 3.4;
          o.base.copy(rampColour(colourT(o.w)));
          paintWard(o);
          o.edge.material.color.copy(o.w.id === sel ? PAL.ink : PAL.line);
          o.hullMat.color.copy(o.w.id === sel ? PAL.ink : PAL.line);
        });
        slabHullMat.color.copy(PAL.line);
        slabMats.forEach((m, i) => m.color.copy(shade(PAL.ground, FACE[i])));
        slabEdge.material.color.copy(PAL.line);
        dot.material.color.copy(PAL.brand);
      };
      applyData();

      /* ---------- camera ---------- */
      let rect = canvas.getBoundingClientRect();
      const place = () => {
        const w = stage.clientWidth,
          h = stage.clientHeight;
        renderer.setSize(w, h, false);
        const a = w / h;
        const needW = 4.62,
          needH = 4.05;
        const s = Math.max(needH, needW / a) / zoom;
        camera.left = -s * a;
        camera.right = s * a;
        camera.top = s;
        camera.bottom = -s;
        camera.updateProjectionMatrix();
        camera.position.set(
          dist * Math.sin(polar) * Math.cos(azim),
          dist * Math.cos(polar),
          dist * Math.sin(polar) * Math.sin(azim),
        );
        camera.lookAt(0, 1.72, 0);
      };
      const measure = () => {
        rect = canvas.getBoundingClientRect();
        place();
      };
      const onScroll = () => {
        rect = canvas.getBoundingClientRect();
      };
      addEventListener("resize", measure);
      addEventListener("scroll", onScroll, { passive: true });
      cleanups.push(() => removeEventListener("resize", measure));
      cleanups.push(() => removeEventListener("scroll", onScroll));

      /* ---------- drag to orbit ---------- */
      const ray = new T.Raycaster(),
        ndc = new T.Vector2();
      const pick = (cx: number, cy: number) => {
        const r = canvas.getBoundingClientRect();
        ndc.x = ((cx - r.left) / r.width) * 2 - 1;
        ndc.y = -((cy - r.top) / r.height) * 2 + 1;
        ray.setFromCamera(ndc, camera);
        const hit = ray.intersectObjects(
          cells.map((o) => o.mesh),
          false,
        )[0];
        if (hit) {
          const o = cells.find((o) => o.mesh === hit.object);
          if (o) onSelectRef.current(o.w.id);
        }
      };

      let drag = false,
        moved = 0,
        lx = 0,
        ly = 0;
      const dn = (e: MouseEvent | TouchEvent) => {
        drag = true;
        moved = 0;
        idle = false;
        const p = "touches" in e ? e.touches[0] : e;
        lx = p.clientX;
        ly = p.clientY;
      };
      const mv = (e: MouseEvent | TouchEvent) => {
        if (!drag) return;
        const p = "touches" in e ? e.touches[0] : e;
        const dx = p.clientX - lx,
          dy = p.clientY - ly;
        lx = p.clientX;
        ly = p.clientY;
        moved += Math.abs(dx) + Math.abs(dy);
        azim += dx * 0.008; // drag right -> block turns right
        polar = Math.max(0.3, Math.min(1.32, polar - dy * 0.006));
        if (e.cancelable) e.preventDefault();
      };
      const up = (e: MouseEvent | TouchEvent) => {
        if (!drag) return;
        drag = false;
        if (moved < 7) {
          const p = "changedTouches" in e ? e.changedTouches[0] : e;
          pick(p.clientX, p.clientY);
        }
      };
      const wheel = (e: WheelEvent) => {
        zoom = Math.max(0.62, Math.min(2.1, zoom - e.deltaY * 0.0012));
        e.preventDefault();
      };
      canvas.addEventListener("mousedown", dn);
      canvas.addEventListener("touchstart", dn, { passive: true });
      addEventListener("mousemove", mv);
      canvas.addEventListener("touchmove", mv, { passive: false });
      addEventListener("mouseup", up);
      canvas.addEventListener("touchend", up);
      canvas.addEventListener("wheel", wheel, { passive: false });
      cleanups.push(() => {
        canvas.removeEventListener("mousedown", dn);
        canvas.removeEventListener("touchstart", dn);
        removeEventListener("mousemove", mv);
        canvas.removeEventListener("touchmove", mv);
        removeEventListener("mouseup", up);
        canvas.removeEventListener("touchend", up);
        canvas.removeEventListener("wheel", wheel);
      });

      /* ---------- label ----------
         Always on while a ward is selected. Orthographic projection puts z
         outside [-1,1], so a visibility test on it would hide the label
         mid-rotation. Text is written only when the selection changes;
         position is rounded and clamped so it cannot jitter or leave the
         stage. ---------- */
      const v3 = new T.Vector3();
      let hudText = "";
      const drawHud = () => {
        const o = cells.find((o) => o.w.id === sel);
        if (!o) {
          hud.style.opacity = "0";
          return;
        }
        const label = "Ward " + o.w.name;
        if (label !== hudText) {
          hud.textContent = label;
          hudText = label;
        }
        v3.set(0, o.h * o.grow + 0.46, 0).applyMatrix4(o.g.matrixWorld).project(camera);
        const w = rect.width || stage.clientWidth,
          h = rect.height || stage.clientHeight;
        const pad = 56;
        const x = Math.round(Math.max(pad, Math.min(w - pad, ((v3.x + 1) / 2) * w)));
        const y = Math.round(Math.max(30, Math.min(h - 24, ((-v3.y + 1) / 2) * h)));
        hud.style.transform = `translate3d(${x}px,${y}px,0) translate(-50%,-100%)`;
        hud.style.opacity = "1";
      };

      /* ---------- loop ---------- */
      const START = performance.now();
      let t0 = START;
      const frame = (now: number) => {
        const dt = Math.min(0.05, (now - t0) / 1000);
        t0 = now;
        const el = (now - START) / 1000;
        cells.forEach((o) => {
          const p = Math.max(0, Math.min(1, (el - 0.35 - o.delay) / 0.55));
          o.grow += ((p < 1 ? 1 - Math.pow(1 - p, 3) : 1) - o.grow) * 0.35;
          const lift = o.w.id === sel ? 0.34 : 0;
          const sy = Math.max(0.001, o.h * o.grow);
          o.mesh.scale.y = sy;
          o.mesh.position.y = sy / 2 + lift;
          o.edge.scale.y = sy;
          o.edge.position.y = o.mesh.position.y;
          const ow = o.w.id === sel ? OUT * 1.9 : OUT; // selection reads as a heavier stroke
          o.hull.scale.set((SIZE + 2 * ow) / SIZE, sy + 2 * ow, (SIZE + 2 * ow) / SIZE);
          o.hull.position.y = o.mesh.position.y;
        });
        if (mineIdx >= 0) {
          const m = cells[mineIdx];
          dot.position.set(
            m.g.position.x,
            m.h * m.grow + (m.w.id === sel ? 0.34 : 0) + 0.24,
            m.g.position.z,
          );
        }
        if (idle) azim += dt * 0.055;
        place();
        drawHud();
        renderer.render(scene, camera);
        raf = requestAnimationFrame(frame);
      };
      measure();
      raf = requestAnimationFrame(frame);

      api.current = {
        setConfig: (h, c) => {
          HEIGHT_BY = h;
          COLOUR_BY = c;
          applyData();
        },
        select: (id) => {
          sel = id;
          idle = false;
          cells.forEach((o) => {
            paintWard(o);
            o.edge.material.color.copy(o.w.id === sel ? PAL.ink : PAL.line);
            o.hullMat.color.copy(o.w.id === sel ? PAL.ink : PAL.line);
          });
        },
        reset: () => {
          azim = Math.PI * 0.25;
          polar = 0.92;
          zoom = 1;
          idle = false;
        },
        applyTheme: () => {
          readPalette();
          applyData();
        },
      };

      // Repaint from CSS variables whenever the theme or mode flips.
      const mo = new MutationObserver(() => api.current?.applyTheme());
      mo.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ["data-theme", "data-mode"],
      });
      cleanups.push(() => mo.disconnect());

      cleanups.push(() => {
        renderer.dispose();
        geo.dispose();
        edgeGeo.dispose();
        slabGeo.dispose();
      });
    })();

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      cleanups.forEach((fn) => fn());
      api.current = null;
    };
    // The scene is built once for a given ward set; later intent flows
    // through `api` rather than a rebuild.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wards]);

  useEffect(() => {
    api.current?.setConfig(heightBy, colourBy);
  }, [heightBy, colourBy]);
  useEffect(() => {
    api.current?.select(selected);
  }, [selected]);

  const touch = useCallback(() => {
    stageRef.current?.classList.add("touched");
  }, []);

  return (
    <div className="stage3d" ref={stageRef} onPointerDown={touch}>
      <canvas ref={canvasRef} />
      <div className="hudwrap">
        <div className="hud" ref={hudRef} />
      </div>
      <div className="stagetools">
        <button
          className="tbtn"
          onClick={() => api.current?.reset()}
          aria-label="Reset the view"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 12a8 8 0 1 1-2.6-5.9" />
            <path d="M20 4v5h-5" />
          </svg>
        </button>
      </div>
      <div className="dragHint">Drag to rotate · tap a ward</div>
      <div className="fade" />
    </div>
  );
}
