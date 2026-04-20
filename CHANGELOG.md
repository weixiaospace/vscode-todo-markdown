# Changelog

All notable changes to the "Todo (Markdown)" extension are documented here.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

**[English](CHANGELOG.md) | [中文](CHANGELOG.zh-CN.md)**

## [0.1.2] - 2026-04-20

### Changed
- Marketplace icon (`media/icon.png`) re-rendered at 256×256 from SVG source (was a blurry 128×128 colormap PNG)
- Activity Bar icon now uses a custom SVG (`media/icon.svg`, adapts to theme via `currentColor`) instead of the generic `$(checklist)` codicon
- `todo.svg` viewBox tightened to the circle's bounding box — no built-in padding

## [0.1.1] - 2026-04-20

### Added
- `repository`, `homepage`, `bugs` fields in `package.json` so the Marketplace listing links to source
- Chinese docs: `README.zh-CN.md` and `CHANGELOG.zh-CN.md`, with language switch links in both locales
- Marketplace / VS Code / License badges in README

### Changed
- `pnpm package` script no longer needs `--allow-missing-repository` (repo metadata now present); also now runs `pnpm build` first

## [0.1.0] - 2026-04-20

Initial release.

### Added
- Activity Bar sidebar that reads workspace-root `TODO.md` and renders it as a `TreeView`
- Two-level grouping from markdown headings: `## Section` and `### Subsection`
- GFM checkbox parsing: `- [ ]` / `- [x]`, supports `*` and `+` bullet markers, `[x]` / `[X]` done states, CRLF / BOM / mixed indent, code fence (``` / ~~~) skipping, orphan items bucket
- Inline markdown stripping for labels: bold, italic, inline code, and link syntax render as plain text; originals preserved in tooltip
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
