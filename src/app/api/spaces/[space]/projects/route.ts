import { NextResponse } from "next/server";
import { listProjects, createProject } from "@/lib/plans";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ space: string }> },
) {
  const { space } = await params;
  try {
    const projectsList = await listProjects(space);
    return NextResponse.json(projectsList);
  } catch {
    return NextResponse.json({ error: "Space ej hittat" }, { status: 404 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ space: string }> },
) {
  const { space } = await params;
  const { name, description } = await request.json();

  if (!name || typeof name !== "string") {
    return NextResponse.json({ error: "Namn krävs" }, { status: 400 });
  }

  try {
    const project = await createProject(space, name, description);
    return NextResponse.json(project, { status: 201 });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Okänt fel";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
