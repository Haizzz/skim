export interface PRListItem {
  number: number;
  title: string;
  author: { login: string };
  additions: number;
  deletions: number;
  changedFiles: number;
  createdAt: string;
}

export type PRSize = "S" | "M" | "L" | "XL";

export interface PRDetail {
  number: number;
  title: string;
  author: { login: string };
  body: string;
  additions: number;
  deletions: number;
  changedFiles: number;
  createdAt: string;
  headRefOid: string;
  files: { path: string; additions: number; deletions: number }[];
}

export interface DiffLine {
  type: "add" | "remove" | "context" | "header";
  content: string;
  oldLineNumber?: number;
  newLineNumber?: number;
}

export interface DiffFile {
  path: string;
  oldPath?: string;
  lines: DiffLine[];
  rawDiff: string;
}

export interface FileAnalysis {
  file: string;
  summary: string;
  objects: {
    name: string;
    kind: string;
    desc: string;
    members: {
      name: string;
      kind: string;
      desc: string;
    }[];
  }[];
  annotations: {
    lineNumber: number;
    annotation: string;
  }[];
  riskNotes: string[];
  decisions: string[];
}

export interface PRAnalysis {
  size: PRSize;
  keyChanges: string[];
  intent: string;
  concepts: {
    id: string;
    label: string;
    icon: string;
    size: "S" | "M" | "L" | "XL";
    summary: string;
    fileIds: string[];
  }[];
}

export interface AnalysisResult {
  prAnalysis: PRAnalysis;
  fileAnalyses: FileAnalysis[];
}
