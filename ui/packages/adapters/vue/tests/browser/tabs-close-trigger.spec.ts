import type { TabsVariant } from '@xihan-ui/headless'
// 关闭钮与所属标签平级、紧跟其后，画面上要收进标签面的行尾：钮整个落在标签盒里、块向居中、行尾留白与块向留白相等，
// 标签文字不被它压住，下一枚标签的起点与没有关闭钮时一样。几何只有真实 Chromium 算得出，jsdom 不算数。
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import { XhTabsCloseTrigger, XhTabsContent, XhTabsList, XhTabsRoot, XhTabsTrigger } from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

type Orientation = 'horizontal' | 'vertical'

let app: App | null = null
let host: HTMLElement | null = null

const VALUES = ['a', 'b', 'c'] as const

interface Mounted {
  list: HTMLElement
  triggers: HTMLElement[]
  labels: HTMLElement[]
  closes: HTMLElement[]
  events: unknown[]
}

async function mount(opts: { orientation?: Orientation, variant?: TabsVariant, closable?: boolean, dir?: 'ltr' | 'rtl' } = {}): Promise<Mounted> {
  const { orientation = 'horizontal', variant = 'line', closable = true, dir = 'ltr' } = opts
  const events: unknown[] = []
  host = document.createElement('div')
  host.setAttribute('dir', dir)
  document.body.append(host)
  app = createApp({
    render: () => h(XhTabsRoot, {
      'defaultValue': 'a',
      orientation,
      variant,
      dir,
      closable,
      'collection': VALUES.map(value => ({ value })),
      'style': { inlineSize: '480px' },
      'onTab-close': (details: unknown) => events.push(details),
    }, () => [
      h(XhTabsList, { 'aria-label': '文件' }, () => VALUES.flatMap(v => [
        h(XhTabsTrigger, { key: v, value: v }, () => h('span', { 'data-testid': 'label' }, `文件 ${v}`)),
        h(XhTabsCloseTrigger, { key: `${v}:close`, value: v }),
      ])),
      ...VALUES.map(v => h(XhTabsContent, { key: v, value: v }, () => `内容 ${v}`)),
    ]),
  })
  app.mount(host)
  await nextTick()
  await new Promise(resolve => requestAnimationFrame(() => resolve(undefined)))
  return {
    list: host.querySelector<HTMLElement>('[data-scope="tabs"][data-part="list"]')!,
    triggers: [...host.querySelectorAll<HTMLElement>('[data-scope="tabs"][data-part="trigger"]')],
    labels: [...host.querySelectorAll<HTMLElement>('[data-testid="label"]')],
    closes: [...host.querySelectorAll<HTMLElement>('[data-scope="tabs"][data-part="close-trigger"]')],
    events,
  }
}

afterEach(() => {
  app?.unmount()
  app = null
  host?.remove()
  host = null
})

function gap(list: HTMLElement, orientation: Orientation): number {
  const style = getComputedStyle(list)
  return Number.parseFloat(orientation === 'horizontal' ? style.columnGap : style.rowGap) || 0
}

describe.each(['line', 'card', 'segment'] as const)('tabs 关闭钮落位（%s）', (variant) => {
  it('横排：钮收在标签面的行尾，块向居中、行尾留白与块向留白相等，不压文字', async () => {
    const m = await mount({ variant })
    for (let i = 0; i < VALUES.length; i++) {
      const tab = m.triggers[i]!.getBoundingClientRect()
      const close = m.closes[i]!.getBoundingClientRect()
      const label = m.labels[i]!.getBoundingClientRect()
      expect(close.width).toBeGreaterThan(0)
      expect(close.left).toBeGreaterThanOrEqual(tab.left)
      expect(close.right).toBeLessThanOrEqual(tab.right + 0.5)
      const blockInset = close.top - tab.top
      expect(Math.abs(blockInset - (tab.bottom - close.bottom))).toBeLessThanOrEqual(1)
      expect(Math.abs((tab.right - close.right) - blockInset)).toBeLessThanOrEqual(1)
      expect(label.right).toBeLessThanOrEqual(close.left)
    }
  })

  it('横排：下一枚标签紧接在上一枚之后，只隔标签带自己的间距', async () => {
    const m = await mount({ variant })
    const g = gap(m.list, 'horizontal')
    for (let i = 1; i < VALUES.length; i++) {
      const prev = m.triggers[i - 1]!.getBoundingClientRect()
      const next = m.triggers[i]!.getBoundingClientRect()
      expect(Math.abs(next.left - (prev.right + g))).toBeLessThanOrEqual(1)
    }
  })
})

describe('tabs 关闭钮落位（其他方向）', () => {
  it('rtl：钮落在行尾（左侧），文字在它右边', async () => {
    const m = await mount({ dir: 'rtl' })
    const tab = m.triggers[0]!.getBoundingClientRect()
    const close = m.closes[0]!.getBoundingClientRect()
    const label = m.labels[0]!.getBoundingClientRect()
    expect(close.left).toBeGreaterThanOrEqual(tab.left - 0.5)
    expect(Math.abs((close.left - tab.left) - (close.top - tab.top))).toBeLessThanOrEqual(1)
    expect(label.left).toBeGreaterThanOrEqual(close.right)
  })

  it('竖排：钮收进同一行标签面的行尾，下一枚标签只隔标签带自己的间距', async () => {
    const m = await mount({ orientation: 'vertical' })
    const g = gap(m.list, 'vertical')
    for (let i = 0; i < VALUES.length; i++) {
      const tab = m.triggers[i]!.getBoundingClientRect()
      const close = m.closes[i]!.getBoundingClientRect()
      expect(close.top).toBeGreaterThanOrEqual(tab.top - 0.5)
      expect(close.bottom).toBeLessThanOrEqual(tab.bottom + 0.5)
      expect(close.right).toBeLessThanOrEqual(tab.right + 0.5)
      expect(Math.abs((close.top - tab.top) - (tab.bottom - close.bottom))).toBeLessThanOrEqual(1)
      if (i > 0) {
        const prev = m.triggers[i - 1]!.getBoundingClientRect()
        expect(Math.abs(tab.top - (prev.bottom + g))).toBeLessThanOrEqual(1)
      }
    }
  })

  it('不开 closable：钮收起，标签不给它留位', async () => {
    const closed = await mount({ closable: false })
    const width = closed.triggers[0]!.getBoundingClientRect().width
    expect(getComputedStyle(closed.closes[0]!).display).toBe('none')
    app?.unmount()
    host?.remove()
    const open = await mount({ closable: true })
    expect(open.triggers[0]!.getBoundingClientRect().width).toBeGreaterThan(width)
  })

  it('钮压在标签面之上：点到的是钮，发 tab-close 而不切换选中', async () => {
    const m = await mount({ variant: 'segment' })
    const close = m.closes[1]!.getBoundingClientRect()
    const hit = document.elementFromPoint(close.left + close.width / 2, close.top + close.height / 2)
    expect(hit).toBe(m.closes[1])
    m.closes[1]!.click()
    await nextTick()
    expect(m.events).toEqual([{ value: 'b', values: ['a', 'c'] }])
    expect(m.triggers[1]!.getAttribute('aria-selected')).toBe('false')
  })
})
