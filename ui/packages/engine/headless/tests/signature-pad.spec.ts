/**
 * 落笔要真实的活 DOM：屏幕坐标换算成画布坐标靠的是画布节点的矩形，
 * 而拖动途中的指针事件挂在 document 上，纯逻辑环境里演不出来。
 *
 * @vitest-environment jsdom
 */

import type { Service } from '@xihan-ui/machine'
import type { SignaturePadDrawDetails, SignaturePadDrawEndDetails, SignaturePadSchema } from '../src/signature-pad/index'
import { normalizeProps } from '@xihan-ui/kernel'
import { createService } from '@xihan-ui/machine'
import { createVanillaRuntime } from '@xihan-ui/machine/vanilla'
import { afterEach, describe, expect, it } from 'vitest'
import {
  connectSignaturePad,
  pathFromPoints,
  signaturePadMachine,
  signaturePadSvg,
  simulatedPressure,
  strokeRadius,
  strokesToPaths,
} from '../src/signature-pad/index'

type Props = SignaturePadSchema['props']

interface Harness {
  service: Service<SignaturePadSchema>
  setProps: (next: Props) => void
  control: HTMLElement
  draws: SignaturePadDrawDetails[]
  ends: SignaturePadDrawEndDetails[]
}

/** 画布矩形：jsdom 不做布局，量出来恒是全 0，不桩就换算不出画布坐标。 */
function stubRect(el: HTMLElement, x: number, y: number, width: number, height: number): void {
  el.getBoundingClientRect = (): DOMRect => ({
    x,
    y,
    width,
    height,
    top: y,
    left: x,
    right: x + width,
    bottom: y + height,
    toJSON: () => ({}),
  }) as DOMRect
}

function makeService(initial: Props = {}): Harness {
  const draws: SignaturePadDrawDetails[] = []
  const ends: SignaturePadDrawEndDetails[] = []
  let props: Props = {
    ...initial,
    onDraw: details => draws.push(details),
    onDrawEnd: details => ends.push(details),
  }
  const control = document.createElement('div')
  document.body.appendChild(control)
  stubRect(control, 20, 10, 300, 120)

  const runtime = createVanillaRuntime()
  const service = createService(signaturePadMachine, { props: () => props, runtime })
  service.refs.set('getControlEl', () => control)
  runtime.start()
  return {
    service,
    control,
    draws,
    ends,
    setProps: (next) => {
      props = { ...props, ...next }
      // props 是从外面换进来的，不经 set；推一下让订阅者按新 props 重算
      service.context.set('strokes', service.context.get('strokes'))
    },
  }
}

function api(service: Service<SignaturePadSchema>) {
  return connectSignaturePad(service, normalizeProps)
}

/** 落一笔：按下、依次移动、抬手。坐标是画布内坐标，这里加回矩形原点。 */
function drawStroke(h: Harness, path: ReadonlyArray<[number, number]>): void {
  const [first, ...rest] = path
  h.service.send({ type: 'DRAW.START', point: { clientX: 20 + first![0], clientY: 10 + first![1] } })
  for (const [x, y] of rest)
    document.dispatchEvent(new PointerEvent('pointermove', { clientX: 20 + x, clientY: 10 + y, bubbles: true }))
  document.dispatchEvent(new PointerEvent('pointerup', { bubbles: true }))
}

afterEach(() => {
  document.body.innerHTML = ''
})

describe('signature-pad 笔迹几何', () => {
  it('没有可用点时不产出路径：空笔画在 SVG 里连节点都不该占', () => {
    expect(pathFromPoints([])).toBe('')
    expect(pathFromPoints([{ x: Number.NaN, y: 0, pressure: 1 }])).toBe('')
  })

  it('单点成笔画成一个圆点：只点一下也要留下痕迹，否则手写的句点会消失', () => {
    const d = pathFromPoints([{ x: 10, y: 10, pressure: 1 }], { size: 4 })
    expect(d).toBe('M8 10A2 2 0 1 0 12 10A2 2 0 1 0 8 10Z')
  })

  it('一段水平笔画的轮廓宽度等于 size：轮廓填充与描边给出同样的粗细', () => {
    const d = pathFromPoints(
      [{ x: 0, y: 0, pressure: 1 }, { x: 10, y: 0, pressure: 1 }],
      { size: 4 },
    )
    // 左侧沿 y=+2、右侧沿 y=-2，两端各补一个半径 2 的半圆笔帽
    expect(d).toBe('M0 2L10 2A2 2 0 0 0 10 -2L0 -2A2 2 0 0 0 0 2Z')
  })

  it('与前一点完全重合的点被丢掉：重合点量不出走向，留着会把法线算成 NaN', () => {
    const dup = pathFromPoints(
      [{ x: 0, y: 0, pressure: 1 }, { x: 0, y: 0, pressure: 1 }, { x: 10, y: 0, pressure: 1 }],
      { size: 4 },
    )
    const plain = pathFromPoints(
      [{ x: 0, y: 0, pressure: 1 }, { x: 10, y: 0, pressure: 1 }],
      { size: 4 },
    )
    expect(dup).toBe(plain)
  })

  it('thinning 为 0 时压感不参与，粗细恒定；调大以后压感越轻笔画越细', () => {
    expect(strokeRadius(0.2, { size: 6 })).toBe(3)
    expect(strokeRadius(1, { size: 6 })).toBe(3)
    expect(strokeRadius(1, { size: 6, thinning: 1 })).toBe(3)
    expect(strokeRadius(0.5, { size: 6, thinning: 1 })).toBe(1.5)
    // 半径有下限，否则那一段会细成一条没有面积的缝
    expect(strokeRadius(0, { size: 6, thinning: 1 })).toBeGreaterThan(0)
  })

  it('模拟压感随速度递减并有上下限：划得再快也留得下一道可见的笔痕', () => {
    expect(simulatedPressure(0, 4)).toBe(1)
    expect(simulatedPressure(4, 4)).toBeCloseTo(0.5, 5)
    expect(simulatedPressure(9999, 4)).toBe(0.2)
  })

  it('导出的 SVG 按落笔时量到的画布尺寸写视窗；一笔都没有时是空串', () => {
    expect(signaturePadSvg([], { width: 300, height: 120 })).toBe('')
    const svg = signaturePadSvg(['M0 0L1 1'], { width: 300, height: 120 })
    expect(svg).toContain('viewBox="0 0 300 120"')
    expect(svg).toContain('<path d="M0 0L1 1"/>')
    // 尺寸还没量到时不写视窗，写成 0 0 0 0 会把整张图缩没
    expect(signaturePadSvg(['M0 0L1 1'], { width: 0, height: 0 })).not.toContain('viewBox')
  })

  it('画不出形状的那一笔不占位：中途被打断的笔不该在 SVG 里留一个空节点', () => {
    expect(strokesToPaths([{ points: [] }, { points: [{ x: 1, y: 1, pressure: 1 }] }])).toHaveLength(1)
  })
})

describe('signaturePadMachine 落笔与收笔', () => {
  it('按下即起一笔，移动逐点累积，抬笔回到 idle', () => {
    const h = makeService()
    expect(h.service.state.get()).toBe('idle')
    h.service.send({ type: 'DRAW.START', point: { clientX: 20, clientY: 10 } })
    expect(h.service.state.get()).toBe('drawing')
    document.dispatchEvent(new PointerEvent('pointermove', { clientX: 60, clientY: 40, bubbles: true }))
    document.dispatchEvent(new PointerEvent('pointerup', { bubbles: true }))
    expect(h.service.state.get()).toBe('idle')
    const strokes = h.service.context.get('strokes')
    expect(strokes).toHaveLength(1)
    // 坐标以画布左上角为原点：客户端坐标减去矩形原点
    expect(strokes[0]!.points).toEqual([
      { x: 0, y: 0, pressure: 0.5 },
      { x: 40, y: 30, pressure: expect.any(Number) },
    ])
  })

  it('抬笔后再动指针不该继续画：监听器要真的摘干净', () => {
    const h = makeService()
    drawStroke(h, [[0, 0], [40, 30]])
    document.dispatchEvent(new PointerEvent('pointermove', { clientX: 200, clientY: 100, bubbles: true }))
    expect(h.service.context.get('strokes')[0]!.points).toHaveLength(2)
  })

  it('低于最小间距的移动被丢掉：手抖与重采样噪声会让轮廓自交', () => {
    const h = makeService()
    h.service.send({ type: 'DRAW.START', point: { clientX: 20, clientY: 10 } })
    document.dispatchEvent(new PointerEvent('pointermove', { clientX: 20.4, clientY: 10, bubbles: true }))
    expect(h.service.context.get('strokes')[0]!.points).toHaveLength(1)
    document.dispatchEvent(new PointerEvent('pointermove', { clientX: 25, clientY: 10, bubbles: true }))
    expect(h.service.context.get('strokes')[0]!.points).toHaveLength(2)
  })

  it('两笔各成一条子路径，落笔尺寸写进导出视窗', () => {
    const h = makeService()
    drawStroke(h, [[0, 0], [40, 30]])
    drawStroke(h, [[60, 0], [90, 30]])
    expect(h.service.context.get('strokes')).toHaveLength(2)
    expect(api(h.service).paths).toHaveLength(2)
    expect(h.service.context.get('surface')).toEqual({ width: 300, height: 120 })
  })

  it('画布没就位时一笔都落不下：没有坐标系就没有坐标', () => {
    const h = makeService()
    h.service.refs.set('getControlEl', () => null)
    h.service.send({ type: 'DRAW.START', point: { clientX: 20, clientY: 10 } })
    expect(h.service.context.get('strokes')).toHaveLength(0)
  })

  it('onDraw 每收进一个点通知一次，onDrawEnd 抬笔才发一次并带上可提交的 SVG', () => {
    const h = makeService()
    drawStroke(h, [[0, 0], [40, 30], [80, 60]])
    expect(h.draws).toHaveLength(3)
    expect(h.ends).toHaveLength(1)
    expect(h.ends[0]!.paths).toHaveLength(1)
    expect(h.ends[0]!.svg).toContain('viewBox="0 0 300 120"')
  })

  it('onDraw 带上正在写的那一笔：宿主只重画这一条就够', () => {
    const h = makeService()
    drawStroke(h, [[0, 0], [40, 30]])
    drawStroke(h, [[60, 0], [90, 30]])
    const last = h.draws[h.draws.length - 1]!
    expect(last.paths).toHaveLength(2)
    expect(last.path).toBe(last.paths[1])
  })

  it('清空与表单重置也发通知：宿主照 draw-end 缓存的 SVG 不会停在旧的那一版', () => {
    const h = makeService()
    drawStroke(h, [[0, 0], [40, 30]])
    h.draws.length = 0
    h.ends.length = 0

    h.service.send({ type: 'STROKES.CLEAR' })
    expect(h.draws).toEqual([{ paths: [], path: '' }])
    expect(h.ends).toEqual([{ paths: [], svg: '' }])

    // 本来就空的画布上再清一次不发：表单重置会连着打到每一个字段上
    h.draws.length = 0
    h.ends.length = 0
    h.service.send({ type: 'FORM.RESET' })
    expect(h.draws).toHaveLength(0)
    expect(h.ends).toHaveLength(0)
  })

  it('只认起笔那根指针：手掌与第二根手指的移动和抬起都不算数', () => {
    const h = makeService()
    h.service.send({ type: 'DRAW.START', point: { clientX: 20, clientY: 10, pointerId: 1 } })
    document.dispatchEvent(new PointerEvent('pointermove', { pointerId: 2, clientX: 300, clientY: 120, bubbles: true }))
    document.dispatchEvent(new PointerEvent('pointerup', { pointerId: 2, bubbles: true }))
    expect(h.service.state.get()).toBe('drawing')
    expect(h.service.context.get('strokes')[0]!.points).toHaveLength(1)

    document.dispatchEvent(new PointerEvent('pointermove', { pointerId: 1, clientX: 60, clientY: 40, bubbles: true }))
    document.dispatchEvent(new PointerEvent('pointerup', { pointerId: 1, bubbles: true }))
    expect(h.service.state.get()).toBe('idle')
    expect(h.service.context.get('strokes')[0]!.points).toHaveLength(2)
  })

  it('画布尺寸第一笔就钉住：容器变窄后落的新笔与旧笔在同一套坐标里', () => {
    const h = makeService()
    drawStroke(h, [[0, 0], [40, 30]])
    expect(h.service.context.get('surface')).toEqual({ width: 300, height: 120 })

    // 容器缩到一半，笔迹坐标系不变，新落的点按比例放大回原坐标
    stubRect(h.control, 20, 10, 150, 60)
    drawStroke(h, [[20, 15], [40, 30]])
    expect(h.service.context.get('surface')).toEqual({ width: 300, height: 120 })
    expect(h.service.context.get('strokes')[1]!.points[0]).toMatchObject({ x: 40, y: 30 })

    // 清空后重新量：下一笔按当时的画布定坐标系
    h.service.send({ type: 'STROKES.CLEAR' })
    drawStroke(h, [[10, 10], [40, 30]])
    expect(h.service.context.get('surface')).toEqual({ width: 150, height: 60 })
  })

  it('禁用与只读都落不下笔；解除后照常能画', () => {
    const h = makeService({ disabled: true })
    h.service.send({ type: 'DRAW.START', point: { clientX: 20, clientY: 10 } })
    expect(h.service.state.get()).toBe('idle')
    expect(h.service.context.get('strokes')).toHaveLength(0)

    h.setProps({ disabled: false, readOnly: true })
    h.service.send({ type: 'DRAW.START', point: { clientX: 20, clientY: 10 } })
    expect(h.service.context.get('strokes')).toHaveLength(0)

    h.setProps({ readOnly: false })
    drawStroke(h, [[0, 0], [40, 30]])
    expect(h.service.context.get('strokes')).toHaveLength(1)
  })

  it('落笔途中被禁用就不再收点，但抬笔照常收尾，状态不会卡在 drawing', () => {
    const h = makeService()
    h.service.send({ type: 'DRAW.START', point: { clientX: 20, clientY: 10 } })
    h.setProps({ disabled: true })
    document.dispatchEvent(new PointerEvent('pointermove', { clientX: 60, clientY: 40, bubbles: true }))
    expect(h.service.context.get('strokes')[0]!.points).toHaveLength(1)
    document.dispatchEvent(new PointerEvent('pointerup', { bubbles: true }))
    expect(h.service.state.get()).toBe('idle')
  })

  it('清空与表单重置都把画布抹回空，导出的 SVG 跟着变空串', () => {
    const h = makeService()
    drawStroke(h, [[0, 0], [40, 30]])
    expect(api(h.service).empty).toBe(false)

    h.service.send({ type: 'STROKES.CLEAR' })
    expect(api(h.service).empty).toBe(true)
    expect(api(h.service).toSvg()).toBe('')

    drawStroke(h, [[0, 0], [40, 30]])
    h.service.send({ type: 'FORM.RESET' })
    expect(h.service.context.get('strokes')).toHaveLength(0)
  })
})

describe('connectSignaturePad 属性表', () => {
  it('空画布：root 与画布都带 data-empty，segment 的 d 是空串', () => {
    const h = makeService()
    const a = api(h.service)
    expect(a.getRootProps()).toMatchObject({ 'data-empty': '', 'data-drawing': undefined })
    expect(a.getControlProps()).toMatchObject({ 'role': 'img', 'aria-label': 'Signature' })
    expect(a.getSegmentProps()).toMatchObject({ 'd': '', 'data-empty': '' })
  })

  it('画完一笔后 data-empty 消失，segment 拿到那一笔的轮廓', () => {
    const h = makeService()
    drawStroke(h, [[0, 0], [40, 30]])
    const a = api(h.service)
    expect(a.getRootProps()).toMatchObject({ 'data-empty': undefined })
    expect(String((a.getSegmentProps() as Record<string, unknown>).d)).toMatch(/^M/)
  })

  it('表单影子提交的就是导出的那份 SVG；空签名提交空串，required 才拦得住', () => {
    const h = makeService({ name: 'sign', required: true })
    expect(api(h.service).getHiddenInputProps()).toMatchObject({
      name: 'sign',
      required: true,
      value: '',
    })
    drawStroke(h, [[0, 0], [40, 30]])
    const hidden = api(h.service).getHiddenInputProps() as Record<string, unknown>
    expect(hidden.value).toBe(api(h.service).toSvg())
    expect(String(hidden.value)).toContain('<svg xmlns="http://www.w3.org/2000/svg"')
  })

  it('禁用与只读都让清空按钮按不动，且用的是原生 disabled', () => {
    const h = makeService({ disabled: true })
    expect(api(h.service).getClearTriggerProps()).toMatchObject({
      'type': 'button',
      'disabled': true,
      'data-disabled': '',
    })
    h.setProps({ disabled: false, readOnly: true })
    expect(api(h.service).getClearTriggerProps()).toMatchObject({ disabled: true })
    h.setProps({ readOnly: false })
    expect(api(h.service).getClearTriggerProps()).toMatchObject({ disabled: undefined })
  })

  it('基准线自报落位并带 aria-hidden：它只是画面，读屏念它没有意义', () => {
    const h = makeService()
    expect(api(h.service).getGuideProps()).toMatchObject({
      'x1': '8%',
      'x2': '92%',
      'aria-hidden': true,
    })
  })

  it('文案可覆盖：画布、清空按钮与状态区的文案都走 translations', () => {
    const h = makeService({
      translations: { label: '手写签名', clearTrigger: '清空签名', statusEmpty: '尚未签名', statusSigned: '已签名' },
    })
    expect(api(h.service).getControlProps()).toMatchObject({ 'aria-label': '手写签名' })
    expect(api(h.service).getClearTriggerProps()).toMatchObject({ 'aria-label': '清空签名' })
    expect(api(h.service).statusText).toBe('尚未签名')
    drawStroke(h, [[0, 0], [40, 30]])
    expect(api(h.service).statusText).toBe('已签名')
  })

  it('状态区是活区域：画布报的是 role=img，签没签只能从这里听出来', () => {
    const h = makeService()
    expect(api(h.service).getStatusProps()).toMatchObject({
      'role': 'status',
      'aria-live': 'polite',
      'data-empty': '',
    })
    expect(api(h.service).statusText).toBe('No signature yet')
    drawStroke(h, [[0, 0], [40, 30]])
    expect(api(h.service).getStatusProps()).toMatchObject({ 'data-empty': undefined })
    expect(api(h.service).statusText).toBe('Signed')
  })

  it('画布量到尺寸后自报 viewBox，空画布不写：写成 0 0 0 0 会把整块画布缩没', () => {
    const h = makeService()
    expect(api(h.service).getControlProps()).toMatchObject({ viewBox: undefined })
    drawStroke(h, [[0, 0], [40, 30]])
    expect(api(h.service).getControlProps()).toMatchObject({
      preserveAspectRatio: 'none',
      viewBox: '0 0 300 120',
    })
  })
})
