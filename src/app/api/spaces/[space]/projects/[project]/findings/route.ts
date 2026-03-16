import { NextResponse } from "next/server";
import { listFindings, createFinding } from "@/lib/plans";
import type { FindingStatus } from "@/lib/types";

type Params = { params: Promise<{ space: string; project: string }> };

export async function GET(request: Request, { params }: Params) {
  const { space, project } = await params;
  const url = new URL(request.url);
  const status = url.searchParams.get("status") as FindingStatus | null;

  try {
    const list = await listFindings(space, project, status || undefined);
    return NextResponse.json(list);
  } catch {
    return NextResponse.json({ error: "Projekt ej hittat" }, { status: 404 });
  }
}

export async function POST(request: Request, { params }: Params) {
  const { space, project } = await params;
  const body = await request.json();

  if (!body.title || typeof body.title !== "string") {
    return NextResponse.json({ error: "Titel krävs" }, { status: 400 });
  }

  try {
    const finding = await createFinding(space, project, body);
    return NextResponse.json(finding, { status: 201 });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Okänt fel";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
