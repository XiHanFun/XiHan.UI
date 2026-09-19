import type { AlertOpenChangeDetails, AlertSchema } from '../src/alert'
import { createService, normalizeProps } from '@xihan-ui/core'
import { createVanillaRuntime } from '@xihan-ui/core/vanilla'
import { describe, expect, it } from 'vitest'
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

  it('收起态给 root 打 hidden，展开态不留这个属性', () => {
    const a = makeAlert()
    expect(a.api().getRootProps().hidden).toBeUndefined()
    a.api().setOpen(false)
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
