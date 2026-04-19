import * as vscode from 'vscode'
import { registerCommands } from './commands'
import { disposeLogger, initLogger, logger } from './logger'
import { TodoTreeProvider } from './provider'
import { startWatcher } from './watcher'
import { resolveTodoFile } from './workspace'

export function activate(context: vscode.ExtensionContext): void {
  initLogger()
  logger.info('Todo (Markdown) activating')

  const provider = new TodoTreeProvider()
  const view = vscode.window.createTreeView('todoMd.tree', {
    treeDataProvider: provider,
    showCollapseAll: true,
  })
  context.subscriptions.push(view)

  const watcher = startWatcher(context, provider)
  registerCommands(context, watcher)

  // 初始化上下文键 + 第一次刷新
  vscode.commands.executeCommand(
    'setContext',
    'todoMd.fileMissing',
    !resolveTodoFile(),
  )
  watcher.refresh()
}

export function deactivate(): void {
  disposeLogger()
}
