import { DiffFile, DiffLine } from "./types";

export function parseDiff(rawDiff: string): DiffFile[] {
  const files: DiffFile[] = [];
  const fileSections = rawDiff.split(/^diff --git /m).filter(Boolean);

  for (const section of fileSections) {
    const lines = section.split("\n");

    // Parse file paths from the first line: a/path b/path
    const pathMatch = lines[0]?.match(/a\/(.+?) b\/(.+)/);
    if (!pathMatch) continue;

    const oldPath = pathMatch[1];
    const newPath = pathMatch[2];

    const diffLines: DiffLine[] = [];
    let oldLine = 0;
    let newLine = 0;

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];

      // Hunk header: @@ -old,count +new,count @@
      const hunkMatch = line.match(/^@@ -(\d+)(?:,\d+)? \+(\d+)(?:,\d+)? @@/);
      if (hunkMatch) {
        oldLine = parseInt(hunkMatch[1], 10);
        newLine = parseInt(hunkMatch[2], 10);
        diffLines.push({ type: "header", content: line });
        continue;
      }

      // Skip metadata lines (index, ---, +++)
      if (
        line.startsWith("index ") ||
        line.startsWith("--- ") ||
        line.startsWith("+++ ") ||
        line.startsWith("new file") ||
        line.startsWith("deleted file") ||
        line.startsWith("old mode") ||
        line.startsWith("new mode") ||
        line.startsWith("similarity") ||
        line.startsWith("rename") ||
        line.startsWith("Binary")
      ) {
        continue;
      }

      if (line.startsWith("+")) {
        diffLines.push({
          type: "add",
          content: line.slice(1),
          newLineNumber: newLine++,
        });
      } else if (line.startsWith("-")) {
        diffLines.push({
          type: "remove",
          content: line.slice(1),
          oldLineNumber: oldLine++,
        });
      } else if (line.startsWith(" ") || line === "") {
        diffLines.push({
          type: "context",
          content: line.startsWith(" ") ? line.slice(1) : line,
          oldLineNumber: oldLine++,
          newLineNumber: newLine++,
        });
      }
    }

    files.push({
      path: newPath,
      oldPath: oldPath !== newPath ? oldPath : undefined,
      lines: diffLines,
      rawDiff: "diff --git " + section,
    });
  }

  return files;
}

export function splitDiffByFile(
  rawDiff: string
): { fileName: string; diff: string }[] {
  const sections = rawDiff.split(/^(?=diff --git )/m).filter(Boolean);
  return sections.map((section) => {
    const pathMatch = section.match(/diff --git a\/.+? b\/(.+)/);
    return {
      fileName: pathMatch?.[1] ?? "unknown",
      diff: section,
    };
  });
}
