import Link from "next/link";
import type { PlanMeta } from "@/lib/types";

function relativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just nu";
  if (mins < 60) return `${mins} min sedan`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} tim sedan`;
  const days = Math.floor(hours / 24);
  return `${days} dag${days > 1 ? "ar" : ""} sedan`;
}

export function PlanCard({ plan, href }: { plan: PlanMeta; href: string }) {
  return (
    <Link
      href={href}
      className="group relative overflow-hidden rounded-xl border p-5"
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
        <div className="mb-2 flex items-center gap-2">
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            style={{ color: "var(--accent)" }}
          >
            <path
              d="M3 2h7l3 3v9a1 1 0 01-1 1H3a1 1 0 01-1-1V3a1 1 0 011-1z"
              stroke="currentColor"
              strokeWidth="1.3"
              strokeLinejoin="round"
            />
            <path
              d="M5 9h6M5 12h4"
              stroke="currentColor"
              strokeWidth="1.3"
              strokeLinecap="round"
            />
          </svg>
          <span className="text-sm font-semibold">{plan.title}</span>
        </div>
        <div className="text-xs" style={{ color: "var(--fg-muted)" }}>
          {relativeTime(plan.updatedAt)}
        </div>
      </div>
    </Link>
  );
}
