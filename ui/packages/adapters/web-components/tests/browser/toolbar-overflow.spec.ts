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

async function mount(width: number): Promise<Mounted> {
  const box = document.createElement('div')
  box.style.inlineSize = `${width}px`
  const items = LABELS.map(label => `<button data-xh-part="item" type="button" value="${label}" style="inline-size: ${ITEM_WIDTH}px">${label}</button>`).join('')
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
