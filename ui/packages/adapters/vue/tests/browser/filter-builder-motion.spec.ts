// 条件编辑器的列表动效：首帧的条件与子组直接呈现，新加的进场，删掉的由替身在原处淡出、播完即移除，
// 留下来的从旧位置滑到新位置。动画是否在播、替身落在哪、此刻的位移只有真实浏览器量得出来。
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { userEvent } from 'vitest/browser'
import { createApp, h, nextTick } from 'vue'
import { XhFilterBuilderRoot } from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let app: App | null = null
let host: HTMLElement | null = null

afterEach(() => {
  app?.unmount()
  host?.remove()
  app = null
  host = null
})

const FIELDS = [
  { name: 'region', type: 'string', label: 'Region' },
  { name: 'amount', type: 'number', label: 'Amount' },
] as const

// 带 id 的条件身份稳定：删哪一行就是哪一行离场
const VALUE = {
  logic: 'and',
  conditions: [
    { id: 'c1', field: 'region', operator: 'eq', value: 'East' },
    { id: 'c2', field: 'amount', operator: 'gt', value: 5 },
    { id: 'c3', field: 'region', operator: 'eq', value: 'West' },
  ],
} as const

// 没写 id 的条件按位置认身份：删中间一行时视图按位置复用节点，卸下的是最后一个
const VALUE_WITHOUT_ID = {
  logic: 'and',
  conditions: VALUE.conditions.map(({ id: _id, ...condition }) => condition),
}

const CONDITION = `[data-scope='filter-builder'][data-part='condition']`

async function frames(): Promise<void> {
  for (let i = 0; i < 3; i++) {
    await nextTick()
    await new Promise<void>(resolve => requestAnimationFrame(() => resolve()))
  }
}

async function mount(value: object = VALUE): Promise<HTMLElement> {
  host = document.createElement('div')
  host.style.inlineSize = '720px'
  document.body.append(host)
  app = createApp({ render: () => h(XhFilterBuilderRoot, { 'fields': FIELDS, 'defaultValue': value, 'aria-label': 'Orders' }) })
  app.mount(host)
  await frames()
  return host.querySelector<HTMLElement>(`[data-scope='filter-builder'][data-part='root']`)!
}

/** 元素身上浏览器实际起播的 CSS 关键帧动画名。 */
function running(el: Element): string[] {
  return el.getAnimations().filter(a => a instanceof CSSAnimation).map(a => (a as CSSAnimation).animationName)
}

function offsetY(el: Element): number {
  const value = getComputedStyle(el).translate
  return !value || value === 'none' ? 0 : Number.parseFloat(value.split(/\s+/)[1] ?? '0') || 0
}

function live(root: HTMLElement): HTMLElement[] {
  return [...root.querySelectorAll<HTMLElement>(`${CONDITION}:not([data-state='closed'])`)]
}

describe('条件编辑器的列表动效', () => {
  it('首帧的条件直接呈现；点加条件后新的一行进场', async () => {
    const root = await mount()
    for (const el of live(root))
      expect(running(el)).toEqual([])
    await userEvent.click(root.querySelector<HTMLElement>(`[data-part='add-condition-trigger']`)!)
    await expect.poll(() => live(root).length).toBe(4)
    expect(running(live(root)[3]!)).toEqual(['xh-item-in'])
  })

  it('删一行：替身在原处淡出、播完即移除，下面的行从旧位置滑上去', async () => {
    const root = await mount()
    const [, middle, last] = live(root)
    const top = middle!.getBoundingClientRect().top
    const lastTop = last!.getBoundingClientRect().top
    await userEvent.click(middle!.querySelector<HTMLElement>(`[data-part='condition-delete-trigger']`)!)
    await expect.poll(() => root.querySelector(`${CONDITION}[data-state='closed']`) !== null).toBe(true)
    const ghost = root.querySelector<HTMLElement>(`${CONDITION}[data-state='closed']`)!
    expect(Math.abs(ghost.getBoundingClientRect().top - top)).toBeLessThan(1)
    expect(running(ghost)).toEqual(['xh-fade-out'])
    expect(ghost.querySelector('[id]'), '替身里摘掉了 id').toBeNull()
    expect(offsetY(last!)).toBeGreaterThan(0)
    expect(Math.abs(last!.getBoundingClientRect().top - lastTop)).toBeLessThan(2)
    await expect.poll(() => ghost.isConnected).toBe(false)
  })

  it('没写 id 的条件按位置认身份：删中间一行不放替身，免得末尾那一行淡出、像删错了行', async () => {
    const root = await mount(VALUE_WITHOUT_ID)
    const [, middle] = live(root)
    await userEvent.click(middle!.querySelector<HTMLElement>(`[data-part='condition-delete-trigger']`)!)
    await expect.poll(() => live(root).length).toBe(2)
    await new Promise<void>(resolve => requestAnimationFrame(() => resolve()))
    expect(root.querySelector(`${CONDITION}[data-state='closed']`)).toBeNull()
  })
})
