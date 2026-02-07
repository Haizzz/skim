import OpenAI from "openai";
import { FileAnalysis, PRAnalysis } from "./types";

const openai = new OpenAI();

async function jsonChat<T>(system: string, user: string): Promise<T> {
  const response = await openai.chat.completions.create({
    model: "gpt-5.2",
    response_format: { type: "json_object" },
    temperature: 0.2,
    messages: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
  });

  const content = response.choices[0]?.message?.content;
  if (!content) throw new Error("No response from OpenAI");
  return JSON.parse(content);
}

export function analyzeFile(
  fileDiff: string,
  fileName: string,
  prTitle: string
): Promise<FileAnalysis> {
  return jsonChat(
    `You analyze a single file's diff from a pull request. Return a JSON object with this exact schema:
{
  "file": "string (file path)",
  "summary": "string (1-2 sentence description of changes)",
  "objects": [
    {
      "name": "string (function/class/module name)",
      "kind": "string (fn|class|mod|cfg|type|hook|test|style|route|component)",
      "desc": "string (1 sentence description)",
      "members": [
        { "name": "string", "kind": "string", "desc": "string" }
      ]
    }
  ],
  "annotations": [
    { "lineNumber": number, "annotation": "string (brief note)" }
  ],
  "riskNotes": ["string (risk specific to this file)"],
  "decisions": ["string (design decision visible in this file)"]
}

Guidelines:
- Only annotate lines that are surprising, risky, or non-obvious
- Keep descriptions to 1-2 sentences max
- "objects" are the top-level code constructs changed (functions, classes, components, etc.)
- "members" are sub-items within objects (methods, properties, parameters, etc.)
- Use the kind abbreviations: fn, class, mod, cfg, type, hook, test, style, route, component
- If a file is trivial (config, formatting), keep objects/annotations minimal`,
    `PR Title: ${prTitle}\nFile: ${fileName}\n\nDiff:\n${fileDiff}`
  );
}

export function synthesizePR(
  fileAnalyses: FileAnalysis[],
  prTitle: string,
  prBody: string
): Promise<PRAnalysis> {
  return jsonChat(
    `You synthesize per-file analyses of a pull request into a high-level narrative review. Return a JSON object with this exact schema:
{
  "summary": "string (2-3 sentence PR summary)",
  "riskLevel": "low" | "medium" | "high",
  "keyChanges": ["string (most important changes, what was done)"],
  "intent": "string (1-2 sentences: why this PR exists, what it aims to achieve)",
  "concepts": [
    {
      "id": "string (kebab-case slug)",
      "label": "string (short concept name)",
      "icon": "string (single emoji)",
      "size": "S" | "M" | "L" | "XL",
      "summary": "string (1-2 sentence concept summary)",
      "fileIds": ["string (file paths belonging to this concept)"]
    }
  ]
}

Guidelines:
- Group files into conceptual themes (e.g. "Auth Flow", "Database Migration", "UI Updates")
- Order concepts in narrative reading order (most important/foundational first)
- Size based on scope: S (1-2 files, small changes), M (2-4 files), L (4-8 files), XL (8+ files or major changes)
- keyChanges: the most important concrete changes made (what was added, modified, removed)
- intent: the purpose or goal behind this PR (why it exists)
- Keep everything concise`,
    `PR Title: ${prTitle}\nPR Description: ${prBody || "(no description)"}\n\nFile Analyses:\n${JSON.stringify(fileAnalyses, null, 2)}`
  );
}
