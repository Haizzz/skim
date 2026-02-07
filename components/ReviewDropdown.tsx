"use client";

import { useState, useRef, useEffect } from "react";

type ReviewAction = "approve" | "comment" | "request_changes";

const ACTIONS: {
  key: ReviewAction;
  label: string;
  tooltip: string;
  style: string;
  activeStyle: string;
}[] = [
  {
    key: "approve",
    label: "Pasteurize",
    tooltip: "Approve",
    style: "text-risk-low border-risk-low hover:bg-risk-low/10",
    activeStyle: "bg-risk-low/15 border-risk-low text-risk-low",
  },
  {
    key: "comment",
    label: "Moo",
    tooltip: "Comment",
    style: "text-text-secondary border-border hover:bg-bg-hover",
    activeStyle: "bg-bg-hover border-text-secondary text-text",
  },
  {
    key: "request_changes",
    label: "Graze",
    tooltip: "Request changes",
    style: "text-risk-high border-risk-high hover:bg-risk-high/10",
    activeStyle: "bg-risk-high/15 border-risk-high text-risk-high",
  },
];

interface ReviewDropdownProps {
  repo: string;
  prNumber: number;
}

export default function ReviewDropdown({ repo, prNumber }: ReviewDropdownProps) {
  const [active, setActive] = useState<ReviewAction | null>(null);
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);
  const composeRef = useRef<HTMLDivElement>(null);

  const activeAction = active ? ACTIONS.find((a) => a.key === active)! : null;

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (composeRef.current && !composeRef.current.contains(e.target as Node)) {
        // Don't close if clicking the action buttons themselves
        const target = e.target as HTMLElement;
        if (target.closest("[data-review-btn]")) return;
        setActive(null);
        setBody("");
        setResult(null);
      }
    }
    if (active) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [active]);

  async function handleSubmit() {
    if (!active) return;
    setSubmitting(true);
    setResult(null);

    try {
      const res = await fetch(`/api/prs/${prNumber}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repo, action: active, body }),
      });

      const data = await res.json();
      if (res.ok) {
        setResult({ ok: true, message: "Submitted!" });
        setTimeout(() => {
          setActive(null);
          setBody("");
          setResult(null);
        }, 1500);
      } else {
        setResult({ ok: false, message: data.error || "Failed" });
      }
    } catch {
      setResult({ ok: false, message: "Network error" });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      {/* Three text buttons */}
      <div className="flex items-center gap-1.5">
        {ACTIONS.map((a) => (
          <div key={a.key} className="relative group">
            <button
              data-review-btn
              onClick={() => {
                if (active === a.key) {
                  setActive(null);
                  setBody("");
                  setResult(null);
                } else {
                  setActive(a.key);
                  setResult(null);
                }
              }}
              className={`text-xs px-2.5 py-1.5 font-semibold rounded-lg border transition-colors ${
                active === a.key ? a.activeStyle : a.style
              }`}
            >
              {a.label}
            </button>
            {/* Tooltip below */}
            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1.5 px-2 py-1 bg-bg-card border border-border rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
              <div className="text-[10px] text-text-tertiary">{a.tooltip}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Compose bar below navbar */}
      {active && activeAction && (
        <div
          ref={composeRef}
          className="absolute left-0 right-0 top-full z-40 border-b border-border-subtle bg-bg-raised px-4 py-3 space-y-2"
        >
          <div className="text-xs text-text-tertiary">
            {activeAction.tooltip}
          </div>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder={
              active === "comment"
                ? "Write your comment..."
                : "Optional comment..."
            }
            rows={3}
            autoFocus
            className="w-full bg-bg-card border border-border-subtle rounded-lg px-3 py-2 text-sm text-text placeholder:text-text-tertiary focus:outline-none focus:border-accent transition-colors resize-none"
          />
          <div className="flex items-center justify-between">
            {result ? (
              <p
                className={`text-xs ${result.ok ? "text-risk-low" : "text-risk-high"}`}
              >
                {result.message}
              </p>
            ) : (
              <button
                onClick={() => {
                  setActive(null);
                  setBody("");
                  setResult(null);
                }}
                className="text-xs text-text-tertiary hover:text-text transition-colors"
              >
                Cancel
              </button>
            )}
            <button
              onClick={handleSubmit}
              disabled={submitting || (active === "comment" && !body.trim())}
              className="text-xs px-4 py-1.5 bg-accent hover:bg-accent-hover text-text-inverse font-semibold rounded-lg transition-colors disabled:opacity-40"
            >
              {submitting ? "..." : "\u{1F42E} Moove along"}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
