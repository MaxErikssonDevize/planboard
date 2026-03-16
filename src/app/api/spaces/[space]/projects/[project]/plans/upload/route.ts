import { NextResponse } from "next/server";
import { writePlan } from "@/lib/plans";
import { slugify } from "@/lib/slugify";

type Params = { params: Promise<{ space: string; project: string }> };

export async function POST(request: Request, { params }: Params) {
  const { space, project } = await params;

  const formData = await request.formData();
  const files = formData.getAll("files") as File[];

  if (files.length === 0) {
    return NextResponse.json({ error: "Inga filer" }, { status: 400 });
  }

  const results = [];
  for (const file of files) {
    if (!file.name.endsWith(".md")) continue;
    const content = await file.text();
    const baseName = file.name.replace(/\.md$/, "");
    const slug = slugify(baseName);
    const plan = await writePlan(space, project, slug, content);
    results.push(plan);
  }

  return NextResponse.json(results, { status: 201 });
}
