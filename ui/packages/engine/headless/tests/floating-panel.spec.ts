/**
 * 拖动与改尺要真实的活 DOM：跟手期间的监听挂在 document 上，
 * 而按键处理器只有拿到真事件才判得出"这一下拦没拦"。
 *
 * @vitest-environment jsdom
 */

import type { Service } from '@xihan-ui/machine'
import type {
  FloatingPanelDimensionsChangeDetails,
  FloatingPanelOpenChangeDetails,
  FloatingPanelPositionChangeDetails,
  FloatingPanelResizeEdge,
  FloatingPanelSchema,
  FloatingPanelWindowStateChangeDetails,
} from '../src/floating-panel'
import { normalizeProps } from '@xihan-ui/kernel'
import { createService } from '@xihan-ui/machine'
import { createVanillaRuntime } from '@xihan-ui/machine/vanilla'
import { afterEach, describe, expect, it } from 'vitest'
import {
  clampFloatingPanelSize,
  connectFloatingPanel,
  floatingPanelMachine,
  floatingPanelRectStyle,
  moveFloatingPanel,
  resizeFloatingPanel,
  sameFloatingPanelPosition,
  sameFloatingPanelSize,
} from '../src/floating-panel'

type Props = FloatingPanelSchema['props']
type Dict = Record<string, unknown>

interface Rig {
  service: Service<FloatingPanelSchema>
  setProps: (next: Partial<Props>) => void
  opens: FloatingPanelOpenChangeDetails[]
  positions: FloatingPanelPositionChangeDetails[]
  sizes: FloatingPanelDimensionsChangeDetails[]
  windowStates: FloatingPanelWindowStateChangeDetails[]
}

/** props 对象身份固定、字段可改：受控用例要在机器活着的时候从外面写回。 */
function makeRig(initial: Props = {}): Rig {
  const opens: FloatingPanelOpenChangeDetails[] = []
  const positions: FloatingPanelPositionChangeDetails[] = []
  const sizes: FloatingPanelDimensionsChangeDetails[] = []
  const windowStates: FloatingPanelWindowStateChangeDetails[] = []
  const props: Props = {
    ...initial,
    onOpenChange: d => opens.push(d),
    onPositionChange: d => positions.push(d),
    onDimensionsChange: d => sizes.push(d),
    onWindowStateChange: d => windowStates.push(d),
  }
  const runtime = createVanillaRuntime()
  const service = createService(floatingPanelMachine, { props: () => props, runtime })
  runtime.start()
  return {
    service,
    setProps: next => Object.assign(props, next),
    opens,
    positions,
    sizes,
    windowStates,
  }
}

const api = (service: Service<FloatingPanelSchema>) => connectFloatingPanel(service, normalizeProps)
const positionerProps = (service: Service<FloatingPanelSchema>) => api(service).getPositionerProps() as Dict
const contentProps = (service: Service<FloatingPanelSchema>) => api(service).getContentProps() as Dict
const dragProps = (service: Service<FloatingPanelSchema>) => api(service).getDragTriggerProps() as Dict
const bodyProps = (service: Service<FloatingPanelSchema>) => api(service).getBodyProps() as Dict
function resizeProps(service: Service<FloatingPanelSchema>, edge: FloatingPanelResizeEdge) {
  return api(service).getResizeTriggerProps({ edge }) as Dict
}

/**
 * 造一个真事件再派发，而不是传个字面量对象：
 * 合成事件默认 cancelable=false，在那种事件上 preventDefault 是空操作，
 * "认下的键要拦住"这条断言会永远为真。
 */
function keydown(key: string, init: KeyboardEventInit = {}): KeyboardEvent {
  return new KeyboardEvent('keydown', { key, cancelable: true, bubbles: true, ...init })
}

/** 直接调处理器并把事件还回来，由调用方看 defaultPrevented。 */
function press(props: Dict, key: string, init?: KeyboardEventInit): KeyboardEvent {
  const event = keydown(key, init)
  ;(props.onKeyDown as (e: KeyboardEvent) => void)(event)
  return event
}

function pointerDown(props: Dict, clientX: number, clientY: number): void {
  ;(props.onPointerDown as (e: PointerEvent) => void)(
    new PointerEvent('pointerdown', { clientX, clientY, button: 0, bubbles: true, cancelable: true }),
  )
}

/**
 * 把处理器挂到真节点上再派事件：指针按下会 preventDefault，
 * 而"焦点补没补回来"只有事件真的从某个元素上派出去才判得出（currentTarget 得有值）。
 */
function pointerDownOn(props: Dict, el: HTMLElement, clientX: number, clientY: number): void {
  document.body.appendChild(el)
  el.addEventListener('pointerdown', props.onPointerDown as EventListener)
  el.dispatchEvent(new PointerEvent('pointerdown', { clientX, clientY, button: 0, bubbles: true, cancelable: true }))
}

function movePointer(clientX: number, clientY: number): void {
  document.dispatchEvent(new PointerEvent('pointermove', { clientX, clientY, bubbles: true }))
}

function releasePointer(): void {
  document.dispatchEvent(new PointerEvent('pointerup', { bubbles: true }))
}

afterEach(() => {
  document.body.innerHTML = ''
})

// ══ 纯函数：矩形算术 ══

describe('floating-panel 尺寸夹取', () => {
  it('没给下限时用内建的 160×120，负数与 NaN 一并收住', () => {
    expect(clampFloatingPanelSize({ width: 10, height: 10 })).toEqual({ width: 160, height: 120 })
    expect(clampFloatingPanelSize({ width: Number.NaN, height: 300 })).toEqual({ width: 160, height: 300 })
  })

  it('上限比下限还小时以下限为准，不产生上下颠倒的区间', () => {
    // 颠倒的区间会让每次夹取给出第三个数，面板在两个端点之间来回弹
    const min = { width: 200, height: 200 }
    const max = { width: 100, height: 100 }
    expect(clampFloatingPanelSize({ width: 500, height: 500 }, min, max)).toEqual(min)
  })

  it('不给上限即不封顶', () => {
    expect(clampFloatingPanelSize({ width: 5000, height: 4000 })).toEqual({ width: 5000, height: 4000 })
  })
})

describe('resizeFloatingPanel 推边', () => {
  const position = { x: 100, y: 100 }
  const size = { width: 300, height: 200 }

  it('东边与南边只改尺寸，起点不动', () => {
    expect(resizeFloatingPanel(position, size, 'se', 50, 30)).toEqual({
      position: { x: 100, y: 100 },
      size: { width: 350, height: 230 },
    })
  })

  it('西边与北边同时改起点：那两条边动的是矩形的起点', () => {
    expect(resizeFloatingPanel(position, size, 'nw', 40, 20)).toEqual({
      position: { x: 140, y: 120 },
      size: { width: 260, height: 180 },
    })
  })

  it('顶到下限之后起点不再漂：夹过尺寸才回算位置', () => {
    // 往右推 1000px，宽度早已顶死在 160，起点只该走 300-160=140
    expect(resizeFloatingPanel(position, size, 'w', 1000, 0)).toEqual({
      position: { x: 240, y: 100 },
      size: { width: 160, height: 200 },
    })
  })

  it('单边把手不碰另一根轴', () => {
    expect(resizeFloatingPanel(position, size, 'e', 20, 999).size).toEqual({ width: 320, height: 200 })
    expect(resizeFloatingPanel(position, size, 's', 999, 20).size).toEqual({ width: 300, height: 220 })
  })
})

describe('floatingPanelRectStyle', () => {
  const position = { x: 12, y: 34 }
  const size = { width: 300, height: 200 }

  it('常规形态四个键都是像素值', () => {
    expect(floatingPanelRectStyle('default', position, size)).toEqual({
      position: 'fixed',
      left: '12px',
      top: '34px',
      width: '300px',
      height: '200px',
    })
  })

  it('收拢时高度交给标题栏撑，铺满时贴满视口', () => {
    expect(floatingPanelRectStyle('minimized', position, size).height).toBe('auto')
    expect(floatingPanelRectStyle('maximized', position, size)).toEqual({
      position: 'fixed',
      left: '0px',
      top: '0px',
      width: '100%',
      height: '100%',
    })
  })

  it('三种形态写出的键完全一样：少一个键上一帧的值会留在节点上', () => {
    const keys = (windowState: 'default' | 'maximized' | 'minimized') =>
      Object.keys(floatingPanelRectStyle(windowState, position, size)).sort()
    expect(keys('minimized')).toEqual(keys('default'))
    expect(keys('maximized')).toEqual(keys('default'))
  })
})

describe('值比较', () => {
  it('按内容比而不是按引用比，否则每帧都判成变了', () => {
    expect(sameFloatingPanelPosition({ x: 1, y: 2 }, { x: 1, y: 2 })).toBe(true)
    expect(sameFloatingPanelPosition({ x: 1, y: 2 }, undefined)).toBe(false)
    expect(sameFloatingPanelSize({ width: 1, height: 2 }, { width: 1, height: 3 })).toBe(false)
  })

  it('moveFloatingPanel 只做加法，非有限值收成 0', () => {
    expect(moveFloatingPanel({ x: 10, y: 10 }, 5, -5)).toEqual({ x: 15, y: 5 })
    expect(moveFloatingPanel({ x: Number.NaN, y: 10 }, 5, 0)).toEqual({ x: 5, y: 10 })
  })
})

// ══ 机器：开合 ══

describe('floatingPanelMachine 开合', () => {
  it('非受控：点触发器自己开合并一并通知', () => {
    const { service, opens } = makeRig()
    expect(service.state.get()).toBe('closed')
    ;((api(service).getTriggerProps() as Dict).onClick as () => void)()
    expect(service.state.matches('open')).toBe(true)
    expect(opens).toEqual([{ open: true }])
  })

  it('受控：只发意图不自改，宿主写回后才跳转', () => {
    // open 编在 FSM 状态里，回写靠 watch，因此宿主那一侧要用真信号承载 props
    const runtime = createVanillaRuntime()
    const open = runtime.signal(false)
    const seen: boolean[] = []
    const service = createService(floatingPanelMachine, {
      props: () => ({ open: open.get(), onOpenChange: (d: { open: boolean }) => seen.push(d.open) }),
      runtime,
    })
    runtime.start()

    ;((connectFloatingPanel(service, normalizeProps).getTriggerProps() as Dict).onClick as () => void)()
    expect(service.state.get()).toBe('closed')
    expect(seen).toEqual([true])

    // 宿主写回 → watch 派发影子事件 → 状态跟上，且不再重复通知
    open.set(true)
    expect(service.state.matches('open')).toBe(true)
    expect(seen).toEqual([true])
  })

  it('esc 在 content 上关闭，且拦下这一键', () => {
    const rig = makeRig({ defaultOpen: true })
    const event = press(contentProps(rig.service), 'Escape')
    expect(event.defaultPrevented).toBe(true)
    expect(rig.service.state.get()).toBe('closed')
    expect(rig.opens).toEqual([{ open: false }])
  })

  it('带 Ctrl 的 Esc 不接：那是浏览器与读屏的组合', () => {
    const rig = makeRig({ defaultOpen: true })
    const event = press(contentProps(rig.service), 'Escape', { ctrlKey: true })
    expect(event.defaultPrevented).toBe(false)
    expect(rig.service.state.matches('open')).toBe(true)
  })

  it('收起时 positioner 带 hidden，展开后撤掉', () => {
    const rig = makeRig()
    expect(positionerProps(rig.service).hidden).toBe(true)
    rig.service.send({ type: 'OPEN' })
    expect(positionerProps(rig.service).hidden).toBeUndefined()
  })
})

// ══ 机器：形态 ══

describe('floatingPanelMachine 形态', () => {
  it('形态按钮再按一次回到常规：不然收拢着的面板没有出口', () => {
    const rig = makeRig({ defaultOpen: true })
    const click = (windowState: 'maximized' | 'minimized') =>
      ((api(rig.service).getWindowStateTriggerProps({ windowState }) as Dict).onClick as () => void)()

    click('minimized')
    expect(rig.service.context.get('windowState')).toBe('minimized')
    click('minimized')
    expect(rig.service.context.get('windowState')).toBe('default')
    expect(rig.windowStates).toEqual([{ windowState: 'minimized' }, { windowState: 'default' }])
  })

  it('收拢时正文带 hidden：只压高度的话读屏与 Tab 照样进得去', () => {
    const rig = makeRig({ defaultOpen: true, defaultWindowState: 'minimized' })
    expect(bodyProps(rig.service).hidden).toBe(true)
    rig.service.send({ type: 'WINDOW_STATE.SET', windowState: 'default' })
    expect(bodyProps(rig.service).hidden).toBeUndefined()
  })

  it('铺满时搬不动、收拢时改不了尺寸', () => {
    const maximized = makeRig({ defaultOpen: true, defaultWindowState: 'maximized' })
    expect(api(maximized.service).canDrag).toBe(false)
    expect(dragProps(maximized.service)['aria-disabled']).toBe('true')

    const minimized = makeRig({ defaultOpen: true, defaultWindowState: 'minimized' })
    expect(api(minimized.service).canResize).toBe(false)
    expect(resizeProps(minimized.service, 'se')['aria-disabled']).toBe('true')
  })

  it('受控形态：只发意图不自改', () => {
    const rig = makeRig({ defaultOpen: true, windowState: 'default' })
    ;((api(rig.service).getWindowStateTriggerProps({ windowState: 'maximized' }) as Dict).onClick as () => void)()
    expect(rig.service.context.get('windowState')).toBe('default')
    expect(rig.windowStates).toEqual([{ windowState: 'maximized' }])
  })
})

// ══ connect：ARIA 与身份 ══

describe('connectFloatingPanel ARIA', () => {
  it('面板是非模态 dialog，名字挂在标题上', () => {
    const rig = makeRig({ defaultOpen: true })
    const content = contentProps(rig.service)
    const title = api(rig.service).getTitleProps() as Dict
    expect(content.role).toBe('dialog')
    expect(content['aria-modal']).toBe('false')
    expect(content['aria-labelledby']).toBe(title.id)
    expect(content.tabindex).toBe(-1)
  })

  it('触发器报出展开态并指向面板', () => {
    const rig = makeRig()
    const trigger = api(rig.service).getTriggerProps() as Dict
    expect(trigger.type).toBe('button')
    expect(trigger['aria-expanded']).toBe('false')
    expect(trigger['aria-controls']).toBe((contentProps(rig.service)).id)
  })

  it('把手推不动时只报 aria-disabled，不上原生 disabled', () => {
    const rig = makeRig({ defaultOpen: true, disabled: true })
    const drag = dragProps(rig.service)
    expect(drag['aria-disabled']).toBe('true')
    expect(drag.disabled).toBeUndefined()
    expect(drag['data-disabled']).toBe('')
  })

  it('改尺把手自报守的是哪条边，可及名带方位', () => {
    const rig = makeRig({ defaultOpen: true })
    const props = resizeProps(rig.service, 'nw')
    expect(props['data-edge']).toBe('nw')
    expect(props['aria-label']).toBe('Resize top left corner')
  })

  it('改尺把手是分隔条：报的那根轴与 aria-orientation 对应，且恒留在 Tab 序列里', () => {
    const rig = makeRig({
      defaultOpen: true,
      defaultDimensions: { width: 300, height: 200 },
      minSize: { width: 200, height: 150 },
      maxSize: { width: 600, height: 400 },
    })
    const east = resizeProps(rig.service, 'e')
    expect(east.role).toBe('separator')
    expect(east['aria-orientation']).toBe('vertical')
    expect(east['aria-valuenow']).toBe('300')
    expect(east['aria-valuemin']).toBe('200')
    expect(east['aria-valuemax']).toBe('600')
    expect(east.tabindex).toBe(0)
    // 按钮的激活语义在这里没有落点，因此它不是按钮
    expect(east.type).toBeUndefined()

    const north = resizeProps(rig.service, 'n')
    expect(north['aria-orientation']).toBe('horizontal')
    expect(north['aria-valuenow']).toBe('200')
    expect(north['aria-valuemin']).toBe('150')

    // 角上的把手两根轴都推，取宽度那一根报值
    expect(resizeProps(rig.service, 'se')['aria-orientation']).toBe('vertical')
  })

  it('不给上限时 aria-valuemax 缺席，宽高改由 aria-valuetext 念出来', () => {
    const rig = makeRig({ defaultOpen: true, defaultDimensions: { width: 300, height: 200 } })
    const props = resizeProps(rig.service, 'se')
    expect(props['aria-valuemax']).toBeUndefined()
    expect(props['aria-valuetext']).toBe('Width 300, height 200')
  })

  it('禁用时把手仍留在 Tab 序列里：抽掉 Tab 位读屏就读不到"这里本来能改尺寸"', () => {
    const rig = makeRig({ defaultOpen: true, disabled: true })
    const props = resizeProps(rig.service, 'e')
    expect(props.tabindex).toBe(0)
    expect(props['aria-disabled']).toBe('true')
    expect(props.disabled).toBeUndefined()
  })

  it('文案可整条替换', () => {
    const rig = makeRig({
      defaultOpen: true,
      defaultDimensions: { width: 300, height: 200 },
      translations: {
        dragTrigger: '移动面板',
        resizeTrigger: edge => `调整${edge}`,
        resizeValueText: size => `宽 ${size.width}、高 ${size.height}`,
        close: '关闭',
      },
    })
    expect(dragProps(rig.service)['aria-label']).toBe('移动面板')
    expect(resizeProps(rig.service, 'e')['aria-label']).toBe('调整e')
    expect(resizeProps(rig.service, 'e')['aria-valuetext']).toBe('宽 300、高 200')
    expect((api(rig.service).getCloseTriggerProps() as Dict)['aria-label']).toBe('关闭')
    // 没覆盖的那条仍走内建英文
    expect((api(rig.service).getWindowStateTriggerProps({ windowState: 'minimized' }) as Dict)['aria-label'])
      .toBe('Minimize panel')
  })
})

// ══ 键盘：平移与推边 ══

describe('connectFloatingPanel 键盘', () => {
  it('拖拽把手上方向键平移 10px，Shift 走 50px', () => {
    const rig = makeRig({ defaultOpen: true, defaultPosition: { x: 100, y: 100 } })
    expect(press(dragProps(rig.service), 'ArrowRight').defaultPrevented).toBe(true)
    expect(rig.service.context.get('position')).toEqual({ x: 110, y: 100 })

    press(dragProps(rig.service), 'ArrowUp', { shiftKey: true })
    expect(rig.service.context.get('position')).toEqual({ x: 110, y: 50 })
    expect(rig.positions.at(-1)).toEqual({ position: { x: 110, y: 50 } })
  })

  it('不归本组件管的键一律放行：把手不吞 Home', () => {
    const rig = makeRig({ defaultOpen: true })
    expect(press(dragProps(rig.service), 'Home').defaultPrevented).toBe(false)
  })

  it('拖拽把手的激活键把面板送回初始落点：被拖出视口后靠这一键收回来', () => {
    const rig = makeRig({ defaultOpen: true, defaultPosition: { x: 120, y: 90 } })
    press(dragProps(rig.service), 'ArrowRight', { shiftKey: true })
    expect(rig.service.context.get('position')).toEqual({ x: 170, y: 90 })

    expect(press(dragProps(rig.service), 'Enter').defaultPrevented).toBe(true)
    expect(rig.service.context.get('position')).toEqual({ x: 120, y: 90 })

    press(dragProps(rig.service), 'ArrowLeft')
    expect(press(dragProps(rig.service), ' ').defaultPrevented).toBe(true)
    expect(rig.service.context.get('position')).toEqual({ x: 120, y: 90 })
  })

  it('没给 defaultPosition 时送回内建落点 24,24', () => {
    const rig = makeRig({ defaultOpen: true })
    rig.service.send({ type: 'POSITION.SET', position: { x: 9000, y: 9000 } })
    press(dragProps(rig.service), 'Enter')
    expect(rig.service.context.get('position')).toEqual({ x: 24, y: 24 })
  })

  it('推不动时激活键也不接：与 aria-disabled 报的是同一件事', () => {
    const rig = makeRig({ defaultOpen: true, draggable: false, defaultPosition: { x: 10, y: 10 } })
    rig.service.send({ type: 'POSITION.SET', position: { x: 500, y: 500 } })
    expect(press(dragProps(rig.service), 'Enter').defaultPrevented).toBe(false)
    expect(rig.service.context.get('position')).toEqual({ x: 500, y: 500 })
  })

  it('上下把手放行左右键：吞掉的话页面就再也滚不动了', () => {
    const rig = makeRig({ defaultOpen: true, defaultDimensions: { width: 300, height: 200 } })
    const before = rig.service.context.get('dimensions')
    expect(press(resizeProps(rig.service, 'n'), 'ArrowRight').defaultPrevented).toBe(false)
    expect(rig.service.context.get('dimensions')).toEqual(before)
  })

  it('东边把手：右键长宽只长宽，左键缩回去', () => {
    const rig = makeRig({ defaultOpen: true, defaultDimensions: { width: 300, height: 200 } })
    expect(press(resizeProps(rig.service, 'e'), 'ArrowRight').defaultPrevented).toBe(true)
    expect(rig.service.context.get('dimensions')).toEqual({ width: 310, height: 200 })
    press(resizeProps(rig.service, 'e'), 'ArrowLeft', { shiftKey: true })
    expect(rig.service.context.get('dimensions')).toEqual({ width: 260, height: 200 })
  })

  it('西边把手推边时位置跟着走', () => {
    const rig = makeRig({
      defaultOpen: true,
      defaultPosition: { x: 100, y: 100 },
      defaultDimensions: { width: 300, height: 200 },
    })
    press(resizeProps(rig.service, 'w'), 'ArrowRight')
    expect(rig.service.context.get('position')).toEqual({ x: 110, y: 100 })
    expect(rig.service.context.get('dimensions')).toEqual({ width: 290, height: 200 })
  })

  it('禁用时按键不改任何值也不拦键', () => {
    const rig = makeRig({ defaultOpen: true, disabled: true, defaultPosition: { x: 10, y: 10 } })
    expect(press(dragProps(rig.service), 'ArrowRight').defaultPrevented).toBe(false)
    expect(rig.service.context.get('position')).toEqual({ x: 10, y: 10 })
    expect(rig.positions).toEqual([])
  })
})

// ══ 指针：跟手 ══

describe('connectFloatingPanel 指针拖动', () => {
  it('搬动：基准是按下那一刻的矩形，松手后不再跟手', () => {
    const rig = makeRig({ defaultOpen: true, defaultPosition: { x: 100, y: 100 } })
    pointerDown(dragProps(rig.service), 50, 50)
    expect(rig.service.state.matches('open.dragging')).toBe(true)

    movePointer(80, 70)
    expect(rig.service.context.get('position')).toEqual({ x: 130, y: 120 })
    // 再走一步仍从按下那一刻算起，不叠加上一帧
    movePointer(60, 60)
    expect(rig.service.context.get('position')).toEqual({ x: 110, y: 110 })

    releasePointer()
    expect(rig.service.state.get()).toBe('open.idle')
    movePointer(999, 999)
    expect(rig.service.context.get('position')).toEqual({ x: 110, y: 110 })
  })

  it('改尺：西北角把手顶到下限后位置停住', () => {
    const rig = makeRig({
      defaultOpen: true,
      defaultPosition: { x: 100, y: 100 },
      defaultDimensions: { width: 300, height: 200 },
      minSize: { width: 200, height: 150 },
    })
    pointerDown(resizeProps(rig.service, 'nw'), 0, 0)
    expect(rig.service.state.matches('open.resizing')).toBe(true)

    movePointer(500, 500)
    expect(rig.service.context.get('dimensions')).toEqual({ width: 200, height: 150 })
    expect(rig.service.context.get('position')).toEqual({ x: 200, y: 150 })
    releasePointer()
  })

  it('按下把手要把焦点补回来：preventDefault 连带取消了浏览器自带的聚焦', () => {
    const rig = makeRig({ defaultOpen: true })
    const handle = document.createElement('button')
    pointerDownOn(dragProps(rig.service), handle, 20, 20)
    // 焦点不落在把手上，手拖完之后方向键就接不上了
    expect(document.activeElement).toBe(handle)
    releasePointer()
  })

  it('改尺把手同理：按下即聚焦，随后方向键接着推', () => {
    const rig = makeRig({ defaultOpen: true })
    const handle = document.createElement('div')
    handle.tabIndex = 0
    pointerDownOn(resizeProps(rig.service, 'se'), handle, 20, 20)
    expect(document.activeElement).toBe(handle)
    releasePointer()
  })

  it('推不动的时候按下不进入拖动态', () => {
    const rig = makeRig({ defaultOpen: true, draggable: false })
    pointerDown(dragProps(rig.service), 10, 10)
    expect(rig.service.state.get()).toBe('open.idle')
  })

  it('改不了尺寸时按下同样不进入改尺态', () => {
    const rig = makeRig({ defaultOpen: true, resizable: false, defaultDimensions: { width: 300, height: 200 } })
    expect(resizeProps(rig.service, 'se')['aria-disabled']).toBe('true')
    pointerDown(resizeProps(rig.service, 'se'), 10, 10)
    expect(rig.service.state.get()).toBe('open.idle')
    movePointer(200, 200)
    expect(rig.service.context.get('dimensions')).toEqual({ width: 300, height: 200 })
  })

  it('pointercancel 与 pointerup 一样收场：不收会永远停在拖动态', () => {
    const rig = makeRig({ defaultOpen: true })
    pointerDown(dragProps(rig.service), 10, 10)
    document.dispatchEvent(new PointerEvent('pointercancel', { bubbles: true }))
    expect(rig.service.state.get()).toBe('open.idle')
  })
})

// ══ 受控的位置与尺寸 ══

describe('floatingPanelMachine 受控几何', () => {
  it('位置受控：拖动只发意图，DOM 上的值等宿主写回', () => {
    const rig = makeRig({ defaultOpen: true, position: { x: 0, y: 0 } })
    pointerDown(dragProps(rig.service), 0, 0)
    movePointer(40, 30)
    expect(rig.service.context.get('position')).toEqual({ x: 0, y: 0 })
    expect(rig.positions.at(-1)).toEqual({ position: { x: 40, y: 30 } })

    rig.setProps({ position: { x: 40, y: 30 } })
    expect(rig.service.context.get('position')).toEqual({ x: 40, y: 30 })
    releasePointer()
  })

  it('受控尺寸同样过一遍上下限：作者写进来的也不该小于 minSize', () => {
    const rig = makeRig({ defaultOpen: true, dimensions: { width: 10, height: 10 } })
    expect(rig.service.context.get('dimensions')).toEqual({ width: 160, height: 120 })
  })

  it('setDimensions 公开出口不得造出界面造不出的值', () => {
    const rig = makeRig({ defaultOpen: true, minSize: { width: 240, height: 180 } })
    api(rig.service).setDimensions({ width: 10, height: 10 })
    expect(rig.service.context.get('dimensions')).toEqual({ width: 240, height: 180 })
  })
})
