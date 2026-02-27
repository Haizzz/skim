import { PRSize } from "@/lib/types";

export function SizeBadge({ size }: { size: PRSize }) {
  const colors: Record<string, string> = {
    S: "bg-size-s/20 text-size-s",
    M: "bg-size-m/20 text-size-m",
    L: "bg-size-l/20 text-size-l",
    XL: "bg-size-xl/20 text-size-xl",
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-mono font-semibold ${colors[size]}`}
    >
      {size}
    </span>
  );
}

export function KindTag({ kind }: { kind: string }) {
  return (
    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-mono font-medium bg-accent-subtle text-accent uppercase tracking-wider">
      {kind}
    </span>
  );
}

export function StatusDot({
  status,
}: {
  status: "added" | "modified" | "deleted";
}) {
  const colors: Record<string, string> = {
    added: "bg-risk-low",
    modified: "bg-risk-medium",
    deleted: "bg-risk-high",
  };

  return <span className={`inline-block w-2 h-2 rounded-full ${colors[status]}`} />;
}

export function computePRSize(totalLines: number): PRSize {
  if (totalLines > 500) return "XL";
  if (totalLines > 200) return "L";
  if (totalLines > 50) return "M";
  return "S";
}
