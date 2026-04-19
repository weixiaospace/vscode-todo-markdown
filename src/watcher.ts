import * as vscode from 'vscode'
import { logger } from './logger'
import { fileExists, resolveTodoFile } from './workspace'
import { parseTodoMarkdown } from './parser'
import type { TodoTreeProvider } from './provider'

const DEBOUNCE_MS = 150
const DEFAULT_MAX_KB = 1024

export interface WatcherHandle {
  dispose(): void
  refresh(): void
}

export function startWatcher(
  context: vscode.ExtensionContext,
  provider: TodoTreeProvider,
): WatcherHandle {
  let timer: NodeJS.Timeout | undefined
  let generation = 0

  const refresh = () => {
    if (timer) clearTimeout(timer)
    timer = setTimeout(doRefresh, DEBOUNCE_MS)
  }

  const doRefresh = async () => {
    const gen = ++generation
    const resolved = resolveTodoFile()
    if (!resolved) {
      provider.update({ nodes: [], sourceUri: null })
      vscode.commands.executeCommand('setContext', 'todoMd.fileMissing', false)
      return
    }
    const { uri } = resolved
    const exists = await fileExists(uri)
    vscode.commands.executeCommand('setContext', 'todoMd.fileMissing', !exists)
    if (!exists) {
      provider.update({ nodes: [], sourceUri: null })
      logger.info(`TODO.md not found at ${uri.fsPath}`)
      return
    }
    try {
      const stat = await vscode.workspace.fs.stat(uri)
      const maxKb = vscode.workspace
        .getConfiguration('todoMd')
        .get<number>('maxFileSizeKb', DEFAULT_MAX_KB)
      if (stat.size > maxKb * 1024) {
        logger.warn(`Skip parsing: ${uri.fsPath} is ${stat.size} bytes (> ${maxKb} KB)`)
        provider.update({
          nodes: [tooLargeGroup(stat.size, maxKb)],
          sourceUri: uri,
        })
        return
      }
      const bytes = await vscode.workspace.fs.readFile(uri)
      if (gen !== generation) return // 已有更新的刷新
      const text = new TextDecoder('utf8').decode(bytes)
      const t0 = Date.now()
      const nodes = parseTodoMarkdown(text)
      logger.debug(`Parsed ${uri.fsPath} in ${Date.now() - t0}ms, ${countItems(nodes)} items`)
      const cfg = vscode.workspace.getConfiguration('todoMd')
      provider.update({
        nodes,
        sourceUri: uri,
        collapsedTitles: cfg.get<string[]>('collapsedSections', []),
        showDoneDescription: cfg.get<boolean>('showDoneDescription', true),
      })
    } catch (err) {
      logger.error('Parse failed', err)
    }
  }

  const fsWatcher = vscode.workspace.createFileSystemWatcher('**/TODO.md')
  context.subscriptions.push(
    fsWatcher,
    fsWatcher.onDidChange(uri => ifOurs(uri) && refresh()),
    fsWatcher.onDidCreate(uri => ifOurs(uri) && refresh()),
    fsWatcher.onDidDelete(uri => ifOurs(uri) && refresh()),
    vscode.workspace.onDidChangeTextDocument(e => ifOurs(e.document.uri) && refresh()),
    vscode.workspace.onDidSaveTextDocument(doc => ifOurs(doc.uri) && refresh()),
    vscode.workspace.onDidChangeWorkspaceFolders(refresh),
    vscode.workspace.onDidChangeConfiguration(e => {
      if (e.affectsConfiguration('todoMd')) refresh()
    }),
  )

  return {
    dispose: () => {
      if (timer) clearTimeout(timer)
    },
    refresh,
  }

  function ifOurs(uri: vscode.Uri): boolean {
    const resolved = resolveTodoFile()
    return !!resolved && resolved.uri.fsPath === uri.fsPath
  }
}

function countItems(nodes: import('./types').TodoNode[]): number {
  let n = 0
  for (const node of nodes) {
    if (node.kind === 'item') n += 1
    else n += countItems(node.children)
  }
  return n
}

function tooLargeGroup(size: number, maxKb: number): import('./types').GroupNode {
  return {
    kind: 'group',
    level: 1,
    title: `(跳过解析：文件 ${(size / 1024).toFixed(1)} KB > ${maxKb} KB)`,
    line: -1,
    children: [],
    totalOpen: 0,
  }
}
