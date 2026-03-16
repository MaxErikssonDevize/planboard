"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { MarkdownRenderer } from "@/components/markdown-renderer";
import { PlanEditor } from "@/components/plan-editor";
import { ConfirmDialog } from "@/components/confirm-dialog";
import type { Plan } from "@/lib/types";

export default function PlanPage() {
  const { space, project, slug } = useParams<{
    space: string;
    project: string;
    slug: string;
  }>();
  const router = useRouter();
  const [plan, setPlan] = useState<Plan | null>(null);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch(`/api/spaces/${space}/projects/${project}/plans/${slug}`)
      .then((r) => r.json())
      .then(setPlan);
  }, [space, project, slug]);

  async function handleSave(content: string) {
    setSaving(true);
    const res = await fetch(
      `/api/spaces/${space}/projects/${project}/plans/${slug}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      },
    );
    if (res.ok) {
      const updated = await res.json();
      setPlan(updated);
      setEditing(false);
    }
    setSaving(false);
  }

  async function handleDelete() {
    await fetch(`/api/spaces/${space}/projects/${project}/plans/${slug}`, {
      method: "DELETE",
    });
    router.push(`/${space}/${project}`);
  }

  function handleShare() {
    const url = `${window.location.origin}/dela/${space}/${project}/${slug}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (!plan) {
    return (
      <>
        <Navbar
          crumbs={[
            { label: space, href: `/${space}` },
            { label: project, href: `/${space}/${project}` },
          ]}
        />
        <div
          className="flex items-center gap-2"
          style={{ color: "var(--fg-muted)" }}
        >
          <div
            className="h-4 w-4 animate-spin rounded-full border-2 border-current"
            style={{ borderTopColor: "transparent" }}
          />
          <span className="text-sm">Laddar...</span>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar
        crumbs={[
          { label: space, href: `/${space}` },
          { label: project, href: `/${space}/${project}` },
          { label: plan.title },
        ]}
      />

      <div className="mb-6 flex items-start justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight">{plan.title}</h1>
        <div className="flex shrink-0 gap-2">
          <button
            onClick={handleShare}
            className="rounded-lg border px-4 py-2 text-sm font-medium transition-colors"
            style={{
              borderColor: copied ? "var(--accent)" : "var(--border)",
              color: copied ? "var(--accent)" : "var(--fg)",
            }}
          >
            {copied ? "Kopierad!" : "Dela"}
          </button>
          <button
            onClick={() => setEditing(!editing)}
            className="rounded-lg px-4 py-2 text-sm font-semibold text-white"
            style={{
              background: editing ? "var(--fg-muted)" : "var(--accent)",
            }}
          >
            {editing ? "Avbryt" : "Redigera"}
          </button>
          <button
            onClick={() => setConfirmDelete(true)}
            className="rounded-lg border border-red-400/30 px-4 py-2 text-sm font-medium text-red-500 transition-colors hover:bg-red-500/10"
          >
            Radera
          </button>
        </div>
      </div>

      {editing ? (
        <PlanEditor
          initialContent={plan.content}
          onSave={handleSave}
          saving={saving}
        />
      ) : (
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
      )}

      <ConfirmDialog
        open={confirmDelete}
        title="Radera plan"
        message={`Är du säker på att du vill radera "${plan.title}"? Detta kan inte ångras.`}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(false)}
      />
    </>
  );
}
