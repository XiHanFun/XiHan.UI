// @vitest-environment jsdom

import type { DesignerRulerEventMap, XhDesignerRulerElement } from '../src'
import { setXhConfig } from '@xihan-ui/web-components'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { defineDesignerShell } from '../src'
import { designerShellZhCN } from '../src/locale'

defineDesignerShell()

// jsdom 不排版：画布区按 (20, 20) 起、400 × 300 算，标尺在它上方与左方各 20 像素
const CANVAS = { left: 20, top: 20, width: 400, height: 300 }

beforeEach(() => {
  const sized = (element: HTMLElement, size: number): number => (element.dataset.part === 'canvas' ? size : 0)
  vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockImplementation(function (this: HTMLElement) {
    return sized(this, CANVAS.width)
  })
  vi.spyOn(HTMLElement.prototype, 'clientHeight', 'get').mockImplementation(function (this: HTMLElement) {
    return sized(this, CANVAS.height)
  })
  const real = HTMLElement.prototype.getBoundingClientRect
  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (this: HTMLElement) {
    return this.dataset.part === 'canvas' ? DOMRect.fromRect({ x: CANVAS.left, y: CANVAS.top, width: CANVAS.width, height: CANVAS.height }) : real.call(this)
  })
})

afterEach(() => {
  document.body.innerHTML = ''
  setXhConfig({})
  vi.restoreAllMocks()
})

async function mount(setup: (ruler: XhDesignerRulerElement) => void = () => {}): Promise<XhDesignerRulerElement> {
  const ruler = document.createElement('xh-designer-ruler')
  ruler.viewport = { x: 0, y: 0, zoom: 1 }
  setup(ruler)
  document.body.append(ruler)
  await ruler.updateComplete
  return ruler
}

function part(root: Element, name: string): HTMLElement {
  return root.querySelector<HTMLElement>(`[data-part="${name}"]`)!
}

function ruler(root: Element, orientation: 'horizontal' | 'vertical'): HTMLElement {
  return root.querySelector<HTMLElement>(`[data-part="ruler"][data-orientation="${orientation}"]`)!
}

function guide(root: Element, axis: 'x' | 'y', index: number): HTMLElement {
  return root.querySelector<HTMLElement>(`[data-part="guide"][data-axis="${axis}"][data-index="${index}"]`)!
}

function pointer(type: string, x: number, y: number): PointerEvent {
  return new PointerEvent(type, { bubbles: true, cancelable: true, pointerId: 1, isPrimary: true, button: 0, clientX: x, clientY: y })
}

function drag(from: Element, path: readonly [number, number][]): void {
  const [x0, y0] = path[0]!
  from.dispatchEvent(pointer('pointerdown', x0, y0))
  for (const [x, y] of path.slice(1, -1))
    document.dispatchEvent(pointer('pointermove', x, y))
  const [x1, y1] = path.at(-1)!
  document.dispatchEvent(pointer('pointermove', x1, y1))
  document.dispatchEvent(pointer('pointerup', x1, y1))
}

function record(root: Element): DesignerRulerEventMap['guides-change']['detail'][] {
  const seen: DesignerRulerEventMap['guides-change']['detail'][] = []
  root.addEventListener('guides-change', event => seen.push((event as DesignerRulerEventMap['guides-change']).detail))
  return seen
}

describe('<xh-designer-ruler>', () => {
  it('生成角块、两条标尺、画布与参考线层；作者内容进画布，slot="corner" 进角块', async () => {
    const ruler = document.createElement('xh-designer-ruler')
    const content = document.createElement('div')
    const unit = document.createElement('button')
    unit.slot = 'corner'
    ruler.append(content, unit)
    document.body.append(ruler)
    await ruler.updateComplete
    expect(Array.from(ruler.children, child => [child.getAttribute('data-part'), child.hasAttribute('data-xh-gen')])).toEqual([
      ['corner', true],
      ['ruler', true],
      ['ruler', true],
      ['canvas', true],
      ['guides', true],
    ])
    expect(content.parentElement).toBe(part(ruler, 'canvas'))
    expect(unit.parentElement).toBe(part(ruler, 'corner'))
    const late = document.createElement('span')
    ruler.append(late)
    await Promise.resolve()
    expect(late.parentElement).toBe(part(ruler, 'canvas'))
  })

  it('刻度按视口与 unitSize 排，主刻度带文字；缺省按主刻度间隔取小数位，format 可换', async () => {
    const root = await mount(element => element.viewport = { x: 50, y: 0, zoom: 1 })
    const ticks = Array.from(ruler(root, 'horizontal').querySelectorAll<HTMLElement>('[data-part="tick"]'))
    const majors = ticks.filter(tick => tick.hasAttribute('data-major'))
    expect(majors.slice(0, 3).map(tick => [tick.style.transform, tick.textContent])).toEqual([
      ['translateX(50px)', '0'],
      ['translateX(150px)', '100'],
      ['translateX(250px)', '200'],
    ])
    root.unitSize = 10
    root.viewport = { x: 0, y: 0, zoom: 4 }
    await root.updateComplete
    const fine = Array.from(ruler(root, 'horizontal').querySelectorAll<HTMLElement>('[data-part="tick"][data-major]'))
    expect(fine.slice(0, 3).map(tick => tick.textContent)).toEqual(['0', '2', '4'])
    root.unitSize = 1
    root.viewport = { x: 0, y: 0, zoom: 200 }
    await root.updateComplete
    expect(ruler(root, 'vertical').querySelectorAll<HTMLElement>('[data-part="tick"][data-major]')[1]!.textContent).toBe('0.5')
    root.format = value => `${value} mm`
    await root.updateComplete
    expect(ruler(root, 'vertical').querySelector('[data-part="tick"][data-major]')!.textContent).toBe('0 mm')
  })

  it('highlight 在两条标尺上画淡底，参考线在对应标尺上画标记、在画布上画通栏线', async () => {
    setXhConfig(designerShellZhCN)
    const root = await mount((element) => {
      element.viewport = { x: 10, y: 20, zoom: 2 }
      element.highlight = { x: 5, y: 10, width: 20, height: 30 }
      element.guides = { x: [100], y: [40, 60] }
    })
    const top = ruler(root, 'horizontal')
    const band = top.querySelector<HTMLElement>('[data-part="highlight"]')!
    expect(band.hidden).toBe(false)
    expect(band.style.transform).toBe('translateX(20px)')
    expect(band.style.inlineSize).toBe('40px')
    expect(ruler(root, 'vertical').querySelector<HTMLElement>('[data-part="highlight"]')!.style.blockSize).toBe('60px')
    expect(top.querySelectorAll('[data-part="marker"]')).toHaveLength(1)
    expect(ruler(root, 'vertical').querySelectorAll('[data-part="marker"]')).toHaveLength(2)
    const line = guide(root, 'y', 1)
    expect(line.style.transform).toBe('translateY(140px)')
    expect(line.getAttribute('role')).toBe('separator')
    expect(line.getAttribute('aria-orientation')).toBe('horizontal')
    expect(line.getAttribute('aria-label')).toBe('横向参考线 60')
    expect(guide(root, 'x', 0).getAttribute('aria-label')).toBe('竖向参考线 100')
  })

  it('从上标尺拖进画布新建横向参考线，拖动中显示预览与数值，吸附由 snap 给', async () => {
    const root = await mount((element) => {
      element.guides = { x: [], y: [10] }
      element.snap = (_axis, value) => Math.round(value / 5) * 5
    })
    const seen = record(root)
    const top = ruler(root, 'horizontal')
    top.dispatchEvent(pointer('pointerdown', 100, 10))
    document.dispatchEvent(pointer('pointermove', 100, 30))
    document.dispatchEvent(pointer('pointermove', 100, 83))
    await root.updateComplete
    const preview = part(root, 'guide-preview')
    expect(preview.hidden).toBe(false)
    expect(preview.dataset.axis).toBe('y')
    expect(preview.style.transform).toBe('translateY(65px)')
    expect(part(root, 'guide-label').textContent).toBe('65')
    document.dispatchEvent(pointer('pointerup', 100, 83))
    expect(seen).toEqual([{ guides: { x: [], y: [10, 65] }, change: { type: 'add', axis: 'y', index: 1 } }])
    await root.updateComplete
    expect(part(root, 'guide-preview').hidden).toBe(true)
  })

  it('松手时还在标尺上即取消；从左标尺拖出的是竖向参考线', async () => {
    const root = await mount()
    const seen = record(root)
    drag(ruler(root, 'horizontal'), [[100, 10], [100, 60], [100, 12]])
    expect(seen).toEqual([])
    drag(ruler(root, 'vertical'), [[10, 100], [60, 100], [120, 100]])
    expect(seen).toEqual([{ guides: { x: [100], y: [] }, change: { type: 'add', axis: 'x', index: 0 } }])
  })

  it('拖动已有参考线挪动，拖回标尺即删除，拖到别处不变', async () => {
    const root = await mount(element => element.guides = { x: [50, 150], y: [] })
    const seen = record(root)
    drag(guide(root, 'x', 1), [[170, 100], [200, 100], [220, 100]])
    expect(seen.at(-1)).toEqual({ guides: { x: [50, 200], y: [] }, change: { type: 'move', axis: 'x', index: 1 } })
    drag(guide(root, 'x', 0), [[70, 100], [40, 100], [5, 100]])
    expect(seen.at(-1)).toEqual({ guides: { x: [150], y: [] }, change: { type: 'remove', axis: 'x', index: 0 } })
    drag(guide(root, 'x', 0), [[70, 100], [90, 100], [200, 400]])
    expect(seen).toHaveLength(2)
  })

  it('点参考线选中并取得焦点，Delete 删除；按 Esc 放弃进行中的拖动', async () => {
    const root = await mount(element => element.guides = { x: [], y: [40, 80] })
    const seen = record(root)
    const line = guide(root, 'y', 1)
    line.dispatchEvent(pointer('pointerdown', 100, 100))
    document.dispatchEvent(pointer('pointerup', 100, 100))
    await root.updateComplete
    expect(document.activeElement).toBe(line)
    expect(line.hasAttribute('data-selected')).toBe(true)
    line.dispatchEvent(new KeyboardEvent('keydown', { key: 'Delete', bubbles: true, cancelable: true }))
    expect(seen).toEqual([{ guides: { x: [], y: [40] }, change: { type: 'remove', axis: 'y', index: 1 } }])

    guide(root, 'y', 0).dispatchEvent(pointer('pointerdown', 100, 60))
    document.dispatchEvent(pointer('pointermove', 100, 120))
    await root.updateComplete
    expect(guide(root, 'y', 0).hasAttribute('data-dragging')).toBe(true)
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }))
    document.dispatchEvent(pointer('pointerup', 100, 120))
    await root.updateComplete
    expect(seen).toHaveLength(1)
    expect(guide(root, 'y', 0).hasAttribute('data-dragging')).toBe(false)
  })

  it('指针在标尺或画布上时两条标尺画跟随的细线，离开即收起', async () => {
    const root = await mount()
    part(root, 'canvas').dispatchEvent(pointer('pointermove', 120, 70))
    const top = ruler(root, 'horizontal').querySelector<HTMLElement>('[data-part="cursor"]')!
    const left = ruler(root, 'vertical').querySelector<HTMLElement>('[data-part="cursor"]')!
    expect(top.hidden).toBe(false)
    expect(top.style.transform).toBe('translateX(100px)')
    expect(left.style.transform).toBe('translateY(50px)')
    root.dispatchEvent(new PointerEvent('pointerleave'))
    expect(top.hidden).toBe(true)
  })

  it('readonly attribute 三态：="false" 不只读，空串只读，移除后回到不只读，重绘也不来回翻转', async () => {
    const root = await mount()
    const settle = async (): Promise<void> => {
      await (root as unknown as { updateComplete: Promise<unknown> }).updateComplete
    }
    root.setAttribute('readonly', 'false')
    await settle()
    expect(root.readonly).toBe(false)
    expect(root.hasAttribute('data-readonly')).toBe(false)
    root.setAttribute('readonly', '')
    await settle()
    expect(root.hasAttribute('data-readonly')).toBe(true)
    root.removeAttribute('readonly')
    await settle()
    expect(root.readonly).toBeUndefined()
    expect(root.hasAttribute('data-readonly')).toBe(false)
    root.guides = { x: [10], y: [] }
    await settle()
    expect(root.hasAttribute('data-readonly')).toBe(false)
  })

  it('只读时照常显示参考线，不能新建、挪动或删除', async () => {
    const root = await mount((element) => {
      element.guides = { x: [], y: [40] }
      element.readonly = true
    })
    const seen = record(root)
    expect(root.hasAttribute('data-readonly')).toBe(true)
    drag(ruler(root, 'horizontal'), [[100, 10], [100, 60], [100, 100]])
    drag(guide(root, 'y', 0), [[100, 60], [100, 10], [100, 5]])
    guide(root, 'y', 0).dispatchEvent(new KeyboardEvent('keydown', { key: 'Delete', bubbles: true, cancelable: true }))
    expect(seen).toEqual([])
  })
})
