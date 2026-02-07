import { execSync } from "child_process";
import { PRListItem, PRDetail } from "./types";

function sanitizeRepo(input: string): string {
  // Only allow alphanumeric, hyphens, underscores, dots, and slashes
  if (!/^[a-zA-Z0-9._-]+\/[a-zA-Z0-9._-]+$/.test(input)) {
    throw new Error(`Invalid repo format: ${input}`);
  }
  return input;
}

function sanitizeNumber(input: number): number {
  const n = Math.floor(input);
  if (n <= 0 || n > 999999) {
    throw new Error(`Invalid PR number: ${input}`);
  }
  return n;
}

function exec(command: string): string {
  return execSync(command, {
    encoding: "utf-8",
    timeout: 30000,
    maxBuffer: 10 * 1024 * 1024,
  });
}

export function listPRs(repo: string): PRListItem[] {
  const safeRepo = sanitizeRepo(repo);
  const json = exec(
    `gh pr list --repo '${safeRepo}' --json number,title,author,additions,deletions,changedFiles,createdAt --limit 20`
  );
  return JSON.parse(json);
}

export function getPR(repo: string, number: number): PRDetail {
  const safeRepo = sanitizeRepo(repo);
  const safeNum = sanitizeNumber(number);
  const json = exec(
    `gh pr view ${safeNum} --repo '${safeRepo}' --json number,title,author,body,additions,deletions,changedFiles,createdAt,headRefOid,files`
  );
  return JSON.parse(json);
}

export function getDiff(repo: string, number: number): string {
  const safeRepo = sanitizeRepo(repo);
  const safeNum = sanitizeNumber(number);
  return exec(`gh pr diff ${safeNum} --repo '${safeRepo}'`);
}
