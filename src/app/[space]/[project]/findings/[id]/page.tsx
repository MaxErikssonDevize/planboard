"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { Navbar } from "@/components/navbar";
import { MarkdownRenderer } from "@/components/markdown-renderer";
import { ConfirmDialog } from "@/components/confirm-dialog";
import type {
  Finding,
  FindingComment,
  FindingStatus,
  FindingPriority,
  Profile,
} from "@/lib/types";

const statusLabels: Record<FindingStatus, string> = {
  draft: "Utkast",
  open: "Öppen",
  in_progress: "Pågår",
  resolved: "Löst",
  dismissed: "Avfärdad",
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

interface CommentForm {
  content: string;
  authorId: string;
}

export default function FindingDetailPage() {
  const { space, project, id } = useParams<{
    space: string;
    project: string;
    id: string;
  }>();
  const router = useRouter();
  const [finding, setFinding] = useState<Finding | null>(null);
  const [comments, setComments] = useState<FindingComment[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const findingApi = `/api/spaces/${space}/projects/${project}/findings/${id}`;

  const commentForm = useForm<CommentForm>({
    defaultValues: { content: "", authorId: "" },
  });

  const editForm = useForm<{
    description: string;
    status: FindingStatus;
    priority: FindingPriority;
    assigneeId: string;
  }>();

  useEffect(() => {
    Promise.all([
      fetch(`/api/findings/${id}`).then((r) => (r.ok ? r.json() : null)),
      fetch(`/api/findings/${id}/comments`).then((r) => (r.ok ? r.json() : [])),
      fetch("/api/profiles").then((r) => (r.ok ? r.json() : [])),
    ]).then(([f, c, p]) => {
      if (f) setFinding(f);
      if (Array.isArray(c)) setComments(c);
      if (Array.isArray(p)) setProfiles(p);
    });
  }, [id]);

  useEffect(() => {
    if (finding && !editing) {
      editForm.reset({
        description: finding.description,
        status: finding.status,
        priority: finding.priority,
        assigneeId: finding.assignee?.id ?? "",
      });
    }
  }, [finding, editing, editForm]);

  async function handleSaveEdit(data: {
    description: string;
    status: FindingStatus;
    priority: FindingPriority;
    assigneeId: string;
  }) {
    const res = await fetch(findingApi, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        description: data.description,
        status: data.status,
        priority: data.priority,
        assigneeId: data.assigneeId || null,
      }),
    });
    if (res.ok) {
      const updated = await res.json();
      setFinding(updated);
      setEditing(false);
    }
  }

  async function handleAddComment(data: CommentForm) {
    const res = await fetch(`/api/findings/${id}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content: data.content.trim(),
        authorId: data.authorId || undefined,
      }),
    });
    if (res.ok) {
      const comment = await res.json();
      setComments((prev) => [...prev, comment]);
      commentForm.reset({ content: "", authorId: data.authorId });
    }
  }

  async function handleDeleteComment(commentId: string) {
    await fetch(`/api/findings/${id}/comments/${commentId}`, {
      method: "DELETE",
    });
    setComments((prev) => prev.filter((c) => c.id !== commentId));
  }

  async function handleDelete() {
    await fetch(findingApi, { method: "DELETE" });
    router.push(`/${space}/${project}`);
  }

  if (!finding) {
    return (
      <>
        <Navbar
          crumbs={[
            { label: space, href: `/${space}` },
            { label: project, href: `/${space}/${project}` },
          ]}
        />
        <div className="flex items-center gap-2" style={{ color: "var(--fg-muted)" }}>
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
          { label: finding.title },
        ]}
      />

      {/* Header */}
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{finding.title}</h1>
          <div className="mt-2 flex items-center gap-3 text-sm" style={{ color: "var(--fg-muted)" }}>
            <span className="flex items-center gap-1.5">
              <span
                className="inline-block h-2 w-2 rounded-full"
                style={{ background: priorityColors[finding.priority] }}
              />
              {priorityLabels[finding.priority]}
            </span>
            <span>{statusLabels[finding.status]}</span>
            {finding.assignee && (
              <span>Tilldelad: {finding.assignee.name}</span>
            )}
          </div>
          {finding.tags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
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
          )}
        </div>
        <div className="flex shrink-0 gap-2">
          <button
            onClick={() => setEditing(!editing)}
            className="rounded-lg px-4 py-2 text-sm font-semibold text-white"
            style={{ background: editing ? "var(--fg-muted)" : "var(--accent)" }}
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

      {/* Description */}
      {editing ? (
        <form
          onSubmit={editForm.handleSubmit(handleSaveEdit)}
          className="mb-8 rounded-xl border p-6"
          style={{
            background: "var(--bg-card)",
            borderColor: "var(--border)",
            boxShadow: "var(--shadow-card)",
          }}
        >
          <div className="flex flex-col gap-4">
            <div className="flex gap-3">
              <select
                {...editForm.register("status")}
                className="rounded-lg border px-3 py-2 text-sm outline-none"
                style={{
                  background: "var(--bg-elevated)",
                  borderColor: "var(--border)",
                  color: "var(--fg)",
                }}
              >
                {(Object.entries(statusLabels)).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
              <select
                {...editForm.register("priority")}
                className="rounded-lg border px-3 py-2 text-sm outline-none"
                style={{
                  background: "var(--bg-elevated)",
                  borderColor: "var(--border)",
                  color: "var(--fg)",
                }}
              >
                {(Object.entries(priorityLabels)).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
              <select
                {...editForm.register("assigneeId")}
                className="rounded-lg border px-3 py-2 text-sm outline-none"
                style={{
                  background: "var(--bg-elevated)",
                  borderColor: "var(--border)",
                  color: "var(--fg)",
                }}
              >
                <option value="">Ingen tilldelad</option>
                {profiles.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
            <textarea
              {...editForm.register("description")}
              rows={12}
              className="resize-none rounded-lg border p-4 font-mono text-sm leading-relaxed outline-none focus:ring-2"
              style={{
                background: "var(--bg-elevated)",
                borderColor: "var(--border)",
                color: "var(--fg)",
              }}
              placeholder="Beskrivning i markdown..."
            />
            <div className="flex justify-end">
              <button
                type="submit"
                className="rounded-lg px-5 py-2 text-sm font-semibold text-white"
                style={{ background: "var(--accent)" }}
              >
                Spara
              </button>
            </div>
          </div>
        </form>
      ) : (
        <div
          className="mb-8 rounded-xl border p-6"
          style={{
            background: "var(--bg-card)",
            borderColor: "var(--border)",
            boxShadow: "var(--shadow-card)",
          }}
        >
          {finding.description ? (
            <MarkdownRenderer content={finding.description} />
          ) : (
            <p className="text-sm italic" style={{ color: "var(--fg-muted)" }}>
              Ingen beskrivning.
            </p>
          )}
        </div>
      )}

      {/* Comments */}
      <div className="mb-4">
        <h2 className="text-lg font-bold">Kommentarer</h2>
      </div>

      {comments.length > 0 && (
        <div className="mb-6 flex flex-col gap-4">
          {comments.map((comment) => (
            <div
              key={comment.id}
              className="group rounded-xl border p-4"
              style={{
                background: "var(--bg-card)",
                borderColor: "var(--border)",
              }}
            >
              <div className="mb-2 flex items-center justify-between text-xs" style={{ color: "var(--fg-muted)" }}>
                <div className="flex items-center gap-2">
                  {comment.author ? (
                    <span className="font-medium" style={{ color: "var(--fg)" }}>
                      {comment.author.name}
                    </span>
                  ) : (
                    <span>Anonym</span>
                  )}
                  <span>
                    {new Date(comment.createdAt).toLocaleString("sv")}
                  </span>
                </div>
                <button
                  onClick={() => handleDeleteComment(comment.id)}
                  className="rounded-md p-1 opacity-0 transition-opacity group-hover:opacity-100"
                  style={{ color: "var(--fg-muted)" }}
                >
                  <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                    <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </button>
              </div>
              <div className="text-sm">
                <MarkdownRenderer content={comment.content} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add comment */}
      <form
        onSubmit={commentForm.handleSubmit(handleAddComment)}
        className="rounded-xl border p-4"
        style={{
          background: "var(--bg-card)",
          borderColor: "var(--border)",
          boxShadow: "var(--shadow-card)",
        }}
      >
        <textarea
          {...commentForm.register("content", { required: true })}
          rows={3}
          placeholder="Skriv en kommentar i markdown..."
          className="mb-3 w-full resize-none rounded-lg border p-3 text-sm outline-none focus:ring-2"
          style={{
            background: "var(--bg-elevated)",
            borderColor: "var(--border)",
            color: "var(--fg)",
          }}
        />
        <div className="flex items-center justify-between">
          <select
            {...commentForm.register("authorId")}
            className="rounded-lg border px-3 py-2 text-sm outline-none"
            style={{
              background: "var(--bg-elevated)",
              borderColor: "var(--border)",
              color: "var(--fg)",
            }}
          >
            <option value="">Anonym</option>
            {profiles.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
          <button
            type="submit"
            disabled={commentForm.formState.isSubmitting}
            className="rounded-lg px-4 py-2 text-sm font-semibold text-white disabled:opacity-40"
            style={{ background: "var(--accent)" }}
          >
            Kommentera
          </button>
        </div>
      </form>

      <ConfirmDialog
        open={confirmDelete}
        title="Radera finding"
        message={`Radera "${finding.title}"? Alla kommentarer raderas också.`}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(false)}
      />
    </>
  );
}
