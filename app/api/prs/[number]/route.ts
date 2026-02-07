import { NextRequest, NextResponse } from "next/server";
import { getPR } from "@/lib/gh";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ number: string }> }
) {
  const { number } = await params;
  const repo = request.nextUrl.searchParams.get("repo");
  if (!repo) {
    return NextResponse.json({ error: "repo parameter required" }, { status: 400 });
  }

  try {
    const pr = getPR(repo, parseInt(number, 10));
    return NextResponse.json(pr);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Failed to get PR";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
