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

describe('parseTodoMarkdown — nested groups', () => {
  it('nests ### under its enclosing ##', () => {
    const input = [
      '## 📅 计划',
      '### 编辑器',
      '- [ ] DOCX 导出',
      '- [ ] 交叉引用',
      '### 文献',
      '- [ ] AI 搜索',
    ].join('\n')
    const tree = parseTodoMarkdown(input)
    expect(tree).toHaveLength(1)
    const plan = tree[0]
    if (plan.kind !== 'group') throw new Error('expected group')
    expect(plan.title).toBe('计划')
    expect(plan.children).toHaveLength(2)
    const editor = plan.children[0]
    const lit = plan.children[1]
    if (editor.kind !== 'group' || lit.kind !== 'group') throw new Error('expected groups')
    expect(editor.level).toBe(2)
    expect(editor.children).toHaveLength(2)
    expect(lit.children).toHaveLength(1)
    expect(plan.totalOpen).toBe(3)
  })

  it('ignores #### and deeper (no group created, items keep attaching)', () => {
    const input = [
      '## 计划',
      '### 编辑器',
      '#### 子子标题',
      '- [ ] inner task',
    ].join('\n')
    const tree = parseTodoMarkdown(input)
    const plan = tree[0]
    if (plan.kind !== 'group') throw new Error('expected group')
    const editor = plan.children[0]
    if (editor.kind !== 'group') throw new Error('expected group')
    expect(editor.children).toHaveLength(1)
    expect(editor.children[0].kind).toBe('item')
  })
})

describe('parseTodoMarkdown — code fence', () => {
  it('skips items and headings inside ``` fences', () => {
    const input = [
      '## Real',
      '- [ ] real task',
      '```',
      '## Fake heading',
      '- [ ] fake item',
      '```',
      '- [ ] another real',
    ].join('\n')
    const tree = parseTodoMarkdown(input)
    expect(tree).toHaveLength(1)
    const g = tree[0]
    if (g.kind !== 'group') throw new Error('expected group')
    expect(g.children.map(c => c.kind === 'item' ? c.text : c.title)).toEqual(['real task', 'another real'])
  })

  it('also respects ~~~ fences', () => {
    const input = [
      '## G',
      '~~~',
      '- [ ] inside tilde fence',
      '~~~',
      '- [ ] outside',
    ].join('\n')
    const tree = parseTodoMarkdown(input)
    const g = tree[0]
    if (g.kind !== 'group') throw new Error('expected group')
    expect(g.children).toHaveLength(1)
  })
})

describe('parseTodoMarkdown — input variants', () => {
  it('accepts -, *, + bullet markers and lowercase/uppercase x', () => {
    const input = [
      '## G',
      '- [ ] dash space',
      '* [x] star done',
      '+ [X] plus upper',
    ].join('\n')
    const tree = parseTodoMarkdown(input)
    const g = tree[0]
    if (g.kind !== 'group') throw new Error('expected group')
    expect(g.children).toHaveLength(3)
    const [a, b, c] = g.children
    if (a.kind !== 'item' || b.kind !== 'item' || c.kind !== 'item') {
      throw new Error('expected items')
    }
    expect([a.checked, b.checked, c.checked]).toEqual([false, true, true])
  })

  it('handles CRLF and BOM', () => {
    const input = '\uFEFF## G\r\n- [ ] crlf task\r\n'
    const tree = parseTodoMarkdown(input)
    const g = tree[0]
    if (g.kind !== 'group') throw new Error('expected group')
    expect(g.children).toHaveLength(1)
    const item = g.children[0]
    if (item.kind !== 'item') throw new Error('expected item')
    expect(item.text).toBe('crlf task')
  })

  it('computes indent level from leading spaces/tabs', () => {
    const input = [
      '## G',
      '- [ ] root',
      '  - [ ] two-space',
      '    - [ ] four-space',
      '\t- [ ] tab',
    ].join('\n')
    const tree = parseTodoMarkdown(input)
    const g = tree[0]
    if (g.kind !== 'group') throw new Error('expected group')
    const indents = g.children
      .filter((c): c is import('../types').ItemNode => c.kind === 'item')
      .map(c => c.indent)
    expect(indents).toEqual([0, 1, 2, 1])
  })
})

describe('parseTodoMarkdown — edge cases', () => {
  it('groups items before any heading under a virtual "(未分组)" group', () => {
    const input = [
      '- [ ] orphan one',
      '- [ ] orphan two',
      '## later',
      '- [ ] categorized',
    ].join('\n')
    const tree = parseTodoMarkdown(input)
    expect(tree).toHaveLength(2)
    const orphan = tree[0]
    const later = tree[1]
    if (orphan.kind !== 'group' || later.kind !== 'group') throw new Error('expected groups')
    expect(orphan.title).toBe('(未分组)')
    expect(orphan.line).toBe(-1)
    expect(orphan.children).toHaveLength(2)
    expect(later.children).toHaveLength(1)
  })

  it('returns empty array for empty input', () => {
    expect(parseTodoMarkdown('')).toEqual([])
  })

  it('returns just groups when headings have no items', () => {
    const tree = parseTodoMarkdown('## A\n## B\n')
    expect(tree.map(n => n.kind === 'group' ? n.title : '')).toEqual(['A', 'B'])
    expect(tree.every(n => n.kind === 'group' && n.children.length === 0)).toBe(true)
  })

  it('computes unique lineHash per line content', () => {
    const input = [
      '## G',
      '- [ ] same text',
      '- [ ] same text',
      '- [ ] different',
    ].join('\n')
    const tree = parseTodoMarkdown(input)
    const g = tree[0]
    if (g.kind !== 'group') throw new Error('expected group')
    const hashes = g.children
      .filter((c): c is import('../types').ItemNode => c.kind === 'item')
      .map(c => c.lineHash)
    expect(hashes[0]).toBe(hashes[1]) // same input → same hash
    expect(hashes[0]).not.toBe(hashes[2])
    expect(hashes[0]).toHaveLength(8)
  })
})
