// @vitest-environment jsdom
import type { ImageViewerSchema } from '../src/image-viewer'
import { normalizeProps } from '@xihan-ui/kernel'
import { createService } from '@xihan-ui/machine'
import { createVanillaRuntime } from '@xihan-ui/machine/vanilla'
import { beforeEach, describe, expect, it } from 'vitest'
import { connectImageViewer, imageViewerMachine } from '../src/image-viewer'

type Props = ImageViewerSchema['props']
type Dict = Record<string, unknown>

const ITEMS = [{ src: 'a.png' }, { src: 'b.png' }]

function mount(initial: Partial<Props> = {}) {
  const props: Partial<Props> = { items: ITEMS, defaultOpen: true, ...initial }
  const runtime = createVanillaRuntime()
  const service = createService(imageViewerMachine, { props: () => props, runtime })

  const content = document.createElement('div')
  content.setAttribute('data-scope', 'image-viewer')
  content.setAttribute('data-part', 'content')
  document.body.append(content)
  service.refs.set('getContentEl', () => content)
  runtime.start()

  return {
    service,
    api: () => connectImageViewer(service, normalizeProps),
    transform: () => service.context.get('transform'),
    panning: () => service.context.get('panning'),
  }
}

type Harness = ReturnType<typeof mount>

/** 一根手指落在图上。连接层只报落点，跟手归会话。 */
function down(h: Harness, pointerId: number, clientX: number, clientY: number): void {
  const props = h.api().getViewportProps() as Dict
  ;(props.onPointerdown as (e: PointerEvent) => void)(
    { button: 0, pointerId, clientX, clientY } as PointerEvent,
  )
}

function move(pointerId: number, clientX: number, clientY: number): void {
  document.dispatchEvent(new PointerEvent('pointermove', { pointerId, clientX, clientY, bubbles: true }))
}

function up(pointerId: number): void {
  document.dispatchEvent(new PointerEvent('pointerup', { pointerId, bubbles: true }))
}

beforeEach(() => {
  document.body.innerHTML = ''
})

describe('看图 · 单指平移', () => {
  it('跟手改偏移', () => {
    const h = mount()
    down(h, 1, 100, 100)
    move(1, 160, 130)
    expect(h.transform()).toMatchObject({ x: 60, y: 30 })
  })

  it('基准是按下那一刻，不是上一帧', () => {
    const h = mount()
    down(h, 1, 100, 100)
    move(1, 160, 100)
    move(1, 120, 100)
    expect(h.transform().x).toBe(20)
  })

  it('抬手收尾', () => {
    const h = mount()
    down(h, 1, 100, 100)
    expect(h.panning()).toBe(true)
    move(1, 160, 100)
    up(1)
    expect(h.panning()).toBe(false)
  })

  it('手划出图片仍跟得住——监听挂在文档上，不靠捕获指针', () => {
    const h = mount()
    down(h, 1, 100, 100)
    // 事件派在文档上而不是图片上
    move(1, 9999, 9999)
    expect(h.transform().x).toBe(9899)
  })
})

describe('看图 · 双指缩放', () => {
  it('撑开是放大', () => {
    const h = mount()
    down(h, 1, 100, 100)
    down(h, 2, 200, 100)
    // 间距从 100 撑到 200
    move(2, 300, 100)
    expect(h.transform().scale).toBeCloseTo(2)
  })

  it('捏合是缩小', () => {
    const h = mount()
    down(h, 1, 100, 100)
    down(h, 2, 300, 100)
    // 间距从 200 收到 100
    move(2, 200, 100)
    expect(h.transform().scale).toBeCloseTo(0.5)
  })

  it('相对起始那一刻算，不相对上一帧——来回撑收能回到原样', () => {
    const h = mount()
    down(h, 1, 100, 100)
    down(h, 2, 200, 100)
    move(2, 400, 100)
    move(2, 300, 100)
    move(2, 200, 100)
    expect(h.transform().scale).toBeCloseTo(1)
  })

  it('两指整体平移时只动偏移，不动缩放', () => {
    const h = mount()
    down(h, 1, 100, 100)
    down(h, 2, 200, 100)
    move(1, 150, 140)
    move(2, 250, 140)
    expect(h.transform().scale).toBeCloseTo(1)
    expect(h.transform()).toMatchObject({ x: 50, y: 40 })
  })

  it('吃缩放上下限', () => {
    const h = mount({ minScale: 1, maxScale: 3 })
    down(h, 1, 100, 100)
    down(h, 2, 200, 100)
    move(2, 9999, 100)
    expect(h.transform().scale).toBe(3)
  })

  it('顶到上限之后偏移不再继续漂——位移按夹过的倍率算', () => {
    const h = mount({ minScale: 1, maxScale: 2 })
    down(h, 1, 100, 100)
    down(h, 2, 200, 100)
    // 两指对称撑开，中点始终停在 150：这样偏移只可能来自缩放那一项
    move(1, 0, 100)
    move(2, 300, 100)
    const capped = { ...h.transform() }
    expect(capped.scale).toBe(2)

    move(1, -400, 100)
    move(2, 700, 100)
    expect(h.transform().scale).toBe(2)
    expect(h.transform().x).toBeCloseTo(capped.x)
  })
})

describe('看图 · 指头数变化', () => {
  it('第二根手指落下时重拍基准，图不跳', () => {
    const h = mount()
    down(h, 1, 100, 100)
    move(1, 150, 100)
    const beforeSecond = { ...h.transform() }
    down(h, 2, 250, 100)
    // 第二根刚落下那一刻还没动，变换不该变
    expect(h.transform()).toMatchObject({ x: beforeSecond.x, scale: beforeSecond.scale })
  })

  it('从双指退回单指时重拍基准，剩下那根不会带着旧基准继续走', () => {
    const h = mount()
    down(h, 1, 100, 100)
    down(h, 2, 200, 100)
    move(2, 300, 100)
    const afterPinch = { ...h.transform() }

    up(2)
    // 抬起那一下只重拍基准，不该改变换
    expect(h.transform()).toMatchObject({ x: afterPinch.x, y: afterPinch.y })

    // 剩下那根手指从它此刻的位置重新起量
    move(1, 140, 100)
    expect(h.transform().x).toBeCloseTo(afterPinch.x + 40)
  })

  it('最后一根离开才收尾', () => {
    const h = mount()
    down(h, 1, 100, 100)
    down(h, 2, 200, 100)
    up(1)
    expect(h.panning()).toBe(true)
    up(2)
    expect(h.panning()).toBe(false)
  })

  it('系统收走指针也收尾', () => {
    const h = mount()
    down(h, 1, 100, 100)
    document.dispatchEvent(new PointerEvent('pointercancel', { pointerId: 1, bubbles: true }))
    expect(h.panning()).toBe(false)
  })

  it('右键不开手势', () => {
    const h = mount()
    const props = h.api().getViewportProps() as Dict
    ;(props.onPointerdown as (e: PointerEvent) => void)(
      { button: 2, pointerId: 1, clientX: 0, clientY: 0 } as PointerEvent,
    )
    expect(h.panning()).toBe(false)
  })
})
