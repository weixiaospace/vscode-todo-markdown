import { describe, it, expect } from 'vitest'
import { stripInlineMarkdown } from '../parser'

describe('stripInlineMarkdown', () => {
  it('strips **bold**', () => {
    expect(stripInlineMarkdown('**TipTap 编辑器**：冲突')).toBe('TipTap 编辑器：冲突')
  })

  it('strips *italic* without touching internal underscores', () => {
    expect(stripInlineMarkdown('*emphasis* and work_content_v2')).toBe('emphasis and work_content_v2')
  })

  it('strips inline `code`', () => {
    expect(stripInlineMarkdown('remove `work_nsf_sq` table')).toBe('remove work_nsf_sq table')
  })

  it('unwraps [text](url) to text', () => {
    expect(stripInlineMarkdown('see [详情](./260419.md) now')).toBe('see 详情 now')
  })

  it('handles multiple marks on one line', () => {
    expect(stripInlineMarkdown('**A**: use `foo` or [bar](x)')).toBe('A: use foo or bar')
  })

  it('leaves plain text alone', () => {
    expect(stripInlineMarkdown('plain task description')).toBe('plain task description')
  })

  it('does not eat single asterisks in math-like content', () => {
    // 3 * 4 shouldn't turn into 34; italic regex requires non-space after opening *
    expect(stripInlineMarkdown('3 * 4 = 12')).toBe('3 * 4 = 12')
  })
})
