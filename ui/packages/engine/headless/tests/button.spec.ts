import type { ButtonSchema } from '../src'
import { createService, normalizeProps } from '@xihan-ui/core'
import { createVanillaRuntime } from '@xihan-ui/core/vanilla'
import { describe, expect, it, vi } from 'vitest'
import { buttonMachine, connectButton } from '../src'

type Props = ButtonSchema['props']

/** 桩事件要把 connect 真正会调的方法都备齐，缺一个就变成"实现一改就崩"而不是"行为一变就红"。 */
function fakeEvent(): { preventDefault: ReturnType<typeof vi.fn>, stopPropagation: ReturnType<typeof vi.fn>, stopImmediatePropagation: ReturnType<typeof vi.fn> } {
  return { preventDefault: vi.fn(), stopPropagation: vi.fn(), stopImmediatePropagation: vi.fn() }
}

function makeButton(initial: Props = {}) {
  const runtime = createVanillaRuntime()
  const props = runtime.signal<Props>(initial)
  const service = createService(buttonMachine, { props: () => props.get(), runtime })
  runtime.start()
  return {
    service,
    api: () => connectButton(service, normalizeProps),
    root: () => connectButton(service, normalizeProps).getRootProps() as Record<string, unknown>,
    setProps: (next: Props) => props.set({ ...props.get(), ...next }),
  }
}

/** 按 props 建一台机器并直接连接，给只看投影的用例用。 */
function connect(props: Props = {}) {
  return makeButton(props).api()
}

describe('connectButton', () => {
  it('实心档（缺省）是一块彩色面，投影 data-xh-ink-surface；其余形态不投影', () => {
    const root = (props: Props) => connect(props).getRootProps() as Record<string, unknown>
    expect(root({})['data-xh-ink-surface']).toBe('')
    expect(root({ variant: 'solid', tone: 'warning' })['data-xh-ink-surface']).toBe('')
    for (const variant of ['subtle', 'outline', 'ghost'] as const)
      expect(root({ variant })['data-xh-ink-surface'], variant).toBeUndefined()
  })

  it('getRootProps 带 anatomy 属性与类型', () => {
    const root = connect({ type: 'submit', variant: 'solid', size: 'md' }).getRootProps() as Record<string, unknown>
    expect(root['data-scope']).toBe('button')
    expect(root['data-part']).toBe('root')
    expect(root.type).toBe('submit')
    expect(root['data-xh-action-control']).toBe('')
    expect(root['data-xh-action-profile']).toBe('text')
    expect(root['data-xh-action-display']).toBe('always')
    expect(root['data-xh-action-size']).toBe('md')
    expect(root['data-xh-action-variant']).toBe('solid')
    expect(root['data-variant']).toBe('solid')
    expect(root['data-size']).toBe('md')
  })

  it('不传 variant 落 solid：只有 Button 缺省品牌实心，形态矩阵与 data-variant 同源', () => {
    const root = connect({}).getRootProps() as Record<string, unknown>
    expect(root['data-xh-action-variant']).toBe('solid')
    expect(root['data-variant']).toBe('solid')
  })

  it.each(['subtle', 'outline', 'ghost'] as const)('variant=%s 原样投影到 data-xh-action-variant 与 data-variant', (variant) => {
    const root = connect({ variant }).getRootProps() as Record<string, unknown>
    expect(root['data-xh-action-variant']).toBe(variant)
    expect(root['data-variant']).toBe(variant)
  })

  it('只投影 Action Control 的稳定 profile 与 size，不计算 CSS 数值', () => {
    const icon = connect({ iconOnly: true, size: 'lg', ariaLabel: '关闭' }).getRootProps() as Record<string, unknown>
    expect(icon['data-xh-action-profile']).toBe('icon')
    expect(icon['data-xh-action-size']).toBe('lg')
    expect(Object.keys(icon).includes('style')).toBe(false)
  })

  it('disabled 用原生 disabled（不加 aria-disabled）', () => {
    const root = connect({ disabled: true }).getRootProps() as Record<string, unknown>
    expect(root.disabled).toBe(true)
    expect(root['aria-disabled']).toBeUndefined()
    expect(root['data-disabled']).toBe('')
  })

  it('loading 用 aria-disabled（保留焦点）+ data-loading', () => {
    const api = connect({ loading: true })
    const root = api.getRootProps() as Record<string, unknown>
    expect(root.disabled).toBeUndefined()
    expect(root['aria-disabled']).toBe('true')
    expect(root['data-loading']).toBe('')
    expect(api.loading).toBe(true)
  })

  it('loading/disabled 时 onClick 拦截默认行为，并挡掉同节点上的后续处理器', () => {
    const root = connect({ loading: true }).getRootProps() as Record<string, unknown>
    const e = fakeEvent()
    ;(root.onClick as (e: unknown) => void)(e)
    expect(e.preventDefault).toHaveBeenCalled()
    // 挡的是同一个节点上作者自己的处理器，不是往祖先的冒泡：
    // 只 stopPropagation 的话，"提交中"的按钮还会被点第二次提交出去
    expect(e.stopImmediatePropagation).toHaveBeenCalled()
  })

  it('可交互时 onClick 不拦截', () => {
    const root = connect({}).getRootProps() as Record<string, unknown>
    const e = fakeEvent()
    ;(root.onClick as (e: unknown) => void)(e)
    expect(e.preventDefault).not.toHaveBeenCalled()
    expect(e.stopImmediatePropagation).not.toHaveBeenCalled()
  })

  describe('图标按钮的可及名', () => {
    function collect(run: () => void): string[] {
      const spy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      run()
      const messages = spy.mock.calls.map(call => String(call[0]))
      spy.mockRestore()
      return messages
    }

    it('iconOnly 且没给 aria-label / aria-labelledby：提醒一次，重复调用不再提醒', () => {
      const records = collect(() => {
        connect({ iconOnly: true }).getRootProps()
        connect({ iconOnly: true }).getRootProps()
      })
      expect(records.filter(m => m.includes('iconOnly'))).toHaveLength(1)
    })

    it('给了可及名或不是图标按钮：不提醒', () => {
      const records = collect(() => {
        connect({ iconOnly: true, ariaLabel: '关闭' }).getRootProps()
        connect({ iconOnly: true, ariaLabelledby: 'x' }).getRootProps()
        connect({}).getRootProps()
      })
      expect(records.filter(m => m.includes('iconOnly'))).toHaveLength(0)
    })

    it('装饰性子部件对读屏隐藏：aria-hidden 写布尔', () => {
      const api = connect({})
      expect((api.getPrefixProps() as Record<string, unknown>)['aria-hidden']).toBe(true)
      expect((api.getIndicatorProps() as Record<string, unknown>)['aria-hidden']).toBe(true)
    })
  })
})

/** 键盘桩：只带跟踪器会读的三个字段。 */
function key(name: string, init: Partial<KeyboardEvent> = {}): KeyboardEvent {
  return { key: name, repeat: false, isComposing: false, keyCode: 0, ...init } as KeyboardEvent
}

interface Handlers {
  onKeyDown: (e: KeyboardEvent) => void
  onKeyUp: (e: KeyboardEvent) => void
  onBlur: () => void
  onPointerDown: (e: PointerEvent) => void
  onPointerUp: () => void
  onPointerCancel: () => void
}

describe('按压通道：Space / Enter 与触屏按住投影 data-pressed', () => {
  it('静息不带 data-pressed；keydown Space 期间在场，keyup 撤下', () => {
    const b = makeButton()
    expect(b.root()['data-pressed']).toBeUndefined()
    ;(b.root() as unknown as Handlers).onKeyDown(key(' '))
    expect(b.root()['data-pressed']).toBe('')
    ;(b.root() as unknown as Handlers).onKeyUp(key(' '))
    expect(b.root()['data-pressed']).toBeUndefined()
  })

  it('按住 Enter 是同一副按压面；按住途中失焦即松开', () => {
    const b = makeButton()
    ;(b.root() as unknown as Handlers).onKeyDown(key('Enter'))
    expect(b.root()['data-pressed']).toBe('')
    ;(b.root() as unknown as Handlers).onBlur()
    expect(b.root()['data-pressed']).toBeUndefined()
  })

  it('触屏按下在场、pointercancel 撤下；鼠标按下不走这一路（由 :active 表出）', () => {
    const b = makeButton()
    ;(b.root() as unknown as Handlers).onPointerDown({ pointerType: 'mouse' } as PointerEvent)
    expect(b.root()['data-pressed']).toBeUndefined()
    ;(b.root() as unknown as Handlers).onPointerDown({ pointerType: 'touch' } as PointerEvent)
    expect(b.root()['data-pressed']).toBe('')
    ;(b.root() as unknown as Handlers).onPointerCancel()
    expect(b.root()['data-pressed']).toBeUndefined()
  })

  it.each([{ disabled: true }, { loading: true }])('%o 时按住不进入按压面', (props) => {
    const b = makeButton(props)
    ;(b.root() as unknown as Handlers).onKeyDown(key(' '))
    expect(b.root()['data-pressed']).toBeUndefined()
  })

  it('按住途中转入禁用或加载：按压面由机器自己收，不等 keyup', () => {
    for (const inert of [{ disabled: true }, { loading: true }] as Props[]) {
      const b = makeButton()
      ;(b.root() as unknown as Handlers).onKeyDown(key(' '))
      expect(b.root()['data-pressed']).toBe('')
      b.setProps(inert)
      expect(b.root()['data-pressed']).toBeUndefined()
    }
  })

  it('链接形态（as=a）同样投影按压面', () => {
    const b = makeButton({ as: 'a' })
    ;(b.root() as unknown as Handlers).onKeyDown(key('Enter'))
    expect(b.root()['data-pressed']).toBe('')
  })
})
