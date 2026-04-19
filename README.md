# Todo (Markdown)

读取 workspace 根的 `TODO.md`，在侧栏 Activity Bar 的 `Todo` 面板里以 TreeView 显示 `##` / `###` 分组的 checkbox 条目。

## 使用

- 点击 Activity Bar 的 ✓ 图标打开 Todo 面板
- 点击条目跳到 TODO.md 对应行
- 条目右侧 ✓ 按钮切换 `[ ]` / `[x]`
- 文件变化自动刷新

## 配置

- `todoMd.file`：默认 `TODO.md`
- `todoMd.collapsedSections`：默认折叠的分组标题
- `todoMd.maxFileSizeKb`：文件大小上限（KB），超过跳过解析

## 开发

```sh
cd apps/vscode-todo
pnpm install
pnpm build        # 或 pnpm watch
# 在 VS Code 打开 apps/vscode-todo，按 F5 启动 Extension Development Host
pnpm test         # 跑 parser 单测
pnpm package      # 打 .vsix
```
