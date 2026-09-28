// @vitest-environment jsdom
import type { AlertOpenChangeDetails, AlertSchema } from '../src/alert'
import { createService, normalizeProps } from '@xihan-ui/core'
import { createVanillaRuntime } from '@xihan-ui/core/vanilla'
import { afterEach, describe, expect, it, vi } from 'vitest'
// 直接指向组件目录：包主入口的导出由接线一并补，测试不等它
import { alertMachine, connectAlert } from '../src/alert'

type Props = AlertSchema['props']

/** props 走 signal 而不是裸对象：改 prop 要真的惊动 watch，才验得到受控回写那一路。 */
function makeAlert(initial: Props = {}) {
  const runtime = createVanillaRuntime()
  const props = runtime.signal<Props>(initial)
  const service = createService(alertMachine, { props: () => props.get(), runtime })
  runtime.start()
  return {
    state: () => service.state.get(),
    setProps: (next: Props) => props.set({ ...props.get(), ...next }),
    api: () => connectAlert(service, normalizeProps),
    stop: () => runtime.stop(),
  }
}

/** 等宿主提交（vanilla 运行时是一个微任务）与退场租约的 finished 链落定。 */
async function settle(): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, 0))
}

const realGetComputedStyle = window.getComputedStyle.bind(window)

afterEach(() => {
  vi.restoreAllMocks()
})

/**
 * 按 connect 给根的 id 挂一个根节点：量得出整块高度，身上有一段在播的退场动画。
 * jsdom 不排版也不跑 CSS 动画，高度、计算样式与动画对象都桩成浏览器里的取值；finish() 模拟退场播完。
 */
function stubExit(alert: ReturnType<typeof makeAlert>, height: number): { finish: () => void } {
  const node = document.createElement('div')
  node.id = String(alert.api().getRootProps().id)
  node.getBoundingClientRect = () => ({ height }) as DOMRect
  document.body.append(node)
  vi.spyOn(window, 'getComputedStyle').mockImplementation(((el: Element, pseudo?: string | null) => {
    if (el === node)
      return { animationName: 'xh-fade-out', animationDuration: '0.12s', animationDelay: '0s', animationTimingFunction: 'linear', opacity: '1', display: 'flex' } as CSSStyleDeclaration
    return realGetComputedStyle(el as HTMLElement, pseudo)
  }) as typeof window.getComputedStyle)
  let finish!: () => void
  const finished = new Promise<Animation>((resolve) => {
    finish = () => resolve({} as Animation)
  })
  Object.defineProperty(node, 'getAnimations', {
    configurable: true,
    value: () => [{ animationName: 'xh-fade-out', playState: 'running', effect: { getComputedTiming: () => ({ endTime: 120 }) }, finished }],
  })
  return { finish }
}

/** 关闭按钮的处理器不读事件对象，直接调即可（node 环境里没有 MouseEvent）。 */
function press(props: { onClick?: unknown }): void {
  (props.onClick as () => void)()
}

describe('alertMachine 起步状态', () => {
  it('什么都不给即显示；defaultOpen=false 起步收起；open 压过 defaultOpen', () => {
    expect(makeAlert().state()).toBe('open')
    expect(makeAlert({ defaultOpen: false }).state()).toBe('closed')
    expect(makeAlert({ open: false, defaultOpen: true }).state()).toBe('closed')
  })
})

describe('alertMachine 非受控', () => {
  it('关闭按钮落状态并通知一次；已收起再关不重复通知', () => {
    const seen: AlertOpenChangeDetails[] = []
    const a = makeAlert({ onOpenChange: d => seen.push(d) })

    press(a.api().getCloseTriggerProps())
    expect(a.state()).toBe('closed')
    expect(seen).toEqual([{ open: false }])

    a.api().setOpen(false)
    expect(seen).toEqual([{ open: false }])

    a.api().setOpen(true)
    expect(a.state()).toBe('open')
    expect(seen).toEqual([{ open: false }, { open: true }])
  })
})

describe('alertMachine 受控', () => {
  it('open 给定时点击只发意图不自改状态，宿主写回后才转移', () => {
    const seen: AlertOpenChangeDetails[] = []
    const a = makeAlert({ open: true, onOpenChange: d => seen.push(d) })

    press(a.api().getCloseTriggerProps())
    expect(a.state()).toBe('open')
    expect(seen).toEqual([{ open: false }])

    a.setProps({ open: false })
    expect(a.state()).toBe('closed')
    // 回写不再通知第二遍
    expect(seen).toEqual([{ open: false }])
  })

  it('open 变回 undefined 即转非受控，不强制收起', () => {
    const a = makeAlert({ open: true })
    a.setProps({ open: undefined })
    expect(a.state()).toBe('open')
  })
})

describe('connectAlert 实时区语义', () => {
  it('danger/warning 走 alert+assertive，info/success 走 status+polite', () => {
    const roleOf = (tone: Props['tone']): [unknown, unknown] => {
      const root = makeAlert({ tone }).api().getRootProps()
      return [root.role, root['aria-live']]
    }
    expect(roleOf('danger')).toEqual(['alert', 'assertive'])
    expect(roleOf('warning')).toEqual(['alert', 'assertive'])
    expect(roleOf('info')).toEqual(['status', 'polite'])
    expect(roleOf('success')).toEqual(['status', 'polite'])
    // 不给语气按 info 算
    expect(roleOf(undefined)).toEqual(['status', 'polite'])
  })

  it('标题与说明用 id 关联到 root，图标对读屏隐藏', () => {
    const api = makeAlert().api()
    const root = api.getRootProps()
    expect(root['aria-labelledby']).toBe(api.getTitleProps().id)
    expect(root['aria-describedby']).toBe(api.getDescriptionProps().id)
    expect(root['aria-atomic']).toBe('true')
    expect(api.getIndicatorProps()['aria-hidden']).toBe(true)
  })

  it('收起态给 root 打 hidden，展开态不留这个属性；没有可等的退场时提交之后即藏起', async () => {
    const a = makeAlert()
    expect(a.api().getRootProps().hidden).toBeUndefined()
    a.api().setOpen(false)
    await settle()
    expect(a.api().getRootProps().hidden).toBe(true)
  })

  it('初始即收起：不留退场、直接 hidden', () => {
    const a = makeAlert({ defaultOpen: false })
    expect(a.api().getRootProps().hidden).toBe(true)
    expect(a.api().getRootProps().inert).toBeUndefined()
  })
})

describe('alertMachine 关闭的退场', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('收起时先量下整块高度，等根上的退场动画播完才写 hidden；退场途中不接交互', async () => {
    const a = makeAlert()
    const fade = stubExit(a, 64)
    press(a.api().getCloseTriggerProps())
    expect(a.state()).toBe('closed')

    const exiting = a.api().getRootProps()
    expect(exiting['data-state']).toBe('closed')
    expect(exiting.hidden).toBeUndefined()
    expect(exiting.inert).toBe(true)
    expect((exiting.style as Record<string, string>)['--xh-_alert-exit-block-size']).toBe('64px')

    await settle()
    expect(a.api().getRootProps().hidden).toBeUndefined()

    fade.finish()
    await settle()
    const gone = a.api().getRootProps()
    expect(gone.hidden).toBe(true)
    expect(gone.inert).toBeUndefined()
    expect((gone.style as Record<string, string>)['--xh-_alert-exit-block-size']).toBe('')
  })

  it('退场途中重新显示：当场露面，交互恢复', async () => {
    const a = makeAlert()
    stubExit(a, 64)
    press(a.api().getCloseTriggerProps())
    await settle()
    a.api().setOpen(true)
    const root = a.api().getRootProps()
    expect(root.hidden).toBeUndefined()
    expect(root.inert).toBeUndefined()
    expect(root['data-state']).toBe('open')
  })

  it('受控收起同样先量高度、等退场', async () => {
    const a = makeAlert({ open: true })
    const fade = stubExit(a, 40)
    a.setProps({ open: false })
    expect((a.api().getRootProps().style as Record<string, string>)['--xh-_alert-exit-block-size']).toBe('40px')
    await settle()
    expect(a.api().getRootProps().hidden).toBeUndefined()
    fade.finish()
    await settle()
    expect(a.api().getRootProps().hidden).toBe(true)
  })
})

describe('connectAlert 关闭按钮', () => {
  it('投影 Action Control 家族属性：icon ghost 档、常显、固定 sm', () => {
    const close = makeAlert().api().getCloseTriggerProps()
    expect(close['data-xh-action-control']).toBe('')
    expect(close['data-xh-action-profile']).toBe('icon')
    expect(close['data-xh-action-variant']).toBe('ghost')
    expect(close['data-xh-action-display']).toBe('always')
    expect(close['data-xh-action-size']).toBe('sm')
  })

  it('可访问名默认 Close，可由 translations 替换', () => {
    expect(makeAlert().api().getCloseTriggerProps()['aria-label']).toBe('Close')
    expect(makeAlert({ translations: { close: '关闭提示' } }).api().getCloseTriggerProps()['aria-label']).toBe('关闭提示')
  })

  it('closable=false 时按钮禁用并收起，直接调 onClick 也不收提示', () => {
    const seen: AlertOpenChangeDetails[] = []
    const a = makeAlert({ closable: false, onOpenChange: d => seen.push(d) })
    const close = a.api().getCloseTriggerProps()

    expect(close.disabled).toBe(true)
    expect(close['data-disabled']).toBe('')
    expect(close.hidden).toBe(true)

    press(close)
    expect(a.state()).toBe('open')
    expect(seen).toEqual([])
  })
})

// ══ 按压通道 ══

type Dict = Record<string, unknown>
const key = (name: string): KeyboardEvent => ({ key: name, repeat: false, isComposing: false, keyCode: 0 } as KeyboardEvent)
const fire = (props: Dict, name: string, event: unknown): void => (props[name] as (e: unknown) => void)(event)

describe('alertMachine 按压通道：Space / Enter 与触屏按住投影 data-pressed', () => {
  it('关闭按钮：keydown 在场、keyup 撤下；触屏按下在场、抬起 / 取消撤下；失焦撤下；鼠标按下不走这一路', () => {
    const a = makeAlert()
    const close = (): Dict => a.api().getCloseTriggerProps() as Dict
    expect(close()['data-pressed']).toBeUndefined()
    fire(close(), 'onKeyDown', key(' '))
    expect(close()['data-pressed']).toBe('')
    fire(close(), 'onKeyUp', key(' '))
    expect(close()['data-pressed']).toBeUndefined()
    fire(close(), 'onKeyDown', key('Enter'))
    expect(close()['data-pressed']).toBe('')
    fire(close(), 'onBlur', {})
    expect(close()['data-pressed']).toBeUndefined()
    fire(close(), 'onPointerDown', { pointerType: 'touch' })
    expect(close()['data-pressed']).toBe('')
    fire(close(), 'onPointerCancel', {})
    expect(close()['data-pressed']).toBeUndefined()
    fire(close(), 'onPointerDown', { pointerType: 'touch' })
    expect(close()['data-pressed']).toBe('')
    fire(close(), 'onPointerUp', {})
    expect(close()['data-pressed']).toBeUndefined()
    fire(close(), 'onPointerDown', { pointerType: 'mouse' })
    expect(close()['data-pressed']).toBeUndefined()
    // 按住不等于按下：提示照旧显示
    expect(a.state()).toBe('open')
    a.stop()
  })

  it('收起即松开：按住 Enter 关掉提示，按钮随 root 藏起、不会再来 keyup，按压面由机器收；收起后按住不进', () => {
    const a = makeAlert()
    const close = (): Dict => a.api().getCloseTriggerProps() as Dict
    fire(close(), 'onKeyDown', key('Enter'))
    expect(close()['data-pressed']).toBe('')
    press(close() as { onClick?: unknown })
    expect(a.state()).toBe('closed')
    expect(close()['data-pressed']).toBeUndefined()
    fire(close(), 'onKeyDown', key('Enter'))
    expect(close()['data-pressed']).toBeUndefined()
    fire(close(), 'onPointerDown', { pointerType: 'touch' })
    expect(close()['data-pressed']).toBeUndefined()
    // 再次显示后照常可按
    a.api().setOpen(true)
    fire(close(), 'onKeyDown', key(' '))
    expect(close()['data-pressed']).toBe('')
    a.stop()
  })

  it('受控收起同样松开：宿主写回 open=false 那一刻按钮藏起', () => {
    const a = makeAlert({ open: true })
    const close = (): Dict => a.api().getCloseTriggerProps() as Dict
    fire(close(), 'onKeyDown', key('Enter'))
    expect(close()['data-pressed']).toBe('')
    a.setProps({ open: false })
    expect(a.state()).toBe('closed')
    expect(close()['data-pressed']).toBeUndefined()
    a.stop()
  })

  it('closable=false：按住不进；经 signal 转成不可关闭时按住的按钮自收', () => {
    const off = makeAlert({ closable: false })
    const offClose = (): Dict => off.api().getCloseTriggerProps() as Dict
    fire(offClose(), 'onKeyDown', key(' '))
    expect(offClose()['data-pressed']).toBeUndefined()
    fire(offClose(), 'onPointerDown', { pointerType: 'touch' })
    expect(offClose()['data-pressed']).toBeUndefined()
    off.stop()

    const a = makeAlert()
    const close = (): Dict => a.api().getCloseTriggerProps() as Dict
    fire(close(), 'onKeyDown', key(' '))
    expect(close()['data-pressed']).toBe('')
    a.setProps({ closable: false })
    expect(close()['data-pressed']).toBeUndefined()
    a.stop()
  })
})

describe('横幅', () => {
  it('缺省是页内提示：根不带横幅标记，api 报 false', () => {
    const a = makeAlert()
    expect(a.api().banner).toBe(false)
    expect((a.api().getRootProps() as Dict)['data-banner']).toBeUndefined()
    a.stop()
  })

  it('banner=true：根带横幅标记，语气、实时区与关闭照旧', () => {
    const a = makeAlert({ banner: true, tone: 'warning' })
    const root = a.api().getRootProps() as Dict
    expect(a.api().banner).toBe(true)
    expect(root['data-banner']).toBe('')
    expect(root['data-tone']).toBe('warning')
    expect(root.role).toBe('alert')
    expect((a.api().getCloseTriggerProps() as Dict).hidden).toBeUndefined()
    a.api().setOpen(false)
    expect(a.state()).toBe('closed')
    a.stop()
  })

  it('经 signal 切换横幅：根上的标记跟着换', () => {
    const a = makeAlert()
    a.setProps({ banner: true })
    expect((a.api().getRootProps() as Dict)['data-banner']).toBe('')
    a.setProps({ banner: false })
    expect((a.api().getRootProps() as Dict)['data-banner']).toBeUndefined()
    a.stop()
  })
})
