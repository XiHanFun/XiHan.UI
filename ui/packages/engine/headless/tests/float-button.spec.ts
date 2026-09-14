// @vitest-environment jsdom
import type { LayerRegistry, Service } from '@xihan-ui/core'
import type { FloatButtonApi, FloatButtonAppearance, FloatButtonSchema } from '../src/float-button'
import { createDismissLayer, createRuntimeConfig, createService, normalizeProps } from '@xihan-ui/core'
import { createVanillaRuntime } from '@xihan-ui/core/vanilla'
import { afterEach, describe, expect, it } from 'vitest'
import { connectFloatButton, floatButtonMachine, resolveFloatButtonOffset } from '../src/float-button'

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
    expect(rig.root()['data-shape']).toBe('circle')
    // 贴边距离落进内联自定义属性，贴哪两条边由皮肤按 data-placement 决定
    expect(rig.root().style).toBe('--xh-_float-button-offset: 24px')

    expect(rig.trigger().type).toBe('button')
    expect(rig.trigger()['aria-expanded']).toBe('false')
    expect(rig.trigger()['aria-controls']).toBe(rig.list().id)
    expect(rig.trigger()['aria-label']).toBe('Actions')

    expect(rig.list().role).toBe('group')
    // 名字借触发器的，不另起一个
    expect(rig.list()['aria-labelledby']).toBe(rig.trigger().id)
    expect(rig.list().hidden).toBe(true)
  })

  it('落位、外形与贴边如实落到壳上，list 也拿得到落位', () => {
    const rig = makeRig({}, { placement: 'top-start', shape: 'square', offset: 8 })
    expect(rig.root()['data-placement']).toBe('top-start')
    expect(rig.root()['data-shape']).toBe('square')
    expect(rig.root().style).toBe('--xh-_float-button-offset: 8px')
    expect(rig.trigger()['data-shape']).toBe('square')
    expect(rig.list()['data-placement']).toBe('top-start')
  })

  it('translations 换掉读屏念出的名字', () => {
    const rig = makeRig({}, { translations: { trigger: '更多操作' } })
    expect(rig.trigger()['aria-label']).toBe('更多操作')
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

  it('后开的 Drawer/Popover 层先消解；Toast 反馈节点不成为可消解父层', async () => {
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
    const toast = document.createElement('div')
    toast.dataset.scope = 'toast'
    document.body.append(toast)
    expect(rig.registry.list()).toHaveLength(1)
    pointerDown(toast)
    expect(rig.api().open).toBe(false)
    expect(rig.registry.list()).toHaveLength(0)
    overlay.remove()
    toast.remove()
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
