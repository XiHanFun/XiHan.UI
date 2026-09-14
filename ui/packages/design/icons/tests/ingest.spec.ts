import { describe, expect, it } from 'vitest'
import { svgToIconRecord, toIconName } from '../build/index.mjs'

/** 外部图标集的典型形状：带 class、width/height、许可注释，而且不是 24 网格。 */
const FOREIGN = `<!-- @license Some Set v1 - MIT -->
<svg class="icon icon-star" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
  <title>star</title>
  <path d="M8 1l2 5h5l-4 3 1 5-4-3-4 3 1-5-4-3h5z"/>
</svg>`

describe('图标名归一', () => {
  it('小写连字符分段', () => {
    expect(toIconName('ArrowDown')).toBe('arrowdown')
    expect(toIconName('arrow_down right')).toBe('arrow-down-right')
    expect(toIconName('--check--')).toBe('check')
  })

  it('数字打头前缀一个 n，否则派生出的导出名不是合法标识符', () => {
    expect(toIconName('0-circle')).toBe('n0-circle')
    expect(toIconName('123')).toBe('n123')
  })

  it('归一之后是空的就交回 null', () => {
    expect(toIconName('***')).toBeNull()
    expect(toIconName('  ')).toBeNull()
  })
})

describe('摄取外部图标集', () => {
  it('严格模式下外部集进不来——class 之类会被当成写错', () => {
    expect(() => svgToIconRecord(FOREIGN, 'star', 'star.svg')).toThrow(/class/)
  })

  it('宽松模式收下它，并逐条记下丢了什么', () => {
    const { record, notes } = svgToIconRecord(FOREIGN, 'star', 'star.svg', { lenient: true })
    expect(record.name).toBe('star')
    expect(record.nodes).toHaveLength(1)
    expect(notes.join(' ')).toContain('class')
    expect(notes.join(' ')).toContain('width')
  })

  it('非 24 网格的源就地归一到 24', () => {
    const { record } = svgToIconRecord(FOREIGN, 'star', 'star.svg', { lenient: true })
    expect(record.viewBox).toBe('0 0 24 24')
  })

  it('宽松模式也不放行 use：它的样子依赖记录表达不了的东西，收下就是画错', () => {
    const withUse = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><use href="#other"/></svg>`
    expect(() => svgToIconRecord(withUse, 'bad', 'bad.svg', { lenient: true })).toThrow()
  })

  it('宽松模式也不放行内联事件属性', () => {
    const withEvent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M0 0h24" onclick="alert(1)"/></svg>`
    const { record } = svgToIconRecord(withEvent, 'ok', 'ok.svg', { lenient: true })
    expect(JSON.stringify(record)).not.toContain('onclick')
  })
})
