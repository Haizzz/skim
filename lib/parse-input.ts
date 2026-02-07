export interface ParsedInput {
  owner: string;
  repo: string;
  number?: number;
}

export function parseGithubInput(input: string): ParsedInput | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  // Full PR URL: https://github.com/OWNER/REPO/pull/NUMBER
  const prUrlMatch = trimmed.match(
    /(?:https?:\/\/)?github\.com\/([^/]+)\/([^/]+)\/pull\/(\d+)/
  );
  if (prUrlMatch) {
    return {
      owner: prUrlMatch[1],
      repo: prUrlMatch[2],
      number: parseInt(prUrlMatch[3], 10),
    };
  }

  // Repo URL: https://github.com/OWNER/REPO
  const repoUrlMatch = trimmed.match(
    /(?:https?:\/\/)?github\.com\/([^/]+)\/([^/\s]+)/
  );
  if (repoUrlMatch) {
    return {
      owner: repoUrlMatch[1],
      repo: repoUrlMatch[2].replace(/\.git$/, ""),
    };
  }

  // OWNER/REPO#NUMBER
  const hashMatch = trimmed.match(/^([^/\s]+)\/([^#\s]+)#(\d+)$/);
  if (hashMatch) {
    return {
      owner: hashMatch[1],
      repo: hashMatch[2],
      number: parseInt(hashMatch[3], 10),
    };
  }

  // OWNER/REPO/NUMBER
  const slashNumMatch = trimmed.match(/^([^/\s]+)\/([^/\s]+)\/(\d+)$/);
  if (slashNumMatch) {
    return {
      owner: slashNumMatch[1],
      repo: slashNumMatch[2],
      number: parseInt(slashNumMatch[3], 10),
    };
  }

  // OWNER/REPO
  const ownerRepoMatch = trimmed.match(/^([^/\s]+)\/([^/\s]+)$/);
  if (ownerRepoMatch) {
    return {
      owner: ownerRepoMatch[1],
      repo: ownerRepoMatch[2],
    };
  }

  return null;
}
