import * as vscode from 'vscode'
import { logger } from './logger'
import { resolveTodoFile, fileExists } from './workspace'
import type { WatcherHandle } from './watcher'
import { createHash } from 'node:crypto'
import type { ItemNode } from './types'

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
    vscode.commands.registerCommand('todoMd.toggle', toggle),
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

// TreeView 传给 command 的第一个参数：TodoNode（来自 provider.getChildren）
async function toggle(arg: unknown): Promise<void> {
  const node = arg as Partial<ItemNode> | undefined
  if (!node || node.kind !== 'item') {
    vscode.window.showInformationMessage('Open an item from the Todo tree to toggle it.')
    return
  }
  const resolved = resolveTodoFile()
  if (!resolved) return
  try {
    const doc = await vscode.workspace.openTextDocument(resolved.uri)
    const lineIdx = node.line ?? -1
    if (lineIdx < 0 || lineIdx >= doc.lineCount) {
      warnStale()
      return
    }
    const current = doc.lineAt(lineIdx).text
    const expectedHash = node.lineHash
    const currentHash = createHash('sha256').update(current).digest('hex').slice(0, 8)
    if (expectedHash && expectedHash !== currentHash) {
      warnStale()
      await vscode.commands.executeCommand('todoMd.refresh')
      return
    }
    const replaced = current.replace(/\[([ xX])\]/, (_, ch) => `[${ch === ' ' ? 'x' : ' '}]`)
    if (replaced === current) {
      logger.warn(`toggle: no checkbox on line ${lineIdx + 1}`)
      return
    }
    const edit = new vscode.WorkspaceEdit()
    edit.replace(
      resolved.uri,
      new vscode.Range(lineIdx, 0, lineIdx, current.length),
      replaced,
    )
    const ok = await vscode.workspace.applyEdit(edit)
    if (!ok) logger.warn('applyEdit returned false')
  } catch (err) {
    logger.error('toggle failed', err)
  }
}

function warnStale(): void {
  vscode.window.showWarningMessage('TODO.md has changed. Refreshing — please try again.')
}
