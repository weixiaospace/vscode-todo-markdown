import * as vscode from 'vscode'
import * as path from 'node:path'

export interface ResolvedFile {
  uri: vscode.Uri
  folder: vscode.WorkspaceFolder
}

/** 依据 config `todoMd.file` 得到实际 URI；无 folder 返回 null。 */
export function resolveTodoFile(): ResolvedFile | null {
  const folders = vscode.workspace.workspaceFolders
  if (!folders || folders.length === 0) return null

  const configured = vscode.workspace
    .getConfiguration('todoMd')
    .get<string>('file', 'TODO.md')

  const { folder, relative } = pickFolderAndRelative(folders, configured)
  const uri = vscode.Uri.joinPath(folder.uri, ...relative.split('/').filter(Boolean))
  return { uri, folder }
}

function pickFolderAndRelative(
  folders: readonly vscode.WorkspaceFolder[],
  configured: string,
): { folder: vscode.WorkspaceFolder; relative: string } {
  const namedMatch = /^\$\{workspaceFolder:([^}]+)\}(\/.*)?$/.exec(configured)
  if (namedMatch) {
    const [, name, rest] = namedMatch
    const folder = folders.find(f => f.name === name) ?? folders[0]
    return { folder, relative: normalizeRest(rest) }
  }
  const plainMatch = /^\$\{workspaceFolder\}(\/.*)?$/.exec(configured)
  if (plainMatch) {
    return { folder: folders[0], relative: normalizeRest(plainMatch[1]) }
  }
  if (path.isAbsolute(configured)) {
    // 绝对路径：挂到第一个 folder 但忽略 folder 前缀，用 uri=file://...
    return {
      folder: folders[0],
      relative: path.relative(folders[0].uri.fsPath, configured) || configured,
    }
  }
  return { folder: folders[0], relative: configured }
}

function normalizeRest(rest: string | undefined): string {
  if (!rest) return 'TODO.md'
  return rest.replace(/^\/+/, '')
}

/** 用 fs.stat 检查文件存在。 */
export async function fileExists(uri: vscode.Uri): Promise<boolean> {
  try {
    await vscode.workspace.fs.stat(uri)
    return true
  } catch {
    return false
  }
}
