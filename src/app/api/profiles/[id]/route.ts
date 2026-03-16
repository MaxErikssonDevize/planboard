import { NextResponse } from "next/server";
import { deleteProfile } from "@/lib/plans";

type Params = { params: Promise<{ id: string }> };

export async function DELETE(_request: Request, { params }: Params) {
  const { id } = await params;
  try {
    await deleteProfile(id);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Profil ej hittad" }, { status: 404 });
  }
}
