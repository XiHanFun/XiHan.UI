// @vitest-environment jsdom
import { describe, expect, it } from 'vitest'
import { indexOfValue, isItemDisabled, navigateItems, queryItems } from '../src/collection/items'
import { navIntentFromKey, stepIndex } from '../src/collection/navigate'

describe('navIntentFromKey', () => {
  it('轴限制：横向列表放行上下键（返回 null，调用方不得 preventDefault）', () => {
    expect(navIntentFromKey('ArrowRight', { axis: 'horizontal' })).toBe('next')
    expect(navIntentFromKey('ArrowLeft', { axis: 'horizontal' })).toBe('prev')
    expect(navIntentFromKey('ArrowDown', { axis: 'horizontal' })).toBeNull()
    expect(navIntentFromKey('ArrowUp', { axis: 'horizontal' })).toBeNull()
  })

  it('轴限制：纵向列表放行左右键', () => {
    expect(navIntentFromKey('ArrowDown', { axis: 'vertical' })).toBe('next')
    expect(navIntentFromKey('ArrowRight', { axis: 'vertical' })).toBeNull()
  })

  it('axis=\'both\'：四个方向键全部响应（RadioGroup 的规范要求）', () => {
    for (const [key, intent] of [['ArrowRight', 'next'], ['ArrowDown', 'next'], ['ArrowLeft', 'prev'], ['ArrowUp', 'prev']] as const)
      expect(navIntentFromKey(key, { axis: 'both' })).toBe(intent)
  })

  it('rtl 只翻转水平轴，垂直轴不变', () => {
    expect(navIntentFromKey('ArrowRight', { dir: 'rtl' })).toBe('prev')
    expect(navIntentFromKey('ArrowLeft', { dir: 'rtl' })).toBe('next')
    expect(navIntentFromKey('ArrowDown', { dir: 'rtl' })).toBe('next')
  })

  it('home/End 可关闭（RadioGroup 规范未要求）', () => {
    expect(navIntentFromKey('Home')).toBe('first')
    expect(navIntentFromKey('End')).toBe('last')
    expect(navIntentFromKey('Home', { home: false })).toBeNull()
  })

  it('无关按键一律 null', () => {
    for (const key of ['a', 'Enter', ' ', 'Tab', 'PageDown'])
      expect(navIntentFromKey(key)).toBeNull()
  })

  it('带修饰键的组合不归导航管（否则 Ctrl+Home 等浏览器/读屏组合被吞）', () => {
    expect(navIntentFromKey({ key: 'Home' })).toBe('first')
    for (const mod of ['ctrlKey', 'metaKey', 'altKey', 'shiftKey'] as const) {
      expect(navIntentFromKey({ key: 'Home', [mod]: true })).toBeNull()
      expect(navIntentFromKey({ key: 'ArrowDown', [mod]: true })).toBeNull()
    }
  })

  it('传事件对象与传裸键名对无修饰键的情形结果一致', () => {
    for (const key of ['ArrowDown', 'ArrowUp', 'Home', 'End', 'x'])
      expect(navIntentFromKey({ key })).toBe(navIntentFromKey(key))
  })
})

describe('stepIndex', () => {
  it('基本前后移动', () => {
    expect(stepIndex(3, 0, 'next')).toBe(1)
    expect(stepIndex(3, 1, 'prev')).toBe(0)
    expect(stepIndex(3, 0, 'last')).toBe(2)
    expect(stepIndex(3, 2, 'first')).toBe(0)
  })

  it('回绕开关', () => {
    expect(stepIndex(3, 2, 'next', { loop: true })).toBe(0)
    expect(stepIndex(3, 0, 'prev', { loop: true })).toBe(2)
    expect(stepIndex(3, 2, 'next', { loop: false })).toBe(-1)
    expect(stepIndex(3, 0, 'prev', { loop: false })).toBe(-1)
  })

  it('跳过禁用项', () => {
    const skip = (i: number): boolean => i === 1
    expect(stepIndex(3, 0, 'next', { skip })).toBe(2)
    expect(stepIndex(3, 2, 'prev', { skip })).toBe(0)
  })

  it('first/last 也要跳过禁用项', () => {
    expect(stepIndex(3, -1, 'first', { skip: i => i === 0 })).toBe(1)
    expect(stepIndex(3, -1, 'last', { skip: i => i === 2 })).toBe(1)
  })

  it('无当前项（from=-1）时 next 从头找、prev 从尾找', () => {
    expect(stepIndex(3, -1, 'next')).toBe(0)
    expect(stepIndex(3, -1, 'prev')).toBe(2)
  })

  it('全禁用返回 -1，不死循环', () => {
    expect(stepIndex(3, 0, 'next', { skip: () => true })).toBe(-1)
    expect(stepIndex(3, 0, 'prev', { skip: () => true, loop: false })).toBe(-1)
    expect(stepIndex(3, -1, 'first', { skip: () => true })).toBe(-1)
  })

  it('空集合返回 -1', () => {
    expect(stepIndex(0, -1, 'next')).toBe(-1)
    expect(stepIndex(0, -1, 'first')).toBe(-1)
  })

  it('回绕且仅剩当前项可停留时，停在原地而非 -1', () => {
    expect(stepIndex(3, 1, 'next', { skip: i => i !== 1 })).toBe(1)
  })
})

function mount(html: string): HTMLElement {
  const host = document.createElement('div')
  host.innerHTML = html
  document.body.appendChild(host)
  return host
}

describe('queryItems', () => {
  it('按 scope+part 取条目，文档序', () => {
    const host = mount(`
      <div data-scope="tabs" data-part="list">
        <button data-scope="tabs" data-part="trigger" data-value="a"></button>
        <button data-scope="tabs" data-part="trigger" data-value="b"></button>
      </div>`)
    const list = host.querySelector<HTMLElement>('[data-part="list"]')
    const items = queryItems(list, { scope: 'tabs', part: 'trigger' })
    expect(items.map(el => el.dataset.value)).toEqual(['a', 'b'])
    host.remove()
  })

  it('嵌套同类集合互不吞并：外层只取自己的条目', () => {
    const host = mount(`
      <div data-scope="tabs" data-part="list" id="outer">
        <button data-scope="tabs" data-part="trigger" data-value="a"></button>
        <div data-scope="tabs" data-part="content">
          <div data-scope="tabs" data-part="list" id="inner">
            <button data-scope="tabs" data-part="trigger" data-value="inner-1"></button>
          </div>
        </div>
        <button data-scope="tabs" data-part="trigger" data-value="b"></button>
      </div>`)
    const outer = host.querySelector<HTMLElement>('#outer')
    const inner = host.querySelector<HTMLElement>('#inner')
    expect(queryItems(outer, { scope: 'tabs', part: 'trigger' }).map(el => el.dataset.value)).toEqual(['a', 'b'])
    expect(queryItems(inner, { scope: 'tabs', part: 'trigger' }).map(el => el.dataset.value)).toEqual(['inner-1'])
    host.remove()
  })

  it('容器为空时返回空数组，不抛', () => {
    expect(queryItems(null, { scope: 'tabs', part: 'trigger' })).toEqual([])
  })

  // 条目与容器之间隔着同 scope 的其它 part（Accordion 的 item/header）：
  // 归属判据若取"任意同 scope 祖先"，最近的会是 header，条目会被全部过滤掉。
  it('条目与容器之间隔着同 scope 的其它 part 时照样取得到', () => {
    const host = mount(`
      <div data-scope="accordion" data-part="root" id="root">
        <div data-scope="accordion" data-part="item">
          <h3 data-scope="accordion" data-part="header">
            <button data-scope="accordion" data-part="trigger" data-value="a"></button>
          </h3>
        </div>
        <div data-scope="accordion" data-part="item">
          <h3 data-scope="accordion" data-part="header">
            <button data-scope="accordion" data-part="trigger" data-value="b"></button>
          </h3>
        </div>
      </div>`)
    const root = host.querySelector<HTMLElement>('#root')
    expect(queryItems(root, { scope: 'accordion', part: 'trigger' }).map(el => el.dataset.value)).toEqual(['a', 'b'])
    host.remove()
  })

  it('多层嵌套下仍按最近的同 part 容器归属', () => {
    const host = mount(`
      <div data-scope="accordion" data-part="root" id="outer">
        <div data-scope="accordion" data-part="item">
          <h3 data-scope="accordion" data-part="header">
            <button data-scope="accordion" data-part="trigger" data-value="outer-a"></button>
          </h3>
          <div data-scope="accordion" data-part="content">
            <div data-scope="accordion" data-part="root" id="inner">
              <div data-scope="accordion" data-part="item">
                <h3 data-scope="accordion" data-part="header">
                  <button data-scope="accordion" data-part="trigger" data-value="inner-a"></button>
                </h3>
              </div>
            </div>
          </div>
        </div>
      </div>`)
    const q = { scope: 'accordion', part: 'trigger' }
    expect(queryItems(host.querySelector('#outer'), q).map(el => el.dataset.value)).toEqual(['outer-a'])
    expect(queryItems(host.querySelector('#inner'), q).map(el => el.dataset.value)).toEqual(['inner-a'])
    host.remove()
  })
})

describe('条目禁用与按值导航', () => {
  it('aria-disabled 算禁用，原生 disabled 也算', () => {
    const host = mount(`
      <div data-scope="radio-group" data-part="root">
        <button data-scope="radio-group" data-part="item" data-value="a"></button>
        <button data-scope="radio-group" data-part="item" data-value="b" aria-disabled="true"></button>
        <button data-scope="radio-group" data-part="item" data-value="c" disabled></button>
      </div>`)
    const root = host.querySelector<HTMLElement>('[data-part="root"]')
    const items = queryItems(root, { scope: 'radio-group', part: 'item' })
    expect(items.map(isItemDisabled)).toEqual([false, true, true])
    expect(indexOfValue(items, 'c')).toBe(2)
    expect(indexOfValue(items, '不存在')).toBe(-1)

    // 从 a 前进：跳过禁用的 b 和 c，回绕停回 a
    expect(navigateItems(items, 'a', 'next')?.dataset.value).toBe('a')
    // 允许停留禁用项时前进到 b
    expect(navigateItems(items, 'a', 'next', { focusDisabled: true })?.dataset.value).toBe('b')
    // 当前值已不存在（条目被删的情形）：从头找第一个可停留项
    expect(navigateItems(items, '已删除', 'next')?.dataset.value).toBe('a')
    host.remove()
  })
})
