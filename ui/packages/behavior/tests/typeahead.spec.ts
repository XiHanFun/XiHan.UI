// @vitest-environment jsdom

import { describe, expect, it } from 'vitest'
import { createTypeahead, matchTypeahead } from '../src/collection/typeahead'

/** 可控时钟：缓冲区过期是时间相关的，别让用例去睡。 */
function clock(): { now: () => number, advance: (ms: number) => void } {
  let t = 1000
  return { now: () => t, advance: (ms) => { t += ms } }
}

describe('createTypeahead 缓冲', () => {
  it('连续按键累计成查询串', () => {
    const c = clock()
    const ta = createTypeahead({ now: c.now })
    expect(ta.push('a')).toBe('a')
    c.advance(50)
    expect(ta.push('b')).toBe('ab')
    c.advance(50)
    expect(ta.push('c')).toBe('abc')
  })

  it('停顿超过 timeout 后重开一轮', () => {
    const c = clock()
    const ta = createTypeahead({ timeout: 300, now: c.now })
    ta.push('a')
    c.advance(299)
    expect(ta.push('b')).toBe('ab')
    c.advance(301)
    expect(ta.push('c')).toBe('c')
  })

  it('非字符键不参与检索', () => {
    const ta = createTypeahead({ now: clock().now })
    for (const key of ['ArrowDown', 'Enter', 'Escape', 'Tab', 'F1', 'Home'])
      expect(ta.push(key)).toBeNull()
  })

  it('空格只在已有查询串时才算字符（缓冲为空时归"选中当前项"）', () => {
    const c = clock()
    const ta = createTypeahead({ now: c.now })
    expect(ta.push(' ')).toBeNull()
    ta.push('a')
    c.advance(50)
    expect(ta.push(' ')).toBe('a ')
  })

  it('clear 之后重新开始', () => {
    const c = clock()
    const ta = createTypeahead({ now: c.now })
    ta.push('a')
    ta.clear()
    c.advance(10)
    expect(ta.push('b')).toBe('b')
  })
})

function items(labels: readonly string[]): HTMLElement[] {
  return labels.map((t) => {
    const el = document.createElement('div')
    el.textContent = t
    return el
  })
}

describe('matchTypeahead 落点', () => {
  const list = items(['Apple', 'Avocado', 'Banana', 'Blueberry', 'Cherry'])

  it('按前缀命中，大小写与首尾空白不敏感', () => {
    expect(matchTypeahead(list, -1, 'ban')?.textContent).toBe('Banana')
    expect(matchTypeahead(list, -1, 'BLUE')?.textContent).toBe('Blueberry')
  })

  it('允许命中当前项：边打边改不会一直往后跳', () => {
    // 当前停在 Avocado(1)，输入 "a" 仍应停在 Avocado 而不是跳到 Apple
    expect(matchTypeahead(list, 1, 'a')?.textContent).toBe('Avocado')
  })

  it('同一字符连打是在候选之间轮换，不是找前缀 "aa"', () => {
    expect(matchTypeahead(list, 0, 'aa')?.textContent).toBe('Avocado')
    expect(matchTypeahead(list, 1, 'aaa')?.textContent).toBe('Apple')
  })

  it('轮换会绕回开头', () => {
    expect(matchTypeahead(list, 4, 'cc')?.textContent).toBe('Cherry')
    expect(matchTypeahead(list, 3, 'bb')?.textContent).toBe('Banana')
  })

  it('跳过禁用项', () => {
    const skip = (el: HTMLElement): boolean => el.textContent === 'Banana'
    expect(matchTypeahead(list, -1, 'b', { skip })?.textContent).toBe('Blueberry')
  })

  it('无匹配返回 null（调用方应保持原状）', () => {
    expect(matchTypeahead(list, 0, 'zz')).toBeNull()
    expect(matchTypeahead(list, 0, '')).toBeNull()
    expect(matchTypeahead([], 0, 'a')).toBeNull()
  })

  it('可自定义取文本（条目里混着图标等非文本节点时）', () => {
    const els = items(['x', 'y'])
    els[0]!.dataset.label = 'Zebra'
    els[1]!.dataset.label = 'Yak'
    const text = (el: HTMLElement): string => el.dataset.label ?? ''
    expect(matchTypeahead(els, -1, 'ze', { text })?.dataset.label).toBe('Zebra')
  })
})
