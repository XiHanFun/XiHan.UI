// @vitest-environment jsdom

import type { DesignerMinimapEventMap, DesignerMinimapShape, XhDesignerMinimapElement } from '../src'
import { fitRect } from '@xihan-ui/designer-kit'
import { afterEach, describe, expect, it } from 'vitest'
import { defineDesignerShell } from '../src'

defineDesignerShell()

afterEach(() => {
  document.body.innerHTML = ''
})

const SIZE = { width: 160, height: 100 }
const BOX = { left: 10, top: 20 }

const shapes: DesignerMinimapShape[] = [
  { kind: 'rect', rect: { x: 0, y: 0, width: 100, height: 50 } },
  { kind: 'rect', rect: { x: 200, y: 100, width: 100, height: 50 }, tone: 'muted' },
  { kind: 'path', d: 'M 100 25 L 200 125' },
]

async function mount(setup: (map: XhDesignerMinimapElement) => void = () => {}): Promise<XhDesignerMinimapElement> {
  const map = document.createElement('xh-designer-minimap')
  Object.defineProperty(map, 'clientWidth', { value: SIZE.width })
  Object.defineProperty(map, 'clientHeight', { value: SIZE.height })
  map.getBoundingClientRect = () => DOMRect.fromRect({ x: BOX.left, y: BOX.top, ...SIZE })
  setup(map)
  document.body.append(map)
  await map.updateComplete
  return map
}

function part<T extends Element>(map: Element, name: string): T {
  return map.querySelector<T>(`[data-part="${name}"]`)!
}

function rectOf(element: Element): { x: number, y: number, width: number, height: number } {
  const read = (name: string): number => Number(element.getAttribute(name))
  return { x: read('x'), y: read('y'), width: read('width'), height: read('height') }
}

function pointer(type: string, clientX: number, clientY: number, init: PointerEventInit = {}): PointerEvent {
  return new PointerEvent(type, { bubbles: true, cancelable: true, pointerId: 1, clientX, clientY, ...init })
}

function record(map: Element): DesignerMinimapEventMap['navigate']['detail'][] {
  const seen: DesignerMinimapEventMap['navigate']['detail'][] = []
  map.addEventListener('navigate', event => seen.push((event as DesignerMinimapEventMap['navigate']).detail))
  return seen
}

/** 小地图按内容与视口范围的外包适配到自身尺寸。 */
function expectedMap(content: { x: number, y: number, width: number, height: number }) {
  return fitRect(content, SIZE, { padding: 6, maxZoom: 1, limits: { min: 1e-4, max: 1 } })
}

describe('<xh-designer-minimap>', () => {
  it('整块 aria-hidden；没有图形时收起', async () => {
    const map = await mount()
    expect(map.getAttribute('aria-hidden')).toBe('true')
    expect(map.hasAttribute('data-empty')).toBe(true)
    map.shapes = shapes
    await map.updateComplete
    expect(map.hasAttribute('data-empty')).toBe(false)
    map.shapes = []
    await map.updateComplete
    expect(map.hasAttribute('data-empty')).toBe(true)
  })

  it('按比例画出矩形与路径，矩形可取淡色', async () => {
    const map = await mount((element) => {
      element.shapes = shapes
    })
    const fitted = expectedMap({ x: 0, y: 0, width: 300, height: 150 })
    expect(part(map, 'shapes').getAttribute('transform')).toBe(`translate(${fitted.x} ${fitted.y}) scale(${fitted.zoom})`)
    const rects = map.querySelectorAll('rect[data-part="rect"]')
    expect(rects).toHaveLength(2)
    expect(rectOf(rects[1]!)).toEqual({ x: 200, y: 100, width: 100, height: 50 })
    expect(rects[1]!.getAttribute('data-tone')).toBe('muted')
    expect(rects[0]!.hasAttribute('data-tone')).toBe(false)
    expect(part(map, 'path').getAttribute('d')).toBe('M 100 25 L 200 125')
    expect(part<SVGRectElement>(map, 'frame').style.display).toBe('none')
  })

  it('给了视口与画布尺寸时画出视口框，比例把视口范围一并装下', async () => {
    const map = await mount((element) => {
      element.shapes = shapes
      element.viewport = { x: 100, y: 0, zoom: 2 }
      element.canvasSize = { width: 800, height: 400 }
    })
    const fitted = expectedMap({ x: -50, y: 0, width: 400, height: 200 })
    expect(part(map, 'shapes').getAttribute('transform')).toBe(`translate(${fitted.x} ${fitted.y}) scale(${fitted.zoom})`)
    const frame = part<SVGRectElement>(map, 'frame')
    expect(frame.style.display).toBe('')
    expect(rectOf(frame)).toEqual({ x: -50 * fitted.zoom + fitted.x, y: fitted.y, width: 400 * fitted.zoom, height: 200 * fitted.zoom })
  })

  it('bounds 指定内容范围', async () => {
    const map = await mount((element) => {
      element.shapes = [{ kind: 'path', d: 'M 0 0 L 500 250' }]
      element.bounds = { x: 0, y: 0, width: 500, height: 250 }
    })
    expect(map.hasAttribute('data-empty')).toBe(false)
    const fitted = expectedMap({ x: 0, y: 0, width: 500, height: 250 })
    expect(part(map, 'shapes').getAttribute('transform')).toBe(`translate(${fitted.x} ${fitted.y}) scale(${fitted.zoom})`)
  })

  it('按下与拖动时派发 navigate，坐标换成世界坐标；拖动期间比例不变，松手后重新适配', async () => {
    const map = await mount((element) => {
      element.shapes = shapes
      element.viewport = { x: 0, y: 0, zoom: 1 }
      element.canvasSize = { width: 100, height: 50 }
    })
    const navigated = record(map)
    const fitted = expectedMap({ x: 0, y: 0, width: 300, height: 150 })
    const world = (x: number, y: number) => ({ x: (x - BOX.left - fitted.x) / fitted.zoom, y: (y - BOX.top - fitted.y) / fitted.zoom })
    const down = pointer('pointerdown', 60, 50)
    map.dispatchEvent(down)
    expect(down.defaultPrevented).toBe(true)
    document.dispatchEvent(pointer('pointermove', 90, 70))
    expect(navigated).toEqual([{ center: world(60, 50) }, { center: world(90, 70) }])

    map.viewport = { x: -1000, y: -500, zoom: 1 }
    await map.updateComplete
    const transform = `translate(${fitted.x} ${fitted.y}) scale(${fitted.zoom})`
    expect(part(map, 'shapes').getAttribute('transform')).toBe(transform)
    expect(rectOf(part(map, 'frame')).x).toBeCloseTo(1000 * fitted.zoom + fitted.x)

    document.dispatchEvent(pointer('pointerup', 90, 70))
    await map.updateComplete
    expect(part(map, 'shapes').getAttribute('transform')).not.toBe(transform)
    document.dispatchEvent(pointer('pointermove', 100, 80))
    expect(navigated).toHaveLength(2)
  })

  it('只认主键；拆下后不再跟随指针', async () => {
    const map = await mount((element) => {
      element.shapes = shapes
    })
    const navigated = record(map)
    map.dispatchEvent(pointer('pointerdown', 60, 50, { button: 2 }))
    expect(navigated).toEqual([])
    map.dispatchEvent(pointer('pointerdown', 60, 50))
    expect(navigated).toHaveLength(1)
    map.remove()
    document.dispatchEvent(pointer('pointermove', 90, 70))
    expect(navigated).toHaveLength(1)
  })
})
