"use client";

import { useEffect, useId, useState } from "react";

let mermaidInitialized = false;

export function MermaidBlock({ code }: { code: string }) {
  const [svg, setSvg] = useState("");
  const uniqueId = useId().replace(/:/g, "m");

  useEffect(() => {
    let cancelled = false;

    import("mermaid").then(async (mod) => {
      const mermaid = mod.default;

      if (!mermaidInitialized) {
        mermaid.initialize({
          startOnLoad: false,
          theme: "neutral",
          fontFamily: "Inter, system-ui, sans-serif",
          suppressErrorRendering: true,
        });
        mermaidInitialized = true;
      }

      // Remove any stale element from a previous render
      const stale = document.getElementById(uniqueId);
      if (stale) stale.remove();

      try {
        const { svg: rendered } = await mermaid.render(uniqueId, code);
        if (!cancelled) setSvg(rendered);
      } catch {
        if (!cancelled) setSvg("");
      }
    });

    return () => {
      cancelled = true;
    };
  }, [code, uniqueId]);

  if (!svg) {
    return (
      <pre
        className="rounded-xl border p-4 text-sm"
        style={{ borderColor: "var(--border)" }}
      >
        <code>{code}</code>
      </pre>
    );
  }

  return (
    <div
      className="my-4 overflow-x-auto"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
