// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import { fitOverflowCount, measureOverflowLayout, trackOverflowLayout } from '../src/behavior/overflow'

describe('fitOverflowCount', () => {
  it('全部放得下：一个不收，也不给入口让位', () => {
    // 末端恰好等于可用长度也算放得下
    expect(fitOverflowCount({ available: 120, ends: [40, 80, 120], reserve: 40 })).toBe(3)
  })

  it('放不下：先给入口让出行尾，再从头数放得下几个', () => {
    expect(fitOverflowCount({ available: 130, ends: [40, 80, 120, 160], reserve: 40 })).toBe(2)
  })

  it('连一个都放不下时只剩入口', () => {
    expect(fitOverflowCount({ available: 50, ends: [40, 80], reserve: 40 })).toBe(0)
  })

  it('没有条目时是 0', () => {
    expect(fitOverflowCount({ available: 100, ends: [], reserve: 40 })).toBe(0)
  })

  it('半个像素以内的舍入不改判：恰好放得下的那一个仍然放得下', () => {
    expect(fitOverflowCount({ available: 119.6, ends: [40, 80, 120], reserve: 40 })).toBe(3)
    expect(fitOverflowCount({ available: 119.4, ends: [40, 80, 120], reserve: 40 })).toBe(1)
  })

  it('可用长度越大露出的越多，不会来回跳', () => {
    const ends = [30, 70, 100, 150, 190]
    let last = -1
    for (let available = 0; available <= 220; available += 5) {
      const count = fitOverflowCount({ available, ends, reserve: 36 })
      expect(count).toBeGreaterThanOrEqual(last)
      last = count
    }
    expect(last).toBe(ends.length)
  })
})

// ── 量测：jsdom 没有排版，几何量逐个伪造 ──

interface Box { start: number, size: number }

function stubBox(el: HTMLElement, box: () => Box | null, cross = 32): void {
  Object.defineProperty(el, 'offsetWidth', { configurable: true, get: () => (box()?.size ?? 0) })
  Object.defineProperty(el, 'offsetHeight', { configurable: true, get: () => (box() ? cross : 0) })
  el.getBoundingClientRect = () => {
    const b = box()
    const left = b?.start ?? 0
    const width = b?.size ?? 0
    return { left, right: left + width, top: 0, bottom: b ? cross : 0, width, height: b ? cross : 0, x: left, y: 0, toJSON: () => ({}) } as DOMRect
  }
}

/** 一排宽 40 的条目，末尾一个宽 32 的入口；露着的按文档序从左往右排。 */
function mountRow(width: number, count: number, scale = 1): { container: HTMLElement, items: HTMLElement[], trigger: HTMLElement } {
  const container = document.createElement('div')
  const items = Array.from({ length: count }, () => document.createElement('button'))
  const trigger = document.createElement('button')
  container.append(...items, trigger)
  document.body.append(container)
  const flow = (): HTMLElement[] => [...items, trigger].filter(el => !el.hidden)
  const sizeOf = (el: HTMLElement): number => (el === trigger ? 32 : 40)
  for (const el of [...items, trigger]) {
    stubBox(el, () => {
      if (el.hidden)
        return null
      let start = 0
      for (const other of flow()) {
        if (other === el)
          break
        start += sizeOf(other)
      }
      return { start: start * scale, size: sizeOf(el) }
    })
    // 矩形跟着缩放，布局尺寸不跟
    const rect = el.getBoundingClientRect
    el.getBoundingClientRect = () => {
      const r = rect()
      return { ...r, right: r.left + r.width * scale, width: r.width * scale } as DOMRect
    }
  }
  Object.defineProperty(container, 'clientWidth', { configurable: true, get: () => width })
  stubBox(container, () => ({ start: 0, size: width }))
  const rect = container.getBoundingClientRect
  container.getBoundingClientRect = () => {
    const r = rect()
    return { ...r, right: r.width * scale, width: r.width * scale } as DOMRect
  }
  return { container, items, trigger }
}

afterEach(() => {
  document.body.innerHTML = ''
})

describe('measureOverflowLayout', () => {
  it('量自然排布：收着的条目与入口临时露出，量完原样收回', () => {
    const { container, items, trigger } = mountRow(130, 4)
    items[2]!.hidden = true
    items[3]!.hidden = true
    trigger.hidden = true
    const layout = measureOverflowLayout({ container, items, trigger, axis: 'inline', concealed: [...items, trigger] })
    expect(layout).toEqual({ available: 130, ends: [40, 80, 120, 160], reserve: 32 })
    expect(items.map(el => el.hidden)).toEqual([false, false, true, true])
    expect(trigger.hidden).toBe(true)
  })

  it('祖先缩放不改结果：矩形按容器的缩放比例还原', () => {
    const { container, items, trigger } = mountRow(130, 4, 0.5)
    const layout = measureOverflowLayout({ container, items, trigger, axis: 'inline', concealed: [] })
    expect(layout?.ends).toEqual([40, 80, 120, 160])
    expect(layout?.available).toBe(130)
  })

  it('容器没有排布时返回 null，调用方保留上一轮结果', () => {
    const container = document.createElement('div')
    const trigger = document.createElement('button')
    container.append(trigger)
    document.body.append(container)
    expect(measureOverflowLayout({ container, items: [], trigger, axis: 'inline', concealed: [] })).toBeNull()
  })

  it('rtl：从内衬盒的右缘往左量', () => {
    const container = document.createElement('div')
    container.setAttribute('dir', 'rtl')
    const item = document.createElement('button')
    const trigger = document.createElement('button')
    container.append(item, trigger)
    document.body.append(container)
    // 容器 0..200，条目贴右缘排在 160..200
    stubBox(container, () => ({ start: 0, size: 200 }))
    Object.defineProperty(container, 'clientWidth', { configurable: true, get: () => 200 })
    stubBox(item, () => ({ start: 160, size: 40 }))
    stubBox(trigger, () => ({ start: 128, size: 32 }))
    const layout = measureOverflowLayout({ container, items: [item], trigger, axis: 'inline', concealed: [] })
    expect(layout?.ends).toEqual([40])
  })
})

describe('trackOverflowLayout', () => {
  it('窗口尺寸变化排到下一帧重量，同一帧里多次变化只回调一次；停止后不再回调', async () => {
    const container = document.createElement('div')
    document.body.append(container)
    const onChange = vi.fn()
    const stop = trackOverflowLayout(window, { container, nodes: () => [], onChange })
    window.dispatchEvent(new Event('resize'))
    window.dispatchEvent(new Event('resize'))
    await new Promise(resolve => requestAnimationFrame(() => resolve(undefined)))
    expect(onChange).toHaveBeenCalledTimes(1)
    stop()
    window.dispatchEvent(new Event('resize'))
    await new Promise(resolve => requestAnimationFrame(() => resolve(undefined)))
    expect(onChange).toHaveBeenCalledTimes(1)
  })

  it('条目增减与声明改写（可及名、按下态）都会触发重量；收纳自己写的 hidden 不算', async () => {
    const container = document.createElement('div')
    const item = document.createElement('button')
    container.append(item)
    document.body.append(container)
    const onChange = vi.fn()
    const stop = trackOverflowLayout(window, { container, nodes: () => [item], onChange })
    const frame = (): Promise<void> => new Promise(resolve => requestAnimationFrame(() => resolve()))

    item.hidden = true
    await Promise.resolve()
    await frame()
    expect(onChange).not.toHaveBeenCalled()

    item.setAttribute('aria-pressed', 'true')
    await Promise.resolve()
    await frame()
    expect(onChange).toHaveBeenCalledTimes(1)

    container.append(document.createElement('button'))
    await Promise.resolve()
    await frame()
    expect(onChange).toHaveBeenCalledTimes(2)
    stop()
  })
})
