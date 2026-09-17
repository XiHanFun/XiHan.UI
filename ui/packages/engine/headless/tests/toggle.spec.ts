import type { TogglePressedChangeDetails, ToggleSchema } from '../src/toggle'
import { createService, normalizeProps } from '@xihan-ui/core'
import { createVanillaRuntime } from '@xihan-ui/core/vanilla'
import { describe, expect, it } from 'vitest'
import { connectToggle, toggleMachine } from '../src/toggle'

type Props = ToggleSchema['props']

interface Handlers {
  onClick: () => void
  onKeyDown: (e: KeyboardEvent) => void
  onKeyUp: (e: KeyboardEvent) => void
  onBlur: () => void
  onPointerDown: (e: PointerEvent) => void
  onPointerUp: () => void
  onPointerCancel: () => void
}

function makeToggle(initial: Props = {}) {
  const changes: TogglePressedChangeDetails[] = []
  const runtime = createVanillaRuntime()
  const props = runtime.signal<Props>({ ...initial, onPressedChange: d => changes.push(d) })
  const service = createService(toggleMachine, { props: () => props.get(), runtime })
  runtime.start()
  return {
    service,
    changes,
    state: () => service.state.get(),
    root: () => connectToggle(service, normalizeProps).getRootProps() as Record<string, unknown>,
    handlers: () => connectToggle(service, normalizeProps).getRootProps() as unknown as Handlers,
    setProps: (next: Props) => props.set({ ...props.get(), ...next }),
  }
}

/** 键盘桩：只带跟踪器会读的三个字段。 */
function key(name: string, init: Partial<KeyboardEvent> = {}): KeyboardEvent {
  return { key: name, repeat: false, isComposing: false, keyCode: 0, ...init } as KeyboardEvent
}

describe('toggleMachine 开关', () => {
  it('缺省 off；defaultPressed 起步 on；点击翻转并通知', () => {
    expect(makeToggle().state()).toBe('off')
    const t = makeToggle({ defaultPressed: true })
    expect(t.state()).toBe('on')
    expect(t.root()['aria-pressed']).toBe('true')
    t.handlers().onClick()
    expect(t.state()).toBe('off')
    expect(t.changes).toEqual([{ pressed: false }])
  })

  it('受控：点击只发意图不自改，宿主写回后才变', () => {
    const t = makeToggle({ pressed: false })
    t.handlers().onClick()
    expect(t.state()).toBe('off')
    expect(t.changes).toEqual([{ pressed: true }])
    t.setProps({ pressed: true })
    expect(t.state()).toBe('on')
  })
})

describe('形态矩阵投影：data-xh-action-variant 由 variant × 开关态派生', () => {
  it('缺省不传 variant：data-variant 与 data-xh-action-variant 都落 subtle，按下不变', () => {
    const t = makeToggle()
    expect(t.root()['data-variant']).toBe('subtle')
    expect(t.root()['data-xh-action-variant']).toBe('subtle')
    t.handlers().onClick()
    expect(t.root()['data-state']).toBe('on')
    expect(t.root()['data-xh-action-variant']).toBe('subtle')
  })

  it('solid 未按下投 ghost（透明底），按下才投 solid（品牌实心）；data-variant 始终是 solid', () => {
    const t = makeToggle({ variant: 'solid' })
    expect(t.root()['data-variant']).toBe('solid')
    expect(t.root()['data-xh-action-variant']).toBe('ghost')
    t.handlers().onClick()
    expect(t.root()['data-state']).toBe('on')
    expect(t.root()['data-xh-action-variant']).toBe('solid')
    expect(t.root()['data-variant']).toBe('solid')
  })

  it.each(['outline', 'ghost'] as const)('variant=%s 原样投影，按下后仍是同一档（选中面由皮肤按 data-state 桥接）', (variant) => {
    const t = makeToggle({ variant })
    expect(t.root()['data-xh-action-variant']).toBe(variant)
    t.handlers().onClick()
    expect(t.root()['data-xh-action-variant']).toBe(variant)
  })
})

describe('按压通道：与开关态无关的瞬态按压面', () => {
  it('keydown Space 期间 data-pressed 在场，keyup 撤下；aria-pressed 不受影响', () => {
    const t = makeToggle()
    expect(t.root()['data-pressed']).toBeUndefined()
    t.handlers().onKeyDown(key(' '))
    expect(t.root()['data-pressed']).toBe('')
    expect(t.root()['aria-pressed']).toBe('false')
    t.handlers().onKeyUp(key(' '))
    expect(t.root()['data-pressed']).toBeUndefined()
  })

  it('已按下（on）的开关同样投影按住面：selected + pressed 叠加由皮肤派生', () => {
    const t = makeToggle({ defaultPressed: true })
    t.handlers().onKeyDown(key('Enter'))
    expect(t.root()).toMatchObject({ 'aria-pressed': 'true', 'data-state': 'on', 'data-pressed': '' })
    t.handlers().onBlur()
    expect(t.root()['data-pressed']).toBeUndefined()
    expect(t.root()['data-state']).toBe('on')
  })

  it('触屏按下在场、抬起撤下', () => {
    const t = makeToggle()
    t.handlers().onPointerDown({ pointerType: 'touch' } as PointerEvent)
    expect(t.root()['data-pressed']).toBe('')
    t.handlers().onPointerUp()
    expect(t.root()['data-pressed']).toBeUndefined()
  })

  it('禁用时按住不进入按压面；按住途中被禁用即松开', () => {
    const disabled = makeToggle({ disabled: true })
    disabled.handlers().onKeyDown(key(' '))
    expect(disabled.root()['data-pressed']).toBeUndefined()

    const t = makeToggle()
    t.handlers().onKeyDown(key(' '))
    expect(t.root()['data-pressed']).toBe('')
    t.setProps({ disabled: true })
    expect(t.root()['data-pressed']).toBeUndefined()
  })
})
