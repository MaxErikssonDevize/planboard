import { NextResponse } from "next/server";
import { deleteComment } from "@/lib/plans";

type Params = { params: Promise<{ commentId: string }> };

export async function DELETE(_request: Request, { params }: Params) {
  const { commentId } = await params;
  try {
    await deleteComment(commentId);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Kommentar ej hittad" }, { status: 404 });
  }
}
