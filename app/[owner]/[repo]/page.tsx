import { listPRs } from "@/lib/gh";
import { PRListItem } from "@/lib/types";
import NavBar from "@/components/NavBar";
import QueueList from "@/components/QueueList";

interface Props {
  params: Promise<{ owner: string; repo: string }>;
}

export default async function QueuePage({ params }: Props) {
  const { owner, repo } = await params;
  const repoSlug = `${owner}/${repo}`;

  let prs: PRListItem[] = [];
  let error: string | null = null;

  try {
    prs = listPRs(repoSlug);
  } catch (e: unknown) {
    error = e instanceof Error ? e.message : "Failed to load PRs";
    prs = [];
  }

  return (
    <div className="min-h-screen flex flex-col">
      <NavBar title="Pull Requests" repo={repoSlug} />
      {error ? (
        <div className="flex-1 flex items-center justify-center px-6">
          <div className="text-center space-y-3">
            <p className="text-risk-high text-sm">Failed to load pull requests</p>
            <p className="text-text-tertiary text-xs max-w-sm">{error}</p>
            <p className="text-text-tertiary text-xs">
              Make sure the <code className="font-mono bg-bg-card px-1.5 py-0.5 rounded">gh</code> CLI is installed and authenticated.
            </p>
          </div>
        </div>
      ) : (
        <QueueList prs={prs} owner={owner} repo={repo} />
      )}
    </div>
  );
}
