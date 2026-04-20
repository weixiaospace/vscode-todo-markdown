import * as vscode from 'vscode'
import { stripInlineMarkdown } from './parser'
import type { GroupNode, ItemNode, TodoNode } from './types'

export type HideMode = 'never' | 'noItems' | 'noPending'

export interface TreeState {
  nodes: TodoNode[]
  sourceUri: vscode.Uri | null
  collapsedTitles: string[]   // 来自 todoMd.collapsedSections
  showDoneDescription: boolean
  hideMode: HideMode          // 来自 todoMd.hideEmptyGroups
}

export class TodoTreeProvider implements vscode.TreeDataProvider<TodoNode> {
  private _onDidChange = new vscode.EventEmitter<TodoNode | undefined | void>()
  readonly onDidChangeTreeData = this._onDidChange.event

  private state: TreeState = {
    nodes: [],
    sourceUri: null,
    collapsedTitles: [],
    showDoneDescription: true,
    hideMode: 'noItems',
  }

  update(next: Partial<TreeState>): void {
    this.state = { ...this.state, ...next }
    this._onDidChange.fire()
  }

  getSourceUri(): vscode.Uri | null {
    return this.state.sourceUri
  }

  getTreeItem(node: TodoNode): vscode.TreeItem {
    if (node.kind === 'group') return this.groupToItem(node)
    return this.itemToItem(node)
  }

  getChildren(node?: TodoNode): TodoNode[] {
    const list = node
      ? (node.kind === 'group' ? node.children : [])
      : this.state.nodes
    return list.filter(n => n.kind === 'item' || this.shouldShowGroup(n))
  }

  private shouldShowGroup(g: GroupNode): boolean {
    if (this.state.hideMode === 'never') return true
    if (!hasAnyItem(g)) return false
    if (this.state.hideMode === 'noItems') return true
    return g.totalOpen > 0
  }

  private groupToItem(g: GroupNode): vscode.TreeItem {
    const title = g.line < 0 ? vscode.l10n.t('(uncategorized)') : g.title
    const label = g.emoji ? `${g.emoji} ${title}` : title
    const item = new vscode.TreeItem(label, this.resolveCollapsibleState(g))
    item.description = g.totalOpen > 0 ? `(${g.totalOpen})` : undefined
    item.iconPath = new vscode.ThemeIcon(groupProgressIcon(g))
    item.contextValue = 'todoGroup'
    item.tooltip = g.line >= 0 ? vscode.l10n.t('Line {0}', g.line + 1) : undefined
    return item
  }

  private itemToItem(n: ItemNode): vscode.TreeItem {
    const display = stripInlineMarkdown(n.text)
    const item = new vscode.TreeItem(display, vscode.TreeItemCollapsibleState.None)
    item.iconPath = new vscode.ThemeIcon(n.checked ? 'check' : 'circle-large-outline')
    item.contextValue = n.checked ? 'todoItemDone' : 'todoItemPending'
    item.description = n.checked && this.state.showDoneDescription ? vscode.l10n.t('done') : undefined
    const lineTip = vscode.l10n.t('Line {0}', n.line + 1)
    const suffix = n.checked ? ` · ${vscode.l10n.t('done')}` : ''
    item.tooltip = n.text !== display
      ? `${n.text}\n${lineTip}${suffix}`
      : `${lineTip}${suffix}`
    if (this.state.sourceUri) {
      item.command = {
        command: 'todoMd.reveal',
        title: 'Reveal',
        arguments: [{ uri: this.state.sourceUri, line: n.line }],
      }
    }
    return item
  }

  private resolveCollapsibleState(g: GroupNode): vscode.TreeItemCollapsibleState {
    if (g.children.length === 0) return vscode.TreeItemCollapsibleState.None
    const needle = g.title.toLowerCase()
    const collapsed = this.state.collapsedTitles.some(
      s => s.length > 0 && needle.includes(s.toLowerCase()),
    )
    return collapsed
      ? vscode.TreeItemCollapsibleState.Collapsed
      : vscode.TreeItemCollapsibleState.Expanded
  }
}

function hasAnyItem(n: TodoNode): boolean {
  if (n.kind === 'item') return true
  for (const c of n.children) if (hasAnyItem(c)) return true
  return false
}

function countItems(n: TodoNode): number {
  if (n.kind === 'item') return 1
  let sum = 0
  for (const c of n.children) sum += countItems(c)
  return sum
}

/**
 * 按分组进度挑 icon：
 *   全完成 → pass-filled（✓ in 圈）
 *   部分完成 → circle-large-filled（实心圈）
 *   一个都没完成 → circle-large-outline（空心圈）
 *   无条目 → list-unordered（通用列表）
 */
function groupProgressIcon(g: GroupNode): string {
  const total = countItems(g)
  if (total === 0) return 'list-unordered'
  if (g.totalOpen === 0) return 'pass-filled'
  if (g.totalOpen === total) return 'circle-large-outline'
  return 'circle-large-filled'
}

