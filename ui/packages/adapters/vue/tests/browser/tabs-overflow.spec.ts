// 标签带放不下时的「更多」下拉：钮排在标签带行尾（tablist 之外），下拉列出此刻没有整个露在可见区里的标签，
// 选中一项即选中并挪进可见区。可见区、钮的落位与宽度够不够，都是真实排版才量得到的几何，jsdom 里标签带永远"放得下"。
import type { App, VNode } from 'vue'
import { setMotionOverride } from '@xihan-ui/motion'
import { afterEach, describe, expect, it } from 'vitest'
import { userEvent } from 'vitest/browser'
import { createApp, h } from 'vue'
import { XhTabsContent, XhTabsIndicator, XhTabsList, XhTabsNextTrigger, XhTabsOverflowTrigger, XhTabsPrevTrigger, XhTabsRoot, XhTabsTrigger } from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let app: App | null = null
let host: HTMLElement | null = null

/** 十二枚标签，每枚都比一个词长，320px 的外层只放得下三四枚。 */
const VALUES = Array.from({ length: 12 }, (_, i) => `tab-${i + 1}`)

afterEach(async () => {
  // 指针停回角落的停靠点：点过下拉项后它还悬在下拉的位置上，下一条用例的下拉一开就被它点亮
  await userEvent.hover(document.querySelector<HTMLElement>('[data-test-park-pointer]')!)
  app?.unmount()
  app = null
  host?.remove()
  host = null
  setMotionOverride(null)
})

interface Options {
  width?: number
  /** 两端放上翻页钮。 */
  arrows?: boolean
  dir?: 'rtl'
  orientation?: 'vertical'
  /** root 的块向长度：竖排只有限了高才会放不下。 */
  height?: number
}

interface Parts {
  root: () => HTMLElement
  list: () => HTMLElement
  prev: () => HTMLElement | null
  next: () => HTMLElement | null
  more: () => HTMLElement
  trigger: (value: string) => HTMLElement
  /** 下拉里的条目，按下拉里的次序取身份值。 */
  listed: () => string[]
  menuItem: (value: string) => HTMLElement | null
}

function mountTabs(options: Options = {}): Parts {
  // 位移补间在机器里逐帧跑；这里断言的是落定后的几何，按减弱动效一步到位
  setMotionOverride('reduce')
  host = document.createElement('div')
  host.style.inlineSize = `${options.width ?? 320}px`
  if (options.dir)
    host.setAttribute('dir', options.dir)
  document.body.append(host)
  const render = (): VNode[] => [
    h(XhTabsRoot, {
      defaultValue: 'tab-1',
      dir: options.dir,
      orientation: options.orientation,
      style: options.height ? { blockSize: `${options.height}px` } : undefined,
    }, () => [
      h(XhTabsList, { 'aria-label': '标签' }, () => [
        ...(options.arrows ? [h(XhTabsPrevTrigger)] : []),
        ...VALUES.map(value => h(XhTabsTrigger, { value }, () => `第 ${value.slice(4)} 个标签`)),
        h(XhTabsIndicator),
        ...(options.arrows ? [h(XhTabsNextTrigger)] : []),
      ]),
      h(XhTabsOverflowTrigger),
      ...VALUES.map(value => h(XhTabsContent, { value }, () => `面板 ${value}`)),
    ]),
  ]
  app = createApp({ setup: () => render })
  app.mount(host)
  const q = (part: string): HTMLElement | null => host!.querySelector<HTMLElement>(`[data-scope="tabs"][data-part="${part}"]`)
  return {
    root: () => q('root')!,
    list: () => q('list')!,
    prev: () => q('prev-trigger'),
    next: () => q('next-trigger'),
    more: () => q('overflow-trigger')!,
    trigger: value => host!.querySelector<HTMLElement>(`[data-scope="tabs"][data-part="trigger"][data-value="${value}"]`)!,
    listed: () => [...document.querySelectorAll<HTMLElement>('[data-scope="menu"][data-part="item"]')].map(el => el.dataset.value!),
    menuItem: value => document.querySelector<HTMLElement>(`[data-scope="menu"][data-part="item"][data-value="${value}"]`),
  }
}

/**
 * 按真实几何算出可见区外的标签：标签带内衬盒扣掉两端显示着的翻页钮（挪到头那一侧的钮收起、不算），
 * 没有整个落在这一段里的标签，文档序。
 */
function outsideVisible(p: Parts, vertical = false): string[] {
  const list = p.list()
  const rect = list.getBoundingClientRect()
  const style = getComputedStyle(list)
  const px = (value: string): number => Number.parseFloat(value) || 0
  let start = vertical ? rect.top + px(style.borderTopWidth) + px(style.paddingTop) : rect.left + px(style.borderLeftWidth) + px(style.paddingLeft)
  let end = vertical ? rect.bottom - px(style.borderBottomWidth) - px(style.paddingBottom) : rect.right - px(style.borderRightWidth) - px(style.paddingRight)
  const shown = (el: HTMLElement | null): el is HTMLElement => el != null && !el.hidden && !el.hasAttribute('data-disabled')
  const rtl = getComputedStyle(list).direction === 'rtl'
  const [head, tail] = rtl ? [p.next(), p.prev()] : [p.prev(), p.next()]
  if (shown(head))
    start = vertical ? head.getBoundingClientRect().bottom : head.getBoundingClientRect().right
  if (shown(tail))
    end = vertical ? tail.getBoundingClientRect().top : tail.getBoundingClientRect().left
  return VALUES.filter((value) => {
    const r = p.trigger(value).getBoundingClientRect()
    const [a, b] = vertical ? [r.top, r.bottom] : [r.left, r.right]
    return a < start - 0.5 || b > end + 0.5
  })
}

async function openMenu(p: Parts): Promise<void> {
  await userEvent.click(p.more())
  await expect.poll(() => p.more().getAttribute('aria-expanded')).toBe('true')
}

describe('标签页 · 「更多」下拉（真实排版）', () => {
  it('放不下：钮排在标签带行尾，是与标签同高的正方形、不出界；下拉里恰好是没有整个露在可见区里的标签', async () => {
    const p = mountTabs()
    await expect.poll(() => p.more().hidden).toBe(false)
    const root = p.root().getBoundingClientRect()
    const list = p.list().getBoundingClientRect()
    const more = p.more().getBoundingClientRect()
    const tab = p.trigger('tab-1').getBoundingClientRect()
    // 同一行、排在标签带之后，钮与标签带之间留一截间距
    expect(more.left).toBeGreaterThan(list.right)
    expect(more.right).toBeLessThanOrEqual(root.right + 0.5)
    expect(Math.round(more.top + more.height / 2)).toBe(Math.round(tab.top + tab.height / 2))
    expect(Math.round(more.height)).toBe(Math.round(tab.height))
    expect(Math.round(more.width)).toBe(Math.round(tab.height))
    // 不在 tablist 里、自占一个 Tab 位、对读屏可见，可及名缺省英文
    expect(p.more().closest('[role="tablist"]')).toBeNull()
    expect(p.more().tabIndex).toBe(0)
    expect(p.more().getAttribute('aria-hidden')).toBeNull()
    expect(p.more().getAttribute('aria-label')).toBe('More tabs')
    expect(p.more().getAttribute('aria-haspopup')).toBe('menu')
    // 皮肤画的兜底字形：横排三点
    expect(getComputedStyle(p.more(), '::before').content).toBe('""')

    const expected = outsideVisible(p)
    expect(expected.length).toBeGreaterThan(0)
    expect(expected).not.toContain('tab-1')
    await openMenu(p)
    expect(p.listed()).toEqual(expected)
    expect(p.menuItem(expected[0]!)!.textContent?.trim()).toBe(p.trigger(expected[0]!).textContent?.trim())
  })

  it('选中下拉里的一项：选中那个标签并把它整个挪进可见区，下拉收起、焦点回到钮上，它不再列在下拉里', async () => {
    const p = mountTabs()
    await expect.poll(() => p.more().hidden).toBe(false)
    await openMenu(p)
    const target = 'tab-9'
    expect(p.listed()).toContain(target)
    await userEvent.click(p.menuItem(target)!)
    await expect.poll(() => p.trigger(target).getAttribute('aria-selected')).toBe('true')
    await expect.poll(() => p.more().getAttribute('aria-expanded')).toBe('false')
    await expect.poll(() => document.activeElement).toBe(p.more())
    const list = p.list().getBoundingClientRect()
    const tab = p.trigger(target).getBoundingClientRect()
    expect(tab.left).toBeGreaterThanOrEqual(list.left - 0.5)
    expect(tab.right).toBeLessThanOrEqual(list.right + 0.5)
    expect(outsideVisible(p)).not.toContain(target)
    // 重新打开：下拉跟着新的可见区换了项
    await openMenu(p)
    expect(p.listed()).toEqual(outsideVisible(p))
    expect(p.listed()).toContain('tab-1')
  })

  it('与翻页钮共存：可见区扣掉两端显示着的翻页钮；翻一页后起始侧与结束侧的标签都列在下拉里', async () => {
    const p = mountTabs({ arrows: true })
    await expect.poll(() => p.more().hidden).toBe(false)
    // 翻页钮贴在标签带里的两端，「更多」钮在标签带之外
    expect(p.more().getBoundingClientRect().left).toBeGreaterThan(p.next()!.getBoundingClientRect().right)
    await userEvent.click(p.next()!)
    await expect.poll(() => p.prev()!.hasAttribute('data-disabled')).toBe(false)
    const expected = outsideVisible(p)
    expect(expected).toContain('tab-1')
    expect(expected).toContain('tab-12')
    await openMenu(p)
    expect(p.listed()).toEqual(expected)
  })

  it('宽度够时钮收起：只差钮自己那一截也收起（钮不把自己留住），再窄下来又露面', async () => {
    const p = mountTabs()
    await expect.poll(() => p.more().hidden).toBe(false)
    const extent = p.trigger('tab-12').getBoundingClientRect().right - p.trigger('tab-1').getBoundingClientRect().left
    const more = p.more().getBoundingClientRect().width
    // 放得下全部标签、却放不下「标签 + 钮」的宽度：钮收起，标签带铺满
    host!.style.inlineSize = `${Math.ceil(extent) + 2}px`
    expect(Math.ceil(extent) + 2).toBeLessThan(extent + more)
    await expect.poll(() => p.more().hidden).toBe(true)
    expect(getComputedStyle(p.more()).display).toBe('none')
    const list = p.list().getBoundingClientRect()
    expect(Math.round(list.width)).toBe(Math.round(p.root().getBoundingClientRect().width))
    expect(p.trigger('tab-12').getBoundingClientRect().right).toBeLessThanOrEqual(list.right + 0.5)

    host!.style.inlineSize = '320px'
    await expect.poll(() => p.more().hidden).toBe(false)
  })

  it('键盘：钮在标签带之后自占一个 Tab 位，方向键只在标签之间走；下方向键展开落到首项，Escape 收起回到钮', async () => {
    const p = mountTabs()
    await expect.poll(() => p.more().hidden).toBe(false)
    p.trigger('tab-1').focus()
    await userEvent.keyboard('{End}')
    expect(document.activeElement).toBe(p.trigger('tab-12'))
    await userEvent.keyboard('{ArrowRight}')
    expect(document.activeElement).toBe(p.trigger('tab-1'))

    await userEvent.tab()
    expect(document.activeElement).toBe(p.more())
    await userEvent.tab()
    expect(document.activeElement?.getAttribute('data-part')).toBe('content')
    await userEvent.tab({ shift: true })
    expect(document.activeElement).toBe(p.more())

    const first = outsideVisible(p)[0]!
    await userEvent.keyboard('{ArrowDown}')
    await expect.poll(() => document.activeElement).toBe(p.menuItem(first))
    await userEvent.keyboard('{Escape}')
    await expect.poll(() => document.activeElement).toBe(p.more())
    expect(p.more().getAttribute('aria-expanded')).toBe('false')
  })

  it('rtl：钮落在标签带的行尾（左端）、不出界；下拉里仍是可见区外的标签', async () => {
    const p = mountTabs({ dir: 'rtl' })
    await expect.poll(() => p.more().hidden).toBe(false)
    const root = p.root().getBoundingClientRect()
    const list = p.list().getBoundingClientRect()
    const more = p.more().getBoundingClientRect()
    expect(more.right).toBeLessThan(list.left)
    expect(more.left).toBeGreaterThanOrEqual(root.left - 0.5)
    const expected = outsideVisible(p)
    expect(expected).not.toContain('tab-1')
    await openMenu(p)
    expect(p.listed()).toEqual(expected)
  })

  it('竖排：限了高才放不下，钮排在标签带那一列的列尾、横贯列宽', async () => {
    const p = mountTabs({ orientation: 'vertical', height: 200, width: 480 })
    // 限了高也不把标签压扁：每枚仍是控件高，放不下的那截靠位移露出
    const probe = document.createElement('div')
    probe.style.blockSize = 'var(--xh-control-h-md)'
    host!.append(probe)
    const controlHeight = probe.getBoundingClientRect().height
    probe.remove()
    expect(Math.round(p.trigger('tab-1').getBoundingClientRect().height)).toBe(Math.round(controlHeight))
    await expect.poll(() => p.more().hidden).toBe(false)
    const list = p.list().getBoundingClientRect()
    const more = p.more().getBoundingClientRect()
    expect(more.top).toBeGreaterThan(list.bottom)
    expect(Math.round(more.left)).toBe(Math.round(list.left))
    expect(Math.round(more.width)).toBe(Math.round(list.width))
    expect(more.bottom).toBeLessThanOrEqual(p.root().getBoundingClientRect().bottom + 0.5)
    const expected = outsideVisible(p, true)
    expect(expected.length).toBeGreaterThan(0)
    await openMenu(p)
    expect(p.listed()).toEqual(expected)
  })
})
