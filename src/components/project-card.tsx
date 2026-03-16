import Link from "next/link";
import type { Project } from "@/lib/types";

export function ProjectCard({
  project,
  space,
  onDelete,
}: {
  project: Project;
  space: string;
  onDelete?: () => void;
}) {
  return (
    <div
      className="group relative overflow-hidden rounded-xl border"
      style={{
        background: "var(--bg-card)",
        borderColor: "var(--border)",
        boxShadow: "var(--shadow-card)",
      }}
    >
      <Link href={`/${space}/${project.slug}`} className="block p-6">
        <div
          className="absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100"
          style={{ background: "var(--accent-subtle)" }}
        />
        <div className="relative">
          <div className="mb-1 text-base font-semibold">{project.name}</div>
          {project.description && (
            <p
              className="mb-3 line-clamp-2 text-sm leading-relaxed"
              style={{ color: "var(--fg-muted)" }}
            >
              {project.description}
            </p>
          )}
          <div
            className="mt-2 flex items-center gap-3 text-xs font-medium"
            style={{ color: "var(--fg-muted)" }}
          >
            <span>
              {project.planCount} {project.planCount === 1 ? "plan" : "planer"}
            </span>
            {project.findingCount > 0 && (
              <span>
                {project.findingCount} {project.findingCount === 1 ? "finding" : "findings"}
              </span>
            )}
            <svg
              width="14"
              height="14"
              viewBox="0 0 16 16"
              fill="none"
              className="transition-transform group-hover:translate-x-0.5"
            >
              <path
                d="M6 3l5 5-5 5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>
      </Link>
      {onDelete && (
        <button
          onClick={(e) => {
            e.preventDefault();
            onDelete();
          }}
          className="absolute right-3 top-3 rounded-md p-1.5 opacity-0 transition-opacity group-hover:opacity-100"
          style={{ color: "var(--fg-muted)" }}
          title="Radera projekt"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path
              d="M4 4l8 8M12 4l-8 8"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </button>
      )}
    </div>
  );
}
