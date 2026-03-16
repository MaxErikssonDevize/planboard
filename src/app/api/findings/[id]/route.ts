import { NextResponse } from "next/server";
import { getFinding } from "@/lib/plans";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const { id } = await params;
  try {
    const finding = await getFinding(id);
    return NextResponse.json(finding);
  } catch {
    return NextResponse.json({ error: "Finding ej hittad" }, { status: 404 });
  }
}
