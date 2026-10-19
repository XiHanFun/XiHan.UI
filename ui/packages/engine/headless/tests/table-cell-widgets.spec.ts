// @vitest-environment jsdom
// 单元格级导航的格内控件锁：表体数据行格子里原本能 Tab 到的控件平时写 tabindex="-1"，记下原值；
// 放开一格时只还原那一格；后来插入的控件、别人改写的 tabindex 都接得住；关掉开关或释放时全部还原。
import type { CellWidgetLock } from '../src/table/table.cell-widgets'
import { afterEach, describe, expect, it } from 'vitest'
import { createCellWidgetLock } from '../src/table/table.cell-widgets'

let lock: CellWidgetLock | null = null

afterEach(() => {
  lock?.dispose()
  lock = null
  document.body.replaceChildren()
})

const part = (name: string): string => `data-scope="table" data-part="${name}"`

/** 一张表：表头一个排序钮；a、b 两行，a 的格子里有输入框、按钮、链接、tabindex=0 的块与原本就是 -1 的输入框；b 后面跟一行详情行。 */
function mount(): { root: HTMLElement, el: (id: string) => HTMLElement, cell: (id: string) => HTMLElement } {
  document.body.innerHTML = `
    <div ${part('root')} data-root>
      <div ${part('header')}><div ${part('row')}><div ${part('column-header')}><button data-id="sort">排序</button></div></div></div>
      <div ${part('body')}>
        <div ${part('row')} tabindex="0">
          <div ${part('cell')} data-cell="a1" tabindex="-1"><input data-id="a1-input"><button data-id="a1-button">改</button></div>
          <div ${part('cell')} data-cell="a2" tabindex="-1"><a href="#x" data-id="a2-link">链接</a><span tabindex="0" data-id="a2-span">块</span><input tabindex="-1" data-id="a2-skip"></div>
        </div>
        <div ${part('row')} tabindex="-1">
          <div ${part('cell')} data-cell="b1" tabindex="-1"><input data-id="b1-input"></div>
        </div>
        <div ${part('expanded-row')}><div ${part('cell')}><input data-id="detail-input"></div></div>
      </div>
    </div>
  `
  return {
    root: document.querySelector<HTMLElement>('[data-root]')!,
    el: id => document.querySelector<HTMLElement>(`[data-id="${id}"]`)!,
    cell: id => document.querySelector<HTMLElement>(`[data-cell="${id}"]`)!,
  }
}

const tick = (): Promise<void> => new Promise(resolve => setTimeout(resolve, 0))

describe('单元格级导航的格内控件锁', () => {
  it('数据行格子里原本能 Tab 到的控件都写 -1；原本就是 -1 的、表头、详情行里的不碰', () => {
    const t = mount()
    lock = createCellWidgetLock(t.root, () => true)
    for (const id of ['a1-input', 'a1-button', 'a2-link', 'a2-span', 'b1-input'])
      expect(t.el(id).getAttribute('tabindex')).toBe('-1')
    expect(t.el('a2-skip').getAttribute('tabindex')).toBe('-1')
    expect(t.el('sort').hasAttribute('tabindex')).toBe(false)
    expect(t.el('detail-input').hasAttribute('tabindex')).toBe(false)
    // 格子自己的 tabindex 归 roving，不动
    expect(t.cell('a1').getAttribute('tabindex')).toBe('-1')
  })

  it('放开一格只还原那一格，返回它此刻可 Tab 的控件；收回后又是 -1', () => {
    const t = mount()
    lock = createCellWidgetLock(t.root, () => true)
    const widgets = lock.release(t.cell('a2'))
    expect(widgets).toEqual([t.el('a2-link'), t.el('a2-span')])
    expect(t.el('a2-link').hasAttribute('tabindex')).toBe(false)
    expect(t.el('a2-span').getAttribute('tabindex')).toBe('0')
    expect(t.el('a2-skip').getAttribute('tabindex')).toBe('-1')
    expect(t.el('a1-input').getAttribute('tabindex')).toBe('-1')

    lock.release(t.cell('a1'))
    expect(t.el('a1-input').hasAttribute('tabindex')).toBe(false)
    expect(t.el('a2-span').getAttribute('tabindex')).toBe('-1')

    lock.relock()
    expect(t.el('a1-input').getAttribute('tabindex')).toBe('-1')
  })

  it('焦点落进格内控件就放开那一格，落回格子或离开表格就收回', () => {
    const t = mount()
    const outside = document.createElement('button')
    document.body.append(outside)
    lock = createCellWidgetLock(t.root, () => true)
    t.el('b1-input').focus()
    expect(t.el('b1-input').hasAttribute('tabindex')).toBe(false)
    t.cell('b1').focus()
    expect(t.el('b1-input').getAttribute('tabindex')).toBe('-1')
    t.el('a1-button').focus()
    expect(t.el('a1-input').hasAttribute('tabindex')).toBe(false)
    outside.focus()
    expect(t.el('a1-input').getAttribute('tabindex')).toBe('-1')
  })

  it('后来插进格子的控件也锁上；放开的那一格里插进来的不锁', async () => {
    const t = mount()
    lock = createCellWidgetLock(t.root, () => true)
    const late = document.createElement('button')
    t.cell('b1').append(late)
    await tick()
    expect(late.getAttribute('tabindex')).toBe('-1')

    lock.release(t.cell('a1'))
    const fresh = document.createElement('input')
    t.cell('a1').append(fresh)
    await tick()
    expect(fresh.hasAttribute('tabindex')).toBe(false)
    lock.relock()
    expect(fresh.getAttribute('tabindex')).toBe('-1')
  })

  it('别人把锁着的控件改写成 0：再写回 -1，放开时还原成改写后的值', async () => {
    const t = mount()
    lock = createCellWidgetLock(t.root, () => true)
    t.el('a1-input').setAttribute('tabindex', '0')
    await tick()
    expect(t.el('a1-input').getAttribute('tabindex')).toBe('-1')
    lock.release(t.cell('a1'))
    expect(t.el('a1-input').getAttribute('tabindex')).toBe('0')
  })

  it('同一轮里先被别人改写、随后又同步：改写照样记成原值', () => {
    const t = mount()
    lock = createCellWidgetLock(t.root, () => true)
    t.el('a2-span').setAttribute('tabindex', '2')
    lock.sync()
    expect(t.el('a2-span').getAttribute('tabindex')).toBe('-1')
    lock.release(t.cell('a2'))
    expect(t.el('a2-span').getAttribute('tabindex')).toBe('2')
  })

  it('行节点挪了位置照样管；控件挪出表格就还原', async () => {
    const t = mount()
    lock = createCellWidgetLock(t.root, () => true)
    const body = t.root.querySelector('[data-part="body"]')!
    body.prepend(t.cell('b1').parentElement!)
    await tick()
    expect(t.el('b1-input').getAttribute('tabindex')).toBe('-1')
    const moved = t.el('a1-button')
    document.body.append(moved)
    await tick()
    expect(moved.hasAttribute('tabindex')).toBe(false)
  })

  it('开关关掉后同步一次全部还原；释放时同样还原', () => {
    const t = mount()
    let on = true
    lock = createCellWidgetLock(t.root, () => on)
    on = false
    lock.sync()
    expect(t.el('a1-input').hasAttribute('tabindex')).toBe(false)
    expect(t.el('a2-span').getAttribute('tabindex')).toBe('0')
    on = true
    lock.sync()
    expect(t.el('a1-input').getAttribute('tabindex')).toBe('-1')
    lock.dispose()
    lock = null
    expect(t.el('a1-input').hasAttribute('tabindex')).toBe(false)
    expect(t.el('a2-span').getAttribute('tabindex')).toBe('0')
    expect(t.el('a2-skip').getAttribute('tabindex')).toBe('-1')
  })
})
