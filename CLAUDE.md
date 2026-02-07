# Skim

AI-powered pull request review interface. Uses `gh` CLI for GitHub data, OpenAI for analysis, and Next.js for the web app. Instead of reviewing diffs file-by-file, the AI restructures changes into narrative concepts that can be swiped through like a briefing.

Cow-themed vocabulary: **Pasteurize** (approve), **Moo** (comment), **Graze** (request changes), **Moove along** (submit).

## Tech Stack

- **Next.js 15** (App Router, TypeScript, Turbopack)
- **Tailwind CSS v4** with custom dark theme tokens in `globals.css`
- **OpenAI SDK** (`gpt-5.2`) for two-phase AI analysis
- **GitHub CLI** (`gh`) called via `child_process` from API routes
- **IBM Plex Sans / Mono** fonts from Google Fonts

## Architecture

### Routing

```
/                              → Landing page: paste a GH URL or enter owner/repo
/[owner]/[repo]                → PR Queue screen (server component)
/[owner]/[repo]/[number]       → Review screen (client component, swipe UI)
```

### API Routes

```
GET  /api/prs?repo=owner/repo                   → List open PRs
GET  /api/prs/[number]?repo=owner/repo          → PR details
GET  /api/prs/[number]/diff?repo=owner/repo     → Parsed diff
GET  /api/prs/[number]/analysis?repo=owner/repo → SSE stream of AI analysis
POST /api/prs/[number]/review                    → Submit review (approve/comment/request changes)
```

### Key Directories

- `app/` — Pages and API routes (Next.js App Router)
- `components/` — React components (SwipeView, BriefingCard, ConceptCard, CodeView, FullDiffCard, ReviewDropdown, NavBar, badges)
- `lib/` — Core logic (gh CLI wrapper, OpenAI calls, diff parser, syntax highlighter, URL parser, types)
- `public/` — Static assets (logo)

## Data Flow

1. **Landing page** — User pastes a GitHub URL or types `owner/repo`. Parsed by `lib/parse-input.ts` and redirected.
2. **Queue** — Server component calls `gh pr list` directly via `lib/gh.ts`. Renders PR list with risk badges.
3. **Review** — Client component fetches PR details + diff in parallel, then opens SSE stream to the analysis endpoint.
4. **Analysis endpoint** streams progress events as each file completes, then a final result after synthesis.
5. **SwipeView** renders [BriefingCard, ...ConceptCards, FullDiffCard]. Tapping "View diff" opens the CodeView overlay.
6. **Review actions** — Three buttons in navbar (Pasteurize/Moo/Graze) open an inline compose bar. Submits via `gh pr review`.

## AI Analysis Pipeline

Two-phase, per-file-first approach in `lib/ai.ts`:

**Phase A — Per-file (parallel):** Each changed file's diff is sent individually to OpenAI. Returns objects, members, annotations, risks, and decisions per file. All requests fire concurrently with `Promise.all()`. Progress is streamed to the client via SSE.

**Phase B — Synthesis (single call):** All file analyses (as JSON) are sent to a second OpenAI call that groups them into conceptual themes, produces the overall summary, risk level, key changes, and intent.

Both phases use `jsonChat<T>()` — a shared helper that calls `openai.chat.completions.create` with JSON response format.

Results are cached in-memory keyed by `repo:number:commitSHA`.

## Design Tokens

All colors defined as CSS variables in `app/globals.css` via Tailwind v4's `@theme` directive:

- **Backgrounds:** `bg`, `bg-raised`, `bg-card`, `bg-hover`, `bg-overlay`
- **Text:** `text`, `text-secondary`, `text-tertiary`
- **Accent:** `accent` (warm cream #d4a76a, matching the cow logo)
- **Risk:** `risk-low` (green), `risk-medium` (yellow), `risk-high` (red)
- **Diff:** `diff-add-bg/text`, `diff-remove-bg/text`
- **Syntax:** `syn-keyword`, `syn-string`, `syn-number`, `syn-comment`, `syn-type`, `syn-punct`
- **Size badges:** `size-s` (green), `size-m` (blue), `size-l` (yellow), `size-xl` (red)

## Component Hierarchy

```
ReviewPage
├── NavBar (sticky top bar: logo → home, repo breadcrumb → queue, review actions)
│   └── ReviewDropdown (Pasteurize / Moo / Graze buttons + compose bar)
├── SwipeView (touch carousel)
│   ├── BriefingCard (summary, stats, intent, key changes)
│   ├── ConceptCard × N (one per theme)
│   │   └── FileObjectCard (expandable file)
│   │       └── ObjectItem (expandable code construct)
│   │           └── Member rows (with descriptions)
│   └── FullDiffCard (all files with syntax-highlighted diffs)
└── CodeView (full-screen diff overlay with AI annotations)
```

## Development

```bash
pnpm install
pnpm dev          # starts on localhost:3000 with Turbopack
pnpm build        # production build
```

### Prerequisites

- **`gh` CLI** installed and authenticated (`gh auth login`)
- **`OPENAI_API_KEY`** set in `.env.local`

### Adding a new component

Components go in `components/`. They use Tailwind classes referencing the theme tokens (e.g. `bg-bg-card`, `text-accent`, `border-border`).

### Modifying AI prompts

Both prompts live in `lib/ai.ts` as string arguments to `jsonChat()`. The response schemas are documented inline. Update the corresponding TypeScript interfaces in `lib/types.ts` if the schema changes.

### Modifying the gh CLI wrapper

`lib/gh.ts` uses `execSync` with input sanitization. The `sanitizeRepo` regex and `sanitizeNumber` range check prevent command injection.

### Syntax highlighting

`lib/syntax.ts` provides a regex-based tokenizer. `components/HighlightedCode.tsx` renders tokens with color classes. Used by `DiffTable` for context lines in diffs.

### Keeping docs up to date

When making changes to the codebase, update both `CLAUDE.md` and `README.md` to reflect the current state. This includes changes to architecture, components, API routes, design tokens, AI prompts, or any user-facing behavior.
