"use client";

import { useState } from "react";
import Link from "next/link";
import { MarkdownRenderer } from "./markdown-renderer";
import type { Finding, FindingStatus, FindingPriority, Profile } from "@/lib/types";

const statusLabels: Record<FindingStatus, string> = {
  draft: "Utkast",
  open: "Öppen",
  in_progress: "Pågår",
  resolved: "Löst",
  dismissed: "Avfärdad",
};

const statusColors: Record<FindingStatus, string> = {
  draft: "#9ca3af",
  open: "#3b82f6",
  in_progress: "#f59e0b",
  resolved: "#22c55e",
  dismissed: "#6b7280",
};

const priorityLabels: Record<FindingPriority, string> = {
  low: "Låg",
  medium: "Medium",
  high: "Hög",
  critical: "Kritisk",
};

const priorityColors: Record<FindingPriority, string> = {
  low: "#9ca3af",
  medium: "#3b82f6",
  high: "#f59e0b",
  critical: "#ef4444",
};

function DescriptionBlock({ description }: { description: string }) {
  const [expanded, setExpanded] = useState(false);
  const isLong = description.length > 200 || description.split("\n").length > 4;

  return (
    <div className="mb-3">
      <div
        className={`overflow-hidden text-xs ${!expanded && isLong ? "max-h-20" : ""}`}
      >
        <div className="prose-xs">
          <MarkdownRenderer content={description} />
        </div>
      </div>
      {isLong && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-1 text-xs font-medium"
          style={{ color: "var(--accent)" }}
        >
          {expanded ? "Visa mindre" : "Visa mer"}
        </button>
      )}
    </div>
  );
}

interface FindingCardProps {
  finding: Finding;
  profiles: Profile[];
  href: string;
  onStatusChange: (id: string, status: FindingStatus) => void;
  onAssign: (id: string, assigneeId: string | null) => void;
  onDelete: (id: string) => void;
}

export function FindingCard({
  finding,
  profiles,
  href,
  onStatusChange,
  onAssign,
  onDelete,
}: FindingCardProps) {
  const statuses: FindingStatus[] = [
    "draft",
    "open",
    "in_progress",
    "resolved",
    "dismissed",
  ];

  return (
    <Link
      href={href}
      className="group relative block overflow-hidden rounded-xl border p-5 transition-all hover:border-[var(--accent)]"
      style={{
        background: "var(--bg-card)",
        borderColor: "var(--border)",
        boxShadow: "var(--shadow-card)",
      }}
    >
      <div
        className="absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100"
        style={{ background: "var(--accent-subtle)" }}
      />
      <div className="relative">
      <div className="mb-3 flex items-start justify-between gap-3">
        <h3 className="text-sm font-semibold leading-snug">{finding.title}</h3>
        <button
          onClick={(e) => { e.preventDefault(); onDelete(finding.id); }}
          className="shrink-0 rounded-md p-1 opacity-50 transition-opacity hover:opacity-100"
          style={{ color: "var(--fg-muted)" }}
          title="Radera"
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <path
              d="M4 4l8 8M12 4l-8 8"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>

      {finding.description && (
        <DescriptionBlock description={finding.description} />
      )}

      <div className="mb-3 flex flex-wrap gap-1.5">
        {finding.tags.map((tag) => (
          <span
            key={tag}
            className="rounded-md px-2 py-0.5 text-xs"
            style={{
              background: "var(--accent-subtle)",
              color: "var(--accent)",
            }}
          >
            {tag}
          </span>
        ))}
      </div>

      {/* Assignee */}
      <div className="mb-3">
        <select
          value={finding.assignee?.id ?? ""}
          onClick={(e) => e.preventDefault()}
          onChange={(e) => {
            e.preventDefault();
            onAssign(finding.id, e.target.value || null);
          }}
          className="w-full rounded-md border px-2 py-1 text-xs outline-none"
          style={{
            background: "var(--bg-elevated)",
            borderColor: "var(--border)",
            color: finding.assignee ? "var(--fg)" : "var(--fg-muted)",
          }}
        >
          <option value="">Ingen tilldelad</option>
          {profiles.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span
            className="inline-block h-2 w-2 rounded-full"
            style={{ background: priorityColors[finding.priority] }}
          />
          <span className="text-xs" style={{ color: "var(--fg-muted)" }}>
            {priorityLabels[finding.priority]}
          </span>
        </div>
        <select
          value={finding.status}
          onClick={(e) => e.preventDefault()}
          onChange={(e) => {
            e.preventDefault();
            onStatusChange(finding.id, e.target.value as FindingStatus);
          }}
          className="rounded-md border px-2 py-1 text-xs outline-none"
          style={{
            background: "var(--bg-elevated)",
            borderColor: "var(--border)",
            color: statusColors[finding.status],
          }}
        >
          {statuses.map((s) => (
            <option key={s} value={s}>
              {statusLabels[s]}
            </option>
          ))}
        </select>
      </div>
      </div>
    </Link>
  );
}
