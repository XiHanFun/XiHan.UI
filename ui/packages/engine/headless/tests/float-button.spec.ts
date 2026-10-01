// @vitest-environment jsdom
import type { LayerRegistry, Service } from '@xihan-ui/core'
import type { FloatButtonApi, FloatButtonAppearance, FloatButtonSchema } from '../src/float-button'
import { createDismissLayer, createRuntimeConfig, createService, normalizeProps } from '@xihan-ui/core'
import { createVanillaRuntime } from '@xihan-ui/core/vanilla'
import { afterEach, describe, expect, it } from 'vitest'
import { connectFloatButton, floatButtonMachine, resolveFloatButtonOffset } from '../src/float-button'
import { floatButtonPlacementOf, resolveFloatButtonSnap } from '../src/float-button/float-button.geometry'

type Dict = Record<string, unknown>
type Props = Partial<FloatButtonSchema['props']>

describe('resolveFloatButtonOffset', () => {
  it('缺省 24，负数夹到 0，非有限数退回缺省', () => {
    expect(resolveFloatButtonOffset(undefined)).toBe(24)
    expect(resolveFloatButtonOffset(8)).toBe(8)
    // 负的贴边会把整组推出视口
    expect(resolveFloatButtonOffset(-8)).toBe(0)
    expect(resolveFloatButtonOffset(Number.NaN)).toBe(24)
  })
})

interface Rig {
  service: Service<FloatButtonSchema>
  registry: LayerRegistry
  rootEl: HTMLElement
  api: () => FloatButtonApi
  root: () => Dict
  trigger: () => Dict
  list: () => Dict
  setProps: (next: Props) => void
}

const stops: Array<() => void> = []
afterEach(() => {
  while (stops.length) stops.pop()!()
})

/** 悬浮按钮跑的是 collapsible 机器，落位与外形不入机器、直接进 connect。 */
function makeRig(initial: Props = {}, look: FloatButtonAppearance = {}): Rig {
  const runtime = createVanillaRuntime()
  const props = runtime.signal<Props>({ ...initial, expandTrigger: look.expandTrigger })
  const service = createService(floatButtonMachine, { props: () => props.get(), runtime })
  const rootEl = document.createElement('div')
  document.body.append(rootEl)
  const config = createRuntimeConfig({ scope: service.scope })
  service.refs.set('config', config)
  service.refs.set('registerLayer', layer => config.layerRegistry.register(layer))
  service.refs.set('getRootEl', () => rootEl)
  runtime.start()
  stops.push(() => {
    runtime.stop()
    rootEl.remove()
  })

  const api = (): FloatButtonApi => connectFloatButton(service, look, normalizeProps)
  return {
    service,
    registry: config.layerRegistry,
    rootEl,
    api,
    root: () => api().getRootProps() as Dict,
    trigger: () => api().getTriggerProps() as Dict,
    list: () => api().getListProps() as Dict,
    setProps: next => props.set({ ...props.get(), ...next }),
  }
}

async function armDismissLayer(): Promise<void> {
  await Promise.resolve()
  await Promise.resolve()
}

function pointerDown(target: Element): void {
  target.dispatchEvent(new Event('pointerdown', { bubbles: true, composed: true }) as PointerEvent)
}

function escape(target: EventTarget = document): void {
  target.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }))
}

describe('float-button 结构与缺省', () => {
  it('起点收起：list 带 hidden，触发器指向 list 并自带名字', () => {
    const rig = makeRig()
    expect(rig.root()['data-state']).toBe('closed')
    expect(rig.root()['data-placement']).toBe('bottom-end')
    // 贴边距离落进内联自定义属性，贴哪两条边由皮肤按 data-placement 决定
    expect(rig.root().style).toMatchObject({ '--xh-_float-button-offset': '24px' })

    expect(rig.trigger().type).toBe('button')
    expect(rig.trigger()['aria-expanded']).toBe('false')
    expect(rig.trigger()['aria-controls']).toBe(rig.list().id)
    expect(rig.trigger()['aria-label']).toBe('Actions')

    expect(rig.list().role).toBe('group')
    // 名字借触发器的，不另起一个
    expect(rig.list()['aria-labelledby']).toBe(rig.trigger().id)
    expect(rig.list().hidden).toBe(true)
  })

  it('落位与贴边如实落到壳上，list 也拿得到落位；没有 shape 位', () => {
    const rig = makeRig({}, { placement: 'top-start', offset: 8 })
    expect(rig.root()['data-placement']).toBe('top-start')
    expect(rig.root().style).toMatchObject({ '--xh-_float-button-offset': '8px' })
    expect(rig.root()['data-shape']).toBeUndefined()
    expect(rig.trigger()['data-shape']).toBeUndefined()
    expect(rig.list()['data-placement']).toBe('top-start')
  })

  it('translations 换掉读屏念出的名字', () => {
    const rig = makeRig({}, { translations: { trigger: '更多操作' } })
    expect(rig.trigger()['aria-label']).toBe('更多操作')
  })

  it('触发器接 Action Control floating 档：缺省 outline、md，data-variant 与 data-xh-action-variant 同源', () => {
    const rig = makeRig()
    const trigger = rig.trigger()
    expect(trigger['data-xh-action-control']).toBe('')
    expect(trigger['data-xh-action-profile']).toBe('floating')
    expect(trigger['data-xh-action-display']).toBe('always')
    expect(trigger['data-xh-action-size']).toBe('md')
    // 缺省中性：描边 + 磨砂面，不传 variant 时显式落 outline
    expect(trigger['data-xh-action-variant']).toBe('outline')
    expect(rig.root()['data-variant']).toBe('outline')
    expect(trigger['data-pressed']).toBeUndefined()

    const solid = makeRig({}, { variant: 'solid', size: 'lg' })
    expect(solid.root()['data-variant']).toBe('solid')
    expect(solid.trigger()['data-xh-action-variant']).toBe('solid')
    expect(solid.trigger()['data-xh-action-size']).toBe('lg')
  })
})

describe('float-button 按压通道：Space / Enter 与触屏按住投影 data-pressed', () => {
  const key = (name: string): KeyboardEvent => ({ key: name, repeat: false, isComposing: false, keyCode: 0 } as KeyboardEvent)
  const fire = (props: Dict, name: string, event: unknown): void => (props[name] as (e: unknown) => void)(event)

  it('静息不带 data-pressed；keydown 期间在场，keyup 撤下；触屏按下在场、抬起撤下；失焦撤下', () => {
    const rig = makeRig()
    expect(rig.trigger()['data-pressed']).toBeUndefined()
    fire(rig.trigger(), 'onKeyDown', key(' '))
    expect(rig.trigger()['data-pressed']).toBe('')
    fire(rig.trigger(), 'onKeyUp', key(' '))
    expect(rig.trigger()['data-pressed']).toBeUndefined()
    fire(rig.trigger(), 'onPointerDown', { pointerType: 'touch' })
    expect(rig.trigger()['data-pressed']).toBe('')
    fire(rig.trigger(), 'onPointerUp', {})
    expect(rig.trigger()['data-pressed']).toBeUndefined()
    fire(rig.trigger(), 'onKeyDown', key('Enter'))
    expect(rig.trigger()['data-pressed']).toBe('')
    fire(rig.trigger(), 'onBlur', {})
    expect(rig.trigger()['data-pressed']).toBeUndefined()
  })

  it('禁用时按住不进入按压面；按住途中被禁用即松开', () => {
    const off = makeRig({ disabled: true })
    fire(off.trigger(), 'onKeyDown', key(' '))
    expect(off.trigger()['data-pressed']).toBeUndefined()

    const rig = makeRig()
    fire(rig.trigger(), 'onKeyDown', key(' '))
    expect(rig.trigger()['data-pressed']).toBe('')
    rig.setProps({ disabled: true })
    expect(rig.trigger()['data-pressed']).toBeUndefined()
  })
})

describe('float-button 液态组的融回', () => {
  /** 替身液态组：split 的结局由用例决定。 */
  function stubGroup(rig: Rig, animated: boolean): { calls: boolean[], settle: () => void } {
    const calls: boolean[] = []
    let settle = (): void => {}
    rig.service.refs.set('liquidGroup', {
      items: () => [],
      goo: {
        active: animated,
        animated,
        split: (_items, open) => {
          calls.push(open)
          return new Promise((resolve) => {
            settle = () => resolve('rest')
          })
        },
        dispose: () => {},
      },
    })
    return { calls, settle: () => settle() }
  }

  it('液态组会播放时，收起先把展开组留着、挡在 Tab 序之外，融回落定才藏起来', async () => {
    const rig = makeRig({ defaultOpen: true })
    const group = stubGroup(rig, true)
    ;(rig.trigger().onClick as () => void)()
    expect(rig.api().open).toBe(false)
    expect(rig.list().hidden).toBeUndefined()
    expect(rig.list().inert).toBe(true)
    await Promise.resolve()
    expect(group.calls).toEqual([false])

    group.settle()
    await Promise.resolve()
    await Promise.resolve()
    expect(rig.list().hidden).toBe(true)
    expect(rig.list().inert).toBeUndefined()
  })

  it('融回途中又展开：展开组照常可交互，先前那次融回落定也不再把它藏起来', async () => {
    const rig = makeRig({ defaultOpen: true })
    const group = stubGroup(rig, true)
    ;(rig.trigger().onClick as () => void)()
    await Promise.resolve()
    ;(rig.trigger().onClick as () => void)()
    expect(rig.list().hidden).toBeUndefined()
    expect(rig.list().inert).toBeUndefined()
    group.settle()
    await Promise.resolve()
    await Promise.resolve()
    expect(rig.list().hidden).toBeUndefined()
  })

  it('液态组不播放（standard 档、减弱动效）时收起等条目的退场动画；没有可等的，宿主提交之后随即藏起来', async () => {
    const rig = makeRig({ defaultOpen: true })
    stubGroup(rig, false)
    ;(rig.trigger().onClick as () => void)()
    await Promise.resolve()
    await Promise.resolve()
    expect(rig.list().hidden).toBe(true)
    expect(rig.list().inert).toBeUndefined()
  })
})

describe('float-button 开合', () => {
  it('点触发器开合，两次都通知', () => {
    const seen: boolean[] = []
    const rig = makeRig({ onOpenChange: d => seen.push(d.open) })

    ;(rig.trigger().onClick as () => void)()
    expect(rig.api().open).toBe(true)
    expect(rig.list().hidden).toBeUndefined()

    ;(rig.trigger().onClick as () => void)()
    expect(rig.api().open).toBe(false)
    expect(seen).toEqual([true, false])
  })

  it('click 模式不接指针进出，hover 模式才接', () => {
    expect(makeRig().root().onPointerEnter).toBeUndefined()

    const hover = makeRig({}, { expandTrigger: 'hover' })
    ;(hover.root().onPointerEnter as () => void)()
    expect(hover.api().open).toBe(true)
    ;(hover.root().onPointerLeave as () => void)()
    expect(hover.api().open).toBe(false)
  })

  it('hover 模式下点一下照样开合：触摸与键盘只有这一条路', () => {
    const rig = makeRig({}, { expandTrigger: 'hover' })
    ;(rig.trigger().onClick as () => void)()
    expect(rig.api().open).toBe(true)
  })

  it('document 级 Escape 收起；焦点无需留在根内', async () => {
    const seen: boolean[] = []
    const rig = makeRig({ onOpenChange: d => seen.push(d.open) })

    escape()
    expect(seen).toEqual([])

    ;(rig.trigger().onClick as () => void)()
    await armDismissLayer()
    expect(rig.rootEl.style.getPropertyValue('--xh-_layer')).not.toBe('')
    const outside = document.createElement('button')
    document.body.append(outside)
    escape(outside)
    expect(rig.api().open).toBe(false)
    expect(seen).toEqual([true, false])
    expect(rig.rootEl.style.getPropertyValue('--xh-_layer')).toBe('')
    outside.remove()
  })

  it('click 展开后层外 pointerdown 收起，根内 pointerdown 不收起', async () => {
    const seen: boolean[] = []
    const rig = makeRig({ onOpenChange: d => seen.push(d.open) })
    const inside = document.createElement('button')
    rig.rootEl.append(inside)
    const outside = document.createElement('button')
    document.body.append(outside)

    ;(rig.trigger().onClick as () => void)()
    await armDismissLayer()
    pointerDown(inside)
    expect(rig.api().open).toBe(true)
    pointerDown(outside)
    expect(rig.api().open).toBe(false)
    expect(seen).toEqual([true, false])
    outside.remove()
  })

  it('后开的 Drawer/Popover 层先消解；通知反馈节点不成为可消解父层', async () => {
    const rig = makeRig()
    ;(rig.trigger().onClick as () => void)()
    await armDismissLayer()

    const overlay = document.createElement('div')
    document.body.append(overlay)
    const registration = rig.registry.register({
      kind: 'modal',
      node: () => overlay,
      branches: () => [],
      isModal: () => true,
      surfaces: () => [],
    })
    const dismiss = createDismissLayer({
      config: createRuntimeConfig({ scope: rig.service.scope, layerRegistry: rig.registry }),
      layer: registration.layer,
      onDismiss: () => {
        dismiss.dispose()
        registration.dispose()
      },
    })
    await armDismissLayer()

    escape()
    expect(rig.api().open).toBe(true)
    expect(rig.registry.top()).toBeDefined()
    escape()
    expect(rig.api().open).toBe(false)
    expect(rig.registry.list()).toHaveLength(0)

    ;(rig.trigger().onClick as () => void)()
    await armDismissLayer()
    const notice = document.createElement('div')
    notice.dataset.scope = 'notification'
    document.body.append(notice)
    expect(rig.registry.list()).toHaveLength(1)
    pointerDown(notice)
    expect(rig.api().open).toBe(false)
    expect(rig.registry.list()).toHaveLength(0)
    overlay.remove()
    notice.remove()
  })

  it('受控 open：点一下只发意图，父写回才展开', () => {
    const seen: boolean[] = []
    const rig = makeRig({ open: false, onOpenChange: d => seen.push(d.open) })

    ;(rig.trigger().onClick as () => void)()
    expect(rig.api().open).toBe(false)
    expect(seen).toEqual([true])

    rig.setProps({ open: true })
    expect(rig.api().open).toBe(true)
  })

  it('禁用：原生 disabled，点与悬停都不开', () => {
    const seen: boolean[] = []
    const rig = makeRig(
      { disabled: true, onOpenChange: d => seen.push(d.open) },
      { expandTrigger: 'hover' },
    )
    expect(rig.trigger().disabled).toBe(true)
    expect(rig.trigger()['data-disabled']).toBe('')

    ;(rig.trigger().onClick as () => void)()
    ;(rig.root().onPointerEnter as () => void)()
    expect(rig.api().open).toBe(false)
    expect(seen).toEqual([])
  })

  it('禁用释放逻辑层；受控 open 只发一次关闭意图，父未写回前仍保持展开 DOM', async () => {
    const seen: boolean[] = []
    const rig = makeRig({ open: true, disabled: false, onOpenChange: d => seen.push(d.open) })
    await armDismissLayer()
    expect(rig.registry.list()).toHaveLength(1)

    rig.setProps({ disabled: true })
    expect(rig.api().open).toBe(true)
    expect(rig.list().hidden).toBeUndefined()
    expect(seen).toEqual([false])
    expect(rig.registry.list()).toHaveLength(0)

    // 同一个 disabled 值反复进 props 不得重复派关闭意图。
    rig.setProps({ disabled: true })
    expect(seen).toEqual([false])

    rig.setProps({ open: false })
    expect(rig.api().open).toBe(false)
    // 条目的退场动画（这里没有可等的）播完才藏起
    await Promise.resolve()
    await Promise.resolve()
    expect(rig.list().hidden).toBe(true)
    expect(rig.registry.list()).toHaveLength(0)
  })

  it('hover 离开与紧随其后的层外交互只产生一次受控关闭意图，下一次 Escape 仍可重试', async () => {
    const seen: boolean[] = []
    const rig = makeRig(
      { open: true, onOpenChange: d => seen.push(d.open) },
      { expandTrigger: 'hover' },
    )
    await armDismissLayer()
    const outside = document.createElement('button')
    document.body.append(outside)

    ;(rig.root().onPointerLeave as () => void)()
    pointerDown(outside)
    expect(rig.api().open).toBe(true)
    expect(seen).toEqual([false])

    escape(outside)
    expect(rig.api().open).toBe(true)
    expect(seen).toEqual([false, false])
    outside.remove()
  })

  it('setOpen 与点一下走同一条路，方向一致时不重复发', () => {
    const seen: boolean[] = []
    const rig = makeRig({ onOpenChange: d => seen.push(d.open) })

    rig.api().setOpen(false)
    expect(seen).toEqual([])

    rig.api().setOpen(true)
    expect(rig.api().open).toBe(true)
    expect(seen).toEqual([true])
  })
})

describe('resolveFloatButtonSnap：松手后贴向哪里', () => {
  // 1000 × 800 的视口，48px 的触发器，四边各留 24
  const base = { size: 48, width: 1000, height: 800, gap: 24, rtl: false, velocity: { x: 0, y: 0 } }

  it('inline 按中心在左半还是右半贴左右边，沿边那条轴停在放手处；比例按触发器中心量', () => {
    const left = resolveFloatButtonSnap({ ...base, snap: 'inline', at: { x: 300, y: 376 } })
    expect(left.target).toEqual({ x: 24, y: 376 })
    expect(left.position).toEqual({ edge: 'inline-start', ratio: 0.5 })
    const right = resolveFloatButtonSnap({ ...base, snap: 'inline', at: { x: 600, y: 576 } })
    expect(right.target).toEqual({ x: 928, y: 576 })
    expect(right.position).toEqual({ edge: 'inline-end', ratio: 0.75 })
  })

  it('RTL 下左边是行尾：贴边位置按书写方向命名，比例沿边仍从上往下', () => {
    const left = resolveFloatButtonSnap({ ...base, rtl: true, snap: 'inline', at: { x: 300, y: 376 } })
    expect(left.position).toEqual({ edge: 'inline-end', ratio: 0.5 })
  })

  it('甩一下贴到甩去的那一边：松手处在左半，向右的速度足够大就贴右边', () => {
    const flick = resolveFloatButtonSnap({ ...base, snap: 'inline', at: { x: 400, y: 376 }, velocity: { x: 2000, y: 0 } })
    expect(flick.position).toMatchObject({ edge: 'inline-end' })
  })

  it('block 贴上下边，比例沿行内轴量；RTL 下从行首（右边）量起', () => {
    const top = resolveFloatButtonSnap({ ...base, snap: 'block', at: { x: 226, y: 300 } })
    expect(top.target).toEqual({ x: 226, y: 24 })
    expect(top.position).toEqual({ edge: 'block-start', ratio: 0.25 })
    const bottom = resolveFloatButtonSnap({ ...base, rtl: true, snap: 'block', at: { x: 226, y: 500 } })
    expect(bottom.target).toEqual({ x: 226, y: 728 })
    expect(bottom.position).toEqual({ edge: 'block-end', ratio: 0.75 })
  })

  it('nearest 贴四条边里最近的那条', () => {
    expect(resolveFloatButtonSnap({ ...base, snap: 'nearest', at: { x: 476, y: 40 } }).position).toMatchObject({ edge: 'block-start' })
    expect(resolveFloatButtonSnap({ ...base, snap: 'nearest', at: { x: 940, y: 376 } }).position).toMatchObject({ edge: 'inline-end' })
  })

  it('none 停在放手处并提交像素坐标；越出视口的先收进四边各留 gap 的范围', () => {
    expect(resolveFloatButtonSnap({ ...base, snap: 'none', at: { x: 300, y: 200 } })).toEqual({ target: { x: 300, y: 200 }, position: { x: 300, y: 200 } })
    expect(resolveFloatButtonSnap({ ...base, snap: 'none', at: { x: -50, y: 900 } }).target).toEqual({ x: 24, y: 728 })
  })
})

describe('floatButtonPlacementOf：位置推出展开组朝哪长', () => {
  it('左右边按比例上下半分；上下边按比例行首行尾分；停在一点按视口上下半分，视口未知时朝下长', () => {
    expect(floatButtonPlacementOf({ edge: 'inline-end', ratio: 0.75 }, null)).toBe('bottom-end')
    expect(floatButtonPlacementOf({ edge: 'inline-start', ratio: 0.2 }, null)).toBe('top-start')
    expect(floatButtonPlacementOf({ edge: 'block-start', ratio: 0.8 }, null)).toBe('top-end')
    expect(floatButtonPlacementOf({ edge: 'block-end', ratio: 0.1 }, null)).toBe('bottom-start')
    expect(floatButtonPlacementOf({ x: 10, y: 500 }, 800)).toBe('bottom-start')
    expect(floatButtonPlacementOf({ x: 10, y: 500 }, null)).toBe('top-start')
  })
})

describe('float-button 位置投影', () => {
  it('不给位置停在 placement 那一角；defaultPosition 贴边时投影贴哪条边与比例，展开组朝页面中间长', () => {
    expect(makeRig().root()['data-edge']).toBeUndefined()
    const rig = makeRig({ defaultPosition: { edge: 'inline-end', ratio: 0.75 } }, { placement: 'top-start' })
    expect(rig.root()['data-edge']).toBe('inline-end')
    expect(rig.root()['data-placement']).toBe('bottom-end')
    expect(rig.list()['data-placement']).toBe('bottom-end')
    expect(rig.root().style).toMatchObject({ '--xh-_float-button-ratio': '0.75' })
    expect(rig.api().position).toEqual({ edge: 'inline-end', ratio: 0.75 })
  })

  it('比例夹到 0 到 1', () => {
    const rig = makeRig({ defaultPosition: { edge: 'inline-start', ratio: 3 } })
    expect(rig.root().style).toMatchObject({ '--xh-_float-button-ratio': '1' })
  })

  it('停在一点：投影 data-point 与坐标；量到视口高度后按上下半定朝向', () => {
    const rig = makeRig({ defaultPosition: { x: 40, y: 500 } })
    expect(rig.root()['data-point']).toBe('')
    expect(rig.root().style).toMatchObject({ '--xh-_float-button-x': '40px' })
    expect(rig.root().style).toMatchObject({ '--xh-_float-button-y': '500px' })
    rig.service.send({ type: 'VIEWPORT.RESIZE', height: 800 })
    expect(rig.root()['data-placement']).toBe('bottom-start')
  })

  it('受控 position：setPosition 只发意图，宿主写回才换位置', () => {
    const seen: unknown[] = []
    const rig = makeRig({ position: { edge: 'inline-end', ratio: 0.5 }, onPositionChange: d => seen.push(d.position) })
    rig.api().setPosition({ edge: 'inline-start', ratio: 0.5 })
    expect(seen).toEqual([{ edge: 'inline-start', ratio: 0.5 }])
    expect(rig.root()['data-edge']).toBe('inline-end')
    rig.setProps({ position: { edge: 'inline-start', ratio: 0.5 } })
    expect(rig.root()['data-edge']).toBe('inline-start')
  })
})

describe('float-button 拖动', () => {
  /** 视口 1000 × 800；触发器 48px 停在右下角（928, 728）。减弱动效下弹簧直接落到终点。 */
  function dragRig(initial: Props = {}): Rig {
    const rig = makeRig({ draggable: true, ...initial })
    rig.rootEl.dataset.motion = 'reduce'
    const trigger = document.createElement('button')
    trigger.id = String(rig.trigger().id)
    trigger.getBoundingClientRect = () => ({ left: 928, top: 728, width: 48, height: 48, right: 976, bottom: 776, x: 928, y: 728, toJSON: () => ({}) })
    rig.rootEl.append(trigger)
    Object.defineProperty(document.documentElement, 'clientWidth', { configurable: true, value: 1000 })
    Object.defineProperty(document.documentElement, 'clientHeight', { configurable: true, value: 800 })
    stops.push(() => {
      delete (document.documentElement as unknown as Record<string, unknown>).clientWidth
      delete (document.documentElement as unknown as Record<string, unknown>).clientHeight
    })
    return rig
  }

  function down(rig: Rig): void {
    ;(rig.trigger().onPointerDown as (e: PointerEvent) => void)({ button: 0, pointerId: 1, clientX: 950, clientY: 750, pointerType: 'mouse' } as PointerEvent)
  }

  it('按下移动过激活距离才跟手：投影 data-moving / data-dragging 与跟手坐标，起拖时展开着就收起', () => {
    const rig = dragRig({ defaultOpen: true })
    down(rig)
    rig.service.send({ type: 'DRAG.MOVE', clientX: 952, clientY: 751 })
    expect(rig.root()['data-moving']).toBeUndefined()
    expect(rig.api().open).toBe(true)
    rig.service.send({ type: 'DRAG.MOVE', clientX: 600, clientY: 300 })
    expect(rig.root()['data-moving']).toBe('')
    expect(rig.root()['data-dragging']).toBe('')
    expect(rig.root().style).toMatchObject({ '--xh-_float-button-x': '578px' })
    expect(rig.root().style).toMatchObject({ '--xh-_float-button-y': '278px' })
    expect(rig.api().open).toBe(false)
  })

  it('跟手的坐标夹在视口里，四边各留 offset', () => {
    const rig = dragRig()
    down(rig)
    rig.service.send({ type: 'DRAG.MOVE', clientX: -500, clientY: 2000 })
    expect(rig.root().style).toMatchObject({ '--xh-_float-button-x': '24px' })
    expect(rig.root().style).toMatchObject({ '--xh-_float-button-y': '728px' })
  })

  it('松手按 snap 贴边、落定才提交并通知一次；随后浏览器补派的 click 不开合，再点一下照常开合', async () => {
    const seen: unknown[] = []
    const rig = dragRig({ onPositionChange: d => seen.push(d.position) })
    down(rig)
    rig.service.send({ type: 'DRAG.MOVE', clientX: 300, clientY: 398 })
    rig.service.send({ type: 'DRAG.END', velocityX: 0, velocityY: 0, canceled: false })
    await Promise.resolve()
    await Promise.resolve()
    expect(seen).toEqual([{ edge: 'inline-start', ratio: 0.5 }])
    expect(rig.root()['data-edge']).toBe('inline-start')
    expect(rig.root()['data-moving']).toBeUndefined()
    expect(rig.root()['data-dragging']).toBeUndefined()
    ;(rig.trigger().onClick as () => void)()
    expect(rig.api().open).toBe(false)
    ;(rig.trigger().onClick as () => void)()
    expect(rig.api().open).toBe(true)
  })

  it('没移动过激活距离就松手是一次点按：不提交位置，click 照常开合', async () => {
    const seen: unknown[] = []
    const rig = dragRig({ onPositionChange: d => seen.push(d.position) })
    down(rig)
    rig.service.send({ type: 'DRAG.MOVE', clientX: 951, clientY: 751 })
    rig.service.send({ type: 'DRAG.END', velocityX: 0, velocityY: 0, canceled: false })
    await Promise.resolve()
    expect(seen).toEqual([])
    ;(rig.trigger().onClick as () => void)()
    expect(rig.api().open).toBe(true)
  })

  it('snap 为 none 时停在放手处，提交像素坐标', async () => {
    const seen: unknown[] = []
    const rig = dragRig({ snap: 'none', onPositionChange: d => seen.push(d.position) })
    down(rig)
    rig.service.send({ type: 'DRAG.MOVE', clientX: 500, clientY: 300 })
    rig.service.send({ type: 'DRAG.END', velocityX: 0, velocityY: 0, canceled: false })
    await Promise.resolve()
    expect(seen).toEqual([{ x: 478, y: 278 }])
    expect(rig.root()['data-point']).toBe('')
  })

  it('不写 draggable 或禁用时按下不起拖', () => {
    const rig = dragRig({ draggable: false })
    down(rig)
    rig.service.send({ type: 'DRAG.MOVE', clientX: 300, clientY: 300 })
    expect(rig.root()['data-moving']).toBeUndefined()
    const disabled = dragRig({ disabled: true })
    down(disabled)
    disabled.service.send({ type: 'DRAG.MOVE', clientX: 300, clientY: 300 })
    expect(disabled.root()['data-moving']).toBeUndefined()
    expect(disabled.root()['data-draggable']).toBeUndefined()
  })
})
