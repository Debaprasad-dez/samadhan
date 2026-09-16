"use client";

import { useEffect } from "react";

/**
 * Scroll choreography for citizen pages.
 *
 * Content is visible from the first paint. Only a block that is still below
 * the fold when the page mounts is held back, and it rises in as it scrolls
 * into view — hiding something nobody can see yet costs nothing.
 *
 * Pages stream their data in after the static shell, so a one-time scan at
 * mount would leave any late block invisible. A MutationObserver adopts blocks,
 * SLA bars and heat cells as they arrive.
 */
export function HomeReveal() {
  useEffect(() => {
    const root = document.querySelector<HTMLElement>(".chome");
    if (!root) return;
    // The entrance already played this session: show everything as it lands.
    const settled = document.documentElement.hasAttribute("data-settled");

    /** Grow bars from their data-w and pop heat cells, once each. */
    const fill = (scope: ParentNode) => {
      scope.querySelectorAll<HTMLElement>(".trk i[data-w]").forEach((bar, i) => {
        if (bar.dataset.filled) return;
        bar.dataset.filled = "1";
        setTimeout(() => {
          bar.style.width = `${bar.dataset.w}%`;
        }, 240 + i * 130);
      });
      scope.querySelectorAll(".heat i:not(.in)").forEach((c) => c.classList.add("in"));
    };

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          const el = e.target as HTMLElement;
          el.style.animationDelay = `${(Number(el.dataset.d) || 0) * 0.09}s`;
          el.classList.remove("pending");
          el.classList.add("in");
          fill(el);
          io.unobserve(el);
        });
      },
      { threshold: 0.18, rootMargin: "0px 0px -6% 0px" },
    );

    const adopt = (el: HTMLElement) => {
      if (el.dataset.adopted) return;
      el.dataset.adopted = "1";
      const belowFold = el.getBoundingClientRect().top > window.innerHeight;
      if (belowFold && !settled) {
        el.classList.add("pending");
        io.observe(el);
      } else {
        fill(el);
      }
    };

    const scan = (node: HTMLElement) => {
      if (node.matches(".reveal")) adopt(node);
      node.querySelectorAll<HTMLElement>(".reveal").forEach(adopt);
      // Bars or cells streamed into a block that is already on screen.
      if (node.closest(".reveal:not(.pending)")) fill(node);
    };

    scan(root);
    const mo = new MutationObserver((mutations) => {
      for (const m of mutations) {
        m.addedNodes.forEach((n) => {
          if (n instanceof HTMLElement) scan(n);
        });
      }
    });
    mo.observe(root, { childList: true, subtree: true });

    return () => {
      io.disconnect();
      mo.disconnect();
    };
  }, []);

  return null;
}
