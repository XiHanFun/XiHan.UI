// 标尺框在真实 Chromium 里：两条标尺与画布按网格排开，刻度与画布的视口对齐；从标尺拖进画布按真实几何新建参考线；
// 参考线层除参考线外不挡作者内容的指针；画布区里的作者内容不写尺寸也撑满。
import type { DesignerRulerEventMap, XhDesignerRulerElement } from '../../src'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { defineDesignerShell } from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '../../style.css'

defineDesignerShell()

let root: XhDesignerRulerElement
let content: HTMLElement

beforeEach(async () => {
  root = document.createElement('xh-designer-ruler')
  root.style.cssText = 'position:fixed;left:40px;top:30px;width:620px;height:420px'
  root.viewport = { x: 30, y: 10, zoom: 1 }
  content = document.createElement('div')
  content.style.background = '#eee'
  root.append(content)
  document.body.prepend(root)
  await root.updateComplete
})

afterEach(() => {
  root.remove()
})

function pointer(target: EventTarget, type: string, x: number, y: number): void {
  target.dispatchEvent(new PointerEvent(type, { bubbles: true, cancelable: true, composed: true, pointerId: 1, isPrimary: true, pointerType: 'mouse', button: 0, clientX: x, clientY: y }))
}

function canvas(): DOMRect {
  return root.querySelector('[data-part="canvas"]')!.getBoundingClientRect()
}

describe('<xh-designer-ruler>（Chromium）', () => {
  it('标尺在画布上方与左方各占一条，刻度 0 对着画布里视口的原点', async () => {
    const top = root.querySelector('[data-part="ruler"][data-orientation="horizontal"]')!.getBoundingClientRect()
    const left = root.querySelector('[data-part="ruler"][data-orientation="vertical"]')!.getBoundingClientRect()
    const box = canvas()
    expect(top.bottom).toBeCloseTo(box.top, 0)
    expect(top.left).toBeCloseTo(box.left, 0)
    expect(left.right).toBeCloseTo(box.left, 0)
    expect(box.width).toBeCloseTo(620 - top.height, 0)
    const zero = Array.from(root.querySelectorAll<HTMLElement>('[data-orientation="horizontal"] [data-part="tick"][data-major]'))
      .find(tick => tick.textContent === '0')!
    expect(zero.getBoundingClientRect().left).toBeCloseTo(box.left + 30, 0)
  })

  it('画布区里不写尺寸的作者内容撑满画布区，多个子节点叠在同一块上', async () => {
    const layer = document.createElement('div')
    root.append(layer)
    await Promise.resolve()
    expect(layer.parentElement!.dataset.part).toBe('canvas')
    const box = canvas()
    for (const element of [content, layer]) {
      const rect = element.getBoundingClientRect()
      expect([rect.left, rect.top, rect.width, rect.height]).toEqual([box.left, box.top, box.width, box.height])
    }
  })

  it('从上标尺拖进画布新建参考线，数值按画布与视口换算', async () => {
    const seen: DesignerRulerEventMap['guides-change']['detail'][] = []
    root.addEventListener('guides-change', event => seen.push((event as DesignerRulerEventMap['guides-change']).detail))
    const top = root.querySelector('[data-part="ruler"][data-orientation="horizontal"]')!
    const box = canvas()
    const x = box.left + 100
    pointer(top, 'pointerdown', x, box.top - 8)
    pointer(document, 'pointermove', x, box.top + 40)
    pointer(document, 'pointermove', x, box.top + 110)
    await root.updateComplete
    const preview = root.querySelector('[data-part="guide-preview"]')!.getBoundingClientRect()
    expect(preview.top).toBeCloseTo(box.top + 110, 0)
    pointer(document, 'pointerup', x, box.top + 110)
    expect(seen).toEqual([{ guides: { x: [], y: [100] }, change: { type: 'add', axis: 'y', index: 0 } }])
  })

  it('参考线可以按中，参考线层其余部分把指针交给作者内容', async () => {
    root.guides = { x: [200], y: [] }
    await root.updateComplete
    const box = canvas()
    const line = root.querySelector<HTMLElement>('[data-part="guide"][data-axis="x"]')!
    expect(document.elementFromPoint(box.left + 30 + 200, box.top + 100)).toBe(line)
    expect(document.elementFromPoint(box.left + 30 + 260, box.top + 100)).toBe(content)
    expect(getComputedStyle(line).cursor).toBe('col-resize')
  })
  it('画布里的作者内容不受标尺样式影响：带同名部件的作者元素保持浏览器缺省样式', async () => {
    content.insertAdjacentHTML('beforeend', [
      '<div data-part="ruler" data-orientation="horizontal">',
      '<div data-part="ticks"><div data-part="tick" data-major><span data-part="tick-label">1</span></div></div>',
      '<div data-part="markers"><div data-part="marker"></div></div>',
      '<div data-part="cursor"></div><div data-part="highlight"></div>',
      '</div>',
      '<div data-part="guides"><div data-part="guide-lines"><div data-part="guide" data-axis="x" data-selected></div></div>',
      '<div data-part="guide-preview" data-axis="x"></div><div data-part="guide-label">1</div></div>',
    ].join(''))
    const planted = Array.from(content.querySelectorAll<HTMLElement>('[data-part]'))
    expect(planted).toHaveLength(13)
    for (const element of planted) {
      const style = getComputedStyle(element)
      expect([element.dataset.part, style.position, style.backgroundColor, style.translate, style.cursor, style.marginTop, style.pointerEvents, style.overflow])
        .toEqual([element.dataset.part, 'static', 'rgba(0, 0, 0, 0)', 'none', 'auto', '0px', 'auto', 'visible'])
      expect(getComputedStyle(element, '::before').content).toBe('none')
    }
    const own = root.querySelector<HTMLElement>(':scope > [data-part="ruler"][data-orientation="horizontal"] > [data-part="ticks"] > [data-part="tick"]')!
    expect(getComputedStyle(own).position).toBe('absolute')
  })
})
