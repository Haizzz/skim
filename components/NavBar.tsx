"use client";

import { useRouter } from "next/navigation";

interface NavBarProps {
  title: string;
  backHref?: string;
  repo?: string;
  right?: React.ReactNode;
}

export default function NavBar({ title, backHref, repo, right }: NavBarProps) {
  const router = useRouter();

  return (
    <nav className="sticky top-0 z-50 bg-bg/80 backdrop-blur-xl border-b border-border-subtle relative">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3 min-w-0">
          {backHref && (
            <button
              onClick={() => router.push(backHref)}
              className="text-text-secondary hover:text-text transition-colors shrink-0"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 4l-6 6 6 6" />
              </svg>
            </button>
          )}
          <button onClick={() => router.push("/")} className="shrink-0">
            <img src="/logo.png" alt="Skim" className="w-6 h-6" />
          </button>
          {repo && (
            <button
              onClick={() => router.push(`/${repo}`)}
              className="text-xs text-text-tertiary hover:text-text font-mono transition-colors truncate"
            >
              {repo}
            </button>
          )}
          <h1 className="text-sm font-semibold truncate">{title}</h1>
        </div>
        {right && <div className="shrink-0">{right}</div>}
      </div>
    </nav>
  );
}
