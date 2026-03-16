import { NextResponse } from "next/server";
import { listComments, addComment } from "@/lib/plans";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const { id } = await params;
  const comments = await listComments(id);
  return NextResponse.json(comments);
}

export async function POST(request: Request, { params }: Params) {
  const { id } = await params;
  const { content, authorId } = await request.json();

  if (!content || typeof content !== "string" || !content.trim()) {
    return NextResponse.json({ error: "Innehåll krävs" }, { status: 400 });
  }

  try {
    const comment = await addComment(id, content.trim(), authorId);
    return NextResponse.json(comment, { status: 201 });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Okänt fel";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
