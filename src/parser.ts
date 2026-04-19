import { createHash } from 'node:crypto'
import type { GroupNode, ItemNode, TodoNode } from './types'

const HEADING_RE = /^(#{2,6})\s+(.+?)\s*$/
const ITEM_RE = /^(\s*)[-*+]\s+\[([ xX])\]\s+(.+?)\s*$/
const EMOJI_RE = /^(\p{Extended_Pictographic}(?:\uFE0F|\u200D\p{Extended_Pictographic})*)\s*(.*)$/u

export function parseTodoMarkdown(source: string): TodoNode[] {
  const lines = stripBom(source).split(/\r\n|\r|\n/)
  const roots: TodoNode[] = []
  let currentL1: GroupNode | null = null
  let currentL2: GroupNode | null = null

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const headingMatch = HEADING_RE.exec(line)
    if (headingMatch) {
      const hashes = headingMatch[1]
      const rawTitle = headingMatch[2]
      if (hashes.length === 2) {
        currentL1 = makeGroup(1, rawTitle, i)
        currentL2 = null
        roots.push(currentL1)
      } else if (hashes.length === 3) {
        const group = makeGroup(2, rawTitle, i)
        currentL2 = group
        if (currentL1) {
          currentL1.children.push(group)
        } else {
          roots.push(group)
        }
      }
      // #### 及以上：不建分组；currentL1/L2 不变，条目仍归属当前 group
      continue
    }
    const itemMatch = ITEM_RE.exec(line)
    if (itemMatch) {
      const item = makeItem(itemMatch, line, i)
      const parent = currentL2 ?? currentL1
      if (parent) {
        parent.children.push(item)
      } else {
        // 孤儿条目：后续任务会扩展；先挂到 roots 末尾的虚拟分组
        const orphan = ensureOrphan(roots)
        orphan.children.push(item)
      }
    }
  }

  recomputeTotals(roots)
  return roots
}

function makeGroup(level: 1 | 2, rawTitle: string, line: number): GroupNode {
  const { emoji, title } = extractEmoji(rawTitle)
  return { kind: 'group', level, title, emoji, line, children: [], totalOpen: 0 }
}

function makeItem(m: RegExpExecArray, line: string, lineIdx: number): ItemNode {
  const [, leading, mark, text] = m
  const checked = mark.toLowerCase() === 'x'
  const indent = computeIndent(leading)
  return {
    kind: 'item',
    checked,
    text,
    line: lineIdx,
    lineHash: hashLine(line),
    indent,
  }
}

function computeIndent(leading: string): number {
  let count = 0
  for (const ch of leading) count += ch === '\t' ? 1 : 0.5
  return Math.floor(count)
}

function extractEmoji(rawTitle: string): { title: string; emoji?: string } {
  const m = EMOJI_RE.exec(rawTitle)
  if (!m) return { title: rawTitle }
  return { emoji: m[1], title: m[2].trim() || rawTitle }
}

function recomputeTotals(nodes: TodoNode[]): number {
  let total = 0
  for (const n of nodes) {
    if (n.kind === 'item') {
      if (!n.checked) total += 1
    } else {
      n.totalOpen = recomputeTotals(n.children)
      total += n.totalOpen
    }
  }
  return total
}

function ensureOrphan(roots: TodoNode[]): GroupNode {
  const last = roots[roots.length - 1]
  if (last && last.kind === 'group' && last.line === -1) return last
  const g: GroupNode = {
    kind: 'group',
    level: 1,
    title: '(未分组)',
    line: -1,
    children: [],
    totalOpen: 0,
  }
  roots.unshift(g)
  return g
}

function hashLine(line: string): string {
  return createHash('sha256').update(line).digest('hex').slice(0, 8)
}

function stripBom(s: string): string {
  return s.charCodeAt(0) === 0xfeff ? s.slice(1) : s
}
