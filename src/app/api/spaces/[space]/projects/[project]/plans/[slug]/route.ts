import { NextResponse } from "next/server";
import { readPlan, writePlan, deletePlan } from "@/lib/plans";

type Params = {
  params: Promise<{ space: string; project: string; slug: string }>;
};

export async function GET(_request: Request, { params }: Params) {
  const { space, project, slug } = await params;
  try {
    const plan = await readPlan(space, project, slug);
    return NextResponse.json(plan);
  } catch {
    return NextResponse.json({ error: "Plan ej hittad" }, { status: 404 });
  }
}

export async function PUT(request: Request, { params }: Params) {
  const { space, project, slug } = await params;
  const { content, title } = await request.json();

  if (content === undefined) {
    return NextResponse.json({ error: "Innehåll krävs" }, { status: 400 });
  }

  try {
    const plan = await writePlan(space, project, slug, content, title);
    return NextResponse.json(plan);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Okänt fel";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  const { space, project, slug } = await params;
  try {
    await deletePlan(space, project, slug);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Plan ej hittad" }, { status: 404 });
  }
}
