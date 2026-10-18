// field-array 的拖动把手在真实指针下（Vue，标准结构）：按住把手把一行拖到别处放下，值按 move 换位、
// 那一行从松手处收进新位置；删掉一行的替身还在淡出时拖别的行，替身不算一项。把手不占 Tab 位、对读屏隐藏。
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { cdp } from 'vitest/browser'
import { createApp, defineComponent, h, nextTick, ref } from 'vue'
import { XhFieldArrayRoot } from '../../src'
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

async function mount(): Promise<{ value: () => unknown[], mutations: Mutation[] }> {
  host = document.createElement('div')
  host.style.cssText = 'inline-size: 420px; padding: 16px'
  document.body.append(host)
  const value = ref<unknown[]>(['甲', '乙', '丙'])
  const mutations: Mutation[] = []
  app = createApp(defineComponent({
    setup: () => () => h(XhFieldArrayRoot, {
      'movable': true,
      'value': value.value,
      'onValue-change': (details: { value: unknown[], mutation?: Mutation }) => {
        if (details.mutation)
          mutations.push(details.mutation)
        value.value = details.value
      },
    }, {
      'item-content': ({ item }: { item: { value: unknown } }) => [h('span', String(item.value))],
    }),
  }))
  app.mount(host)
  await nextTick()
  await frames(3)
  return { value: () => value.value, mutations }
}

function rows(): HTMLElement[] {
  return [...host!.querySelectorAll<HTMLElement>('[data-scope="field-array"][data-part="item"]:not([data-xh-ghost])')]
}

function grip(row: HTMLElement): HTMLElement {
  return row.querySelector<HTMLElement>('[data-part="item-drag-trigger"]')!
}

async function mouseScale(): Promise<number> {
  const seen = new Promise<number>(resolve => document.addEventListener('pointermove', event => resolve(event.clientX / 20), { once: true }))
  await cdp().send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: 20, y: 20 })
  return seen
}

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

describe('vue 字段数组的拖动把手', () => {
  it('标准结构开了 movable 就铺拖动把手：不占 Tab 位、对读屏隐藏', async () => {
    await mount()
    const handle = grip(rows()[0]!)
    expect([handle.hidden, handle.getAttribute('tabindex'), handle.getAttribute('aria-hidden')]).toEqual([false, '-1', 'true'])
  })

  it('真指针把第 1 行拖到第 3 行之下放下：值按 move 换位，那一行收进末位，不留位移', async () => {
    const { value, mutations } = await mount()
    const [first, , third] = rows()
    const thirdTop = third!.getBoundingClientRect().top
    const bottom = third!.getBoundingClientRect()
    await drag(grip(first!), { x: bottom.left + bottom.width / 2, y: bottom.bottom - 4 })
    expect(mutations).toEqual([{ type: 'move', from: 0, to: 2 }])
    expect(value()).toEqual(['乙', '丙', '甲'])
    const moved = rows()[2]!
    expect(moved.textContent).toContain('甲')
    await expect.poll(() => moved.hasAttribute('data-animating'), { timeout: 2000 }).toBe(false)
    await expect.poll(() => rows().map(row => row.style.translate || ''), { timeout: 2000 }).toEqual(['', '', ''])
    expect(moved.getBoundingClientRect().top).toBeCloseTo(thirdTop, 0)
  })

  it('删掉一行的替身还在淡出时拖别的行：替身不算一项，拖动按剩下的两行算', async () => {
    const { value, mutations } = await mount()
    rows()[1]!.querySelector<HTMLElement>('[data-part="item-delete-trigger"]')!.click()
    await nextTick()
    await frames(1)
    const ghost = host!.querySelector<HTMLElement>('[data-xh-ghost]')
    expect(ghost).not.toBeNull()
    const [first, last] = rows()
    const target = last!.getBoundingClientRect()
    await drag(grip(first!), { x: target.left + target.width / 2, y: target.bottom - 4 })
    expect(mutations).toEqual([{ type: 'remove', index: 1 }, { type: 'move', from: 0, to: 1 }])
    expect(value()).toEqual(['丙', '甲'])
    await expect.poll(() => ghost!.isConnected, { timeout: 3000 }).toBe(false)
  })
})
