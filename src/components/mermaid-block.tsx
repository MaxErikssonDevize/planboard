"use client";

import { useEffect, useRef, useState } from "react";

export function MermaidBlock({ code }: { code: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [svg, setSvg] = useState("");

  useEffect(() => {
    let cancelled = false;
    import("mermaid").then((mod) => {
      const mermaid = mod.default;
      mermaid.initialize({
        startOnLoad: false,
        theme: "neutral",
        fontFamily: "Inter, system-ui, sans-serif",
      });
      const id = `mermaid-${Math.random().toString(36).slice(2, 9)}`;
      mermaid.render(id, code).then(({ svg: rendered }) => {
        if (!cancelled) setSvg(rendered);
      }).catch(() => {
        if (!cancelled) setSvg("");
      });
    });
    return () => { cancelled = true; };
  }, [code]);

  if (!svg) {
    return (
      <pre className="rounded-xl border p-4 text-sm" style={{ borderColor: "var(--border)" }}>
        <code>{code}</code>
      </pre>
    );
  }

  return (
    <div
      ref={ref}
      className="my-4 overflow-x-auto"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
