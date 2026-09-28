// 排序组：两个列表并排，条目用真指针拖过容器、落在另一个列表的指定位置；键盘在列表间挪；播报文本。
// 让位、容器长高、落点线的位置、放下归位与节点换到另一个容器里，都只有真实浏览器量得出来。
import type { SortableTransferDetails } from '@xihan-ui/headless'
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { cdp, userEvent } from 'vitest/browser'
import { createApp, h, nextTick, reactive } from 'vue'
import { XhSortableDropIndicator, XhSortableItem, XhSortableItemDragTrigger, XhSortableLiveRegion, XhSortableRoot } from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let app: App | null = null
let host: HTMLElement | null = null

afterEach(() => {
  app?.unmount()
  app = null
  host?.remove()
  host = null
})

function frames(count = 3): Promise<void> {
  return new Promise<void>((resolve) => {
    const step = (left: number): void => {
      if (left === 0)
        resolve()
      else requestAnimationFrame(() => step(left - 1))
    }
    step(count)
  })
}

const ITEM_H = 40

/** 两列并排：A 三项、B 两项，各 200px 宽、每项 40px 高；accept 为 false 时宿主不接转移。 */
async function mount(accept = true): Promise<{ transfers: SortableTransferDetails[] }> {
  host = document.createElement('div')
  host.style.cssText = 'display: flex; align-items: flex-start; gap: 48px; padding: 16px'
  document.body.append(host)
  const lists = reactive<Record<string, string[]>>({ A: ['a1', 'a2', 'a3'], B: ['b1', 'b2'] })
  const transfers: SortableTransferDetails[] = []
  app = createApp({
    render: () => ['A', 'B'].map(listId => h(XhSortableRoot, {
      'key': listId,
      'ids': lists[listId],
      'group': 'board',
      'listId': listId,
      'aria-label': `列 ${listId}`,
      'activationDistance': 0,
      'style': 'inline-size: 200px',
      'onTransfer': (details: SortableTransferDetails) => {
        transfers.push(details)
        if (accept) {
          lists[details.fromList] = details.fromIds
          lists[details.toList] = details.toIds
        }
      },
      'onUpdate:ids': (next: string[]) => (lists[listId] = next),
    }, () => [
      ...lists[listId]!.map(id => h(XhSortableItem, { key: id, itemId: id, style: `block-size: ${ITEM_H}px; box-sizing: border-box` }, () => [h(XhSortableItemDragTrigger, { itemId: id }), id])),
      h(XhSortableDropIndicator),
      h(XhSortableLiveRegion),
    ])),
  })
  app.mount(host)
  await nextTick()
  await frames()
  return { transfers }
}

function root(listId: 'A' | 'B'): HTMLElement {
  return host!.querySelector<HTMLElement>(`[data-part="root"][aria-label="列 ${listId}"]`)!
}

function item(id: string): HTMLElement {
  return [...host!.querySelectorAll<HTMLElement>('[data-part="item"]')].find(el => el.textContent === id)!
}

function itemsOf(listId: 'A' | 'B'): string[] {
  return [...root(listId).querySelectorAll<HTMLElement>('[data-part="item"]')].map(el => el.textContent ?? '')
}

async function mouseScale(): Promise<number> {
  const seen = new Promise<number>(resolve => document.addEventListener('pointermove', event => resolve(event.clientX / 20), { once: true }))
  await cdp().send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: 20, y: 20 })
  return seen
}

/** 按住一项的中心，分几步把它的中心挪到 (tx, ty)；release 为 false 时不松手。 */
async function drag(el: HTMLElement, tx: number, ty: number, release = true): Promise<void> {
  const scale = await mouseScale()
  const rect = el.getBoundingClientRect()
  const x = rect.left + rect.width / 2
  const y = rect.top + rect.height / 2
  const at = (px: number, py: number) => ({ x: px / scale, y: py / scale })
  await cdp().send('Input.dispatchMouseEvent', { type: 'mouseMoved', ...at(x, y) })
  await cdp().send('Input.dispatchMouseEvent', { type: 'mousePressed', button: 'left', clickCount: 1, ...at(x, y) })
  const steps = 8
  for (let i = 1; i <= steps; i++) {
    await frames(1)
    await cdp().send('Input.dispatchMouseEvent', { type: 'mouseMoved', button: 'left', ...at(x + ((tx - x) * i) / steps, y + ((ty - y) * i) / steps) })
  }
  if (release)
    await cdp().send('Input.dispatchMouseEvent', { type: 'mouseReleased', button: 'left', clickCount: 1, ...at(tx, ty) })
}

describe('排序组 · 真指针拖过容器', () => {
  it('拖到另一列 b1 与 b2 之间：那一列的根报 data-drop、b2 让出一格、容器长高一格、落点线画在让出那一格的上缘', async () => {
    await mount()
    const b = root('B')
    const before = b.getBoundingClientRect()
    const b1 = item('b1').getBoundingClientRect()
    const b2 = item('b2').getBoundingClientRect()
    const gap = b2.top - b1.bottom
    // 被拖项的中心落在 b1、b2 两个中心之间
    await drag(item('a1'), before.left + before.width / 2, (b1.top + b1.height / 2 + b2.top + b2.height / 2) / 2, false)
    await frames(2)
    expect(b.dataset.drop).toBe('inside')
    expect(root('A').hasAttribute('data-drop')).toBe(false)
    expect(item('b1').style.translate).toBe('')
    expect(item('b2').style.translate).toBe(`0px ${ITEM_H + gap}px`)
    // 末尾垫出落进来那一格：容器长高一项加一个间距
    expect(b.getBoundingClientRect().height).toBeCloseTo(before.height + ITEM_H + gap, 0)
    const line = b.querySelector<HTMLElement>('[data-part="drop-indicator"]')!
    expect(line.hidden).toBe(false)
    await expect.poll(() => Math.round(line.getBoundingClientRect().top)).toBe(Math.round(b2.top))
    // 源列表的线收起，被拖项跟着指针进了 B 的范围
    expect(root('A').querySelector<HTMLElement>('[data-part="drop-indicator"]')!.hidden).toBe(true)
    const dragged = item('a1').getBoundingClientRect()
    expect(dragged.left + dragged.width / 2).toBeCloseTo(before.left + before.width / 2, 0)
    await cdp().send('Input.dispatchMouseEvent', { type: 'mouseReleased', button: 'left', clickCount: 1, x: 0, y: 0 })
  })

  it('松手：宿主按 transfer 写回，那一项换进 B 的第 1 位，从松手处收进新位置', async () => {
    const { transfers } = await mount()
    const b1 = item('b1').getBoundingClientRect()
    const b2 = item('b2').getBoundingClientRect()
    const bRect = root('B').getBoundingClientRect()
    await drag(item('a1'), bRect.left + bRect.width / 2, (b1.top + b1.height / 2 + b2.top + b2.height / 2) / 2)
    await nextTick()
    await frames(1)
    expect(transfers).toEqual([{ id: 'a1', fromList: 'A', toList: 'B', from: 0, to: 1, fromIds: ['a2', 'a3'], toIds: ['b1', 'a1', 'b2'] }])
    expect(itemsOf('A')).toEqual(['a2', 'a3'])
    expect(itemsOf('B')).toEqual(['b1', 'a1', 'b2'])
    expect(root('B').hasAttribute('data-drop')).toBe(false)
    const moved = item('a1')
    await expect.poll(() => moved.hasAttribute('data-animating'), { timeout: 2000 }).toBe(false)
    expect(moved.style.translate).toBe('')
    // 新位置：b1 之下隔一个间距，b2 原先的位置
    expect(moved.getBoundingClientRect().top).toBeCloseTo(b2.top, 0)
    expect(item('b2').style.translate).toBe('')
  })

  it('宿主不接：那一项留在 A、收回原位，B 的让位撤掉', async () => {
    const { transfers } = await mount(false)
    const start = item('a1').getBoundingClientRect()
    const bRect = root('B').getBoundingClientRect()
    await drag(item('a1'), bRect.left + bRect.width / 2, bRect.top + ITEM_H / 2)
    await nextTick()
    await frames(1)
    expect(transfers).toHaveLength(1)
    expect(itemsOf('A')).toEqual(['a1', 'a2', 'a3'])
    const back = item('a1')
    await expect.poll(() => back.hasAttribute('data-animating'), { timeout: 2000 }).toBe(false)
    expect(back.getBoundingClientRect().left).toBeCloseTo(start.left, 0)
    expect(back.getBoundingClientRect().top).toBeCloseTo(start.top, 0)
    expect(item('b1').style.translate).toBe('')
    expect(root('B').hasAttribute('data-drop')).toBe(false)
  })
})

describe('排序组 · 键盘跨列表与播报', () => {
  it('拾起后右键挪进 B、下键在 B 里挪一格、空格放下，每一步都播报', async () => {
    const { transfers } = await mount()
    const live = root('A').querySelector<HTMLElement>('[data-part="live-region"]')!
    const b1 = item('b1').getBoundingClientRect()
    item('a1').querySelector<HTMLElement>('[data-part="item-drag-trigger"]')!.focus()
    await userEvent.keyboard(' ')
    await frames(1)
    expect(live.textContent).toBe('Picked up a1. Position 1 of 3. Use arrow keys to move, space to drop, escape to cancel.')
    await userEvent.keyboard('{ArrowRight}')
    await frames(1)
    expect(live.textContent).toBe('Moved to 列 B, list 2 of 2. Position 1 of 3.')
    expect(root('B').dataset.drop).toBe('inside')
    // 被拖项平移进 B 的第 0 格：b1 此刻的位置
    await expect.poll(() => Math.round(item('a1').getBoundingClientRect().left)).toBe(Math.round(b1.left))
    await expect.poll(() => Math.round(item('a1').getBoundingClientRect().top)).toBe(Math.round(b1.top))
    await userEvent.keyboard('{ArrowDown}')
    await frames(1)
    expect(live.textContent).toBe('Moved to position 2 of 3.')
    await userEvent.keyboard(' ')
    await nextTick()
    await frames(1)
    expect(live.textContent).toBe('a1 dropped into 列 B, list 2, at position 2.')
    expect(transfers).toEqual([{ id: 'a1', fromList: 'A', toList: 'B', from: 0, to: 1, fromIds: ['a2', 'a3'], toIds: ['b1', 'a1', 'b2'] }])
    expect(itemsOf('B')).toEqual(['b1', 'a1', 'b2'])
  })

  it('左键挪回源列表、Escape 取消：B 撤掉让位，一次 transfer 都不发', async () => {
    const { transfers } = await mount()
    const live = root('A').querySelector<HTMLElement>('[data-part="live-region"]')!
    item('a2').querySelector<HTMLElement>('[data-part="item-drag-trigger"]')!.focus()
    await userEvent.keyboard(' ')
    await userEvent.keyboard('{ArrowRight}')
    await frames(1)
    await userEvent.keyboard('{ArrowLeft}')
    await frames(1)
    expect(live.textContent).toBe('Moved to 列 A, list 1 of 2. Position 2 of 3.')
    expect(root('B').hasAttribute('data-drop')).toBe(false)
    await userEvent.keyboard('{ArrowRight}')
    await userEvent.keyboard('{Escape}')
    await frames(1)
    expect(live.textContent).toBe('Sorting canceled. a2 returned to position 2.')
    expect(transfers).toEqual([])
    expect(root('B').hasAttribute('data-drop')).toBe(false)
    expect(itemsOf('A')).toEqual(['a1', 'a2', 'a3'])
  })
})
