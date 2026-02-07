# Skim

A mobile-first, AI-powered pull request review interface. Paste a GitHub PR URL and get a structured briefing with swipeable concept cards instead of raw file-by-file diffs.

Cow-themed because skim milk.

## How It Works

1. **Paste a GitHub URL** — enter a repo or PR link on the landing page
2. **Browse the queue** — see open PRs with risk levels, line counts, and authors
3. **Read the briefing** — AI summarizes the PR into key changes, intent, and stats
4. **Swipe through concepts** — changes are grouped into narrative themes (e.g. "Auth Flow", "DB Migration")
5. **Drill into code** — expand objects and members, view syntax-highlighted diffs with AI annotations
6. **Submit your review** — Pasteurize (approve), Moo (comment), or Graze (request changes)

The AI analysis happens in two phases: each file is analyzed independently in parallel, then a synthesis step groups everything into concepts. Progress streams to the UI in real-time.

## Quick Start

```bash
# Prerequisites
gh auth login                    # GitHub CLI must be authenticated
echo "OPENAI_API_KEY=sk-..." > .env.local

# Install & run
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) and paste a GitHub PR URL.

## Security

There is no authentication or authorization built into Skim. Anyone who can reach the server can use your `gh` CLI session and `OPENAI_API_KEY`. If you deploy this beyond localhost, secure it yourself — put it behind a VPN, reverse proxy with auth, or add your own auth layer.

## Tech Stack

- [Next.js 15](https://nextjs.org/) (App Router, TypeScript, Turbopack)
- [Tailwind CSS v4](https://tailwindcss.com/) with custom dark theme
- [OpenAI API](https://platform.openai.com/) (gpt-5.2) for two-phase analysis
- [GitHub CLI](https://cli.github.com/) (`gh`) for PR data
- IBM Plex Sans / Mono fonts

## Project Structure

```
app/
  page.tsx                      Landing page (URL input)
  [owner]/[repo]/
    page.tsx                    PR queue (server component)
    [number]/page.tsx           Review screen (client component)
  api/prs/                      API routes (list, detail, diff, analysis, review)

components/
  SwipeView.tsx                 Touch carousel with dot indicators
  BriefingCard.tsx              PR summary, stats, intent, key changes
  ConceptCard.tsx               Themed file groups with expandable objects
  CodeView.tsx                  Full-screen diff with AI annotations
  FullDiffCard.tsx              Complete file-by-file diff card
  DiffTable.tsx                 Shared diff renderer with syntax highlighting
  HighlightedCode.tsx           Syntax token coloring
  ReviewDropdown.tsx            Pasteurize / Moo / Graze review actions
  NavBar.tsx                    Sticky nav: logo → home, repo breadcrumb → queue
  badges.tsx                    Risk, size, kind badges

lib/
  ai.ts                         OpenAI integration (per-file + synthesis)
  gh.ts                         GitHub CLI wrapper with input sanitization
  diff-parser.ts                Unified diff parser
  syntax.ts                     Regex-based syntax tokenizer
  parse-input.ts                GitHub URL/input parser
  types.ts                      TypeScript interfaces

public/
  logo.png                      Cow head logo
```

## License

MIT
