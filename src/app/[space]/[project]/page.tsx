"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { PlanCard } from "@/components/plan-card";
import { FindingsBoard } from "@/components/findings-board";
import type { PlanMeta } from "@/lib/types";

type Tab = "plans" | "findings";

export default function ProjectPage() {
  const { space, project } = useParams<{ space: string; project: string }>();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("plans");
  const [plans, setPlans] = useState<PlanMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch(`/api/spaces/${space}/projects/${project}/plans`)
      .then((r) => r.json())
      .then(setPlans)
      .finally(() => setLoading(false));
  }, [space, project]);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);

    const formData = new FormData();
    for (const file of Array.from(files)) {
      formData.append("files", file);
    }

    const res = await fetch(
      `/api/spaces/${space}/projects/${project}/plans/upload`,
      { method: "POST", body: formData },
    );

    if (res.ok) {
      const uploaded = await res.json();
      setPlans((prev) => [...uploaded, ...prev]);
    }

    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  return (
    <>
      <Navbar
        crumbs={[
          { label: space, href: `/${space}` },
          { label: project },
        ]}
      />

      <div className="mb-6 flex items-start justify-between">
        <h1 className="text-3xl font-bold tracking-tight">{project}</h1>
        {tab === "plans" && (
          <div className="flex gap-3">
            <label
              className="cursor-pointer rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors"
              style={{ borderColor: "var(--border)", color: "var(--fg)" }}
            >
              {uploading ? "Laddar upp..." : "Ladda upp .md"}
              <input
                ref={fileInputRef}
                type="file"
                accept=".md"
                multiple
                onChange={handleUpload}
                className="hidden"
              />
            </label>
            <button
              onClick={() => router.push(`/${space}/${project}/ny`)}
              className="rounded-lg px-5 py-2.5 text-sm font-semibold text-white transition-transform hover:scale-[1.02] active:scale-[0.98]"
              style={{ background: "var(--accent)" }}
            >
              Ny plan
            </button>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div
        className="mb-6 flex gap-1 rounded-xl p-1.5"
        style={{ background: "var(--bg-elevated)" }}
      >
        {(
          [
            ["plans", "Planer"],
            ["findings", "Findings"],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className="rounded-lg px-4 py-2 text-sm font-medium transition-all"
            style={{
              background: tab === key ? "var(--bg-card)" : "transparent",
              color: tab === key ? "var(--fg)" : "var(--fg-muted)",
              boxShadow: tab === key ? "var(--shadow-card)" : "none",
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "plans" && (
        <>
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
          ) : plans.length === 0 ? (
            <div
              className="rounded-xl border-2 border-dashed p-12 text-center"
              style={{ borderColor: "var(--border)" }}
            >
              <p className="text-sm" style={{ color: "var(--fg-muted)" }}>
                Inga planer ännu. Skapa din första eller ladda upp en .md-fil.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {plans.map((plan) => (
                <PlanCard
                  key={plan.id}
                  plan={plan}
                  href={`/${space}/${project}/${plan.slug}`}
                />
              ))}
            </div>
          )}
        </>
      )}

      {tab === "findings" && (
        <FindingsBoard space={space} project={project} />
      )}
    </>
  );
}
