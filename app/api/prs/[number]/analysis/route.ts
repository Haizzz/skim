import { NextRequest, NextResponse } from "next/server";
import { getPR, getDiff } from "@/lib/gh";
import { splitDiffByFile } from "@/lib/diff-parser";
import { analyzeFile, synthesizePR } from "@/lib/ai";
import { FileAnalysis, AnalysisResult } from "@/lib/types";

const cache = new Map<string, AnalysisResult>();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ number: string }> }
) {
  const { number } = await params;
  const repo = request.nextUrl.searchParams.get("repo");
  if (!repo) {
    return NextResponse.json(
      { error: "repo parameter required" },
      { status: 400 }
    );
  }

  const prNum = parseInt(number, 10);

  try {
    const pr = getPR(repo, prNum);
    const cacheKey = `${repo}:${prNum}:${pr.headRefOid}`;

    // If cached, return as a single SSE "done" event
    const cached = cache.get(cacheKey);
    if (cached) {
      const stream = new ReadableStream({
        start(controller) {
          const enc = new TextEncoder();
          controller.enqueue(
            enc.encode(`data: ${JSON.stringify({ type: "done", data: cached })}\n\n`)
          );
          controller.close();
        },
      });
      return new Response(stream, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        },
      });
    }

    const rawDiff = getDiff(repo, prNum);
    const fileDiffs = splitDiffByFile(rawDiff);
    const total = fileDiffs.length;

    const stream = new ReadableStream({
      async start(controller) {
        const enc = new TextEncoder();

        function send(event: Record<string, unknown>) {
          controller.enqueue(
            enc.encode(`data: ${JSON.stringify(event)}\n\n`)
          );
        }

        // Send initial count
        send({ type: "start", total });

        // Phase A: per-file analysis with progress
        let completed = 0;
        const fileAnalyses: FileAnalysis[] = [];

        const promises = fileDiffs.map(({ fileName, diff }) =>
          analyzeFile(diff, fileName, pr.title)
            .catch(
              (err): FileAnalysis => ({
                file: fileName,
                summary: `Analysis failed: ${err instanceof Error ? err.message : "unknown error"}`,
                objects: [],
                annotations: [],
                riskNotes: [],
                decisions: [],
              })
            )
            .then((result) => {
              completed++;
              send({
                type: "progress",
                completed,
                total,
                file: fileName,
              });
              fileAnalyses.push(result);
            })
        );

        await Promise.all(promises);

        // Phase B: synthesis
        send({ type: "synthesizing" });

        let prAnalysis;
        try {
          prAnalysis = await synthesizePR(fileAnalyses, pr.title, pr.body);
        } catch {
          prAnalysis = {
            summary: pr.title,
            riskLevel: "medium" as const,
            keyChanges: [],
            intent: "",
            concepts: [
              {
                id: "all-changes",
                label: "All Changes",
                icon: "📝",
                size: "L" as const,
                summary: "All files changed in this PR",
                fileIds: fileAnalyses.map((f) => f.file),
              },
            ],
          };
        }

        const result: AnalysisResult = { prAnalysis, fileAnalyses };
        cache.set(cacheKey, result);

        send({ type: "done", data: result });
        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Analysis failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
