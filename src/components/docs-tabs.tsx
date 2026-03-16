"use client";

import { useState } from "react";

interface Tab {
  id: string;
  label: string;
  content: React.ReactNode;
}

export function DocsTabs({ tabs }: { tabs: Tab[] }) {
  const [active, setActive] = useState(tabs[0].id);
  const current = tabs.find((t) => t.id === active)!;

  return (
    <div>
      <div
        className="mb-5 flex gap-1 overflow-x-auto rounded-lg p-1"
        style={{ background: "var(--bg-elevated)" }}
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActive(tab.id)}
            className="shrink-0 rounded-md px-3.5 py-1.5 text-sm font-medium transition-all"
            style={{
              background: active === tab.id ? "var(--bg-card)" : "transparent",
              color: active === tab.id ? "var(--fg)" : "var(--fg-muted)",
              boxShadow: active === tab.id ? "var(--shadow-card)" : "none",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div>{current.content}</div>
    </div>
  );
}
