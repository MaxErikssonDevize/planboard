import { NextResponse } from "next/server";
import { listSpaces, createSpace } from "@/lib/plans";

export async function GET() {
  const spaces = await listSpaces();
  return NextResponse.json(spaces);
}

export async function POST(request: Request) {
  const { name } = await request.json();
  if (!name || typeof name !== "string") {
    return NextResponse.json({ error: "Namn krävs" }, { status: 400 });
  }
  try {
    const space = await createSpace(name);
    return NextResponse.json(space, { status: 201 });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Okänt fel";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
