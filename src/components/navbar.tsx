"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

interface Crumb {
  label: string;
  href?: string;
}

interface AppConfig {
  appName: string;
  appIcon: string;
}

export function Navbar({ crumbs = [] }: { crumbs?: Crumb[] }) {
  const [config, setConfig] = useState<AppConfig>({
    appName: "Planboard",
    appIcon: "P",
  });

  useEffect(() => {
    fetch("/api/config")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data) setConfig(data);
      })
      .catch(() => {});
  }, []);

  return (
    <nav className="mb-10 flex items-center justify-between">
      <div className="flex items-center gap-2.5 text-sm">
        <Link
          href="/"
          className="flex items-center gap-2 font-bold text-lg tracking-tight"
          style={{ color: "var(--fg)" }}
        >
          {config.appIcon ? (
            <img
              src={config.appIcon}
              alt={config.appName}
              className="h-8 w-8 rounded-lg object-contain"
            />
          ) : (
            <span
              className="flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold text-white"
              style={{ background: "var(--accent)" }}
            >
              {config.appName.charAt(0)}
            </span>
          )}
          <span>{config.appName}</span>
        </Link>
        {crumbs.map((crumb, i) => (
          <span key={i} className="flex items-center gap-2.5">
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              style={{ color: "var(--fg-muted)" }}
            >
              <path
                d="M6 3l5 5-5 5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            {crumb.href ? (
              <Link
                href={crumb.href}
                className="font-medium hover:opacity-70"
                style={{ color: "var(--fg-muted)" }}
              >
                {crumb.label}
              </Link>
            ) : (
              <span className="font-medium" style={{ color: "var(--fg)" }}>
                {crumb.label}
              </span>
            )}
          </span>
        ))}
      </div>
      <div className="flex items-center gap-4">
        <Link
          href="/profiler"
          className="text-sm font-medium hover:opacity-70"
          style={{ color: "var(--fg-muted)" }}
        >
          Profiler
        </Link>
        <Link
          href="/docs"
          className="text-sm font-medium hover:opacity-70"
          style={{ color: "var(--fg-muted)" }}
        >
          Docs
        </Link>
      </div>
    </nav>
  );
}
