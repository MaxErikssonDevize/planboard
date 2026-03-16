import { NextResponse } from "next/server";
import { listPlanComments, addPlanComment } from "@/lib/plans";

type Params = { params: Promise<{ planId: string }> };

export async function GET(_request: Request, { params }: Params) {
  const { planId } = await params;
  const comments = await listPlanComments(planId);
  return NextResponse.json(comments);
}

export async function POST(request: Request, { params }: Params) {
  const { planId } = await params;
  const { content, authorId } = await request.json();

  if (!content || typeof content !== "string" || !content.trim()) {
    return NextResponse.json({ error: "Innehåll krävs" }, { status: 400 });
  }

  try {
    const comment = await addPlanComment(planId, content.trim(), authorId);
    return NextResponse.json(comment, { status: 201 });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Okänt fel";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
