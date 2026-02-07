"use client";

import { useState } from "react";
import { DiffFile, FileAnalysis } from "@/lib/types";
import DiffTable, { buildAnnotationMap } from "./DiffTable";
import { StatusDot } from "./badges";

interface FullDiffCardProps {
  diffFiles: DiffFile[];
  fileAnalyses?: FileAnalysis[];
}

export default function FullDiffCard({ diffFiles, fileAnalyses }: FullDiffCardProps) {
  const [showAnnotations, setShowAnnotations] = useState(true);

  const analysisMap = new Map<string, FileAnalysis>();
  if (fileAnalyses) {
    for (const fa of fileAnalyses) {
      analysisMap.set(fa.file, fa);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Full Diff</h2>
        {fileAnalyses && (
          <button
            onClick={() => setShowAnnotations(!showAnnotations)}
            className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
              showAnnotations
                ? "bg-accent-subtle border-accent text-accent"
                : "border-border text-text-tertiary hover:text-text"
            }`}
          >
            AI {showAnnotations ? "on" : "off"}
          </button>
        )}
      </div>

      <p className="text-sm text-text-secondary">
        {diffFiles.length} file{diffFiles.length !== 1 ? "s" : ""} changed
      </p>

      <div className="space-y-3">
        {diffFiles.map((file) => (
          <FileDiffSection
            key={file.path}
            file={file}
            fileAnalysis={analysisMap.get(file.path)}
            showAnnotations={showAnnotations}
          />
        ))}
      </div>
    </div>
  );
}

function FileDiffSection({
  file,
  fileAnalysis,
  showAnnotations,
}: {
  file: DiffFile;
  fileAnalysis?: FileAnalysis;
  showAnnotations: boolean;
}) {
  const [expanded, setExpanded] = useState(true);
  const annotations = buildAnnotationMap(fileAnalysis, showAnnotations);

  const adds = file.lines.filter((l) => l.type === "add").length;
  const removes = file.lines.filter((l) => l.type === "remove").length;
  const status = removes === 0 ? "added" : adds === 0 ? "deleted" : "modified";

  return (
    <div className="card overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-bg-hover transition-colors"
      >
        <StatusDot status={status} />
        <span className="text-sm font-mono text-text truncate flex-1">
          {file.path}
        </span>
        <span className="text-xs text-text-tertiary shrink-0">
          <span className="text-diff-add-text">+{adds}</span>
          {" "}
          <span className="text-diff-remove-text">-{removes}</span>
        </span>
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`shrink-0 text-text-tertiary transition-transform ${expanded ? "rotate-90" : ""}`}
        >
          <path d="M6 4l4 4-4 4" />
        </svg>
      </button>

      {expanded && (
        <div className="border-t border-border-subtle overflow-x-auto">
          <DiffTable file={file} annotations={annotations} />
        </div>
      )}
    </div>
  );
}
