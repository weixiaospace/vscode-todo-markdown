# 更新日志

"Todo (Markdown)" 扩展的所有重要变更都记录在此文件中。

格式基于 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.1.0/)。

**[English](CHANGELOG.md) | [中文](CHANGELOG.zh-CN.md)**

## [0.1.0] - 2026-04-20

首个发布版本。

### 新增
- 活动栏侧边视图，读取工作区根目录的 `TODO.md` 并以 `TreeView` 渲染
- 基于 markdown 标题的两级分组：`## 一级标题` 和 `### 二级标题`
- GFM checkbox 解析：`- [ ]` / `- [x]`，支持 `*` / `+` bullet 标记、`[x]` / `[X]` 完成状态、CRLF / BOM / 混合缩进、代码围栏（``` / ~~~）跳过、孤儿条目桶
- 条目 label 行内 markdown 脱壳：粗体、斜体、行内代码、链接语法渲染为纯文本；原文保留在 tooltip
- 点击条目跳转到编辑器源码行
- hover 出现的 inline 勾选按钮，切换 `[ ]` ↔ `[x]`，带行哈希乐观锁防止并发编辑冲突，成功后自动保存文件
- 已完成条目有独立的取消完成按钮（⊘）
- 分组进度图标：空心（无完成）、实心（部分完成）、实心加勾（全部完成）
- 六路信号驱动的实时刷新（FileSystemWatcher × 3 + 文档变更 + 保存 + 工作区 + 配置），150 ms 去抖，世代计数器防止旧结果覆盖新结果
- 文件大小上限（`todoMd.maxFileSizeKb`，默认 1024 KB），超限显示占位分组
- 空状态欢迎视图："Open Folder" 或基于模板 "Create TODO.md"
- 配置项：`todoMd.file`、`todoMd.collapsedSections`、`todoMd.maxFileSizeKb`、`todoMd.showDoneDescription`、`todoMd.hideEmptyGroups`（never / noItems / noPending）
- 标题栏命令：Refresh、Open TODO.md、Open Settings
- 完整双语 UI（简中 / 英文），通过 `package.nls.*.json`（清单）和 `l10n/bundle.l10n.*.json`（运行时消息）
- OutputChannel 日志（"Todo (Markdown)"），输出解析耗时与诊断信息
- 单测：21 个 vitest 用例，覆盖 parser 边界与 markdown 脱壳
- 集成测：4 个 `@vscode/test-cli` 用例，覆盖激活与命令注册
