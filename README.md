# Todo (Markdown)

A lightweight VS Code sidebar that reads your workspace's `TODO.md` and renders its checkbox list as a native tree view. Click to jump, click to check, click to uncheck. Built for **"vibe coding"** — quick task capture without leaving the editor.

## Features

- **Zero-config** — drop a `TODO.md` in your workspace root and the tree appears in the Activity Bar
- **GFM checkbox parsing** — `- [ ]` / `- [x]`, `*`/`+` bullets, nested items, code-fence-safe
- **Two-level grouping** — `## Section` and `### Subsection` become collapsible tree nodes
- **Progress at a glance** — group icon reflects state: outline circle (none done) → filled circle (partial) → check (all done)
- **Click to jump** — click any item to reveal it in the open editor at the exact line
- **Click to toggle** — inline button flips `[ ]` ↔ `[x]` and saves immediately (safe: hash-verified so external edits never get clobbered)
- **Live refresh** — edits to `TODO.md` update the tree in 150 ms
- **Bilingual UI** — zh-CN / en, follows your VS Code display language
- **Hide empty groups** — configurable: never / hide when no items / hide when no pending

## Quick start

1. Install the extension
2. Open any folder in VS Code
3. Click the ✓ icon in the Activity Bar
4. If no `TODO.md` exists, click **Create TODO.md** — a minimal template will be generated
5. Start writing:

   ```md
   ## 🔥 In Progress

   - [ ] Refactor auth service
   - [ ] Wire up error reporting

   ## 📅 Planned

   ### Frontend
   - [ ] Dark mode toggle
   - [ ] Empty-state illustrations
   ```

The tree updates as you type. Click a `- [ ]` item in the sidebar → editor jumps to its line. Click the ✓ button on hover → file saved with the new state.

## Configuration

| Setting | Default | Description |
|---|---|---|
| `todoMd.file` | `TODO.md` | Relative path from workspace folder. Supports `${workspaceFolder}` and `${workspaceFolder:name}` |
| `todoMd.collapsedSections` | `["Decided against", "Recently done", "Completed"]` (case-insensitive substring match) | Section titles collapsed by default |
| `todoMd.maxFileSizeKb` | `1024` | Skip parsing if `TODO.md` exceeds this size |
| `todoMd.showDoneDescription` | `true` | Show "done" suffix next to completed items |
| `todoMd.hideEmptyGroups` | `noItems` | `never` / `noItems` / `noPending` |

Click the ⚙ button in the sidebar title bar to jump straight to the filtered Settings UI.

## Commands

| Command | Purpose |
|---|---|
| `Todo: Refresh` | Re-parse `TODO.md` |
| `Todo: Open TODO.md` | Open the source file |
| `Todo: Create TODO.md` | Create from template if missing |
| `Todo: Open Settings` | Jump to `todoMd.*` settings |

## Philosophy

This is an **opinionated** tool for personal / small-team workflows. It intentionally does **not** do:

- Task assignment, priorities, due dates — use GitHub Issues / Linear
- Real-time collaboration — your `TODO.md` is already in git
- Custom markdown flavors — GFM checkbox syntax only
- Editing task text from the sidebar — use the editor

If you want those, try **Todo Tree**, **Markdown Checkbox**, or **Todo Sidebar MD**.

## Development

```sh
pnpm install
pnpm build                # or pnpm watch
# In VS Code, open this directory and press F5 to launch an Extension Development Host
pnpm test                 # unit tests (vitest, parser logic)
pnpm test:integration     # integration tests (@vscode/test-cli, spawns VS Code)
pnpm package              # build keyan-vscode-todo-<version>.vsix
```

## License

MIT — see `LICENSE` in this repo.
