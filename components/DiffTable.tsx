import { DiffFile, FileAnalysis } from "@/lib/types";
import HighlightedCode from "./HighlightedCode";

interface DiffTableProps {
  file: DiffFile;
  annotations?: Map<number, string>;
}

export default function DiffTable({ file, annotations }: DiffTableProps) {
  return (
    <table className="w-full text-xs font-mono">
      <tbody>
        {file.lines.map((line, i) => {
          const lineNum = line.newLineNumber ?? line.oldLineNumber;
          const annotation =
            annotations && lineNum ? annotations.get(lineNum) : undefined;

          return (
            <tr key={i}>
              {line.type === "header" ? (
                <td
                  colSpan={3}
                  className="px-4 py-1.5 text-text-tertiary bg-bg-card font-medium sticky top-0"
                >
                  {line.content}
                </td>
              ) : (
                <>
                  <td className="w-[1px] whitespace-nowrap text-right pr-2 pl-4 py-px text-text-tertiary select-none align-top">
                    {line.oldLineNumber ?? ""}
                  </td>
                  <td className="w-[1px] whitespace-nowrap text-right pr-3 py-px text-text-tertiary select-none align-top">
                    {line.newLineNumber ?? ""}
                  </td>
                  <td
                    className={`pr-4 py-px whitespace-pre-wrap break-all ${
                      line.type === "add"
                        ? "bg-diff-add-bg text-diff-add-text"
                        : line.type === "remove"
                          ? "bg-diff-remove-bg text-diff-remove-text"
                          : "text-text-secondary"
                    }`}
                  >
                    <span className="select-none text-text-tertiary mr-1">
                      {line.type === "add"
                        ? "+"
                        : line.type === "remove"
                          ? "-"
                          : " "}
                    </span>
                    {line.type === "context" ? (
                      <HighlightedCode code={line.content} />
                    ) : (
                      line.content
                    )}
                    {annotation && (
                      <div className="mt-1 mb-1 px-2 py-1.5 rounded-md bg-accent-subtle border border-accent/30 text-accent text-xs font-sans leading-snug">
                        {annotation}
                      </div>
                    )}
                  </td>
                </>
              )}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

export function buildAnnotationMap(
  fileAnalysis?: FileAnalysis,
  enabled?: boolean
): Map<number, string> | undefined {
  if (!fileAnalysis || !enabled) return undefined;
  const map = new Map<number, string>();
  for (const a of fileAnalysis.annotations) {
    map.set(a.lineNumber, a.annotation);
  }
  return map;
}
