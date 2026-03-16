import { NextResponse } from "next/server";
import { updateFinding, deleteFinding } from "@/lib/plans";

type Params = { params: Promise<{ id: string }> };

export async function PUT(request: Request, { params }: Params) {
  const { id } = await params;
  const body = await request.json();

  try {
    const finding = await updateFinding(id, body);
    return NextResponse.json(finding);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Okänt fel";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  const { id } = await params;
  try {
    await deleteFinding(id);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Finding ej hittad" }, { status: 404 });
  }
}
