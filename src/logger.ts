import * as vscode from 'vscode'

let channel: vscode.OutputChannel | null = null

function ts(): string {
  return new Date().toISOString().slice(11, 23)
}

export function initLogger(): vscode.OutputChannel {
  if (!channel) channel = vscode.window.createOutputChannel('Todo (Markdown)')
  return channel
}

export function disposeLogger(): void {
  channel?.dispose()
  channel = null
}

export const logger = {
  info(msg: string): void {
    channel?.appendLine(`[${ts()}] INFO  ${msg}`)
  },
  warn(msg: string): void {
    channel?.appendLine(`[${ts()}] WARN  ${msg}`)
  },
  error(msg: string, err?: unknown): void {
    const detail = err instanceof Error ? `${err.message}\n${err.stack ?? ''}` : String(err ?? '')
    channel?.appendLine(`[${ts()}] ERROR ${msg}${detail ? `: ${detail}` : ''}`)
  },
  debug(msg: string): void {
    channel?.appendLine(`[${ts()}] DEBUG ${msg}`)
  },
}
