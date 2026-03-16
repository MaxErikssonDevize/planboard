import { NextResponse } from "next/server";
import { deleteSpace } from "@/lib/plans";

type Params = { params: Promise<{ space: string }> };

export async function DELETE(_request: Request, { params }: Params) {
  const { space } = await params;
  try {
    await deleteSpace(space);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Space ej hittat" }, { status: 404 });
  }
}
