"use client";

import { useTheme } from "next-themes";
import { useEffect } from "react";

/**
 * Renders the `[data-mermaid]` placeholders left by `rehypeMermaid`. Mermaid is
 * only downloaded on posts that have a diagram, and re-renders on theme change.
 */
export function MermaidDiagrams({ containerId }: { containerId: string }) {
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    const container = document.getElementById(containerId);
    const nodes = container?.querySelectorAll<HTMLElement>("[data-mermaid]");
    if (!nodes?.length || !resolvedTheme) return;

    let cancelled = false;
    (async () => {
      const { default: mermaid } = await import("mermaid");
      mermaid.initialize({
        startOnLoad: false,
        theme: resolvedTheme === "dark" ? "dark" : "neutral",
        fontFamily: "inherit",
      });
      for (const [i, node] of nodes.entries()) {
        const source = node.dataset.mermaid ?? "";
        try {
          const { svg } = await mermaid.render(`mermaid-${i}`, source);
          if (cancelled) return;
          node.innerHTML = svg;
        } catch (error) {
          console.error("Mermaid failed to render a diagram", error);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [containerId, resolvedTheme]);

  return null;
}
