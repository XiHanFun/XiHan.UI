import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { userEvent } from 'vitest/browser'
import { createApp, h, nextTick, ref } from 'vue'
import { XhToolbarGroup, XhToolbarItem, XhToolbarOverflowTrigger, XhToolbarRoot, XhToolbarSeparator } from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

// 真实排版下的收纳：条目按次序收进行尾「更多」钮弹出的菜单，放得下就不收。
// 条目给定宽 50px（作者的内联样式），可用长度按工具条自己的间距与钮的实际尺寸算出来再比，
// 不写死像素：密度、尺寸档变了，断言跟着令牌走。

const ITEM_WIDTH = 50
const LABELS = ['撤销', '重做', '加粗', '斜体', '复制', '粘贴']

let app: App | null = null
let host: HTMLElement | null = null

afterEach(async () => {
  // 指针停回角落的停靠点：点过菜单项后它还悬在菜单的位置上，下一条用例的菜单一开就被它点亮
  await userEvent.hover(document.querySelector<HTMLElement>('[data-test-park-pointer]')!)
  app?.unmount()
  app = null
  host?.remove()
  host = null
})

interface Mounted {
  width: { value: number }
  clicks: string[]
  root: () => HTMLElement
  items: () => HTMLElement[]
  trigger: () => HTMLElement
  menuItem: (label: string) => HTMLElement | null
}

async function mount(options: { width: number, dir?: 'rtl', grouped?: boolean } = { width: 240 }): Promise<Mounted> {
  host = document.createElement('div')
  if (options.dir)
    host.setAttribute('dir', options.dir)
  document.body.append(host)
  const width = ref(options.width)
  const clicks: string[] = []
  const item = (label: string) => h(XhToolbarItem, {
    'value': label,
    'type': 'button',
    'style': { inlineSize: `${ITEM_WIDTH}px` },
    'data-testid': label,
    'onClick': () => clicks.push(label),
  }, () => label)
  app = createApp({
    setup: () => () => h('div', { style: { inlineSize: `${width.value}px` } }, [
      h(XhToolbarRoot, { 'aria-label': '编辑', 'dir': options.dir }, () => options.grouped
        ? [
            item(LABELS[0]!),
            item(LABELS[1]!),
            h(XhToolbarSeparator),
            h(XhToolbarGroup, null, () => LABELS.slice(2).map(item)),
            h(XhToolbarOverflowTrigger),
          ]
        : [...LABELS.map(item), h(XhToolbarOverflowTrigger)]),
    ]),
  })
  app.mount(host)
  await nextTick()
  await new Promise(resolve => requestAnimationFrame(resolve))
  return {
    width,
    clicks,
    root: () => host!.querySelector<HTMLElement>('[data-scope="toolbar"][data-part="root"]')!,
    items: () => [...host!.querySelectorAll<HTMLElement>('[data-scope="toolbar"][data-part="item"]')],
    trigger: () => host!.querySelector<HTMLElement>('[data-scope="toolbar"][data-part="overflow-trigger"]')!,
    menuItem: label => document.querySelector<HTMLElement>(`[data-scope="menu"][data-part="item"][data-value="${label}"]`),
  }
}

/** 按工具条自己的间距与钮的尺寸，算出这条宽度下应当露出几个条目。 */
function expectedVisible(bar: Mounted, available: number): number {
  const gap = Number.parseFloat(getComputedStyle(bar.root()).columnGap)
  const total = LABELS.length * ITEM_WIDTH + (LABELS.length - 1) * gap
  if (total <= available)
    return LABELS.length
  const room = available - (bar.trigger().getBoundingClientRect().width + gap)
  let count = 0
  while (count < LABELS.length && (count + 1) * ITEM_WIDTH + count * gap <= room)
    count += 1
  return count
}

const hiddenFlags = (bar: Mounted): boolean[] => bar.items().map(el => el.hasAttribute('hidden'))

describe('toolbar 溢出收纳（真实排版）', () => {
  it('放不下时按次序从尾部收：露出的个数与可用宽度对得上，「更多」钮贴在最后一个露出的条目之后、不出界', async () => {
    const bar = await mount({ width: 240 })
    const visible = expectedVisible(bar, 240)
    expect(visible).toBeGreaterThan(0)
    expect(visible).toBeLessThan(LABELS.length)
    expect(hiddenFlags(bar)).toEqual(LABELS.map((_, i) => i >= visible))

    const trigger = bar.trigger()
    expect(trigger.hidden).toBe(false)
    const rootRect = bar.root().getBoundingClientRect()
    const last = bar.items()[visible - 1]!.getBoundingClientRect()
    const triggerRect = trigger.getBoundingClientRect()
    expect(triggerRect.left).toBeGreaterThanOrEqual(last.right)
    expect(triggerRect.right).toBeLessThanOrEqual(rootRect.right + 0.5)
    // 钮是与条目同高的正方形
    expect(triggerRect.width).toBeCloseTo(triggerRect.height, 0)
    expect(triggerRect.height).toBeCloseTo(bar.items()[0]!.getBoundingClientRect().height, 0)
  })

  it('容器变宽变窄都重量：放得下时钮收起，窄下来再收回去', async () => {
    const bar = await mount({ width: 240 })
    bar.width.value = 400
    await expect.poll(() => hiddenFlags(bar)).toEqual(LABELS.map(() => false))
    expect(bar.trigger().hidden).toBe(true)
    bar.width.value = 180
    await expect.poll(() => bar.trigger().hidden).toBe(false)
    const visible = expectedVisible(bar, 180)
    expect(hiddenFlags(bar)).toEqual(LABELS.map((_, i) => i >= visible))
  })

  it('点「更多」展开菜单，菜单里是收起的条目；选中一项即替它触发点击，焦点回到钮上', async () => {
    const bar = await mount({ width: 240 })
    const visible = expectedVisible(bar, 240)
    await userEvent.click(bar.trigger())
    await expect.poll(() => bar.trigger().getAttribute('aria-expanded')).toBe('true')
    // 菜单里恰好是收起的那几条，顺序不变
    const inMenu = LABELS.filter(label => bar.menuItem(label) != null)
    expect(inMenu).toEqual(LABELS.slice(visible))
    const target = LABELS[LABELS.length - 1]!
    await userEvent.click(bar.menuItem(target)!)
    expect(bar.clicks).toEqual([target])
    await expect.poll(() => bar.trigger().getAttribute('aria-expanded')).toBe('false')
    await expect.poll(() => document.activeElement).toBe(bar.trigger())
  })

  it('键盘：End 落到「更多」钮，下方向键展开并落到菜单首项，Escape 收起并把焦点还给钮', async () => {
    const bar = await mount({ width: 240 })
    const visible = expectedVisible(bar, 240)
    bar.items()[0]!.focus()
    await userEvent.keyboard('{End}')
    expect(document.activeElement).toBe(bar.trigger())
    await userEvent.keyboard('{ArrowDown}')
    await expect.poll(() => document.activeElement).toBe(bar.menuItem(LABELS[visible]!))
    await userEvent.keyboard('{Escape}')
    await expect.poll(() => document.activeElement).toBe(bar.trigger())
    expect(bar.trigger().getAttribute('aria-expanded')).toBe('false')
    // 从钮往前走回露着的最后一个条目，收起的条目跳过
    await userEvent.keyboard('{ArrowLeft}')
    expect(document.activeElement).toBe(bar.items()[visible - 1])
  })

  it('焦点所在的条目被收进菜单时，焦点交给「更多」钮', async () => {
    const bar = await mount({ width: 400 })
    bar.items()[LABELS.length - 1]!.focus()
    bar.width.value = 240
    await expect.poll(() => bar.items()[LABELS.length - 1]!.hidden).toBe(true)
    await expect.poll(() => document.activeElement).toBe(bar.trigger())
  })

  it('rtl：条目从右往左收，「更多」钮落在左端、不出界', async () => {
    const bar = await mount({ width: 240, dir: 'rtl' })
    const visible = expectedVisible(bar, 240)
    expect(hiddenFlags(bar)).toEqual(LABELS.map((_, i) => i >= visible))
    const rootRect = bar.root().getBoundingClientRect()
    const last = bar.items()[visible - 1]!.getBoundingClientRect()
    const triggerRect = bar.trigger().getBoundingClientRect()
    expect(triggerRect.right).toBeLessThanOrEqual(last.left)
    expect(triggerRect.left).toBeGreaterThanOrEqual(rootRect.left - 0.5)
  })

  it('分组收掉一截：分隔线与收空的部分让开，组里留下的最后一段补回末端圆角', async () => {
    // 前两个散落条目 + 分隔线 + 四段的分组；窄到分组只剩一段露着
    const bar = await mount({ width: 240, grouped: true })
    const items = bar.items()
    const shown = items.filter(el => !el.hidden)
    expect(shown.length).toBeGreaterThan(2)
    expect(shown.length).toBeLessThan(items.length)
    const lastShown = shown[shown.length - 1]!
    expect(lastShown.closest('[data-part="group"]')).not.toBeNull()
    expect(Number.parseFloat(getComputedStyle(lastShown).borderTopRightRadius)).toBeGreaterThan(0)

    // 窄到分组整组收空：分组与它前面的分隔线都不占位
    bar.width.value = 160
    await expect.poll(() => items.slice(2).every(el => el.hidden)).toBe(true)
    const group = bar.root().querySelector<HTMLElement>('[data-part="group"]')!
    const separator = bar.root().querySelector<HTMLElement>('[data-part="separator"]')!
    expect(getComputedStyle(group).display).toBe('none')
    expect(getComputedStyle(separator).display).toBe('none')
    const gap = Number.parseFloat(getComputedStyle(bar.root()).columnGap)
    const lastItem = items[1]!.getBoundingClientRect()
    expect(bar.trigger().getBoundingClientRect().left - lastItem.right).toBeCloseTo(gap, 0)
  })
})
