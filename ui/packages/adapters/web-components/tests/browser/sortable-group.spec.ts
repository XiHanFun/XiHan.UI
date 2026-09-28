// Web Components 的排序组：项节点由作者脚本在 transfer 里从一个 <xh-sortable> 的 root 挪进另一个的 root。
// 钉住：挪过去的节点不带着源列表写的拖动位移，落在目标列表的那一格上；两个元素各自接线、互不抢节点。
import type { SortableTransferDetails } from '@xihan-ui/headless'
import { setDiagnosticsLevel } from '@xihan-ui/core'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { cdp, userEvent } from 'vitest/browser'
import { defineXhElements } from '../../src/define'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

interface SortableElement extends HTMLElement {
  ids?: string[]
  updateComplete: Promise<unknown>
}

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

function list(listId: string, ids: string[]): string {
  const items = ids.map(id => `<div data-xh-part="item" item-id="${id}" style="block-size: 40px; box-sizing: border-box"><button data-xh-part="item-drag-trigger" item-id="${id}"></button>${id}</div>`).join('')
  return `<xh-sortable ids="${ids.join(',')}" group="board" list-id="${listId}" activation-distance="0" style="display: contents">
    <div data-xh-part="root" style="inline-size: 200px">${items}<div data-xh-part="drop-indicator"></div><div data-xh-part="live-region"></div></div>
  </xh-sortable>`
}

async function mount(): Promise<{ board: HTMLElement, transfers: SortableTransferDetails[] }> {
  const board = document.createElement('div')
  board.style.cssText = 'display: flex; align-items: flex-start; gap: 48px; padding: 16px'
  board.innerHTML = list('A', ['a1', 'a2', 'a3']) + list('B', ['b1', 'b2'])
  document.body.append(board)
  const transfers: SortableTransferDetails[] = []
  // 与文档示例同一种写法：按新顺序把项节点排进各自的 root，写回 ids
  const place = (host: SortableElement, ids: string[]): void => {
    const root = host.querySelector('[data-xh-part="root"]')!
    for (const id of ids)
      root.insertBefore(board.querySelector(`[data-xh-part="item"][item-id="${id}"]`)!, root.querySelector('[data-xh-part="drop-indicator"]'))
    host.ids = ids
  }
  board.addEventListener('transfer', (event) => {
    const detail = (event as CustomEvent<SortableTransferDetails>).detail
    transfers.push(detail)
    place(host(detail.toList), detail.toIds)
    place(host(detail.fromList), detail.fromIds)
  })
  for (const el of board.querySelectorAll<SortableElement>('xh-sortable'))
    await el.updateComplete
  await frames()
  return { board, transfers }

  function host(listId: string): SortableElement {
    return board.querySelector<SortableElement>(`xh-sortable[list-id="${listId}"]`)!
  }
}

function item(id: string): HTMLElement {
  return document.querySelector<HTMLElement>(`[data-part="item"][item-id="${id}"]`)!
}

function root(listId: string): HTMLElement {
  return document.querySelector<HTMLElement>(`xh-sortable[list-id="${listId}"] [data-part="root"]`)!
}

function itemsOf(listId: string): string[] {
  return [...root(listId).querySelectorAll<HTMLElement>('[data-part="item"]')].map(el => el.getAttribute('item-id') ?? '')
}

async function mouseScale(): Promise<number> {
  const seen = new Promise<number>(resolve => document.addEventListener('pointermove', event => resolve(event.clientX / 20), { once: true }))
  await cdp().send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: 20, y: 20 })
  return seen
}

describe('web components 排序组', () => {
  it('键盘挪进 B 放下：作者挪过去的节点不带拖动位移，落在 B 的那一格上', async () => {
    const { transfers } = await mount()
    const b2Top = item('b2').getBoundingClientRect().top
    item('a1').querySelector<HTMLElement>('[data-part="item-drag-trigger"]')!.focus()
    await userEvent.keyboard(' ')
    await userEvent.keyboard('{ArrowRight}')
    await frames()
    expect(root('B').dataset.drop).toBe('inside')
    await userEvent.keyboard('{ArrowDown}')
    await userEvent.keyboard(' ')
    await frames()
    expect(transfers.map(t => t.toIds)).toEqual([['b1', 'a1', 'b2']])
    expect(itemsOf('A')).toEqual(['a2', 'a3'])
    expect(itemsOf('B')).toEqual(['b1', 'a1', 'b2'])
    const moved = item('a1')
    await expect.poll(() => moved.hasAttribute('data-animating'), { timeout: 2000 }).toBe(false)
    expect(moved.style.translate).toBe('')
    expect(moved.getBoundingClientRect().top).toBeCloseTo(b2Top, 0)
    expect(root('B').hasAttribute('data-drop')).toBe(false)
    expect(item('b2').style.translate).toBe('')
  })

  it('真指针拖进 B 的末尾放下：节点换进 B、从松手处收进末项之后', async () => {
    const { transfers } = await mount()
    const scale = await mouseScale()
    const from = item('a2').getBoundingClientRect()
    const b2 = item('b2').getBoundingClientRect()
    // 中心停在 B 的末项中心之后、仍在 B 的范围里：排到末尾
    const target = { x: b2.left + b2.width / 2, y: b2.top + b2.height * 0.75 }
    const at = (x: number, y: number) => ({ x: x / scale, y: y / scale })
    const start = { x: from.left + from.width / 2, y: from.top + from.height / 2 }
    await cdp().send('Input.dispatchMouseEvent', { type: 'mouseMoved', ...at(start.x, start.y) })
    await cdp().send('Input.dispatchMouseEvent', { type: 'mousePressed', button: 'left', clickCount: 1, ...at(start.x, start.y) })
    for (let i = 1; i <= 8; i++) {
      await frames(1)
      await cdp().send('Input.dispatchMouseEvent', { type: 'mouseMoved', button: 'left', ...at(start.x + ((target.x - start.x) * i) / 8, start.y + ((target.y - start.y) * i) / 8) })
    }
    await frames(1)
    expect(root('B').dataset.drop).toBe('inside')
    await cdp().send('Input.dispatchMouseEvent', { type: 'mouseReleased', button: 'left', clickCount: 1, ...at(target.x, target.y) })
    await frames()
    expect(transfers).toEqual([{ id: 'a2', fromList: 'A', toList: 'B', from: 1, to: 2, fromIds: ['a1', 'a3'], toIds: ['b1', 'b2', 'a2'] }])
    const moved = item('a2')
    expect(moved.parentElement).toBe(root('B'))
    await expect.poll(() => moved.hasAttribute('data-animating'), { timeout: 2000 }).toBe(false)
    expect(moved.style.translate).toBe('')
    const gap = b2.top - item('b1').getBoundingClientRect().bottom
    expect(moved.getBoundingClientRect().top).toBeCloseTo(b2.bottom + gap, 0)
    // 源列表合拢：a3 回到自己新的排布位，不留位移
    expect(item('a3').style.translate).toBe('')
  })
})
