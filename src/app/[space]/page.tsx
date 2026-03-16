"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { Navbar } from "@/components/navbar";
import { ProjectCard } from "@/components/project-card";
import { ConfirmDialog } from "@/components/confirm-dialog";
import type { Project } from "@/lib/types";

interface CreateProjectForm {
  name: string;
  description: string;
}

export default function SpacePage() {
  const { space } = useParams<{ space: string }>();
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null);

  const { register, handleSubmit, reset, formState: { isSubmitting } } =
    useForm<CreateProjectForm>({ defaultValues: { name: "", description: "" } });

  useEffect(() => {
    fetch(`/api/spaces/${space}/projects`)
      .then((r) => r.json())
      .then(setProjects)
      .finally(() => setLoading(false));
  }, [space]);

  async function onSubmit(data: CreateProjectForm) {
    const res = await fetch(`/api/spaces/${space}/projects`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: data.name.trim(),
        description: data.description.trim(),
      }),
    });
    if (res.ok) {
      const project = await res.json();
      reset();
      router.push(`/${space}/${project.slug}`);
    }
  }

  async function handleDeleteProject() {
    if (!deleteTarget) return;
    await fetch(`/api/spaces/${space}/projects/${deleteTarget.slug}`, {
      method: "DELETE",
    });
    setProjects((prev) => prev.filter((p) => p.id !== deleteTarget.id));
    setDeleteTarget(null);
  }

  return (
    <>
      <Navbar crumbs={[{ label: space }]} />

      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{space}</h1>
          <p className="mt-2 text-sm" style={{ color: "var(--fg-muted)" }}>
            {projects.length} {projects.length === 1 ? "projekt" : "projekt"}
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="rounded-lg px-5 py-2.5 text-sm font-semibold text-white transition-transform hover:scale-[1.02] active:scale-[0.98]"
          style={{ background: "var(--accent)" }}
        >
          Nytt projekt
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="mb-8 rounded-xl border p-5"
          style={{
            background: "var(--bg-card)",
            borderColor: "var(--border)",
            boxShadow: "var(--shadow-card)",
          }}
        >
          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              {...register("name", { required: true })}
              type="text"
              placeholder="Projektnamn"
              autoFocus
              className="flex-1 rounded-lg border px-4 py-2.5 text-sm outline-none focus:ring-2"
              style={{
                background: "var(--bg-elevated)",
                borderColor: "var(--border)",
                color: "var(--fg)",
              }}
            />
            <input
              {...register("description")}
              type="text"
              placeholder="Kort beskrivning (valfritt)"
              className="flex-1 rounded-lg border px-4 py-2.5 text-sm outline-none focus:ring-2"
              style={{
                background: "var(--bg-elevated)",
                borderColor: "var(--border)",
                color: "var(--fg)",
              }}
            />
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-lg px-5 py-2.5 text-sm font-semibold text-white transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40"
              style={{ background: "var(--accent)" }}
            >
              {isSubmitting ? "Skapar..." : "Skapa"}
            </button>
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
      ) : projects.length === 0 ? (
        <div
          className="rounded-xl border-2 border-dashed p-12 text-center"
          style={{ borderColor: "var(--border)" }}
        >
          <p className="text-sm" style={{ color: "var(--fg-muted)" }}>
            Inga projekt ännu. Klicka &quot;Nytt projekt&quot; för att skapa ditt
            första.
          </p>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              space={space}
              onDelete={() => setDeleteTarget(project)}
            />
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Radera projekt"
        message={`Är du säker på att du vill radera "${deleteTarget?.name}"? Alla planer i projektet raderas permanent.`}
        onConfirm={handleDeleteProject}
        onCancel={() => setDeleteTarget(null)}
      />
    </>
  );
}
