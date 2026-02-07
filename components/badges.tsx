import { RiskLevel } from "@/lib/types";

export function SizeBadge({ size }: { size: "S" | "M" | "L" | "XL" }) {
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

export function RiskBadge({ level }: { level: RiskLevel }) {
  const config: Record<
    RiskLevel,
    { bg: string; text: string; label: string }
  > = {
    low: { bg: "bg-risk-low/15", text: "text-risk-low", label: "Low" },
    medium: {
      bg: "bg-risk-medium/15",
      text: "text-risk-medium",
      label: "Med",
    },
    high: { bg: "bg-risk-high/15", text: "text-risk-high", label: "High" },
  };

  const { bg, text, label } = config[level];
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold ${bg} ${text}`}
    >
      {label}
    </span>
  );
}

export function KindTag({ kind }: { kind: string }) {
  return (
    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-accent-subtle text-accent uppercase tracking-wider">
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

export function computeRiskLevel(
  changedFiles: number,
  totalLines: number
): RiskLevel {
  if (changedFiles > 10 || totalLines > 500) return "high";
  if (changedFiles > 5 || totalLines > 200) return "medium";
  return "low";
}
