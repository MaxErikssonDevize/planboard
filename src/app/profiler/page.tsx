"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Navbar } from "@/components/navbar";
import { ConfirmDialog } from "@/components/confirm-dialog";
import type { Profile } from "@/lib/types";

interface CreateProfileForm {
  name: string;
}

export default function ProfilesPage() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<Profile | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<CreateProfileForm>({
    defaultValues: { name: "" },
  });

  useEffect(() => {
    fetch("/api/profiles")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setProfiles(data);
      })
      .finally(() => setLoading(false));
  }, []);

  async function onSubmit(data: CreateProfileForm) {
    const res = await fetch("/api/profiles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: data.name.trim() }),
    });
    if (res.ok) {
      const profile = await res.json();
      setProfiles((prev) => [...prev, profile]);
      reset();
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    await fetch(`/api/profiles/${deleteTarget.id}`, { method: "DELETE" });
    setProfiles((prev) => prev.filter((p) => p.id !== deleteTarget.id));
    setDeleteTarget(null);
  }

  return (
    <>
      <Navbar crumbs={[{ label: "Profiler" }]} />

      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Profiler</h1>
        <p className="mt-2 text-sm" style={{ color: "var(--fg-muted)" }}>
          Profiler används för att tilldela findings. Ingen inloggning — bara
          ett namn så alla vet vem som jobbar på vad.
        </p>
      </div>

      {/* Create form */}
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="mb-8 flex items-center gap-3"
      >
        <input
          {...register("name", { required: true })}
          type="text"
          placeholder="Ditt namn..."
          className="rounded-lg border px-4 py-2.5 text-sm outline-none focus:ring-2"
          style={{
            background: "var(--bg-card)",
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
          Skapa profil
        </button>
      </form>

      {/* Profile list */}
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
      ) : profiles.length === 0 ? (
        <div
          className="rounded-xl border-2 border-dashed p-12 text-center"
          style={{ borderColor: "var(--border)" }}
        >
          <p className="text-sm" style={{ color: "var(--fg-muted)" }}>
            Inga profiler ännu. Skapa din första ovan.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {profiles.map((profile) => (
            <div
              key={profile.id}
              className="group relative flex items-center gap-3 rounded-xl border p-4"
              style={{
                background: "var(--bg-card)",
                borderColor: "var(--border)",
                boxShadow: "var(--shadow-card)",
              }}
            >
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-sm font-bold"
                style={{ background: "var(--accent-subtle)", color: "var(--accent)" }}
              >
                {profile.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="text-sm font-semibold">{profile.name}</div>
                <div className="text-xs" style={{ color: "var(--fg-muted)" }}>
                  {profile.slug}
                </div>
              </div>
              <button
                onClick={() => setDeleteTarget(profile)}
                className="absolute right-3 top-3 rounded-md p-1 opacity-0 transition-opacity group-hover:opacity-100"
                style={{ color: "var(--fg-muted)" }}
                title="Radera profil"
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
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Radera profil"
        message={`Radera profilen "${deleteTarget?.name}"? Tilldelningar till denna profil tas bort.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </>
  );
}
