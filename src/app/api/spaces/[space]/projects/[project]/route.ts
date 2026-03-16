import { NextResponse } from "next/server";
import { deleteProject } from "@/lib/plans";

type Params = { params: Promise<{ space: string; project: string }> };

export async function DELETE(_request: Request, { params }: Params) {
  const { space, project } = await params;
  try {
    await deleteProject(space, project);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Projekt ej hittat" }, { status: 404 });
  }
}
