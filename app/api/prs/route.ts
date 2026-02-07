import { NextRequest, NextResponse } from "next/server";
import { listPRs } from "@/lib/gh";

export async function GET(request: NextRequest) {
  const repo = request.nextUrl.searchParams.get("repo");
  if (!repo) {
    return NextResponse.json({ error: "repo parameter required" }, { status: 400 });
  }

  try {
    const prs = listPRs(repo);
    return NextResponse.json(prs);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Failed to list PRs";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
