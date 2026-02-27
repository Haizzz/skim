"use client";

import { useState } from "react";
import { FileAnalysis } from "@/lib/types";
import { SizeBadge, KindTag } from "./badges";

interface ConceptCardProps {
  concept: {
    id: string;
    label: string;
    icon: string;
    size: "S" | "M" | "L" | "XL";
    summary: string;
    fileIds: string[];
  };
  fileAnalyses: FileAnalysis[];
  onViewCode: (file: string) => void;
}

export default function ConceptCard({
  concept,
  fileAnalyses,
  onViewCode,
}: ConceptCardProps) {
  const relevantFiles = fileAnalyses.filter((f) =>
    concept.fileIds.includes(f.file)
  );

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{concept.icon}</span>
          <h2 className="text-xl font-bold">{concept.label}</h2>
          <SizeBadge size={concept.size} />
        </div>
      </div>

      {/* Summary */}
      <div className="bg-accent-subtle border border-border-subtle rounded-xl p-4">
        <p className="text-sm leading-relaxed">{concept.summary}</p>
      </div>

      {/* File objects */}
      <div className="space-y-3">
        {relevantFiles.map((file) => (
          <FileObjectCard
            key={file.file}
            file={file}
            onViewCode={onViewCode}
          />
        ))}
      </div>
    </div>
  );
}

function FileObjectCard({
  file,
  onViewCode,
}: {
  file: FileAnalysis;
  onViewCode: (file: string) => void;
}) {
  const [expanded, setExpanded] = useState(true);

  return (
    <div className="card overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left px-4 py-3 flex items-center justify-between hover:bg-bg-hover transition-colors"
      >
        <div className="min-w-0">
          <p className="text-sm font-mono text-text truncate">
            {file.file.split("/").pop()}
          </p>
          <p className="text-xs text-text-tertiary break-words">{file.summary}</p>
        </div>
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`shrink-0 ml-2 text-text-tertiary transition-transform ${expanded ? "rotate-90" : ""}`}
        >
          <path d="M6 4l4 4-4 4" />
        </svg>
      </button>

      {expanded && (
        <div className="border-t border-border-subtle">
          {file.objects.map((obj, i) => (
            <ObjectItem
              key={i}
              obj={obj}
              fileName={file.file}
              onViewCode={onViewCode}
            />
          ))}

          {file.objects.length === 0 && (
            <div className="px-4 py-3 text-xs text-text-tertiary">
              No notable objects
            </div>
          )}

          <button
            onClick={() => onViewCode(file.file)}
            className="w-full px-4 py-2.5 text-xs text-accent hover:bg-bg-hover transition-colors border-t border-border-subtle font-medium text-left"
          >
            View diff &rsaquo;
          </button>
        </div>
      )}
    </div>
  );
}

function ObjectItem({
  obj,
  fileName,
  onViewCode,
}: {
  obj: FileAnalysis["objects"][number];
  fileName: string;
  onViewCode: (file: string) => void;
}) {
  const [expanded, setExpanded] = useState(true);

  return (
    <div className="border-t border-border-subtle">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left px-4 py-2.5 flex items-center gap-2 hover:bg-bg-hover transition-colors"
      >
        <KindTag kind={obj.kind} />
        <span className="text-sm font-mono text-text">{obj.name}</span>
        {obj.members?.length > 0 && (
          <svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`ml-auto text-text-tertiary transition-transform ${expanded ? "rotate-90" : ""}`}
          >
            <path d="M4 3l3 3-3 3" />
          </svg>
        )}
      </button>

      <p className="px-4 pb-2 text-xs text-text-tertiary">{obj.desc}</p>

      {expanded && obj.members && obj.members.length > 0 && (
        <div className="bg-bg-raised">
          {obj.members.map((m, i) => (
            <div
              key={i}
              className="px-4 py-2 pl-8 border-t border-border-subtle"
            >
              <div className="flex items-center gap-2">
                <KindTag kind={m.kind} />
                <span className="text-xs font-mono text-text-secondary">
                  {m.name}
                </span>
                <button
                  onClick={() => onViewCode(fileName)}
                  className="ml-auto text-xs text-accent hover:text-accent-hover"
                >
                  code &rsaquo;
                </button>
              </div>
              {m.desc && (
                <p className="text-xs text-text-tertiary mt-1 pl-7">
                  {m.desc}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
