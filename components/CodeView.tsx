"use client";

import { useState } from "react";
import { DiffFile, FileAnalysis } from "@/lib/types";
import DiffTable, { buildAnnotationMap } from "./DiffTable";

interface CodeViewProps {
  file: DiffFile;
  fileAnalysis?: FileAnalysis;
  onClose: () => void;
}

export default function CodeView({ file, fileAnalysis, onClose }: CodeViewProps) {
  const [showAnnotations, setShowAnnotations] = useState(true);
  const annotations = buildAnnotationMap(fileAnalysis, showAnnotations);

  return (
    <div className="fixed inset-0 z-50 bg-bg-overlay flex flex-col">
      {/* Header */}
      <div className="shrink-0 flex items-center justify-between px-4 py-3 border-b border-border-subtle bg-bg/80 backdrop-blur-xl">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onClose}
            className="text-text-secondary hover:text-text transition-colors shrink-0"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M15 5L5 15M5 5l10 10" />
            </svg>
          </button>
          <span className="text-sm font-mono text-text truncate">
            {file.path}
          </span>
        </div>
        {fileAnalysis && fileAnalysis.annotations.length > 0 && (
          <button
            onClick={() => setShowAnnotations(!showAnnotations)}
            className={`shrink-0 text-xs px-3 py-1.5 rounded-lg border transition-colors ${
              showAnnotations
                ? "bg-accent-subtle border-accent text-accent"
                : "border-border text-text-tertiary hover:text-text"
            }`}
          >
            AI {showAnnotations ? "on" : "off"}
          </button>
        )}
      </div>

      {/* Diff content */}
      <div className="flex-1 overflow-auto">
        <DiffTable file={file} annotations={annotations} />
      </div>
    </div>
  );
}
