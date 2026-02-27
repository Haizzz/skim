"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { parseGithubInput } from "@/lib/parse-input";
import ThemeToggle from "@/components/ThemeToggle";

const STORAGE_KEY = "pr-review-recent";

interface RecentItem {
  label: string;
  path: string;
}

export default function LandingPage() {
  const router = useRouter();
  const [input, setInput] = useState("");
  const [error, setError] = useState("");
  const [recents, setRecents] = useState<RecentItem[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setRecents(JSON.parse(stored));
    } catch {}
  }, []);

  function saveRecent(item: RecentItem) {
    const updated = [item, ...recents.filter((r) => r.path !== item.path)].slice(0, 5);
    setRecents(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const parsed = parseGithubInput(input);
    if (!parsed) {
      setError("Could not parse input. Try a GitHub URL or owner/repo format.");
      return;
    }

    const path = parsed.number
      ? `/${parsed.owner}/${parsed.repo}/${parsed.number}`
      : `/${parsed.owner}/${parsed.repo}`;

    saveRecent({
      label: parsed.number
        ? `${parsed.owner}/${parsed.repo}#${parsed.number}`
        : `${parsed.owner}/${parsed.repo}`,
      path,
    });

    router.push(path);
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 relative">
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-lg space-y-8">
        <div className="text-center space-y-3">
          <img src="/logo.png" alt="Skim" className="w-20 h-20 mx-auto" />
          <h1 className="text-4xl font-bold tracking-tight">Skim</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Paste a GitHub URL or enter owner/repo"
              className="w-full bg-bg-card border border-border rounded-xl px-5 py-4 text-text placeholder:text-text-tertiary focus:outline-none focus:border-accent transition-colors text-lg"
              autoFocus
            />
          </div>
          {error && (
            <p className="text-risk-high text-sm px-1">{error}</p>
          )}
          <button
            type="submit"
            className="w-full bg-accent hover:bg-accent-hover text-white font-semibold rounded-xl py-4 transition-colors text-lg"
          >
            Skim it
          </button>
        </form>

        <div className="space-y-1 text-sm">
          <p className="text-text-tertiary px-1">
            Examples: <span className="text-text-secondary">vercel/next.js</span>
            {" · "}
            <span className="text-text-secondary">facebook/react#12345</span>
            {" · "}
            <span className="text-text-secondary">https://github.com/owner/repo/pull/42</span>
          </p>
        </div>

        {recents.length > 0 && (
          <div className="space-y-3">
            <p className="text-text-tertiary text-sm px-1">Recent</p>
            <div className="space-y-2">
              {recents.map((item) => (
                <button
                  key={item.path}
                  onClick={() => router.push(item.path)}
                  className="w-full text-left bg-bg-card hover:bg-bg-hover border border-border-subtle rounded-xl px-5 py-3 text-text-secondary hover:text-text transition-colors"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
