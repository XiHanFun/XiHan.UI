// field-array 的拖动把手在真实指针下：按住把手把一行拖到别处放下，值按 move 换位、那一行从松手处收进新位置；
// 表格排布同样拖得动；删掉一行的替身还在淡出时拖别的行，替身不算一项、照样播完退场。
// 把手只接指针：不占 Tab 位、对读屏隐藏，键盘走上移、下移。
import type { XhFieldArrayElement } from '../../src/elements/field-array'
import { setDiagnosticsLevel } from '@xihan-ui/core'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { cdp } from 'vitest/browser'
import { defineXhElements } from '../../src/define'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

defineXhElements()

beforeEach(() => setDiagnosticsLevel('silent'))
afterEach(() => {
  document.body.innerHTML = ''
  setDiagnosticsLevel('warn')
})

function frames(count = 2): Promise<void> {
  return new Promise<void>((resolve) => {
    const step = (left: number): void => {
      if (left === 0)
        resolve()
      else requestAnimationFrame(() => step(left - 1))
    }
    step(count)
  })
}

interface Mutation {
  type: string
  from?: number
  to?: number
  index?: number
}

/** 受控的字段数组：值变了写回，作者内容按行 key 补上（一行一段文字）。 */
async function mount(layout: 'list' | 'table'): Promise<{ el: XhFieldArrayElement, mutations: Mutation[] }> {
  document.body.innerHTML = `<div style="inline-size: 420px; padding: 16px"><xh-field-array movable layout="${layout}"></xh-field-array></div>`
  const el = document.querySelector<XhFieldArrayElement>('xh-field-array')!
  if (layout === 'table')
    el.columns = [{ id: 'name', label: '名称' }]
  const mutations: Mutation[] = []
  const place = (): void => {
    const rows = el.value ?? []
    for (const [index, item] of el.items.entries()) {
      const slot = layout === 'table' ? `item-cell:${item.key}:name` : `item-content:${item.key}`
      let node = el.querySelector<HTMLElement>(`:scope > [slot="${slot}"]`)
      if (!node && !el.querySelector(`[slot="${slot}"]`)) {
        node = document.createElement('span')
        node.setAttribute('slot', slot)
        el.append(node)
      }
      if (node)
        node.textContent = String(rows[index])
    }
  }
  el.addEventListener('value-change', (event) => {
    const detail = (event as CustomEvent<{ value: unknown[], mutation?: Mutation }>).detail
    if (detail.mutation)
      mutations.push(detail.mutation)
    el.value = detail.value
    place()
  })
  el.value = ['甲', '乙', '丙']
  await el.updateComplete
  place()
  await el.updateComplete
  await frames(3)
  return { el, mutations }
}

function rows(el: HTMLElement): HTMLElement[] {
  return [...el.querySelectorAll<HTMLElement>('[data-scope="field-array"][data-part="item"]:not([data-xh-ghost])')]
}

function texts(el: HTMLElement): string[] {
  return rows(el).map(row => row.textContent?.replace(/\s+/g, '').replace(/^\d+/, '') ?? '')
}

function grip(row: HTMLElement): HTMLElement {
  return row.querySelector<HTMLElement>('[data-part="item-drag-trigger"]')!
}

async function mouseScale(): Promise<number> {
  const seen = new Promise<number>(resolve => document.addEventListener('pointermove', event => resolve(event.clientX / 20), { once: true }))
  await cdp().send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: 20, y: 20 })
  return seen
}

/** 按住 handle 的中心，分八步拖到 target，松开。 */
async function drag(handle: HTMLElement, target: { x: number, y: number }): Promise<void> {
  const scale = await mouseScale()
  const at = (x: number, y: number) => ({ x: x / scale, y: y / scale })
  const box = handle.getBoundingClientRect()
  const start = { x: box.left + box.width / 2, y: box.top + box.height / 2 }
  await cdp().send('Input.dispatchMouseEvent', { type: 'mouseMoved', ...at(start.x, start.y) })
  await cdp().send('Input.dispatchMouseEvent', { type: 'mousePressed', button: 'left', clickCount: 1, ...at(start.x, start.y) })
  for (let i = 1; i <= 8; i++) {
    await frames(1)
    await cdp().send('Input.dispatchMouseEvent', { type: 'mouseMoved', button: 'left', ...at(start.x + ((target.x - start.x) * i) / 8, start.y + ((target.y - start.y) * i) / 8) })
  }
  await frames(1)
  await cdp().send('Input.dispatchMouseEvent', { type: 'mouseReleased', button: 'left', clickCount: 1, ...at(target.x, target.y) })
  await frames()
}

describe('web components 字段数组的拖动把手', () => {
  it('开了 movable 才有拖动把手；它不占 Tab 位、对读屏隐藏', async () => {
    const { el } = await mount('list')
    const handle = grip(rows(el)[0]!)
    expect([handle.hidden, handle.getAttribute('tabindex'), handle.getAttribute('aria-hidden'), handle.tagName]).toEqual([false, '-1', 'true', 'BUTTON'])
    el.movable = false
    await el.updateComplete
    expect(rows(el).every(row => grip(row) === null || grip(row).hidden || getComputedStyle(grip(row)).display === 'none')).toBe(true)
  })

  it('真指针把第 1 行拖到第 3 行之下放下：值按 move 换位，那一行从松手处收进末位，不留位移', async () => {
    const { el, mutations } = await mount('list')
    const [first, , third] = rows(el)
    const thirdTop = third!.getBoundingClientRect().top
    const bottom = third!.getBoundingClientRect()
    await drag(grip(first!), { x: bottom.left + bottom.width / 2, y: bottom.bottom - 4 })
    expect(mutations).toEqual([{ type: 'move', from: 0, to: 2 }])
    expect(el.value).toEqual(['乙', '丙', '甲'])
    expect(texts(el)).toEqual(['乙', '丙', '甲'])
    const moved = rows(el)[2]!
    await expect.poll(() => moved.hasAttribute('data-animating'), { timeout: 2000 }).toBe(false)
    await expect.poll(() => rows(el).map(row => row.style.translate || ''), { timeout: 2000 }).toEqual(['', '', ''])
    expect(moved.getBoundingClientRect().top).toBeCloseTo(thirdTop, 0)
    expect(el.querySelector('[data-part="root"]')!.hasAttribute('data-dragging')).toBe(false)
  })

  it('表格排布同样拖得动：把第 3 行拖到第 1 行之上', async () => {
    const { el, mutations } = await mount('table')
    const [first, , third] = rows(el)
    const top = first!.getBoundingClientRect()
    await drag(grip(third!), { x: top.left + top.width / 2, y: top.top + 4 })
    expect(mutations).toEqual([{ type: 'move', from: 2, to: 0 }])
    expect(el.value).toEqual(['丙', '甲', '乙'])
    await expect.poll(() => rows(el).map(row => row.style.translate || ''), { timeout: 2000 }).toEqual(['', '', ''])
  })

  it('删掉一行的替身还在淡出时拖别的行：替身不算一项、照样播完退场，拖动按剩下的两行算', async () => {
    const { el, mutations } = await mount('list')
    rows(el)[1]!.querySelector<HTMLElement>('[data-part="item-delete-trigger"]')!.click()
    await frames(1)
    const ghost = el.querySelector<HTMLElement>('[data-xh-ghost]')
    expect(ghost).not.toBeNull()
    const [first, last] = rows(el)
    const target = last!.getBoundingClientRect()
    await drag(grip(first!), { x: target.left + target.width / 2, y: target.bottom - 4 })
    expect(mutations).toEqual([{ type: 'remove', index: 1 }, { type: 'move', from: 0, to: 1 }])
    expect(el.value).toEqual(['丙', '甲'])
    expect(ghost!.style.translate).toBe('')
    await expect.poll(() => ghost!.isConnected, { timeout: 3000 }).toBe(false)
  })
})
