// 列表型浮层（Select、Combobox、TreeSelect）与触发器等宽：长选项在条目里截断，面板不随最长的一条变宽；
// 触发器比下界还窄时面板取下界；三者同一个下界、同一个限高。
//
// 判据全在布局结果上：面板宽度要等引擎量到锚点、写进槽、皮肤消费之后才落定，jsdom 不排版。
import type { App, VNode } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import { XhComboboxRoot, XhSelectRoot, XhTreeSelectRoot } from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

const LONG = '一条很长很长的选项文字，长到任何一个缺省宽的触发器都装不下，只能在条目里截断'

const OPTIONS = [
  { value: 'short', label: '短' },
  { value: 'long', label: LONG },
  ...Array.from({ length: 30 }, (_, i) => ({ value: `n${i}`, label: `选项 ${i}` })),
]

const TREE = [
  { value: 'short', label: '短' },
  { value: 'long', label: LONG },
  ...Array.from({ length: 30 }, (_, i) => ({ value: `n${i}`, label: `节点 ${i}` })),
]

type Scope = 'select' | 'combobox' | 'tree-select'

const RENDER: Record<Scope, (style?: string) => VNode> = {
  'select': style => h(XhSelectRoot, { collection: OPTIONS, defaultOpen: true, style }),
  'combobox': style => h(XhComboboxRoot, { collection: OPTIONS, defaultOpen: true, style }),
  'tree-select': style => h(XhTreeSelectRoot, { collection: TREE, open: true, style }),
}

const ANCHOR: Record<Scope, string> = {
  'select': 'control',
  'combobox': 'control',
  'tree-select': 'control',
}

let app: App | null = null
let host: HTMLElement | null = null

afterEach(() => {
  app?.unmount()
  host?.remove()
  document.getElementById('xh-portal-root')?.remove()
  app = null
  host = null
})

function part(scope: Scope, name: string): HTMLElement {
  const el = document.querySelector<HTMLElement>(`[data-scope='${scope}'][data-part='${name}']`)
  if (!el)
    throw new Error(`找不到 ${scope} 的 ${name}`)
  return el
}

/** 等落位、进场播完、几何连续两帧不变。 */
async function settled(scope: Scope): Promise<HTMLElement> {
  const frame = (): Promise<void> => new Promise(resolve => requestAnimationFrame(() => setTimeout(resolve, 0)))
  for (let i = 0; i < 120 && !document.querySelector(`[data-scope='${scope}'][data-part='positioner'][data-positioned]`); i += 1)
    await frame()
  const portal = document.getElementById('xh-portal-root')
  if (portal)
    await Promise.all(portal.getAnimations({ subtree: true }).map(a => a.finished.catch(() => undefined)))
  const content = part(scope, 'content')
  let previous = JSON.stringify(content.getBoundingClientRect())
  for (let i = 0; i < 60; i += 1) {
    await frame()
    const current = JSON.stringify(content.getBoundingClientRect())
    if (current === previous)
      return content
    previous = current
  }
  throw new Error(`${scope} 的几何一直没落定`)
}

async function mount(scope: Scope, style?: string): Promise<HTMLElement> {
  host = document.createElement('div')
  host.style.cssText = 'padding: 24px'
  document.body.append(host)
  app = createApp({ render: () => RENDER[scope](style) })
  app.mount(host)
  await nextTick()
  return settled(scope)
}

function remPx(rem: number): number {
  return rem * Number.parseFloat(getComputedStyle(document.documentElement).fontSize)
}

describe.each(['select', 'combobox', 'tree-select'] as const)('%s 列表浮层的宽度', (scope) => {
  it('与触发器等宽，长选项在条目里截断而不撑宽面板', async () => {
    const content = await mount(scope)
    const anchor = part(scope, ANCHOR[scope]).getBoundingClientRect().width
    expect(content.getBoundingClientRect().width).toBeCloseTo(anchor, 0)
    const text = [...content.querySelectorAll<HTMLElement>(`[data-scope='${scope}'][data-part='item-text']`)]
      .find(el => el.textContent === LONG)!
    expect(text.scrollWidth).toBeGreaterThan(text.clientWidth)
  })

  it('触发器比下界还窄时取下界', async () => {
    const content = await mount(scope, 'inline-size: 6rem; min-inline-size: 0')
    expect(part(scope, ANCHOR[scope]).getBoundingClientRect().width).toBeLessThan(remPx(10))
    expect(content.getBoundingClientRect().width).toBeCloseTo(remPx(10), 0)
  })
})

describe('列表浮层同一个限高', () => {
  it('select、combobox、tree-select 装满时面板一样高', async () => {
    const heights: number[] = []
    for (const scope of ['select', 'combobox', 'tree-select'] as const) {
      const content = await mount(scope)
      heights.push(content.getBoundingClientRect().height)
      app!.unmount()
      host!.remove()
      document.getElementById('xh-portal-root')?.remove()
      app = null
      host = null
    }
    expect(heights[1]).toBeCloseTo(heights[0]!, 0)
    expect(heights[2]).toBeCloseTo(heights[0]!, 0)
  })
})
