// 标签带落位、平分与新增钮的版面：placement=end 时标签带排到面板之后，line 档的基线与指示线换到朝向面板的一边，
// card 档的指示条换到底边；fullWidth 时标签平分标签带；新增钮与标签同高、排在标签带那一行的行尾，
// 不放进 tablist。几何与计算样式只有真实 Chromium 算得出，jsdom 不算数。
import type { TabsSchema } from '@xihan-ui/headless'
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import { XhTabsAddTrigger, XhTabsContent, XhTabsIndicator, XhTabsList, XhTabsRoot, XhTabsTrigger } from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

type Props = TabsSchema['props']

let app: App | null = null
let host: HTMLElement | null = null

const VALUES = ['a', 'b', 'c'] as const

interface Mounted {
  root: HTMLElement
  list: HTMLElement
  triggers: HTMLElement[]
  content: HTMLElement
  indicator: HTMLElement | null
  add: HTMLElement | null
}

async function mount(props: Partial<Props> & { indicator?: boolean, addTrigger?: boolean, width?: string } = {}): Promise<Mounted> {
  const { indicator = true, addTrigger = false, width = '480px', ...rest } = props
  host = document.createElement('div')
  document.body.append(host)
  app = createApp({
    render: () => h(XhTabsRoot, { defaultValue: 'a', ...rest, style: { inlineSize: width } }, () => [
      h(XhTabsList, { 'aria-label': '视图' }, () => [
        ...VALUES.map(v => h(XhTabsTrigger, { key: v, value: v }, () => `视图 ${v}`)),
        ...(indicator ? [h(XhTabsIndicator)] : []),
      ]),
      ...(addTrigger ? [h(XhTabsAddTrigger)] : []),
      ...VALUES.map(v => h(XhTabsContent, { key: v, value: v }, () => `内容 ${v}`)),
    ]),
  })
  app.mount(host)
  await nextTick()
  await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve(undefined))))
  const q = (part: string): HTMLElement | null => host!.querySelector<HTMLElement>(`[data-scope="tabs"][data-part="${part}"]`)
  return {
    root: q('root')!,
    list: q('list')!,
    triggers: [...host.querySelectorAll<HTMLElement>('[data-scope="tabs"][data-part="trigger"]')],
    content: host.querySelector<HTMLElement>('[data-scope="tabs"][data-part="content"]:not([hidden])')!,
    indicator: q('indicator'),
    add: q('add-trigger'),
  }
}

afterEach(() => {
  app?.unmount()
  app = null
  host?.remove()
  host = null
})

function px(value: string): number {
  return Number.parseFloat(value) || 0
}

describe('tabs placement=end', () => {
  it('横排：标签带落到面板下方，DOM 里照旧排在面板之前', async () => {
    const m = await mount({ placement: 'end' })
    expect(m.list.compareDocumentPosition(m.content) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(m.list.getBoundingClientRect().top).toBeGreaterThanOrEqual(m.content.getBoundingClientRect().bottom - 0.5)
  })

  it('横排 line：基线换到标签带顶边，指示线压在这道基线上', async () => {
    const m = await mount({ placement: 'end' })
    const style = getComputedStyle(m.list)
    expect(px(style.borderTopWidth)).toBe(1)
    expect(px(style.borderBottomWidth)).toBe(0)
    const list = m.list.getBoundingClientRect()
    const line = m.indicator!.getBoundingClientRect()
    expect(line.height).toBeGreaterThan(0)
    expect(Math.abs(line.top - list.top)).toBeLessThanOrEqual(0.5)
  })

  it('横排 line、不放 indicator：选中标签的静态线贴在顶边', async () => {
    const m = await mount({ placement: 'end', indicator: false })
    // 绝对定位的插入线：取回的是解析后的像素值，贴顶即 top 为 0、bottom 是标签高减线粗
    const after = getComputedStyle(m.triggers[0]!, '::after')
    expect(after.top).toBe('0px')
    expect(px(after.bottom)).toBeGreaterThan(px(after.height))
  })

  it('横排 card：选中标签的指示条换到底边', async () => {
    const m = await mount({ placement: 'end', variant: 'card' })
    const shadow = getComputedStyle(m.triggers[0]!).boxShadow
    expect(shadow).toMatch(/0px -2px 0px 0px inset|inset 0px -2px 0px 0px/)
  })

  it('竖排：标签带落到面板的行尾侧，基线换到行首侧', async () => {
    const m = await mount({ placement: 'end', orientation: 'vertical' })
    expect(m.list.getBoundingClientRect().left).toBeGreaterThanOrEqual(m.content.getBoundingClientRect().right - 0.5)
    const style = getComputedStyle(m.list)
    expect(px(style.borderLeftWidth)).toBe(1)
    expect(px(style.borderRightWidth)).toBe(0)
  })

  it('缺省 start：标签带在面板上方，基线在底边', async () => {
    const m = await mount()
    expect(m.content.getBoundingClientRect().top).toBeGreaterThanOrEqual(m.list.getBoundingClientRect().bottom - 0.5)
    expect(px(getComputedStyle(m.list).borderBottomWidth)).toBe(1)
  })
})

describe('tabs fullWidth', () => {
  it.each(['line', 'card'] as const)('%s：标签平分标签带的宽度', async (variant) => {
    const m = await mount({ fullWidth: true, variant })
    const widths = m.triggers.map(el => el.getBoundingClientRect().width)
    for (const w of widths)
      expect(Math.abs(w - widths[0]!)).toBeLessThanOrEqual(1)
    const list = m.list.getBoundingClientRect()
    expect(Math.abs(m.triggers.at(-1)!.getBoundingClientRect().right - list.right)).toBeLessThanOrEqual(1.5)
  })

  it('缺省：标签只占自己的字宽，标签带右侧留白', async () => {
    const m = await mount()
    expect(m.triggers.at(-1)!.getBoundingClientRect().right).toBeLessThan(m.list.getBoundingClientRect().right - 40)
  })
})

describe('tabs add-trigger', () => {
  it('addable 关闭时收起', async () => {
    const m = await mount({ addTrigger: true })
    expect(getComputedStyle(m.add!).display).toBe('none')
  })

  it.each(['line', 'card', 'segmented'] as const)('%s：与标签同高的正方形，排在标签带那一行的行尾、与标签居中对齐', async (variant) => {
    const m = await mount({ addTrigger: true, addable: true, variant })
    const add = m.add!.getBoundingClientRect()
    const tab = m.triggers[0]!.getBoundingClientRect()
    const list = m.list.getBoundingClientRect()
    expect(Math.abs(add.height - tab.height)).toBeLessThanOrEqual(1)
    expect(Math.abs(add.width - add.height)).toBeLessThanOrEqual(1)
    expect(add.left).toBeGreaterThanOrEqual(list.right - 0.5)
    expect(Math.abs((add.top + add.bottom) / 2 - (tab.top + tab.bottom) / 2)).toBeLessThanOrEqual(1)
    expect(add.bottom).toBeLessThanOrEqual(m.content.getBoundingClientRect().top + 0.5)
    // 不进 tablist：它是 root 的孩子
    expect(m.list.contains(m.add)).toBe(false)
  })

  it('placement=end：新增钮随标签带一行落到面板下方', async () => {
    const m = await mount({ addTrigger: true, addable: true, placement: 'end' })
    const add = m.add!.getBoundingClientRect()
    const tab = m.triggers[0]!.getBoundingClientRect()
    expect(add.top).toBeGreaterThanOrEqual(m.content.getBoundingClientRect().bottom - 0.5)
    expect(Math.abs((add.top + add.bottom) / 2 - (tab.top + tab.bottom) / 2)).toBeLessThanOrEqual(1)
    expect(add.left).toBeGreaterThanOrEqual(m.list.getBoundingClientRect().right - 0.5)
  })

  it('竖排：新增钮躺平在标签带那一列的列尾', async () => {
    const m = await mount({ addTrigger: true, addable: true, orientation: 'vertical' })
    const add = m.add!.getBoundingClientRect()
    const list = m.list.getBoundingClientRect()
    expect(add.top).toBeGreaterThanOrEqual(list.bottom - 0.5)
    expect(Math.abs(add.left - list.left)).toBeLessThanOrEqual(1)
    expect(add.right).toBeLessThanOrEqual(m.content.getBoundingClientRect().left + 0.5)
  })

  it('不写内容时画一枚加号', async () => {
    const m = await mount({ addTrigger: true, addable: true })
    const glyph = getComputedStyle(m.add!, '::before')
    expect(glyph.content).not.toBe('none')
    expect(glyph.maskImage).toContain('5V19')
  })
})
