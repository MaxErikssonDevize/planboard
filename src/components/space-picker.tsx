"use client";

import { useForm } from "react-hook-form";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ConfirmDialog } from "./confirm-dialog";
import type { Space } from "@/lib/types";

interface CreateSpaceForm {
  name: string;
}

export function SpacePicker({
  spaces,
  onDeleted,
}: {
  spaces: Space[];
  onDeleted?: (name: string) => void;
}) {
  const { register, handleSubmit, reset } = useForm<CreateSpaceForm>();
  const [deleteTarget, setDeleteTarget] = useState<Space | null>(null);
  const router = useRouter();

  async function onSubmit(data: CreateSpaceForm) {
    const res = await fetch("/api/spaces", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: data.name.trim() }),
    });
    if (res.ok) {
      const space = await res.json();
      reset();
      router.push(`/${space.name}`);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    await fetch(`/api/spaces/${deleteTarget.name}`, { method: "DELETE" });
    onDeleted?.(deleteTarget.name);
    setDeleteTarget(null);
  }

  return (
    <div>
      {spaces.length > 0 && (
        <div className="mb-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {spaces.map((space) => (
            <div
              key={space.id}
              className="group relative overflow-hidden rounded-xl border"
              style={{
                background: "var(--bg-card)",
                borderColor: "var(--border)",
                boxShadow: "var(--shadow-card)",
              }}
            >
              <a href={`/${space.name}`} className="block p-6">
                <div
                  className="absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100"
                  style={{ background: "var(--accent-subtle)" }}
                />
                <div className="relative">
                  <div
                    className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg text-sm font-bold text-white"
                    style={{ background: "var(--accent)" }}
                  >
                    {space.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="text-base font-semibold">{space.name}</div>
                  <div
                    className="mt-1 text-sm"
                    style={{ color: "var(--fg-muted)" }}
                  >
                    {space.projectCount} projekt
                  </div>
                </div>
              </a>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  setDeleteTarget(space);
                }}
                className="absolute right-3 top-3 rounded-md p-1.5 opacity-0 transition-opacity group-hover:opacity-100"
                style={{ color: "var(--fg-muted)" }}
                title="Radera utrymme"
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
            </div>
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="flex items-center gap-3">
        <input
          {...register("name", { required: true })}
          type="text"
          placeholder="Namn på nytt utrymme..."
          className="rounded-lg border px-4 py-2.5 text-sm outline-none focus:ring-2"
          style={{
            background: "var(--bg-card)",
            borderColor: "var(--border)",
            color: "var(--fg)",
          }}
        />
        <button
          type="submit"
          className="rounded-lg px-5 py-2.5 text-sm font-semibold text-white transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40"
          style={{ background: "var(--accent)" }}
        >
          Skapa utrymme
        </button>
      </form>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Radera utrymme"
        message={`Är du säker på att du vill radera "${deleteTarget?.name}"? Alla projekt och planer i utrymmet raderas permanent.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
