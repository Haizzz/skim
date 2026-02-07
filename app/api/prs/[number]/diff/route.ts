import { NextRequest, NextResponse } from "next/server";
import { getDiff } from "@/lib/gh";
import { parseDiff } from "@/lib/diff-parser";

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
    const rawDiff = getDiff(repo, parseInt(number, 10));
    const files = parseDiff(rawDiff);
    return NextResponse.json({ files, raw: rawDiff });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Failed to get diff";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
