"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { Navbar } from "@/components/navbar";
import { MarkdownRenderer } from "@/components/markdown-renderer";
import { PlanEditor } from "@/components/plan-editor";
import { ConfirmDialog } from "@/components/confirm-dialog";
import type { Plan, PlanComment, Profile } from "@/lib/types";

interface CommentForm {
  content: string;
  authorId: string;
}

export default function PlanPage() {
  const { space, project, slug } = useParams<{
    space: string;
    project: string;
    slug: string;
  }>();
  const router = useRouter();
  const [plan, setPlan] = useState<Plan | null>(null);
  const [comments, setComments] = useState<PlanComment[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [copied, setCopied] = useState(false);

  const commentForm = useForm<CommentForm>({
    defaultValues: { content: "", authorId: "" },
  });

  useEffect(() => {
    fetch(`/api/spaces/${space}/projects/${project}/plans/${slug}`)
      .then((r) => r.json())
      .then((data) => {
        if (data && data.id) {
          setPlan(data);
          // Load comments and profiles once we have the plan ID
          Promise.all([
            fetch(`/api/plans/${data.id}/comments`).then((r) =>
              r.ok ? r.json() : [],
            ),
            fetch("/api/profiles").then((r) => (r.ok ? r.json() : [])),
          ]).then(([c, p]) => {
            if (Array.isArray(c)) setComments(c);
            if (Array.isArray(p)) setProfiles(p);
          });
        }
      });
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

  async function handleAddComment(data: CommentForm) {
    if (!plan) return;
    const res = await fetch(`/api/plans/${plan.id}/comments`, {
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
    if (!plan) return;
    await fetch(`/api/plans/${plan.id}/comments/${commentId}`, {
      method: "DELETE",
    });
    setComments((prev) => prev.filter((c) => c.id !== commentId));
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

      {/* Comments */}
      {!editing && (
        <div className="mt-8">
          <h2 className="mb-4 text-lg font-bold">Kommentarer</h2>

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
                  <div
                    className="mb-2 flex items-center justify-between text-xs"
                    style={{ color: "var(--fg-muted)" }}
                  >
                    <div className="flex items-center gap-2">
                      {comment.author ? (
                        <span
                          className="font-medium"
                          style={{ color: "var(--fg)" }}
                        >
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
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 16 16"
                        fill="none"
                      >
                        <path
                          d="M4 4l8 8M12 4l-8 8"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                        />
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
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
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
