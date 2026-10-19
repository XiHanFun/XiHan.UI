// 工具条的溢出收纳（Web Components）：作者只在 root 末尾写一颗 overflow-trigger，
// 「更多」菜单的定位层、列表与条目由元素自己建。放不下几个、菜单里是哪几条、选中后替条目触发的点击
// 与焦点的来回，只有真实排版算得出来。
import { afterEach, describe, expect, it } from 'vitest'
import { userEvent } from 'vitest/browser'
import { defineXhElements } from '../../src/define'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

defineXhElements()

interface Updatable extends HTMLElement {
  updateComplete: Promise<unknown>
}

const ITEM_WIDTH = 50
const LABELS = ['撤销', '重做', '加粗', '斜体', '复制', '粘贴']

async function settle(): Promise<void> {
  for (let round = 0; round < 5; round++) {
    await Promise.resolve()
    for (const element of document.querySelectorAll<Updatable>('xh-toolbar'))
      await element.updateComplete
  }
  await new Promise<void>(resolve => requestAnimationFrame(() => resolve()))
}

afterEach(async () => {
  // 指针停回角落的停靠点：点过菜单项后它还悬在菜单的位置上，下一条用例的菜单一开就被它点亮
  const park = document.querySelector<HTMLElement>('[data-test-park-pointer]')
  if (park)
    await userEvent.hover(park)
  for (const el of document.querySelectorAll('xh-toolbar'))
    el.parentElement?.remove()
})

interface Mounted {
  box: HTMLElement
  clicks: string[]
  root: () => HTMLElement
  items: () => HTMLElement[]
  trigger: () => HTMLElement
  menuItem: (label: string) => HTMLElement | null
}

async function mount(width: number, tones: Readonly<Record<string, string>> = {}): Promise<Mounted> {
  const box = document.createElement('div')
  box.style.inlineSize = `${width}px`
  const items = LABELS.map(label => `<button data-xh-part="item" type="button" value="${label}"${tones[label] ? ` data-tone="${tones[label]}"` : ''} style="inline-size: ${ITEM_WIDTH}px">${label}</button>`).join('')
  box.innerHTML = `<xh-toolbar><div data-xh-part="root" aria-label="编辑">${items}<button data-xh-part="overflow-trigger"></button></div></xh-toolbar>`
  document.body.append(box)
  const clicks: string[] = []
  for (const el of box.querySelectorAll<HTMLElement>('[data-xh-part="item"]'))
    el.addEventListener('click', () => clicks.push(el.getAttribute('value')!))
  await settle()
  return {
    box,
    clicks,
    root: () => box.querySelector<HTMLElement>('[data-scope="toolbar"][data-part="root"]')!,
    items: () => [...box.querySelectorAll<HTMLElement>('[data-scope="toolbar"][data-part="item"]')],
    trigger: () => box.querySelector<HTMLElement>('[data-scope="toolbar"][data-part="overflow-trigger"]')!,
    menuItem: label => document.querySelector<HTMLElement>(`[data-scope="menu"][data-part="item"][data-value="${label}"]`),
  }
}

/** 按工具条自己的间距与钮的尺寸，算出这条宽度下应当露出几个条目。 */
function expectedVisible(bar: Mounted, available: number): number {
  const gap = Number.parseFloat(getComputedStyle(bar.root()).columnGap)
  const room = available - (bar.trigger().getBoundingClientRect().width + gap)
  let count = 0
  while (count < LABELS.length && (count + 1) * ITEM_WIDTH + count * gap <= room)
    count += 1
  return count
}

const hiddenFlags = (bar: Mounted): boolean[] => bar.items().map(el => el.hasAttribute('hidden'))

describe('wc toolbar 溢出收纳（真实排版）', () => {
  it('放不下时按次序从尾部收，「更多」钮贴在最后一个露出的条目之后、不出界；变宽后放回、钮收起', async () => {
    const bar = await mount(240)
    await expect.poll(() => bar.trigger().hidden).toBe(false)
    const visible = expectedVisible(bar, 240)
    expect(visible).toBeGreaterThan(0)
    expect(hiddenFlags(bar)).toEqual(LABELS.map((_, i) => i >= visible))
    const last = bar.items()[visible - 1]!.getBoundingClientRect()
    const trigger = bar.trigger().getBoundingClientRect()
    expect(trigger.left).toBeGreaterThanOrEqual(last.right)
    expect(trigger.right).toBeLessThanOrEqual(bar.root().getBoundingClientRect().right + 0.5)
    // 皮肤画的兜底字形：横排三点
    expect(getComputedStyle(bar.trigger(), '::before').content).toBe('""')

    bar.box.style.inlineSize = '400px'
    await expect.poll(() => hiddenFlags(bar)).toEqual(LABELS.map(() => false))
    expect(bar.trigger().hidden).toBe(true)
  })

  it('菜单里是收起的条目；点选一项即替它触发点击，菜单收起、焦点回到钮上', async () => {
    const bar = await mount(240)
    await expect.poll(() => bar.trigger().hidden).toBe(false)
    const visible = expectedVisible(bar, 240)
    await userEvent.click(bar.trigger())
    await expect.poll(() => bar.trigger().getAttribute('aria-expanded')).toBe('true')
    expect(LABELS.filter(label => bar.menuItem(label) != null)).toEqual(LABELS.slice(visible))
    const target = LABELS[visible]!
    await userEvent.click(bar.menuItem(target)!)
    expect(bar.clicks).toEqual([target])
    await expect.poll(() => bar.trigger().getAttribute('aria-expanded')).toBe('false')
    await expect.poll(() => document.activeElement).toBe(bar.trigger())
  })

  it('条目上写的 data-tone 随条目收进菜单：菜单项带同一语气，字色与没写语气的菜单项不同', async () => {
    const bar = await mount(240, { 粘贴: 'danger' })
    await expect.poll(() => bar.trigger().hidden).toBe(false)
    await userEvent.click(bar.trigger())
    await expect.poll(() => bar.menuItem('粘贴')).not.toBeNull()
    expect(bar.menuItem('粘贴')!.getAttribute('data-tone')).toBe('danger')
    expect(bar.menuItem('复制')!.hasAttribute('data-tone')).toBe(false)
    expect(getComputedStyle(bar.menuItem('粘贴')!).color).not.toBe(getComputedStyle(bar.menuItem('复制')!).color)
    await userEvent.keyboard('{Escape}')
  })

  it('键盘：End 落到「更多」钮，下方向键展开并落到菜单首项，Escape 收起并把焦点还给钮', async () => {
    const bar = await mount(240)
    await expect.poll(() => bar.trigger().hidden).toBe(false)
    const visible = expectedVisible(bar, 240)
    bar.items()[0]!.focus()
    await userEvent.keyboard('{End}')
    expect(document.activeElement).toBe(bar.trigger())
    await userEvent.keyboard('{ArrowDown}')
    await expect.poll(() => document.activeElement).toBe(bar.menuItem(LABELS[visible]!))
    await userEvent.keyboard('{Escape}')
    await expect.poll(() => document.activeElement).toBe(bar.trigger())
    await userEvent.keyboard('{ArrowLeft}')
    expect(document.activeElement).toBe(bar.items()[visible - 1])
  })
})

const LINE = { name: 'line', viewBox: '0 0 24 24', nodes: [{ tag: 'path' as const, attrs: { d: 'M4 12h16' } }] }

/**
 * 收集这一段里抛出的错误：重铺条目的那一轮更新不一定是 updateComplete 当时指着的那一轮，
 * 它抛的错会成为未处理的拒绝，不落在用例的 await 上。
 */
async function errorsDuring(run: () => Promise<void>): Promise<string[]> {
  const errors: string[] = []
  const onRejection = (event: PromiseRejectionEvent): void => {
    errors.push(String(event.reason))
    event.preventDefault()
  }
  window.addEventListener('unhandledrejection', onRejection)
  try {
    await run().catch((error: unknown) => {
      errors.push(String(error))
    })
    await settle()
  }
  finally {
    window.removeEventListener('unhandledrejection', onRejection)
  }
  return errors
}

/** 「更多」菜单里的条目，按文档序。 */
function menuOrder(): string[] {
  return [...document.querySelectorAll<HTMLElement>('[data-scope="menu"][data-part="item"]')].map(el => el.getAttribute('data-value')!)
}

describe('wc toolbar「更多」菜单重铺条目：被换掉或拿掉的节点正是下一个落点', () => {
  it('收起的首条换上图标（条目整条换新）：菜单照常重铺、次序不乱，新条目带着图标', async () => {
    const bar = await mount(240)
    await expect.poll(() => bar.trigger().hidden).toBe(false)
    const visible = expectedVisible(bar, 240)
    const first = LABELS[visible]!
    const toolbar = bar.box.querySelector('xh-toolbar') as Updatable & { itemIcons?: unknown }
    const errors = await errorsDuring(async () => {
      toolbar.itemIcons = { [first]: LINE }
      await settle()
    })
    expect(errors).toEqual([])
    expect(menuOrder()).toEqual(LABELS.slice(visible))
    expect(bar.menuItem(first)!.querySelector('[data-scope="menu"][data-part="item-icon"]')).not.toBeNull()
  })

  it('收起的两条之间拿掉分隔线：菜单照常重铺、次序不乱，分隔线跟着撤掉', async () => {
    const box = document.createElement('div')
    box.style.inlineSize = '240px'
    const item = (label: string): string => `<button data-xh-part="item" type="button" value="${label}" style="inline-size: ${ITEM_WIDTH}px">${label}</button>`
    box.innerHTML = `<xh-toolbar><div data-xh-part="root" aria-label="编辑">${LABELS.slice(0, 5).map(item).join('')}<div data-xh-part="separator"></div>${item(LABELS[5]!)}<button data-xh-part="overflow-trigger"></button></div></xh-toolbar>`
    document.body.append(box)
    await settle()
    const separators = (): number => document.querySelectorAll('[data-scope="menu"][data-part="separator"]').length
    const collapsed = menuOrder()
    expect(collapsed.slice(-2)).toEqual([LABELS[4], LABELS[5]])
    expect(separators()).toBe(1)
    const errors = await errorsDuring(async () => {
      box.querySelector('[data-xh-part="separator"]')!.remove()
      await settle()
    })
    expect(errors).toEqual([])
    expect(menuOrder()).toEqual(collapsed)
    expect(separators()).toBe(0)
  })
})
