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
    const label = g.emoji ? `${g.emoji} ${g.title}` : g.title
    const item = new vscode.TreeItem(label, this.resolveCollapsibleState(g))
    item.description = g.totalOpen > 0 ? `(${g.totalOpen})` : undefined
    item.iconPath = g.emoji ? undefined : new vscode.ThemeIcon('list-unordered')
    item.contextValue = 'todoGroup'
    item.tooltip = g.line >= 0 ? `Line ${g.line + 1}` : undefined
    return item
  }

  private itemToItem(n: ItemNode): vscode.TreeItem {
    const item = new vscode.TreeItem(stripInlineMarkdown(n.text), vscode.TreeItemCollapsibleState.None)
    item.iconPath = new vscode.ThemeIcon(n.checked ? 'check' : 'circle-large-outline')
    item.contextValue = n.checked ? 'todoItemDone' : 'todoItemPending'
    item.description = n.checked && this.state.showDoneDescription ? 'done' : undefined
    item.tooltip = n.text !== stripInlineMarkdown(n.text)
      ? `${n.text}\nLine ${n.line + 1}${n.checked ? ' · done' : ''}`
      : `Line ${n.line + 1}${n.checked ? ' · done' : ''}`
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
