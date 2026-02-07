import Link from "next/link";
import { PRListItem } from "@/lib/types";
import { RiskBadge, computeRiskLevel } from "./badges";

function timeAgo(dateStr: string): string {
  const seconds = Math.floor(
    (Date.now() - new Date(dateStr).getTime()) / 1000
  );
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

interface QueueListProps {
  prs: PRListItem[];
  owner: string;
  repo: string;
}

export default function QueueList({ prs, owner, repo }: QueueListProps) {
  if (prs.length === 0) {
    return (
      <div className="flex items-center justify-center py-20 text-text-tertiary">
        No open pull requests
      </div>
    );
  }

  return (
    <div className="divide-y divide-border-subtle">
      {prs.map((pr) => {
        const risk = computeRiskLevel(
          pr.changedFiles,
          pr.additions + pr.deletions
        );
        return (
          <Link
            key={pr.number}
            href={`/${owner}/${repo}/${pr.number}`}
            className="block px-4 py-4 hover:bg-bg-hover transition-colors"
          >
            <div className="flex items-start gap-3">
              <div className="shrink-0 pt-0.5">
                <RiskBadge level={risk} />
              </div>
              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-text-tertiary text-sm font-mono">
                    #{pr.number}
                  </span>
                  <h3 className="text-text font-medium truncate text-sm">
                    {pr.title}
                  </h3>
                </div>
                <div className="flex items-center gap-3 text-xs text-text-tertiary">
                  <span>{pr.author.login}</span>
                  <span>
                    <span className="text-diff-add-text">+{pr.additions}</span>
                    {" / "}
                    <span className="text-diff-remove-text">
                      -{pr.deletions}
                    </span>
                  </span>
                  <span>
                    {pr.changedFiles} file{pr.changedFiles !== 1 ? "s" : ""}
                  </span>
                  <span>{timeAgo(pr.createdAt)}</span>
                </div>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
