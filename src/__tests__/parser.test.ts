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
