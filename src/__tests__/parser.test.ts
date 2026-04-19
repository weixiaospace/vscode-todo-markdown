import { describe, it, expect } from 'vitest'
import { parseTodoMarkdown } from '../parser'

describe('parseTodoMarkdown — basics', () => {
  it('parses ## group with unchecked items', () => {
    const input = [
      '## 🔥 进行中',
      '- [ ] task A',
      '- [ ] task B',
    ].join('\n')
    const tree = parseTodoMarkdown(input)
    expect(tree).toHaveLength(1)
    const g = tree[0]
    expect(g.kind).toBe('group')
    if (g.kind !== 'group') return
    expect(g.level).toBe(1)
    expect(g.title).toBe('进行中')
    expect(g.emoji).toBe('🔥')
    expect(g.line).toBe(0)
    expect(g.children).toHaveLength(2)
    expect(g.totalOpen).toBe(2)
  })

  it('marks checked items with done state', () => {
    const input = [
      '## Done',
      '- [x] finished',
      '- [ ] not yet',
    ].join('\n')
    const tree = parseTodoMarkdown(input)
    const g = tree[0]
    if (g.kind !== 'group') throw new Error('expected group')
    const [a, b] = g.children
    if (a.kind !== 'item' || b.kind !== 'item') throw new Error('expected items')
    expect(a.checked).toBe(true)
    expect(a.text).toBe('finished')
    expect(b.checked).toBe(false)
    expect(g.totalOpen).toBe(1)
  })
})
