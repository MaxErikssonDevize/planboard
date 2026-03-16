"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { Navbar } from "@/components/navbar";
import { PlanEditor } from "@/components/plan-editor";

interface NewPlanForm {
  title: string;
}

export default function NewPlanPage() {
  const { space, project } = useParams<{ space: string; project: string }>();
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [apiError, setApiError] = useState("");

  const {
    register,
    getValues,
    formState: { errors },
    trigger,
  } = useForm<NewPlanForm>({ defaultValues: { title: "" } });

  async function handleSave(content: string) {
    const valid = await trigger();
    const title = getValues("title");

    if (!valid && !content.trim()) {
      setApiError("Ange en titel eller skriv innehåll.");
      return;
    }
    setApiError("");
    setSaving(true);

    const finalTitle = title.trim() || "Namnlös plan";
    const res = await fetch(`/api/spaces/${space}/projects/${project}/plans`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: finalTitle, content }),
    });
    if (res.ok) {
      const plan = await res.json();
      router.push(`/${space}/${project}/${plan.slug}`);
    } else {
      const data = await res.json().catch(() => null);
      setApiError(data?.error || "Något gick fel.");
    }
    setSaving(false);
  }

  return (
    <>
      <Navbar
        crumbs={[
          { label: space, href: `/${space}` },
          { label: project, href: `/${space}/${project}` },
          { label: "Ny plan" },
        ]}
      />
      <div className="mb-6">
        <input
          {...register("title")}
          type="text"
          placeholder="Ge din plan en titel..."
          autoFocus
          className="w-full border-b-2 bg-transparent pb-3 text-2xl font-bold tracking-tight outline-none transition-colors focus:border-[var(--accent)]"
          style={{
            borderColor: errors.title || apiError ? "#ef4444" : "var(--border)",
            color: "var(--fg)",
          }}
        />
        {apiError && <p className="mt-2 text-sm text-red-500">{apiError}</p>}
      </div>
      <PlanEditor initialContent="" onSave={handleSave} saving={saving} />
    </>
  );
}
