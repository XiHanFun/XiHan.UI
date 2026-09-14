// @vitest-environment jsdom
import type { ResizableSchema } from '../src/resizable'
import { createService, normalizeProps } from '@xihan-ui/core'
import { createVanillaRuntime } from '@xihan-ui/core/vanilla'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { connectResizable, RESIZABLE_LARGE_STEP, RESIZABLE_STEP, resizableMachine } from '../src/resizable'

type Props = ResizableSchema['props']
type Dict = Record<string, unknown>

/** 一块 200×100 的盒子，左上角在 (100, 50)。 */
const BOX = { x: 100, y: 50, width: 200, height: 100 }

function mount(initial: Partial<Props> = {}) {
  const props: Partial<Props> = { defaultDimensions: { width: BOX.width, height: BOX.height }, ...initial }
  const runtime = createVanillaRuntime()
  const service = createService(resizableMachine, { props: () => props, runtime })

  const root = document.createElement('div')
  root.setAttribute('data-scope', 'resizable')
  root.setAttribute('data-part', 'root')
  // jsdom 不排版：按下那一刻要量的矩形打在真实节点上
  root.getBoundingClientRect = (): DOMRect =>
    ({ ...BOX, top: BOX.y, left: BOX.x, right: BOX.x + BOX.width, bottom: BOX.y + BOX.height, toJSON: () => ({}) }) as DOMRect
  document.body.append(root)

  service.refs.set('getRootEl', () => root)
  runtime.start()

  return {
    service,
    api: () => connectResizable(service, normalizeProps),
    state: () => service.state.get(),
    dimensions: () => service.context.get('dimensions'),
    offset: () => service.context.get('offset'),
    setProps: (next: Partial<Props>) => Object.assign(props, next),
  }
}

type Harness = ReturnType<typeof mount>

function press(h: Harness, edge: string, clientX = 0, clientY = 0): void {
  const props = h.api().getHandleProps({ edge: edge as never }) as Dict
  ;(props.onPointerDown as (e: PointerEvent) => void)({
    button: 0,
    clientX,
    clientY,
    preventDefault: () => {},
  } as unknown as PointerEvent)
}

function move(clientX: number, clientY = 0): void {
  document.dispatchEvent(new PointerEvent('pointermove', { clientX, clientY, bubbles: true }))
}

function release(): void {
  document.dispatchEvent(new PointerEvent('pointerup', { bubbles: true }))
}

function key(h: Harness, edge: string, k: string, shiftKey = false): void {
  const props = h.api().getHandleProps({ edge: edge as never }) as Dict
  ;(props.onKeyDown as (e: KeyboardEvent) => void)({ key: k, shiftKey, preventDefault: () => {} } as KeyboardEvent)
}

beforeEach(() => {
  document.body.innerHTML = ''
})

describe('可调容器 · 指针', () => {
  it('按下进调整态，松手回 idle', () => {
    const h = mount()
    press(h, 'e')
    expect(h.state()).toBe('resizing')
    release()
    expect(h.state()).toBe('idle')
  })

  it('推东边只变宽，位移恒为零', () => {
    const h = mount()
    press(h, 'e', 300)
    move(360)
    expect(h.dimensions()).toEqual({ width: 260, height: 100 })
    expect(h.offset()).toEqual({ x: 0, y: 0 })
  })

  it('推南边只变高', () => {
    const h = mount()
    press(h, 's', 0, 150)
    move(0, 190)
    expect(h.dimensions()).toEqual({ width: 200, height: 140 })
  })

  it('推西边：宽变了，位移跟着走——对边才钉得住', () => {
    const h = mount()
    press(h, 'w', 100)
    move(60)
    expect(h.dimensions().width).toBe(240)
    expect(h.offset().x).toBe(-40)
  })

  it('推北边同理', () => {
    const h = mount()
    press(h, 'n', 0, 50)
    move(0, 20)
    expect(h.dimensions().height).toBe(130)
    expect(h.offset().y).toBe(-30)
  })

  it('角同时动两轴', () => {
    const h = mount()
    press(h, 'se', 300, 150)
    move(340, 180)
    expect(h.dimensions()).toEqual({ width: 240, height: 130 })
  })

  it('基准是按下那一刻，不是上一帧', () => {
    const h = mount()
    press(h, 'e', 300)
    move(360)
    move(320)
    expect(h.dimensions().width).toBe(220)
  })

  it('吃上下限', () => {
    const h = mount({ minWidth: 150, maxWidth: 300 })
    press(h, 'e', 300)
    move(-9999)
    expect(h.dimensions().width).toBe(150)
    release()
    press(h, 'e', 300)
    move(9999)
    expect(h.dimensions().width).toBe(300)
  })

  it('顶到下限之后西边的位移不再走——对边不会被推过去', () => {
    const h = mount({ minWidth: 150 })
    press(h, 'w', 100)
    move(9999)
    expect(h.dimensions().width).toBe(150)
    expect(h.offset().x).toBe(50)
  })

  it('锁了宽高比时另一轴跟着算', () => {
    const h = mount({ aspectRatio: 2 })
    press(h, 'e', 300)
    move(400)
    expect(h.dimensions()).toEqual({ width: 300, height: 150 })
  })

  it('吸附步进', () => {
    const h = mount({ step: 25 })
    press(h, 'e', 300)
    move(318)
    expect(h.dimensions().width).toBe(225)
  })

  it('rtl 下往左拖行尾侧那条边才是变宽', () => {
    const h = mount({ dir: 'rtl' })
    press(h, 'e', 300)
    move(260)
    expect(h.dimensions().width).toBe(240)
  })

  it('rtl 下动的是屏幕左那一头：位移跟着走，右边缘钉住', () => {
    const h = mount({ dir: 'rtl' })
    press(h, 'e', 300)
    move(260)
    // 逻辑上推的是行尾边，物理上推的是西边——起点因此左移。只翻位移正负会变成右边在长
    expect(h.offset().x).toBe(-40)
  })

  it('系统收走指针按取消算：尺寸与位移都退回按下那一刻', () => {
    const h = mount()
    press(h, 'w', 100)
    move(60)
    expect(h.dimensions().width).toBe(240)
    document.dispatchEvent(new PointerEvent('pointercancel', { bubbles: true }))
    expect(h.dimensions().width).toBe(200)
    expect(h.offset().x).toBe(0)
    expect(h.state()).toBe('idle')
  })

  it('disabled 时按下没反应', () => {
    const h = mount({ disabled: true })
    press(h, 'e', 300)
    expect(h.state()).toBe('idle')
  })

  it('没开放的边按下没反应', () => {
    const h = mount({ edges: ['e', 's', 'se'] })
    press(h, 'w', 100)
    expect(h.state()).toBe('idle')
    press(h, 'e', 300)
    expect(h.state()).toBe('resizing')
  })

  it('拖动途中连着发 onDimensionsChange，收尾只发一次 onDimensionsChangeEnd', () => {
    const onDimensionsChange = vi.fn()
    const onDimensionsChangeEnd = vi.fn()
    const h = mount({ onDimensionsChange, onDimensionsChangeEnd })
    press(h, 'e', 300)
    move(320)
    move(340)
    expect(onDimensionsChange.mock.calls.length).toBeGreaterThanOrEqual(2)
    expect(onDimensionsChangeEnd).not.toHaveBeenCalled()
    release()
    expect(onDimensionsChangeEnd).toHaveBeenCalledTimes(1)
    expect(onDimensionsChangeEnd.mock.calls[0]![0]).toEqual({ dimensions: { width: 240, height: 100 }, edge: 'e' })
  })
})

describe('可调容器 · 键盘', () => {
  it('方向键按屏幕方向推：推东边时右键变宽', () => {
    const h = mount()
    key(h, 'e', 'ArrowRight')
    expect(h.dimensions().width).toBe(200 + RESIZABLE_STEP)
  })

  it('推西边时右键是变窄——与拖动同义，不是「变大 / 变小」', () => {
    const h = mount()
    key(h, 'w', 'ArrowRight')
    expect(h.dimensions().width).toBe(200 - RESIZABLE_STEP)
  })

  it('按住 Shift 走大步', () => {
    const h = mount()
    key(h, 'e', 'ArrowRight', true)
    expect(h.dimensions().width).toBe(200 + RESIZABLE_LARGE_STEP)
  })

  it('推南边认上下键', () => {
    const h = mount()
    key(h, 's', 'ArrowDown')
    expect(h.dimensions().height).toBe(100 + RESIZABLE_STEP)
  })

  it('按 Home / End 推到这条边能到的两端', () => {
    const h = mount({ minWidth: 120, maxWidth: 400 })
    key(h, 'e', 'End')
    expect(h.dimensions().width).toBe(400)
    key(h, 'e', 'Home')
    expect(h.dimensions().width).toBe(120)
  })

  it('没给上限时 End 不动', () => {
    const h = mount()
    key(h, 'e', 'End')
    expect(h.dimensions().width).toBe(200)
  })

  it('rtl 下按的仍是屏幕方向：行尾侧那条边落在屏幕左，往左推才是变宽', () => {
    const h = mount({ dir: 'rtl' })
    key(h, 'e', 'ArrowLeft')
    expect(h.dimensions().width).toBe(200 + RESIZABLE_STEP)
  })

  it('键盘不进调整态：按一下就是一次完整的调整', () => {
    const h = mount()
    key(h, 'e', 'ArrowRight')
    expect(h.state()).toBe('idle')
  })

  it('键盘按一下也发一次收尾通知', () => {
    const onDimensionsChangeEnd = vi.fn()
    const h = mount({ onDimensionsChangeEnd })
    key(h, 'e', 'ArrowRight')
    expect(onDimensionsChangeEnd).toHaveBeenCalledTimes(1)
    expect(onDimensionsChangeEnd.mock.calls[0]![0].edge).toBe('e')
  })

  it('键盘同样吃上下限', () => {
    const h = mount({ minWidth: 190 })
    key(h, 'e', 'ArrowLeft', true)
    expect(h.dimensions().width).toBe(190)
  })

  it('disabled 与没开放的边都不认方向键', () => {
    const off = mount({ disabled: true })
    key(off, 'e', 'ArrowRight')
    expect(off.dimensions().width).toBe(200)

    const partial = mount({ edges: ['e'] })
    key(partial, 'w', 'ArrowRight')
    expect(partial.dimensions().width).toBe(200)
  })
})

describe('可调容器 · 产出的属性', () => {
  it('root 报尺寸；没位移时不写 left / top', () => {
    const h = mount()
    const style = (h.api().getRootProps() as { style: Dict }).style
    expect(style.inlineSize).toBe('200px')
    expect(style.blockSize).toBe('100px')
    expect(style.left).toBeUndefined()
    expect(style.top).toBeUndefined()
  })

  it('推过西边之后 root 写出 left', () => {
    const h = mount()
    press(h, 'w', 100)
    move(60)
    expect((h.api().getRootProps() as { style: Dict }).style.left).toBe('-40px')
  })

  it('把手是分隔条，横竖与它推的那一轴垂直', () => {
    const h = mount()
    const east = h.api().getHandleProps({ edge: 'e' }) as Dict
    expect(east.role).toBe('separator')
    expect(east['aria-orientation']).toBe('vertical')
    expect((h.api().getHandleProps({ edge: 'n' }) as Dict)['aria-orientation']).toBe('horizontal')
  })

  it('把手报出所在那一轴的尺寸', () => {
    const h = mount()
    expect((h.api().getHandleProps({ edge: 'e' }) as Dict)['aria-valuenow']).toBe(200)
    expect((h.api().getHandleProps({ edge: 's' }) as Dict)['aria-valuenow']).toBe(100)
  })

  it('光标按方向给，角上走对角线', () => {
    const h = mount()
    expect(((h.api().getHandleProps({ edge: 'e' }) as Dict).style as Dict).cursor).toBe('ew-resize')
    expect(((h.api().getHandleProps({ edge: 'se' }) as Dict).style as Dict).cursor).toBe('nwse-resize')
    expect(((h.api().getHandleProps({ edge: 'ne' }) as Dict).style as Dict).cursor).toBe('nesw-resize')
  })

  it('没开放的边退出 Tab 序列并报 aria-disabled', () => {
    const h = mount({ edges: ['e'] })
    const west = h.api().getHandleProps({ edge: 'w' }) as Dict
    expect(west.tabindex).toBe(-1)
    expect(west['aria-disabled']).toBe('true')
    expect(h.api().edgeEnabled('w')).toBe(false)
    expect(h.api().edgeEnabled('e')).toBe(true)
  })

  it('调整中的那条边报 data-resizing，root 也报出是哪条边', () => {
    const h = mount()
    press(h, 'e', 300)
    expect((h.api().getHandleProps({ edge: 'e' }) as Dict)['data-resizing']).toBe('')
    expect((h.api().getHandleProps({ edge: 'w' }) as Dict)['data-resizing']).toBeUndefined()
    expect((h.api().getRootProps() as Dict)['data-edge']).toBe('e')
    release()
  })

  it('命令式赋值先过约束', () => {
    const h = mount({ minWidth: 150 })
    h.api().setDimensions({ width: 10, height: 10 })
    expect(h.dimensions().width).toBe(150)
  })
})

describe('可调容器 · 受控', () => {
  it('给了 dimensions 就由外面说了算，内部只发意图', () => {
    const onDimensionsChange = vi.fn()
    const h = mount({ dimensions: { width: 300, height: 200 }, onDimensionsChange })
    key(h, 'e', 'ArrowRight')
    expect(h.dimensions()).toEqual({ width: 300, height: 200 })
    expect(onDimensionsChange).toHaveBeenCalled()
  })
})

describe('可调容器 · 把手的名字', () => {
  it('缺省名字念的是方位，不是 n / ne / se 这几个内部字母', () => {
    const h = mount()
    expect((h.api().getHandleProps({ edge: 'e' }) as Dict)['aria-label']).toBe('Resize right edge')
    expect((h.api().getHandleProps({ edge: 'se' }) as Dict)['aria-label']).toBe('Resize bottom right corner')
    for (const edge of ['n', 'ne', 'se'] as const)
      expect((h.api().getHandleProps({ edge }) as Dict)['aria-label']).not.toBe(`Resize ${edge}`)
  })

  it('作者给了 translations.handle 就用作者那份', () => {
    const h = mount({ translations: { handle: edge => `拖动${edge === 'e' ? '右边' : '别处'}` } })
    expect((h.api().getHandleProps({ edge: 'e' }) as Dict)['aria-label']).toBe('拖动右边')
  })
})
