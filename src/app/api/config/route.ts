import { NextResponse } from "next/server";
import { getAppConfig } from "@/lib/config";

export async function GET() {
  return NextResponse.json(getAppConfig());
}
