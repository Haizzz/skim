import { NextRequest, NextResponse } from "next/server";
import { execSync } from "child_process";
import { sanitizeRepo, sanitizeNumber } from "@/lib/gh";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ number: string }> }
) {
  const { number } = await params;
  const { repo, action, body } = await request.json();

  if (!repo || !action) {
    return NextResponse.json({ error: "repo and action required" }, { status: 400 });
  }

  const safeRepo = sanitizeRepo(repo);
  const safeNum = sanitizeNumber(parseInt(number, 10));

  const eventMap: Record<string, string> = {
    approve: "APPROVE",
    comment: "COMMENT",
    request_changes: "REQUEST_CHANGES",
  };

  const event = eventMap[action];
  if (!event) {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  try {
    const bodyArg = body ? ` --body '${body.replace(/'/g, "'\\''")}'` : "";
    execSync(
      `gh pr review ${safeNum} --repo '${safeRepo}' --${event.toLowerCase().replace("_", "-")}${bodyArg}`,
      { encoding: "utf-8", timeout: 15000 }
    );

    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Review submission failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
