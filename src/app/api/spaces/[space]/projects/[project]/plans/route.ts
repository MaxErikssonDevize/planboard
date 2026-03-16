import { NextResponse } from "next/server";
import { listPlans, writePlan } from "@/lib/plans";

type Params = { params: Promise<{ space: string; project: string }> };

export async function GET(_request: Request, { params }: Params) {
  const { space, project } = await params;
  try {
    const plansList = await listPlans(space, project);
    return NextResponse.json(plansList);
  } catch {
    return NextResponse.json({ error: "Projekt ej hittat" }, { status: 404 });
  }
}

export async function POST(request: Request, { params }: Params) {
  const { space, project } = await params;
  const { title, content } = await request.json();

  if (!title || typeof title !== "string") {
    return NextResponse.json({ error: "Titel krävs" }, { status: 400 });
  }

  try {
    const plan = await writePlan(space, project, undefined, content || "", title);
    return NextResponse.json(plan, { status: 201 });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Okänt fel";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
