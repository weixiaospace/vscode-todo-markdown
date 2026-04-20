# todo-markdown — Claude Code 开发须知

VS Code 扩展：侧栏读 `TODO.md` 并以 TreeView 展示 GFM checkbox 任务。目标是 "vibe coding" 的轻量待办面板，不做项目管理级的功能。

## 项目身份

- Extension ID：`weixiao-space.todo-markdown`（marketplace 的 `name` 是 `todo-markdown`；本地目录仍叫 `todo-md`，不影响）
- Display name：`Todo (Markdown)`
- Publisher ID：`weixiao-space`（display name 可以是 "WeiXiao"，但 package.json 的 `publisher` 必须填 ID）
- 由 `keyan-work` monorepo 的 `apps/vscode-todo/` 做 `git subtree split` 迁移而来，历史完整保留

## 技术栈

- TypeScript 5（strict，CommonJS 输出）
- esbuild 打包 → 单个 `out/extension.js`（`vscode` external）
- vitest 跑 parser 单测（纯 Node 环境）
- `@vscode/test-cli` + mocha 跑集成测（spawn 真实 VSCode）
- pnpm 做依赖管理（**本 repo 是独立的，非 workspace 成员**）

## 目录结构

```
todo-md/
├─ src/
│  ├─ extension.ts          # activate/deactivate 装配
│  ├─ types.ts              # TodoNode / GroupNode / ItemNode
│  ├─ parser.ts             # 纯函数解析 TODO.md → TodoNode[]（含 stripInlineMarkdown）
│  ├─ provider.ts           # TreeDataProvider 渲染 + 分组进度图标 + 隐藏空组
│  ├─ watcher.ts            # FileSystemWatcher + onDidChange* 六路刷新，150ms debounce
│  ├─ commands.ts           # 7 个命令（refresh / openFile / openSettings / createFile / reveal / toggle / reopen）
│  ├─ workspace.ts          # resolveTodoFile 支持 ${workspaceFolder[:name]} 占位符
│  ├─ logger.ts             # OutputChannel "Todo (Markdown)"
│  └─ __tests__/
│     ├─ parser.test.ts
│     ├─ markdown.test.ts
│     ├─ integration/       # @vscode/test-cli 下的 mocha 测试（TDD 风格）
│     └─ fixtures/
├─ l10n/                    # vscode.l10n 运行时 bundle（en + zh-cn）
├─ media/icon.png           # 128×128 marketplace 头图
├─ package.nls*.json        # 清单 %key% 本地化（en + zh-cn）
├─ esbuild.mjs
├─ tsconfig.json            # 主构建
├─ tsconfig.test.json       # 集成测独立编译到 out/test/
├─ vitest.config.ts         # 排除 integration 目录
└─ .vscode-test.mjs         # @vscode/test-cli 配置
```

## 关键约定

### Parser 必须纯
`src/parser.ts` 不 import `vscode`。所有 VSCode API 使用放在 provider / watcher / commands 层。这保证 parser 能用 vitest 在纯 Node 跑，集成测专注 UI/命令。

### Toggle 的乐观锁
`commands.ts` 的 toggle 流程：读取行 → 重算 sha256 前 8 位 → 和 `ItemNode.lineHash` 比对 → 不一致则刷新并退出。**改 parser 行哈希算法时务必同步 toggle 的 `createHash('sha256').digest('hex').slice(0, 8)`**，否则首次打开就会误报 stale。

### 刷新去抖世代号
`watcher.ts` 用 `let generation = 0` 避免慢的解析结果覆盖新的。修改 `doRefresh` 时保留 `if (gen !== generation) return` 检查。

### 图标列对齐
分组走 ThemeIcon（`list-unordered` / `circle-large-outline` / `circle-large-filled` / `pass-filled` 四态进度），emoji 作为 label 前缀；条目走 `check` / `circle-large-outline`。**不要把 emoji 塞进 iconPath**——ThemeIcon 不支持 emoji，只接受 codicon ID。

### 双语化
- 清单字段：用 `%key%` 占位，翻译写 `package.nls.json`（英文 / 默认）和 `package.nls.zh-cn.json`
- 运行时字符串：`vscode.l10n.t('...')`，翻译写 `l10n/bundle.l10n.json` / `l10n/bundle.l10n.zh-cn.json`
- `src/parser.ts` 不能用 `vscode.l10n`（纯函数约束）；parser 输出的 `(未分组)` sentinel 由 provider 在 `g.line === -1` 时转成本地化 label

## 常用命令

```sh
pnpm install
pnpm build                  # 一次产出 out/extension.js
pnpm watch                  # esbuild 监听模式
pnpm typecheck              # tsc --noEmit
pnpm test                   # vitest run（21 个单测）
pnpm test:integration       # 打包 + 编译集成测 + 启一个干净 VSCode 跑 mocha
pnpm package                # vsce package → todo-markdown-<ver>.vsix
```

调试：用 VSCode 打开本 repo，按 `F5` 起 Extension Development Host。改完源码 Cmd+S 后触发 esbuild watch 重编；在 Host 窗口里 `Cmd+Shift+P → Developer: Reload Window` 即可看到新版。

## Git 远端

三个 remote（`.git/config`）：

- `github` — `git@github.com:weixiaospace/vscode-todo-markdown.git`（SSH，fetch/push）
- `cnb` — `https://cnb.cool/weixiao.space/vscode-todo-markdown`（fetch/push）
- `all` — 聚合 remote，`url` 配了两条：`git push` 会**同时推到** github 与 cnb（fetch 用第一条 SSH）

`main` 默认追踪 `all/main`，所以平时 `git push` 一次即可双推。如果只想推一边，用 `git push github main` 或 `git push cnb main`。

## 发布到 Marketplace

前置：publisher ID `weixiao-space` 已在 https://aka.ms/vscode-create-publisher 注册（用 Microsoft 账号），PAT 已在 https://dev.azure.com 签发（Organization 选 "All accessible organizations"，Scopes 勾 Marketplace → Manage）。

```sh
vsce login weixiao-space   # 首次，输入 PAT
pnpm publish                        # 其实是 vsce publish（见 package.json scripts）
# 或 bump 版本：
vsce publish patch        # 0.1.0 → 0.1.1
vsce publish minor        # 0.1.0 → 0.2.0
```

发布前清单：
- [ ] `CHANGELOG.md` 加这版的 entry
- [ ] `package.json` 里 `version` 手动改过（或用 `vsce publish <semver>`）
- [ ] `pnpm package` 本地跑一遍，核对 `.vsix` 文件列表没多打无关内容
- [ ] `pnpm test` 和 `pnpm test:integration` 都绿

## 已知限制 / 推迟决定

- 只扫 workspace 根的 `TODO.md`（可配置路径），不扫多级目录 md 文件
- `###` 三级以上标题不建 TreeView 节点（条目归到最近一个 `## / ###` 下）
- 没有"新增 todo"命令——直接在编辑器里敲更快
- 暂无 CI（GitHub Actions / 类似）配置，集成测和发布靠本地跑 `pnpm test:integration` / `vsce publish`

## 调试 tip

- OutputChannel 叫 `Todo (Markdown)`：打开 VSCode → Output → 下拉选它，能看到 parse 耗时、文件路径、hash mismatch 警告
- 集成测首次会下载一个 VSCode 到 `.vscode-test/`（gitignored，~200 MB），后续复用
- `vsce ls` 可在不打包的情况下列出即将进 vsix 的文件，调整 `.vscodeignore` 后先 `vsce ls` 预览
