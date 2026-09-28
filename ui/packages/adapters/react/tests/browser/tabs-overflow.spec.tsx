// 标签带放不下时的「更多」下拉（React）：钮排在标签带行尾（tablist 之外），下拉列出此刻没有整个露在可见区里的标签，
// 选中一项即选中并挪进可见区。可见区、钮的落位与宽度够不够，只有真实排版量得到。
import type { Root } from 'react-dom/client'
import { setMotionOverride } from '@xihan-ui/motion'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, describe, expect, it } from 'vitest'
import { userEvent } from 'vitest/browser'
import { XhTabsContent, XhTabsIndicator, XhTabsList, XhTabsOverflowTrigger, XhTabsRoot, XhTabsTrigger } from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

/** 十二枚标签，每枚都比一个词长，320px 的外层只放得下三四枚。 */
const VALUES = Array.from({ length: 12 }, (_, i) => `tab-${i + 1}`)
const globals = globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }

let root: Root | null = null
let host: HTMLElement | null = null

async function inAct(fn: () => void | Promise<void>): Promise<void> {
  const previous = globals.IS_REACT_ACT_ENVIRONMENT
  globals.IS_REACT_ACT_ENVIRONMENT = true
  try {
    await act(fn)
  }
  finally {
    globals.IS_REACT_ACT_ENVIRONMENT = previous
  }
}

afterEach(async () => {
  // 指针停回角落的停靠点：点过下拉项后它还悬在下拉的位置上，下一条用例的下拉一开就被它点亮
  const park = document.querySelector<HTMLElement>('[data-test-park-pointer]')
  if (park)
    await userEvent.hover(park)
  await inAct(() => root?.unmount())
  root = null
  host?.remove()
  host = null
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
  host = document.createElement('div')
  document.body.append(host)
  const box = host
  box.style.inlineSize = `${width}px`
  root = createRoot(host)
  await inAct(() => root!.render(
    <XhTabsRoot defaultValue="tab-1">
      <XhTabsList aria-label="标签">
        {VALUES.map(value => <XhTabsTrigger key={value} value={value}>{`第 ${value.slice(4)} 个标签`}</XhTabsTrigger>)}
        <XhTabsIndicator />
      </XhTabsList>
      <XhTabsOverflowTrigger />
      {VALUES.map(value => <XhTabsContent key={value} value={value}>{`面板 ${value}`}</XhTabsContent>)}
    </XhTabsRoot>,
  ))
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

describe('react 标签页 · 「更多」下拉（真实排版）', () => {
  it('放不下：钮排在标签带行尾、不出界，下拉里恰好是可见区外的标签；宽度够时钮收起，只差钮那一截也收', async () => {
    const m = await mount(320)
    await expect.poll(() => m.more().hidden).toBe(false)
    const list = m.list().getBoundingClientRect()
    const more = m.more().getBoundingClientRect()
    expect(more.left).toBeGreaterThan(list.right)
    expect(more.right).toBeLessThanOrEqual(m.root().getBoundingClientRect().right + 0.5)
    expect(m.more().closest('[role="tablist"]')).toBeNull()
    expect(m.more().tabIndex).toBe(0)

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
