import * as vscode from 'vscode'
import { logger } from './logger'
import { resolveTodoFile, fileExists } from './workspace'
import type { WatcherHandle } from './watcher'

const DEFAULT_TEMPLATE = `# 项目待办事项

## 🔥 进行中

- [ ] 新任务

## ✅ 最近完成

## 📅 计划

## 💡 想法

`

export function registerCommands(
  context: vscode.ExtensionContext,
  watcher: WatcherHandle,
): void {
  context.subscriptions.push(
    vscode.commands.registerCommand('todoMd.refresh', () => watcher.refresh()),
    vscode.commands.registerCommand('todoMd.openFile', openFile),
    vscode.commands.registerCommand('todoMd.createFile', createFile),
    vscode.commands.registerCommand('todoMd.reveal', reveal),
  )
}

async function openFile(): Promise<void> {
  const resolved = resolveTodoFile()
  if (!resolved) {
    vscode.window.showInformationMessage('No workspace folder.')
    return
  }
  if (!(await fileExists(resolved.uri))) {
    const action = await vscode.window.showInformationMessage(
      `TODO.md not found at ${resolved.uri.fsPath}. Create it?`,
      'Create',
      'Cancel',
    )
    if (action === 'Create') await createFile()
    return
  }
  const doc = await vscode.workspace.openTextDocument(resolved.uri)
  await vscode.window.showTextDocument(doc, { preview: false })
}

async function createFile(): Promise<void> {
  const resolved = resolveTodoFile()
  if (!resolved) {
    vscode.window.showInformationMessage('No workspace folder to create TODO.md in.')
    return
  }
  if (await fileExists(resolved.uri)) {
    await openFile()
    return
  }
  try {
    await vscode.workspace.fs.writeFile(
      resolved.uri,
      new TextEncoder().encode(DEFAULT_TEMPLATE),
    )
    logger.info(`Created ${resolved.uri.fsPath}`)
    const doc = await vscode.workspace.openTextDocument(resolved.uri)
    await vscode.window.showTextDocument(doc, { preview: false })
  } catch (err) {
    logger.error('createFile failed', err)
    vscode.window.showErrorMessage(`Failed to create TODO.md: ${(err as Error).message}`)
  }
}

interface RevealArgs {
  uri: vscode.Uri
  line: number
}

async function reveal(args: RevealArgs | undefined): Promise<void> {
  if (!args) return
  try {
    const doc = await vscode.workspace.openTextDocument(args.uri)
    const editor = await vscode.window.showTextDocument(doc, { preserveFocus: false })
    const target = Math.max(0, Math.min(args.line, doc.lineCount - 1))
    const range = new vscode.Range(target, 0, target, 0)
    editor.selection = new vscode.Selection(range.start, range.start)
    editor.revealRange(range, vscode.TextEditorRevealType.InCenterIfOutsideViewport)
  } catch (err) {
    logger.error('reveal failed', err)
  }
}
