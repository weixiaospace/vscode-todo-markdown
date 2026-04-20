<div align="center">

# Todo (Markdown)

[![Version](https://img.shields.io/visual-studio-marketplace/v/weixiao-space.todo-markdown?label=Marketplace&color=blue)](https://marketplace.visualstudio.com/items?itemName=weixiao-space.todo-markdown)
[![Installs](https://img.shields.io/visual-studio-marketplace/i/weixiao-space.todo-markdown)](https://marketplace.visualstudio.com/items?itemName=weixiao-space.todo-markdown)
[![VS Code](https://img.shields.io/badge/VS%20Code-%5E1.85.0-blue.svg?logo=visual-studio-code)](https://code.visualstudio.com/updates/v1_85)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

**[English](README.md) | [中文](README.zh-CN.md)**

</div>

一个轻量的 VS Code 侧栏：读取当前工作区的 `TODO.md`，把 checkbox 列表渲染成原生 TreeView。点击跳转、点击勾选、点击取消，为 **"vibe coding"** 而做——在编辑器内快速捕捉任务，不用切工具。

## 功能

- **零配置** —— 工作区根目录扔一个 `TODO.md`，活动栏就会出现树视图
- **GFM checkbox 解析** —— `- [ ]` / `- [x]`，支持 `*` / `+` bullet、嵌套条目、代码围栏安全跳过
- **两级分组** —— `## 一级标题` 和 `### 二级标题` 自动成为可折叠树节点
- **进度一目了然** —— 分组图标反映状态：空心圆（全未完成）→ 实心圆（部分完成）→ 对勾（全部完成）
- **点击跳转** —— 点任意条目，编辑器跳到对应行
- **点击切换** —— hover 出现的按钮翻转 `[ ]` ↔ `[x]`，立即保存（带行哈希乐观锁，外部编辑不会被覆盖）
- **实时刷新** —— `TODO.md` 的改动 150 ms 内反映到树视图
- **双语界面** —— 简中 / 英文，跟随 VS Code 显示语言
- **隐藏空分组** —— 可配置：从不 / 无条目时 / 无待办时

## 快速开始

1. 安装扩展
2. 在 VS Code 打开任意文件夹
3. 点活动栏的 ✓ 图标
4. 如果没有 `TODO.md`，点击 **Create TODO.md**，会基于模板生成一份
5. 开始写：

   ```md
   ## 🔥 进行中

   - [ ] 重构 auth service
   - [ ] 接入错误上报

   ## 📅 计划

   ### 前端
   - [ ] 暗色主题切换
   - [ ] 空状态插图
   ```

边敲边更新树。点侧栏里任意 `- [ ]` 条目，编辑器跳到那一行。hover 出现的 ✓ 按钮点击后，文件会被写入新状态。

## 配置

| 配置项 | 默认值 | 说明 |
|---|---|---|
| `todoMd.file` | `TODO.md` | 相对于工作区目录的路径，支持 `${workspaceFolder}` 和 `${workspaceFolder:name}` |
| `todoMd.collapsedSections` | `["Decided against", "Recently done", "Completed"]`（大小写不敏感子串匹配） | 默认折叠的分组标题 |
| `todoMd.maxFileSizeKb` | `1024` | 超过该大小不解析 |
| `todoMd.showDoneDescription` | `true` | 已完成条目后显示 "done" 后缀 |
| `todoMd.hideEmptyGroups` | `noItems` | `never` / `noItems` / `noPending` |

点侧栏标题栏的 ⚙ 按钮可以直接跳到过滤好的 Settings UI。

## 命令

| 命令 | 作用 |
|---|---|
| `Todo: Refresh` | 重新解析 `TODO.md` |
| `Todo: Open TODO.md` | 打开源文件 |
| `Todo: Create TODO.md` | 从模板新建 |
| `Todo: Open Settings` | 跳到 `todoMd.*` 设置 |

## 设计理念

这是一个**有态度**的工具，面向个人 / 小团队场景。有意**不做**：

- 任务指派、优先级、截止日期 —— 用 GitHub Issues / Linear
- 实时协作 —— 你的 `TODO.md` 已经在 git 里
- 自定义 markdown 方言 —— 只支持 GFM checkbox 语法
- 在侧栏里编辑任务文本 —— 用编辑器

需要这些功能，试试 **Todo Tree**、**Markdown Checkbox** 或 **Todo Sidebar MD**。

## 开发

```sh
pnpm install
pnpm build                # 或 pnpm watch
# 在 VS Code 打开本目录，按 F5 启动 Extension Development Host
pnpm test                 # 单测（vitest，parser 逻辑）
pnpm test:integration     # 集成测（@vscode/test-cli，会 spawn VS Code）
pnpm package              # 打包 todo-markdown-<version>.vsix
```

## 许可

MIT —— 见本仓 `LICENSE`。
