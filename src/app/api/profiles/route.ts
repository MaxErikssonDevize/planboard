import { NextResponse } from "next/server";
import { listProfiles, createProfile } from "@/lib/plans";

export async function GET() {
  const list = await listProfiles();
  return NextResponse.json(list);
}

export async function POST(request: Request) {
  const { name, emoji } = await request.json();
  if (!name || typeof name !== "string") {
    return NextResponse.json({ error: "Namn krävs" }, { status: 400 });
  }
  try {
    const profile = await createProfile(name, emoji);
    return NextResponse.json(profile, { status: 201 });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Okänt fel";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
