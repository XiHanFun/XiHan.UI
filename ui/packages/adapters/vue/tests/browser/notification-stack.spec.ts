// 轻提示预设的那一摞：缺省上限、叠放、展开与收起。
// 真渲一台服务连发 20 条，DOM 里只挂 3 条，三条全落在视口内；对照 max: Infinity（不限）的同一批，
// 20 条全挂上——缺省那个 3 就是把摞留在视口里的那道闸。
//
// 摞是 fixed 定位面，量的是它相对视口的几何，只有真实浏览器算得出来；
// 宿主视口改不动，套一层固定高度的 iframe，把服务的宿主容器指进去。
import type { NotificationPlacement } from '@xihan-ui/headless'
import type { NotificationServiceOptions } from '../../src'
import { afterEach, describe, expect, it } from 'vitest'
import { nextTick } from 'vue'
import { createNotificationService } from '../../src'
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

/** 在固定视口的 iframe 里建一台轻提示服务并连发几条，返回那份文档。 */
async function burst(options: Omit<NotificationServiceOptions, 'target'> = {}, count = BURST): Promise<Document> {
  const doc = openFrame(WIDTH, HEIGHT)
  const target = doc.createElement('div')
  doc.body.append(target)
  const toast = createNotificationService({ preset: 'toast', ...options, target })
  dispose = () => toast.dispose()
  for (let i = 1; i <= count; i++)
    toast.info(`第 ${i} 条`, { duration: 0 })
  await tick()
  await new Promise(resolve => setTimeout(resolve, 400))
  return doc
}

function items(doc: Document): HTMLElement[] {
  return [...doc.querySelectorAll<HTMLElement>('[data-scope="notification"][data-part="item"]')]
}

function group(doc: Document): HTMLElement {
  const el = doc.querySelector<HTMLElement>('[data-scope="notification"][data-part="group"]')
  if (!el)
    throw new Error('没渲染出摞')
  return el
}

/** 整条都在视口里：上沿不小于 0、下沿不超过视口高。 */
function insideViewport(el: HTMLElement): boolean {
  const rect = el.getBoundingClientRect()
  return rect.height > 0 && rect.top >= 0 && rect.bottom <= HEIGHT
}

describe('轻提示预设的缺省上限', () => {
  it.each<NotificationPlacement>(['top', 'bottom'])('%s：连发 20 条只挂 3 条，三条全在视口里、摞面不溢出', async (placement) => {
    const doc = await burst({ placement })
    const list = items(doc)

    expect(list).toHaveLength(3)
    expect(group(doc).getAttribute('data-count')).toBe('3')
    expect(group(doc).hasAttribute('data-stacked')).toBe(true)
    expect(list.every(insideViewport)).toBe(true)
  })

  it('留下的是最新的三条，队列顺序就是视觉顺序', async () => {
    const doc = await burst()
    const list = items(doc)

    expect(list.map(el => el.textContent?.trim())).toEqual(['第 18 条', '第 19 条', '第 20 条'])
    const tops = list.map(el => el.getBoundingClientRect().top)
    expect(tops).toEqual([...tops].sort((a, b) => a - b))
  })

  it('对照 max: Infinity 即不限：20 条都在折叠堆叠中', async () => {
    const doc = await burst({ max: Number.POSITIVE_INFINITY })
    const list = items(doc)

    expect(list).toHaveLength(BURST)
    expect(list.every(insideViewport)).toBe(true)
    expect(list.at(-1)?.hasAttribute('data-frontmost')).toBe(true)
    // 摞是 fixed 面，文档本身不会因此长高。
    expect(doc.documentElement.scrollHeight).toBe(doc.documentElement.clientHeight)
  })
})

describe('叠放与展开', () => {
  it('默认折叠成三层，鼠标进入后展开为按真实高度排列的队列', async () => {
    const doc = await burst()
    const list = items(doc)
    expect(list.map(item => item.dataset.stackIndex)).toEqual(['2', '1', '0'])
    expect(list.at(-1)?.hasAttribute('data-frontmost')).toBe(true)
    expect(list.slice(0, -1).every(item => !item.hasAttribute('data-expanded'))).toBe(true)

    group(doc).dispatchEvent(new PointerEvent('pointerenter', { pointerType: 'mouse' }))
    await new Promise(resolve => setTimeout(resolve, 400))
    expect(group(doc).hasAttribute('data-expanded')).toBe(true)
    expect(list.every(item => item.hasAttribute('data-expanded'))).toBe(true)
    const tops = list.map(item => item.getBoundingClientRect().top)
    expect(new Set(tops).size).toBe(list.length)
  })

  it('展开期间整摞计时按住：不是指针停着的那几条也不走', async () => {
    const doc = openFrame(WIDTH, HEIGHT)
    const target = doc.createElement('div')
    doc.body.append(target)
    const toast = createNotificationService({ preset: 'toast', target })
    dispose = () => toast.dispose()
    toast.info('第一条', { duration: 400 })
    toast.info('第二条', { duration: 400 })
    await tick()
    await new Promise(resolve => setTimeout(resolve, 50))

    group(doc).dispatchEvent(new PointerEvent('pointerenter', { pointerType: 'mouse' }))
    await expect.poll(() => items(doc).every(item => item.hasAttribute('data-paused'))).toBe(true)
    // 等过整份停留时长：没被按住的话两条早已退场
    await new Promise(resolve => setTimeout(resolve, 600))
    expect(items(doc).map(item => item.dataset.state)).toEqual(['visible', 'visible'])

    group(doc).dispatchEvent(new PointerEvent('pointerleave', { pointerType: 'mouse' }))
    await expect.poll(() => items(doc).some(item => item.hasAttribute('data-paused'))).toBe(false)
  })

  it('按 Escape 收起展开的一摞，焦点离开卡片', async () => {
    const doc = openFrame(WIDTH, HEIGHT)
    const target = doc.createElement('div')
    doc.body.append(target)
    const toast = createNotificationService({ preset: 'toast', target })
    dispose = () => toast.dispose()
    toast.info('第一条', { duration: 0, actionLabel: '撤销' })
    toast.info('第二条', { duration: 0, actionLabel: '撤销' })
    await tick()
    await new Promise(resolve => setTimeout(resolve, 400))

    const action = doc.querySelectorAll<HTMLElement>('[data-scope="notification"][data-part="item-action-trigger"]')[1]!
    action.focus()
    await expect.poll(() => group(doc).hasAttribute('data-expanded')).toBe(true)
    action.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }))
    await expect.poll(() => group(doc).hasAttribute('data-expanded')).toBe(false)
    expect(doc.activeElement).toBe(doc.body)
    expect(items(doc).every(item => !item.hasAttribute('data-expanded'))).toBe(true)
  })
})
