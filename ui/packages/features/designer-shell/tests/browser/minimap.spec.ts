// 小地图在真实 Chromium 里：尺寸取 ResizeObserver 记下的，视口变化时照记下的尺寸重画视口框，不当场量自己。
import type { XhDesignerMinimapElement } from '../../src'
import { afterEach, describe, expect, it } from 'vitest'
import { defineDesignerShell } from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '../../style.css'

defineDesignerShell()

let map: XhDesignerMinimapElement | undefined

afterEach(() => {
  map?.remove()
  map = undefined
})

function frames(count: number): Promise<void> {
  return new Promise((resolve) => {
    let left = count
    const step = (): void => {
      if (--left <= 0)
        resolve()
      else
        requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  })
}

describe('<xh-designer-minimap>（Chromium）', () => {
  it('视口变化时不读自己的尺寸，视口框照旧落在比例换算后的位置', async () => {
    map = document.createElement('xh-designer-minimap')
    map.shapes = [{ kind: 'rect', rect: { x: 0, y: 0, width: 400, height: 200 } }]
    map.canvasSize = { width: 400, height: 200 }
    map.viewport = { x: 0, y: 0, zoom: 1 }
    document.body.append(map)
    await map.updateComplete
    await frames(2)
    const reads: string[] = []
    const width = Object.getOwnPropertyDescriptor(Element.prototype, 'clientWidth')!
    const height = Object.getOwnPropertyDescriptor(Element.prototype, 'clientHeight')!
    Object.defineProperty(Element.prototype, 'clientWidth', { ...width, get(this: Element) {
      if (this === map)
        reads.push('width')
      return width.get!.call(this)
    } })
    Object.defineProperty(Element.prototype, 'clientHeight', { ...height, get(this: Element) {
      if (this === map)
        reads.push('height')
      return height.get!.call(this)
    } })
    try {
      for (const zoom of [1.5, 2, 1.2]) {
        map.viewport = { x: 0, y: 0, zoom }
        await map.updateComplete
      }
    }
    finally {
      Object.defineProperty(Element.prototype, 'clientWidth', width)
      Object.defineProperty(Element.prototype, 'clientHeight', height)
    }
    expect(reads).toEqual([])
    const frame = map.querySelector('rect[data-part="frame"]')!
    const scale = Number(/scale\(([^)]+)\)/.exec(map.querySelector('[data-part="shapes"]')!.getAttribute('transform')!)![1])
    expect(Number(frame.getAttribute('width'))).toBeCloseTo(400 / 1.2 * scale, 3)
  })
})
