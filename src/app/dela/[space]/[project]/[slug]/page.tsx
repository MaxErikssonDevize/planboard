import { readPlan } from "@/lib/plans";
import { MarkdownRenderer } from "@/components/markdown-renderer";
import { notFound } from "next/navigation";
import Link from "next/link";

interface Props {
  params: Promise<{ space: string; project: string; slug: string }>;
}

export default async function SharePage({ params }: Props) {
  const { space, project, slug } = await params;
  let plan;
  try {
    plan = await readPlan(space, project, slug);
  } catch {
    notFound();
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <div className="mb-6 flex items-center gap-2">
        <Link
          href="/"
          className="flex items-center gap-2 text-sm font-bold"
          style={{ color: "var(--fg)" }}
        >
          <span
            className="flex h-6 w-6 items-center justify-center rounded-md text-xs font-bold text-white"
            style={{ background: "var(--accent)" }}
          >
            P
          </span>
          Planboard
        </Link>
        <span className="text-xs" style={{ color: "var(--fg-muted)" }}>
          / delad plan
        </span>
      </div>
      <div
        className="rounded-xl border p-8"
        style={{
          background: "var(--bg-card)",
          borderColor: "var(--border)",
          boxShadow: "var(--shadow-card)",
        }}
      >
        <MarkdownRenderer content={plan.content} />
      </div>
    </div>
  );
}
