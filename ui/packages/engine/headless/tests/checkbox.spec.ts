import type { CheckboxSchema } from '../src/checkbox'
import { createService, normalizeProps } from '@xihan-ui/core'
import { createVanillaRuntime } from '@xihan-ui/core/vanilla'
import { describe, expect, it } from 'vitest'
import { checkboxMachine, connectCheckbox } from '../src/checkbox'

type Props = CheckboxSchema['props']

interface Handlers {
  onClick: () => void
  onKeyDown: (e: KeyboardEvent) => void
  onKeyUp: (e: KeyboardEvent) => void
  onBlur: () => void
  onPointerDown: (e: PointerEvent) => void
  onPointerUp: () => void
  onPointerCancel: () => void
}

function makeCheckbox(initial: Props = {}) {
  const runtime = createVanillaRuntime()
  const props = runtime.signal<Props>({ ...initial })
  const service = createService(checkboxMachine, { props: () => props.get(), runtime })
  runtime.start()
  return {
    service,
    state: () => service.state.get(),
    root: () => connectCheckbox(service, normalizeProps).getRootProps() as Record<string, unknown>,
    handlers: () => connectCheckbox(service, normalizeProps).getRootProps() as unknown as Handlers,
    setProps: (next: Props) => props.set({ ...props.get(), ...next }),
    stop: () => runtime.stop(),
  }
}

/** 键盘桩：只带跟踪器会读的三个字段。 */
function key(name: string, init: Partial<KeyboardEvent> = {}): KeyboardEvent {
  return { key: name, repeat: false, isComposing: false, keyCode: 0, ...init } as KeyboardEvent
}

describe('connectCheckbox 按压通道', () => {
  it('机器收到 PRESS.START 后 root 投影 data-pressed，PRESS.END 撤下；勾选态不受影响', () => {
    const c = makeCheckbox()
    expect(c.root()['data-pressed']).toBeUndefined()
    c.service.send({ type: 'PRESS.START' })
    expect(c.root()['data-pressed']).toBe('')
    expect(c.root()['aria-checked']).toBe('false')
    c.service.send({ type: 'PRESS.END' })
    expect(c.root()['data-pressed']).toBeUndefined()
    c.stop()
  })

  it('键盘 Space 与 Enter 按住经跟踪器进出，长按重复键不重报，失焦即撤下', () => {
    const c = makeCheckbox()
    c.handlers().onKeyDown(key(' '))
    expect(c.root()['data-pressed']).toBe('')
    c.handlers().onKeyDown(key(' ', { repeat: true }))
    expect(c.root()['data-pressed']).toBe('')
    c.handlers().onKeyUp(key(' '))
    expect(c.root()['data-pressed']).toBeUndefined()
    c.handlers().onKeyDown(key('Enter'))
    expect(c.root()['data-pressed']).toBe('')
    c.handlers().onBlur()
    expect(c.root()['data-pressed']).toBeUndefined()
    c.stop()
  })

  it('按住途中勾选态翻转（Enter 在 keydown 那一刻 click）：按压面跨状态保住，直到 keyup', () => {
    const c = makeCheckbox({ defaultChecked: 'indeterminate' })
    c.handlers().onKeyDown(key('Enter'))
    c.handlers().onClick()
    expect(c.state()).toBe('on')
    expect(c.root()).toMatchObject({ 'aria-checked': 'true', 'data-state': 'checked', 'data-pressed': '' })
    c.handlers().onKeyUp(key('Enter'))
    expect(c.root()['data-pressed']).toBeUndefined()
    expect(c.root()['data-state']).toBe('checked')
    c.stop()
  })

  it('触屏按下在场，抬起或指针取消撤下；鼠标按下不走这一路', () => {
    const c = makeCheckbox()
    c.handlers().onPointerDown({ pointerType: 'mouse' } as PointerEvent)
    expect(c.root()['data-pressed']).toBeUndefined()
    c.handlers().onPointerDown({ pointerType: 'touch' } as PointerEvent)
    expect(c.root()['data-pressed']).toBe('')
    c.handlers().onPointerCancel()
    expect(c.root()['data-pressed']).toBeUndefined()
    c.handlers().onPointerDown({ pointerType: 'touch' } as PointerEvent)
    expect(c.root()['data-pressed']).toBe('')
    c.handlers().onPointerUp()
    expect(c.root()['data-pressed']).toBeUndefined()
    c.stop()
  })

  it('禁用与只读时按住不进入按压面', () => {
    const disabled = makeCheckbox({ disabled: true })
    disabled.handlers().onKeyDown(key(' '))
    expect(disabled.root()['data-pressed']).toBeUndefined()
    disabled.stop()

    const readOnly = makeCheckbox({ readOnly: true })
    readOnly.handlers().onPointerDown({ pointerType: 'touch' } as PointerEvent)
    expect(readOnly.root()['data-pressed']).toBeUndefined()
    readOnly.stop()
  })

  it('按住途中转入禁用或只读：不会再来 keyup，机器自己撤下', () => {
    const c = makeCheckbox()
    c.handlers().onKeyDown(key(' '))
    expect(c.root()['data-pressed']).toBe('')
    c.setProps({ disabled: true })
    expect(c.root()['data-pressed']).toBeUndefined()
    c.setProps({ disabled: false })
    c.handlers().onKeyDown(key(' '))
    expect(c.root()['data-pressed']).toBe('')
    c.setProps({ readOnly: true })
    expect(c.root()['data-pressed']).toBeUndefined()
    c.stop()
  })
})
