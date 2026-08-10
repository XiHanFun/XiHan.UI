// @vitest-environment jsdom
import type { Service } from '@xihan-ui/machine'
import type { CollapsibleSchema } from '../src/collapsible'
import type { FloatButtonApi, FloatButtonAppearance } from '../src/float-button'
import { normalizeProps } from '@xihan-ui/core'
import { createService } from '@xihan-ui/machine'
import { createVanillaRuntime } from '@xihan-ui/machine/vanilla'
import { afterEach, describe, expect, it } from 'vitest'
// 直接指向组件目录：包主入口的导出由接线一并补，测试不等它
import { collapsibleMachine } from '../src/collapsible'
import { connectFloatButton, resolveFloatButtonOffset } from '../src/float-button'

type Dict = Record<string, unknown>
type Props = Partial<CollapsibleSchema['props']>

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
  service: Service<CollapsibleSchema>
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
  const props = runtime.signal<Props>(initial)
  const service = createService(collapsibleMachine, { props: () => props.get(), runtime })
  runtime.start()
  stops.push(() => runtime.stop())

  const api = (): FloatButtonApi => connectFloatButton(service, look, normalizeProps)
  return {
    service,
    api,
    root: () => api().getRootProps() as Dict,
    trigger: () => api().getTriggerProps() as Dict,
    list: () => api().getListProps() as Dict,
    setProps: next => props.set({ ...props.get(), ...next }),
  }
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

  it('展开着按 Escape 收起；收起着按它什么也不发生', () => {
    const seen: boolean[] = []
    const rig = makeRig({ onOpenChange: d => seen.push(d.open) })
    const escape = (): void => {
      ;(rig.root().onKeydown as (e: KeyboardEvent) => void)(new KeyboardEvent('keydown', { key: 'Escape' }))
    }

    escape()
    expect(seen).toEqual([])

    ;(rig.trigger().onClick as () => void)()
    escape()
    expect(rig.api().open).toBe(false)
    expect(seen).toEqual([true, false])
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
