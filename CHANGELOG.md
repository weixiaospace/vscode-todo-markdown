# Changelog

All notable changes to the "Todo (Markdown)" extension are documented here.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [0.1.0] - 2026-04-20

Initial release.

### Added
- Activity Bar sidebar that reads workspace-root `TODO.md` and renders it as a `TreeView`
- Two-level grouping from markdown headings: `## Section` and `### Subsection`
- GFM checkbox parsing: `- [ ]` / `- [x]`, supports `*` and `+` bullet markers, `[x]` / `[X]` done states, CRLF / BOM / mixed indent, code fence (``` / ~~~) skipping, orphan items bucket
- Inline markdown stripping for labels: `**bold**` / `*italic*` / `` `code` `` / `[link](url)` render as plain text; originals preserved in tooltip
- Click item to reveal source line in editor
- Hover inline check button to toggle `[ ]` ↔ `[x]`, with line-hash optimistic lock against concurrent edits; auto-saves the file on success
- Separate reopen button (⊘) for completed items
- Group progress icon: outline (no pending), filled (partial), filled + check (all done)
- Live refresh driven by 6 signals (FileSystemWatcher × 3 + doc change + save + workspace + config), debounced 150 ms, generation counter for stale-result protection
- File size cap (`todoMd.maxFileSizeKb`, default 1024 KB) with placeholder group
- Empty-state welcome view: "Open Folder" or "Create TODO.md" from template
- Configuration: `todoMd.file`, `todoMd.collapsedSections`, `todoMd.maxFileSizeKb`, `todoMd.showDoneDescription`, `todoMd.hideEmptyGroups` (never / noItems / noPending)
- Title-bar commands: Refresh, Open TODO.md, Open Settings
- Full bilingual UI (en / zh-CN) via `package.nls.*.json` (manifest) and `l10n/bundle.l10n.*.json` (runtime messages)
- OutputChannel logger ("Todo (Markdown)") for parse timings and diagnostics
- Unit tests: 21 vitest cases covering parser edge cases and markdown stripping
- Integration tests: 4 `@vscode/test-cli` cases covering activation and command registration
