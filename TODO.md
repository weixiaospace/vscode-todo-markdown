# todo-markdown 待办

> 0.1.0 已发布到 VS Code Marketplace。后续迭代事项记录在这。
> 顺便：本文件就是这个扩展自己读取的 TODO.md，吃自家狗粮。

## 🔥 进行中

## 📅 计划

### Marketplace listing 完善
- [ ] Hub 页填 **Categories**（当前只选了 Other + Visualization）
- [ ] Hub 页开启 **Q&A** 或 **Issues** 入口，选一个给用户反馈通道
- [ ] 建一个独立 GitHub/GitLab repo（或 CNB 单开），push 本仓代码
- [ ] 回填 `package.json` 的 `repository` / `bugs` / `homepage` 三件套，重发 `patch` 版
- [ ] 把 `package` 脚本里的 `--allow-missing-repository` flag 去掉（有真实 repo 后 vsce 自动识别）

### 首发后观察
- [ ] 搜 "todo markdown" 看索引生效没
- [ ] 看 Hub 的 Validation 是否全绿（首发 Microsoft 自动扫描）
- [ ] 安装量 / evaluation 页有反馈就处理

### 文档 / 观感
- [ ] README 加 GIF 或截图展示 tree view（大多 marketplace 扩展都有）
- [ ] README "Philosophy" 里列的竞品加链接
- [ ] 自制 SVG activity bar 图标（现在用默认 `$(checklist)`，不 distinctive）

### 功能微调
- [ ] `todoMd.collapsedSections` 默认值英文在前中文在后，可能要根据 locale 调
- [ ] `(未分组)` orphan 标题 i18n 的 sentinel 方式太 hacky，考虑用特殊 symbol
- [ ] 研究下 `workbench.tree.indent` 能否扩展侧读取，给默认值建议

## 💡 想法（未决定）

- [ ] 新增条目的命令（但直接敲编辑器更快，YAGNI）
- [ ] 允许多个 TODO.md 来源聚合（spec 里明确否决过，但用户可能来要）
- [ ] 拖拽改 section（Kanban-like，重，不建议）
- [ ] 支持优先级标签 `[!] / [~]`（扩语法，和"只支持 GFM"的初衷冲突）
- [ ] 集成 VSCode Tasks API，某些 `[ ]` 可以执行对应 npm script

## 🚫 已决定不做

- Task 指派 / 截止日期 / 优先级——用 GitHub Issues / Linear
- 实时协作——`TODO.md` 进 git 就是协作方式
- 自定义 markdown 方言——只认 GFM
- 在侧栏里编辑任务文本——用编辑器

## ✅ 最近完成

- [x] 2026-04-20 首发 0.1.0 到 VS Code Marketplace（`weixiao-space.todo-markdown`）
- [x] 2026-04-20 从 keyan-work monorepo subtree-split 为独立 repo
- [x] 2026-04-20 `@vscode/test-cli` 集成测上线，4 tests 冒烟激活 / 命令注册
- [x] 2026-04-20 运行时 `vscode.l10n` 文案双语化（en / zh-cn）
- [x] 2026-04-20 分组进度图标：空 / 部分 / 全完成三态
- [x] 2026-04-20 `hideEmptyGroups` 配置：never / noItems / noPending
- [x] 2026-04-20 设置齿轮按钮、inline 取消完成按钮（⊘）
- [x] 2026-04-20 manifest `%key%` 双语化 + 14+7 单测覆盖 parser + markdown 脱壳
