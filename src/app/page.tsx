"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/navbar";
import { SpacePicker } from "@/components/space-picker";
import type { Space } from "@/lib/types";

export default function Home() {
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/spaces")
      .then((r) => r.json())
      .then(setSpaces)
      .finally(() => setLoading(false));
  }, []);

  function handleDeleted(name: string) {
    setSpaces((prev) => prev.filter((s) => s.name !== name));
  }

  return (
    <>
      <Navbar />
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Utrymmen</h1>
        <p className="mt-2 text-sm" style={{ color: "var(--fg-muted)" }}>
          Välj ett utrymme eller skapa ett nytt för att komma igång.
        </p>
      </div>
      {loading ? (
        <div className="flex items-center gap-2" style={{ color: "var(--fg-muted)" }}>
          <div
            className="h-4 w-4 animate-spin rounded-full border-2 border-current"
            style={{ borderTopColor: "transparent" }}
          />
          <span className="text-sm">Laddar...</span>
        </div>
      ) : (
        <SpacePicker spaces={spaces} onDeleted={handleDeleted} />
      )}
    </>
  );
}
