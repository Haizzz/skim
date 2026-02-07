"use client";

import { useState, useEffect, use } from "react";
import { PRDetail, AnalysisResult, DiffFile } from "@/lib/types";
import NavBar from "@/components/NavBar";
import SwipeView from "@/components/SwipeView";
import BriefingCard from "@/components/BriefingCard";
import ConceptCard from "@/components/ConceptCard";
import CodeView from "@/components/CodeView";
import FullDiffCard from "@/components/FullDiffCard";
import ReviewDropdown from "@/components/ReviewDropdown";

interface Props {
  params: Promise<{ owner: string; repo: string; number: string }>;
}

interface AnalysisProgress {
  completed: number;
  total: number;
  phase: "files" | "synthesizing";
  currentFile?: string;
}

export default function ReviewPage({ params }: Props) {
  const { owner, repo, number } = use(params);
  const repoSlug = `${owner}/${repo}`;
  const prNum = parseInt(number, 10);

  const [pr, setPR] = useState<PRDetail | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [diffFiles, setDiffFiles] = useState<DiffFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [codeViewFile, setCodeViewFile] = useState<string | null>(null);
  const [progress, setProgress] = useState<AnalysisProgress | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const [prRes, diffRes] = await Promise.all([
          fetch(`/api/prs/${prNum}?repo=${encodeURIComponent(repoSlug)}`),
          fetch(`/api/prs/${prNum}/diff?repo=${encodeURIComponent(repoSlug)}`),
        ]);

        if (!prRes.ok) throw new Error("Failed to load PR details");
        if (!diffRes.ok) throw new Error("Failed to load diff");

        const prData = await prRes.json();
        const diffData = await diffRes.json();

        setPR(prData);
        setDiffFiles(diffData.files);
        setLoading(false);

        // Stream analysis with SSE
        const analysisRes = await fetch(
          `/api/prs/${prNum}/analysis?repo=${encodeURIComponent(repoSlug)}`
        );

        if (!analysisRes.ok || !analysisRes.body) return;

        const reader = analysisRes.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            const event = JSON.parse(line.slice(6));

            if (event.type === "start") {
              setProgress({ completed: 0, total: event.total, phase: "files" });
            } else if (event.type === "progress") {
              setProgress((prev) => prev ? {
                ...prev,
                completed: event.completed,
                phase: "files",
                currentFile: event.file,
              } : null);
            } else if (event.type === "synthesizing") {
              setProgress((prev) => prev ? { ...prev, phase: "synthesizing" } : null);
            } else if (event.type === "done") {
              setAnalysis(event.data);
              setProgress(null);
            }
          }
        }
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : "Failed to load");
        setLoading(false);
      }
    }

    load();
  }, [prNum, repoSlug]);

  const activeCodeFile = codeViewFile
    ? diffFiles.find((f) => f.path === codeViewFile)
    : null;
  const activeFileAnalysis = codeViewFile && analysis
    ? analysis.fileAnalyses.find((f) => f.file === codeViewFile)
    : undefined;

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <NavBar title={`#${number}`} backHref={`/${owner}/${repo}`} repo={repoSlug} />
        <div className="flex-1 px-4 py-6 space-y-4">
          <div className="skeleton h-8 w-48" />
          <div className="skeleton h-4 w-32" />
          <div className="skeleton h-32 w-full mt-4" />
          <div className="skeleton h-20 w-full" />
          <div className="skeleton h-20 w-full" />
        </div>
      </div>
    );
  }

  if (error || !pr) {
    return (
      <div className="min-h-screen flex flex-col">
        <NavBar title={`#${number}`} backHref={`/${owner}/${repo}`} repo={repoSlug} />
        <div className="flex-1 flex items-center justify-center px-6">
          <div className="text-center space-y-3">
            <p className="text-risk-high text-sm">Failed to load pull request</p>
            <p className="text-text-tertiary text-xs">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  // Build swipe panes
  const panes: React.ReactNode[] = [];
  const labels: string[] = [];

  if (analysis) {
    panes.push(
      <BriefingCard key="briefing" analysis={analysis.prAnalysis} pr={pr} />
    );
    labels.push("Briefing");

    for (const concept of analysis.prAnalysis.concepts) {
      panes.push(
        <ConceptCard
          key={concept.id}
          concept={concept}
          fileAnalyses={analysis.fileAnalyses}
          onViewCode={setCodeViewFile}
        />
      );
      labels.push(concept.label);
    }

    // Full diff as last card
    panes.push(
      <FullDiffCard
        key="full-diff"
        diffFiles={diffFiles}
        fileAnalyses={analysis.fileAnalyses}
      />
    );
    labels.push("Full Diff");
  } else {
    panes.push(
      <div key="loading" className="space-y-5">
        <div className="space-y-2">
          <h2 className="text-xl font-bold">{pr.title}</h2>
          <p className="text-text-secondary text-sm">
            #{pr.number} by {pr.author.login}
          </p>
        </div>

        {progress && (
          <div className="space-y-3">
            {/* Progress bar — only during file analysis phase */}
            {progress.phase === "files" && (
              <>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-text-secondary">Analyzing files...</span>
                    <span className="text-text-tertiary font-mono">
                      {progress.completed}/{progress.total}
                    </span>
                  </div>
                  <div className="h-1.5 bg-bg-card rounded-full overflow-hidden">
                    <div
                      className="h-full bg-accent rounded-full transition-all duration-300 ease-out"
                      style={{
                        width: `${progress.total > 0 ? (progress.completed / progress.total) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </div>
                {progress.currentFile && (
                  <p className="text-xs text-text-tertiary font-mono truncate">
                    {progress.currentFile}
                  </p>
                )}
              </>
            )}

            {progress.phase === "synthesizing" && (
              <div className="flex items-center gap-3 px-1">
                <div className="w-4 h-4 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                <p className="text-sm text-text-secondary">
                  Grouping into concepts...
                </p>
              </div>
            )}
          </div>
        )}

        {!progress && (
          <div className="bg-accent-subtle border border-border-subtle rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 border-2 border-accent border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-text-secondary">
                Starting analysis...
              </p>
            </div>
          </div>
        )}

        <div className="space-y-3">
          <div className="skeleton h-24 w-full" />
          <div className="skeleton h-24 w-full" />
        </div>
      </div>
    );
    labels.push("Analyzing...");
  }

  return (
    <div className="h-screen flex flex-col">
      <NavBar
        title={`#${number}`}
        backHref={`/${owner}/${repo}`}
        repo={repoSlug}
        right={
          <div className="flex items-center gap-3">
            <span className="text-xs text-text-tertiary font-mono">
              {pr.changedFiles} files
            </span>
            <ReviewDropdown repo={repoSlug} prNumber={prNum} />
          </div>
        }
      />
      <div className="flex-1 min-h-0">
        <SwipeView panes={panes} labels={labels} />
      </div>

      {activeCodeFile && codeViewFile && (
        <CodeView
          file={activeCodeFile}
          fileAnalysis={activeFileAnalysis}
          onClose={() => setCodeViewFile(null)}
        />
      )}

    </div>
  );
}
