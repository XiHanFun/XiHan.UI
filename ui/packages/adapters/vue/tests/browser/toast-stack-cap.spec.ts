/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 轻提示那一摞的缺省上限：真渲一台服务连发 20 条，DOM 里只挂 3 条，三条全落在视口内。
// 对照 max: Infinity（不限）的同一批：20 条全挂上，超出的那几条既滚不到也点不到——
// 缺省那个 3 就是把摞留在视口里的那道闸。
//
// 摞是 fixed 定位面，量的是它相对视口的几何，只有真实浏览器算得出来；
// 宿主视口改不动，套一层固定高度的 iframe，把服务的宿主容器指进去。
import type { ToastPlacement } from '@xihan-ui/headless'
import type { ToastServiceOptions } from '../../src'
import { afterEach, describe, expect, it } from 'vitest'
import { nextTick } from 'vue'
import { createToastService } from '../../src'
import { closeFrame, openFrame } from './viewport-frame'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

const WIDTH = 414
const HEIGHT = 640
const BURST = 20

async function tick(): Promise<void> {
  await nextTick()
  await nextTick()
  await new Promise(r => setTimeout(r, 0))
  await nextTick()
}

let dispose: (() => void) | null = null

afterEach(() => {
  dispose?.()
  dispose = null
  closeFrame()
})

/** 在固定视口的 iframe 里建一台服务并连发 BURST 条常驻条子，返回那份文档。 */
async function burst(options: Omit<ToastServiceOptions, 'target'> = {}): Promise<Document> {
  const doc = openFrame(WIDTH, HEIGHT)
  const target = doc.createElement('div')
  doc.body.append(target)
  const toast = createToastService({ ...options, target })
  dispose = () => toast.dispose()
  for (let i = 1; i <= BURST; i++)
    toast.info(`第 ${i} 条`, { duration: 0 })
  await tick()
  await new Promise(resolve => setTimeout(resolve, 400))
  return doc
}

function roots(doc: Document): HTMLElement[] {
  return [...doc.querySelectorAll<HTMLElement>('[data-scope="toast"][data-part="root"]')]
}

function group(doc: Document): HTMLElement {
  const el = doc.querySelector<HTMLElement>('[data-scope="toast"][data-part="group"]')
  if (!el)
    throw new Error('没渲染出摞')
  return el
}

/** 整条都在视口里：上沿不小于 0、下沿不超过视口高。 */
function insideViewport(el: HTMLElement): boolean {
  const rect = el.getBoundingClientRect()
  return rect.height > 0 && rect.top >= 0 && rect.bottom <= HEIGHT
}

describe('轻提示的缺省上限', () => {
  it.each<ToastPlacement>(['top', 'bottom'])('%s：连发 20 条只挂 3 条，三条全在视口里、摞面不溢出', async (placement) => {
    const doc = await burst({ placement })
    const items = roots(doc)

    expect(items).toHaveLength(3)
    expect(group(doc).getAttribute('data-count')).toBe('3')
    expect(items.every(insideViewport)).toBe(true)
  })

  it('默认折叠成三层，鼠标进入后展开为按真实高度排列的队列', async () => {
    const doc = await burst()
    const items = roots(doc)
    expect(items.map(item => item.dataset.stackIndex)).toEqual(['2', '1', '0'])
    expect(items.at(-1)?.hasAttribute('data-frontmost')).toBe(true)
    expect(items.slice(0, -1).every(item => !item.hasAttribute('data-expanded'))).toBe(true)

    group(doc).dispatchEvent(new PointerEvent('pointerenter', { pointerType: 'mouse' }))
    await new Promise(resolve => setTimeout(resolve, 400))
    expect(group(doc).hasAttribute('data-expanded')).toBe(true)
    expect(items.every(item => item.hasAttribute('data-expanded'))).toBe(true)
    const tops = items.map(item => item.getBoundingClientRect().top)
    expect(new Set(tops).size).toBe(items.length)
  })

  it('留下的是最新的三条，队列顺序就是视觉顺序', async () => {
    const doc = await burst()
    const items = roots(doc)

    expect(items.map(el => el.textContent?.trim())).toEqual(['第 18 条', '第 19 条', '第 20 条'])
    const tops = items.map(el => el.getBoundingClientRect().top)
    expect(tops).toEqual([...tops].sort((a, b) => a - b))
  })

  it('对照 max: Infinity 即不限：20 条都在折叠堆叠中', async () => {
    const doc = await burst({ max: Number.POSITIVE_INFINITY })
    const items = roots(doc)

    expect(items).toHaveLength(BURST)
    expect(items.every(insideViewport)).toBe(true)
    expect(items.at(-1)?.hasAttribute('data-frontmost')).toBe(true)
    // 摞是 fixed 面，文档本身不会因此长高。
    expect(doc.documentElement.scrollHeight).toBe(doc.documentElement.clientHeight)
  })
})
