// 标签带放不下时的「更多」下拉（Web Components）：作者只在 root 里、紧跟 list 之后写一颗 overflow-trigger，
// 下拉的定位层、列表与条目由元素自己建。可见区外是哪几个标签、选中后挪进可见区与焦点的来回，只有真实排版算得出来。
import { setMotionOverride } from '@xihan-ui/motion'
import { afterEach, describe, expect, it } from 'vitest'
import { userEvent } from 'vitest/browser'
import { defineXhElements } from '../../src/define'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

defineXhElements()

interface Updatable extends HTMLElement {
  updateComplete: Promise<unknown>
}

/** 十二枚标签，每枚都比一个词长，320px 的外层只放得下三四枚。 */
const VALUES = Array.from({ length: 12 }, (_, i) => `tab-${i + 1}`)

async function settle(): Promise<void> {
  for (let round = 0; round < 5; round++) {
    await Promise.resolve()
    for (const element of document.querySelectorAll<Updatable>('xh-tabs'))
      await element.updateComplete
  }
  await new Promise<void>(resolve => requestAnimationFrame(() => resolve()))
}

afterEach(async () => {
  // 指针停回角落的停靠点：点过下拉项后它还悬在下拉的位置上，下一条用例的下拉一开就被它点亮
  const park = document.querySelector<HTMLElement>('[data-test-park-pointer]')
  if (park)
    await userEvent.hover(park)
  for (const el of document.querySelectorAll('xh-tabs'))
    el.parentElement?.remove()
  setMotionOverride(null)
})

interface Mounted {
  box: HTMLElement
  root: () => HTMLElement
  list: () => HTMLElement
  more: () => HTMLElement
  trigger: (value: string) => HTMLElement
  listed: () => string[]
  menuItem: (value: string) => HTMLElement | null
}

async function mount(width: number): Promise<Mounted> {
  // 位移补间在机器里逐帧跑；这里断言的是落定后的几何，按减弱动效一步到位
  setMotionOverride('reduce')
  const box = document.createElement('div')
  box.style.inlineSize = `${width}px`
  const tabs = VALUES.map(value => `<button data-xh-part="trigger" value="${value}">第 ${value.slice(4)} 个标签</button>`).join('')
  const panels = VALUES.map(value => `<div data-xh-part="content" value="${value}">面板 ${value}</div>`).join('')
  box.innerHTML = `<xh-tabs default-value="tab-1"><div data-xh-part="root"><div data-xh-part="list" aria-label="标签">${tabs}<div data-xh-part="indicator"></div></div><button data-xh-part="overflow-trigger"></button>${panels}</div></xh-tabs>`
  document.body.append(box)
  await settle()
  const q = (part: string): HTMLElement => box.querySelector<HTMLElement>(`[data-scope="tabs"][data-part="${part}"]`)!
  return {
    box,
    root: () => q('root'),
    list: () => q('list'),
    more: () => q('overflow-trigger'),
    trigger: value => box.querySelector<HTMLElement>(`[data-scope="tabs"][data-part="trigger"][data-value="${value}"]`)!,
    listed: () => [...document.querySelectorAll<HTMLElement>('[data-scope="menu"][data-part="item"]')].map(el => el.dataset.value!),
    menuItem: value => document.querySelector<HTMLElement>(`[data-scope="menu"][data-part="item"][data-value="${value}"]`),
  }
}

/** 按真实几何算出可见区外的标签：没有整个落在标签带内衬盒里的，文档序（这里没放翻页钮）。 */
function outsideVisible(m: Mounted): string[] {
  const rect = m.list().getBoundingClientRect()
  return VALUES.filter((value) => {
    const r = m.trigger(value).getBoundingClientRect()
    return r.left < rect.left - 0.5 || r.right > rect.right + 0.5
  })
}

describe('wc 标签页 · 「更多」下拉（真实排版）', () => {
  it('放不下：钮排在标签带行尾、不出界，下拉里恰好是可见区外的标签；宽度够时钮收起，只差钮那一截也收', async () => {
    const m = await mount(320)
    await expect.poll(() => m.more().hidden).toBe(false)
    const list = m.list().getBoundingClientRect()
    const more = m.more().getBoundingClientRect()
    expect(more.left).toBeGreaterThan(list.right)
    expect(more.right).toBeLessThanOrEqual(m.root().getBoundingClientRect().right + 0.5)
    expect(m.more().closest('[role="tablist"]')).toBeNull()
    expect(m.more().tabIndex).toBe(0)
    // 皮肤画的兜底字形：横排三点
    expect(getComputedStyle(m.more(), '::before').content).toBe('""')

    const expected = outsideVisible(m)
    expect(expected.length).toBeGreaterThan(0)
    await userEvent.click(m.more())
    await expect.poll(() => m.more().getAttribute('aria-expanded')).toBe('true')
    expect(m.listed()).toEqual(expected)
    await userEvent.keyboard('{Escape}')
    await expect.poll(() => m.more().getAttribute('aria-expanded')).toBe('false')

    const extent = m.trigger('tab-12').getBoundingClientRect().right - m.trigger('tab-1').getBoundingClientRect().left
    m.box.style.inlineSize = `${Math.ceil(extent) + 2}px`
    await expect.poll(() => m.more().hidden).toBe(true)
    expect(m.trigger('tab-12').getBoundingClientRect().right).toBeLessThanOrEqual(m.list().getBoundingClientRect().right + 0.5)
  })

  it('选中下拉里的一项：选中那个标签并整个挪进可见区，下拉收起、焦点回到钮上', async () => {
    const m = await mount(320)
    await expect.poll(() => m.more().hidden).toBe(false)
    await userEvent.click(m.more())
    await expect.poll(() => m.more().getAttribute('aria-expanded')).toBe('true')
    await userEvent.click(m.menuItem('tab-9')!)
    await expect.poll(() => m.trigger('tab-9').getAttribute('aria-selected')).toBe('true')
    await expect.poll(() => m.more().getAttribute('aria-expanded')).toBe('false')
    await expect.poll(() => document.activeElement).toBe(m.more())
    const list = m.list().getBoundingClientRect()
    const tab = m.trigger('tab-9').getBoundingClientRect()
    expect(tab.left).toBeGreaterThanOrEqual(list.left - 0.5)
    expect(tab.right).toBeLessThanOrEqual(list.right + 0.5)
  })

  it('键盘：方向键只在标签之间走，钮在标签带之后自占一个 Tab 位；下方向键展开落到首项，Escape 收起回到钮', async () => {
    const m = await mount(320)
    await expect.poll(() => m.more().hidden).toBe(false)
    m.trigger('tab-1').focus()
    await userEvent.keyboard('{End}')
    expect(document.activeElement).toBe(m.trigger('tab-12'))
    await userEvent.keyboard('{ArrowRight}')
    expect(document.activeElement).toBe(m.trigger('tab-1'))
    await userEvent.tab()
    expect(document.activeElement).toBe(m.more())
    const first = outsideVisible(m)[0]!
    await userEvent.keyboard('{ArrowDown}')
    await expect.poll(() => document.activeElement).toBe(m.menuItem(first))
    await userEvent.keyboard('{Escape}')
    await expect.poll(() => document.activeElement).toBe(m.more())
  })
})
