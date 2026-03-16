"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { FindingCard } from "./finding-card";
import { ConfirmDialog } from "./confirm-dialog";
import type { Finding, FindingStatus, FindingPriority, Profile } from "@/lib/types";

interface CreateFindingForm {
  title: string;
  description: string;
  priority: FindingPriority;
  tags: string;
}

interface FindingsBoardProps {
  space: string;
  project: string;
}

export function FindingsBoard({ space, project }: FindingsBoardProps) {
  const [findings, setFindings] = useState<Finding[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [filter, setFilter] = useState<FindingStatus | "all">("all");

  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<CreateFindingForm>({
    defaultValues: { title: "", description: "", priority: "medium", tags: "" },
  });

  const apiBase = `/api/spaces/${space}/projects/${project}/findings`;

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      fetch(apiBase).then((r) => (r.ok ? r.json() : [])),
      fetch("/api/profiles").then((r) => (r.ok ? r.json() : [])),
    ])
      .then(([findingsData, profilesData]) => {
        if (cancelled) return;
        if (Array.isArray(findingsData)) setFindings(findingsData);
        if (Array.isArray(profilesData)) setProfiles(profilesData);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [apiBase]);

  async function onSubmit(data: CreateFindingForm) {
    const res = await fetch(apiBase, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: data.title.trim(),
        description: data.description.trim(),
        priority: data.priority,
        tags: data.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
      }),
    });

    if (res.ok) {
      const finding = await res.json();
      setFindings((prev) => [finding, ...prev]);
      reset();
      setShowForm(false);
    }
  }

  async function handleStatusChange(id: string, status: FindingStatus) {
    const res = await fetch(`${apiBase}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      const updated = await res.json();
      setFindings((prev) => prev.map((f) => (f.id === id ? updated : f)));
    }
  }

  async function handleAssign(id: string, assigneeId: string | null) {
    const res = await fetch(`${apiBase}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ assigneeId }),
    });
    if (res.ok) {
      const updated = await res.json();
      setFindings((prev) => prev.map((f) => (f.id === id ? updated : f)));
    }
  }

  async function handleDelete() {
    if (!deleteId) return;
    await fetch(`${apiBase}/${deleteId}`, { method: "DELETE" });
    setFindings((prev) => prev.filter((f) => f.id !== deleteId));
    setDeleteId(null);
  }

  const filtered =
    filter === "all" ? findings : findings.filter((f) => f.status === filter);

  const counts = findings.reduce(
    (acc, f) => {
      acc[f.status] = (acc[f.status] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div
          className="flex gap-1 overflow-x-auto rounded-lg p-1"
          style={{ background: "var(--bg-elevated)" }}
        >
          {(
            [
              ["all", "Alla"],
              ["draft", "Utkast"],
              ["open", "Öppna"],
              ["in_progress", "Pågår"],
              ["resolved", "Lösta"],
              ["dismissed", "Avfärdade"],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className="shrink-0 rounded-md px-3 py-1.5 text-xs font-medium transition-all"
              style={{
                background: filter === key ? "var(--bg-card)" : "transparent",
                color: filter === key ? "var(--fg)" : "var(--fg-muted)",
                boxShadow: filter === key ? "var(--shadow-card)" : "none",
              }}
            >
              {label}
              {key !== "all" && counts[key] ? (
                <span className="ml-1 opacity-60">({counts[key]})</span>
              ) : null}
            </button>
          ))}
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="shrink-0 rounded-lg px-4 py-2 text-sm font-semibold text-white transition-transform hover:scale-[1.02] active:scale-[0.98]"
          style={{ background: "var(--accent)" }}
        >
          Ny finding
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="mb-6 rounded-xl border p-5"
          style={{
            background: "var(--bg-card)",
            borderColor: "var(--border)",
            boxShadow: "var(--shadow-card)",
          }}
        >
          <div className="flex flex-col gap-3">
            <input
              {...register("title", { required: true })}
              type="text"
              placeholder="Titel"
              autoFocus
              className="rounded-lg border px-4 py-2.5 text-sm outline-none focus:ring-2"
              style={{
                background: "var(--bg-elevated)",
                borderColor: "var(--border)",
                color: "var(--fg)",
              }}
            />
            <textarea
              {...register("description")}
              placeholder="Beskrivning i markdown (valfritt)"
              rows={3}
              className="resize-none rounded-lg border px-4 py-2.5 text-sm outline-none focus:ring-2"
              style={{
                background: "var(--bg-elevated)",
                borderColor: "var(--border)",
                color: "var(--fg)",
              }}
            />
            <div className="flex gap-3">
              <select
                {...register("priority")}
                className="rounded-lg border px-3 py-2 text-sm outline-none"
                style={{
                  background: "var(--bg-elevated)",
                  borderColor: "var(--border)",
                  color: "var(--fg)",
                }}
              >
                <option value="low">Låg</option>
                <option value="medium">Medium</option>
                <option value="high">Hög</option>
                <option value="critical">Kritisk</option>
              </select>
              <input
                {...register("tags")}
                type="text"
                placeholder="Taggar (komma-separerade)"
                className="flex-1 rounded-lg border px-4 py-2.5 text-sm outline-none focus:ring-2"
                style={{
                  background: "var(--bg-elevated)",
                  borderColor: "var(--border)",
                  color: "var(--fg)",
                }}
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="rounded-lg border px-4 py-2 text-sm font-medium"
                style={{ borderColor: "var(--border)" }}
              >
                Avbryt
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="rounded-lg px-4 py-2 text-sm font-semibold text-white disabled:opacity-40"
                style={{ background: "var(--accent)" }}
              >
                {isSubmitting ? "Skapar..." : "Skapa"}
              </button>
            </div>
          </div>
        </form>
      )}

      {loading ? (
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
      ) : filtered.length === 0 ? (
        <div
          className="rounded-xl border-2 border-dashed p-12 text-center"
          style={{ borderColor: "var(--border)" }}
        >
          <p className="text-sm" style={{ color: "var(--fg-muted)" }}>
            {findings.length === 0
              ? "Inga findings ännu. AI-agenter eller du kan skapa dem här."
              : "Inga findings med denna status."}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((finding) => (
            <FindingCard
              key={finding.id}
              finding={finding}
              profiles={profiles}
              href={`/${space}/${project}/findings/${finding.id}`}
              onStatusChange={handleStatusChange}
              onAssign={handleAssign}
              onDelete={(fid) => setDeleteId(fid)}
            />
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!deleteId}
        title="Radera finding"
        message="Är du säker på att du vill radera denna finding?"
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
