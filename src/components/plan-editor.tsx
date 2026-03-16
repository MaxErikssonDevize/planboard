"use client";

import { useState } from "react";
import { MarkdownRenderer } from "./markdown-renderer";

interface PlanEditorProps {
  initialContent: string;
  onSave: (content: string) => Promise<void>;
  saving?: boolean;
}

export function PlanEditor({ initialContent, onSave, saving }: PlanEditorProps) {
  const [content, setContent] = useState(initialContent);
  const [tab, setTab] = useState<"edit" | "preview">("edit");

  return (
    <div className="flex flex-col gap-4">
      {/* Tab bar for mobile, always visible */}
      <div
        className="flex gap-1 rounded-lg p-1 md:hidden"
        style={{ background: "var(--bg-elevated)" }}
      >
        <button
          onClick={() => setTab("edit")}
          className="flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors"
          style={{
            background: tab === "edit" ? "var(--bg-card)" : "transparent",
            color: tab === "edit" ? "var(--fg)" : "var(--fg-muted)",
            boxShadow: tab === "edit" ? "var(--shadow-card)" : "none",
          }}
        >
          Redigera
        </button>
        <button
          onClick={() => setTab("preview")}
          className="flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors"
          style={{
            background: tab === "preview" ? "var(--bg-card)" : "transparent",
            color: tab === "preview" ? "var(--fg)" : "var(--fg-muted)",
            boxShadow: tab === "preview" ? "var(--shadow-card)" : "none",
          }}
        >
          Förhandsvisning
        </button>
      </div>

      <div className="grid min-h-[65vh] gap-5 md:grid-cols-2">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className={`resize-none rounded-xl border p-5 font-mono text-sm leading-relaxed outline-none focus:ring-2 ${
            tab === "preview" ? "hidden md:block" : ""
          }`}
          style={{
            background: "var(--bg-card)",
            borderColor: "var(--border)",
            color: "var(--fg)",
            // @ts-expect-error css custom property
            "--tw-ring-color": "var(--accent)",
          }}
          spellCheck={false}
          placeholder="Skriv markdown här..."
        />
        <div
          className={`overflow-auto rounded-xl border p-5 ${
            tab === "edit" ? "hidden md:block" : ""
          }`}
          style={{
            background: "var(--bg-card)",
            borderColor: "var(--border)",
          }}
        >
          {content ? (
            <MarkdownRenderer content={content} />
          ) : (
            <p className="text-sm italic" style={{ color: "var(--fg-muted)" }}>
              Förhandsvisning visas här...
            </p>
          )}
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={() => onSave(content)}
          disabled={saving}
          className="rounded-lg px-6 py-2.5 text-sm font-semibold text-white transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40"
          style={{ background: "var(--accent)" }}
        >
          {saving ? "Sparar..." : "Spara plan"}
        </button>
      </div>
    </div>
  );
}
