import { PRAnalysis, PRDetail } from "@/lib/types";
import { RiskBadge } from "./badges";

interface BriefingCardProps {
  analysis: PRAnalysis;
  pr: PRDetail;
}

export default function BriefingCard({ analysis, pr }: BriefingCardProps) {
  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <RiskBadge level={analysis.riskLevel} />
          <span className="text-text-tertiary text-sm">#{pr.number}</span>
        </div>
        <h2 className="text-xl font-bold leading-tight">{pr.title}</h2>
        <p className="text-text-secondary text-sm">{pr.author.login}</p>
      </div>

      {/* Intent */}
      {analysis.intent && (
        <div className="bg-accent-subtle border border-border-subtle rounded-xl p-4">
          <p className="text-sm leading-relaxed">{analysis.intent}</p>
        </div>
      )}

      {/* Stats */}
      <div className="flex gap-4">
        <Stat label="Files" value={pr.changedFiles} />
        <Stat label="Added" value={`+${pr.additions}`} color="text-diff-add-text" />
        <Stat label="Removed" value={`-${pr.deletions}`} color="text-diff-remove-text" />
        <Stat label="Concepts" value={analysis.concepts.length} />
      </div>

      {/* Key Changes */}
      {analysis.keyChanges.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-xs font-semibold text-text-tertiary uppercase tracking-wider">
            Key Changes
          </h3>
          <ul className="space-y-1.5">
            {analysis.keyChanges.map((c, i) => (
              <li key={i} className="text-sm text-text-secondary flex gap-2">
                <span className="text-accent shrink-0">-</span>
                {c}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function Stat({
  label,
  value,
  color,
}: {
  label: string;
  value: string | number;
  color?: string;
}) {
  return (
    <div className="space-y-0.5">
      <div className={`text-lg font-bold font-mono ${color || "text-text"}`}>
        {value}
      </div>
      <div className="text-[10px] text-text-tertiary uppercase tracking-wider">
        {label}
      </div>
    </div>
  );
}
