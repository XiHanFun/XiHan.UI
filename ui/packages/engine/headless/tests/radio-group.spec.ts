/**
 * 方向键与焦点进组要真实的活 DOM：条目集合是在事件那一刻现查的。
 *
 * @vitest-environment jsdom
 */

import type { RadioGroupSchema, RadioGroupValueChangeDetails } from '../src/radio-group'
import { createService, normalizeProps } from '@xihan-ui/core'
import { createVanillaRuntime } from '@xihan-ui/core/vanilla'
import { afterEach, describe, expect, it } from 'vitest'
import { connectRadioGroup, radioGroupMachine } from '../src/radio-group'

type Props = RadioGroupSchema['props']

const VALUES = ['free', 'standard', 'pro'] as const

const listeners = new WeakMap<HTMLElement, Map<string, EventListener>>()
function spread(el: HTMLElement, props: Record<string, unknown>): void {
  for (const [key, raw] of Object.entries(props)) {
    if (key.length > 2 && key.startsWith('on') && key[2]! >= 'A' && key[2]! <= 'Z') {
      const type = key.slice(2).toLowerCase()
      const map = listeners.get(el) ?? new Map<string, EventListener>()
      listeners.set(el, map)
      const prev = map.get(type)
      if (prev)
        el.removeEventListener(type, prev)
      if (typeof raw === 'function') {
        el.addEventListener(type, raw as EventListener)
        map.set(type, raw as EventListener)
      }
      continue
    }
    if (key === 'style' || raw === undefined || raw === null || raw === false)
      continue
    if (raw === true)
      el.setAttribute(key, '')
    else
      el.setAttribute(key, String(raw))
  }
}

function makeGroup(initial: Props = {}) {
  const changes: RadioGroupValueChangeDetails[] = []
  const runtime = createVanillaRuntime()
  const props = runtime.signal<Props>({ ...initial, onValueChange: d => changes.push(d) })
  const service = createService(radioGroupMachine, { props: () => props.get(), runtime })
  const root = document.createElement('div')
  const label = document.createElement('span')
  const items = VALUES.map(() => document.createElement('div'))
  root.append(label, ...items)
  document.body.append(root)
  runtime.start()

  const wire = (): void => {
    const api = connectRadioGroup(service, normalizeProps)
    spread(root, api.getRootProps() as Record<string, unknown>)
    spread(label, api.getLabelProps() as Record<string, unknown>)
    items.forEach((el, i) => spread(el, api.getItemProps({ value: VALUES[i]! }) as Record<string, unknown>))
  }
  runtime.subscribe(wire)
  wire()

  return {
    service,
    root,
    items,
    changes,
    api: () => connectRadioGroup(service, normalizeProps),
    setProps: (next: Props) => props.set({ ...props.get(), ...next }),
    key: (key: string) => {
      const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true })
      root.dispatchEvent(event)
      return event.defaultPrevented
    },
    stop: () => {
      runtime.stop()
      root.remove()
    },
  }
}

afterEach(() => {
  document.body.innerHTML = ''
})

describe('connectRadioGroup 投影', () => {
  it('根是 radiogroup，指着 label；条目是 radio，未选中也显式 aria-checked=false；隐藏输入 inert 且只在选中时 checked', () => {
    const g = makeGroup({ defaultValue: 'standard', name: 'plan', orientation: 'horizontal' })
    const root = g.api().getRootProps() as Record<string, unknown>
    expect(root).toMatchObject({ 'role': 'radiogroup', 'aria-orientation': 'horizontal', 'data-orientation': 'horizontal', 'aria-readonly': 'false', 'aria-invalid': 'false', 'aria-required': 'false' })
    expect(root['aria-labelledby']).toBe((g.api().getLabelProps() as Record<string, unknown>).id)

    const checked = g.api().getItemProps({ value: 'standard' }) as Record<string, unknown>
    const other = g.api().getItemProps({ value: 'pro' }) as Record<string, unknown>
    expect(checked).toMatchObject({ 'role': 'radio', 'aria-checked': 'true', 'data-state': 'checked', 'tabindex': 0 })
    expect(other).toMatchObject({ 'aria-checked': 'false', 'aria-disabled': 'false', 'data-state': 'unchecked', 'tabindex': -1 })

    const input = g.api().getHiddenInputProps({ value: 'standard' }) as Record<string, unknown>
    expect(input).toMatchObject({ type: 'radio', name: 'plan', value: 'standard', checked: true, inert: true, tabindex: -1 })
    expect((g.api().getHiddenInputProps({ value: 'pro' }) as Record<string, unknown>).checked).toBe(false)
    expect(g.api().getIndicatorProps({ value: 'pro' })).toMatchObject({ 'aria-hidden': true, 'data-state': 'unchecked' })
    g.stop()
  })

  it('缺省竖排、没选中时容器自己占 Tab 位；collection 推出文本与禁用，部件上写的禁用优先', () => {
    const g = makeGroup({ collection: [{ value: 'free' }, { value: 'standard', label: '标准版', disabled: true }, { value: 'pro' }] })
    expect(g.api().getRootProps()).toMatchObject({ 'aria-orientation': 'vertical', 'tabindex': 0 })
    expect(g.api().collection).toEqual([
      { value: 'free', label: 'free', disabled: false },
      { value: 'standard', label: '标准版', disabled: true },
      { value: 'pro', label: 'pro', disabled: false },
    ])
    expect((g.api().getItemProps({ value: 'standard' }) as Record<string, unknown>)['aria-disabled']).toBe('true')
    expect((g.api().getItemProps({ value: 'standard', disabled: false }) as Record<string, unknown>)['aria-disabled']).toBe('false')
    expect((g.api().getHiddenInputProps({ value: 'standard' }) as Record<string, unknown>).disabled).toBe(true)
    g.stop()
  })

  it('条目接 Action Control row 档 ghost：整行是行级命中区，按下只换面不缩放；xs 是 24px 命中地板', () => {
    const g = makeGroup({})
    expect(g.api().getItemProps({ value: 'free' })).toMatchObject({
      'data-xh-action-control': '',
      'data-xh-action-profile': 'row',
      'data-xh-action-variant': 'ghost',
      'data-xh-action-display': 'always',
      'data-xh-action-size': 'xs',
    })
    // 圆圈是行内 aria-hidden 的标记，不投影配方，随行读宿主的桥接槽换面
    const circle = g.api().getIndicatorProps({ value: 'free' }) as Record<string, unknown>
    expect('data-xh-action-control' in circle).toBe(false)
    g.stop()
  })

  it('整组禁用、只读、无效、必填各落到根上，禁用与只读同时落到每个条目', () => {
    const g = makeGroup({ disabled: true, readOnly: true, invalid: true, required: true })
    expect(g.api().getRootProps()).toMatchObject({ 'data-disabled': '', 'aria-readonly': 'true', 'aria-invalid': 'true', 'aria-required': 'true', 'data-required': '' })
    expect(g.api().getItemProps({ value: 'free' })).toMatchObject({ 'aria-disabled': 'true', 'data-disabled': '', 'data-readonly': '', 'data-invalid': '' })
    g.stop()
  })
})

describe('connectRadioGroup 选择', () => {
  it('点条目选中并通知；禁用与只读的条目点不动；受控时只发意图', () => {
    const g = makeGroup({ collection: [{ value: 'free' }, { value: 'standard', disabled: true }, { value: 'pro' }] })
    g.items[2]!.click()
    expect(g.api().value).toBe('pro')
    expect(g.changes).toEqual([{ value: 'pro' }])
    g.items[1]!.click()
    expect(g.api().value).toBe('pro')
    g.stop()

    const ro = makeGroup({ defaultValue: 'free', readOnly: true })
    ro.items[2]!.click()
    expect(ro.api().value).toBe('free')
    ro.stop()

    const c = makeGroup({ value: 'free' })
    c.items[2]!.click()
    expect(c.api().value).toBe('free')
    expect(c.changes).toEqual([{ value: 'pro' }])
    c.setProps({ value: 'pro' })
    expect(c.api().value).toBe('pro')
    c.stop()
  })

  it('空格选中当前条目并拦默认行为；禁用条目上的 Space 放行给页面滚动', () => {
    const g = makeGroup({ collection: [{ value: 'free' }, { value: 'standard', disabled: true }, { value: 'pro' }] })
    const press = (i: number): boolean => {
      const event = new KeyboardEvent('keydown', { key: ' ', bubbles: true, cancelable: true })
      g.items[i]!.dispatchEvent(event)
      return event.defaultPrevented
    }
    expect(press(0)).toBe(true)
    expect(g.api().value).toBe('free')
    expect(press(1)).toBe(false)
    expect(g.api().value).toBe('free')
    g.stop()
  })
})

describe('connectRadioGroup 键盘与焦点', () => {
  it('方向键在组上走：搬焦点的同时选中，四个方向都认，首尾回绕，跳过禁用', () => {
    const g = makeGroup({ defaultValue: 'free', collection: [{ value: 'free' }, { value: 'standard', disabled: true }, { value: 'pro' }] })
    expect(g.key('ArrowDown')).toBe(true)
    expect(g.api().value).toBe('pro')
    expect(document.activeElement).toBe(g.items[2])
    expect(g.key('ArrowRight')).toBe(true)
    expect(g.api().value).toBe('free')
    expect(g.key('ArrowUp')).toBe(true)
    expect(g.api().value).toBe('pro')
    expect(g.changes.map(c => c.value)).toEqual(['pro', 'free', 'pro'])
    g.stop()
  })

  it('home/End 与字母键不归导航管，不 preventDefault；只读时焦点照走、值不落', () => {
    const g = makeGroup({ defaultValue: 'free' })
    expect(g.key('Home')).toBe(false)
    expect(g.key('a')).toBe(false)
    g.stop()

    const ro = makeGroup({ defaultValue: 'free', readOnly: true })
    expect(ro.key('ArrowDown')).toBe(true)
    expect(document.activeElement).toBe(ro.items[1])
    expect(ro.api().value).toBe('free')
    expect(ro.api().focusedValue).toBe('standard')
    ro.stop()
  })

  it('焦点从组外进来落在选中项；没选中就落第一个；焦点离组后容器重新占 Tab 位', () => {
    const g = makeGroup({ defaultValue: 'standard' })
    g.root.dispatchEvent(new FocusEvent('focus', { relatedTarget: null }))
    expect(document.activeElement).toBe(g.items[1])
    expect(g.api().focusedValue).toBe('standard')
    expect((g.api().getRootProps() as Record<string, unknown>).tabindex).toBe(-1)

    g.root.dispatchEvent(new FocusEvent('focusout', { relatedTarget: document.body }))
    expect(g.api().focusedValue).toBeNull()
    expect((g.api().getRootProps() as Record<string, unknown>).tabindex).toBe(0)
    g.stop()

    const empty = makeGroup()
    empty.root.dispatchEvent(new FocusEvent('focus', { relatedTarget: null }))
    expect(document.activeElement).toBe(empty.items[0])
    empty.stop()
  })
})

describe('radioGroupMachine 表单重置', () => {
  it('表单重置回到 defaultValue；受控且没给默认值时不动也不通知', () => {
    const g = makeGroup({ defaultValue: 'free' })
    g.api().setValue('pro')
    g.service.send({ type: 'FORM.RESET' })
    expect(g.api().value).toBe('free')
    g.stop()

    const c = makeGroup({ value: 'pro' })
    c.service.send({ type: 'FORM.RESET' })
    expect(c.api().value).toBe('pro')
    expect(c.changes).toEqual([])
    c.stop()
  })
})

describe('connectRadioGroup 按压通道', () => {
  // 夹具的 spread 不摘属性，按压面的在场与否直接读 connect 的投影
  const pressed = (g: ReturnType<typeof makeGroup>, value: string): unknown =>
    (g.api().getItemProps({ value }) as Record<string, unknown>)['data-pressed']
  const keyEvent = (type: 'keydown' | 'keyup', key: string, init: KeyboardEventInit = {}): KeyboardEvent =>
    new KeyboardEvent(type, { key, bubbles: true, cancelable: true, ...init })
  const pointerEvent = (type: string, pointerType: string): PointerEvent =>
    new PointerEvent(type, { pointerType, bubbles: true, cancelable: true })

  it('机器收到 PRESS.START 后只让那一个条目投影 data-pressed，PRESS.END 撤下；另一条目的 keyup 不串；选中与按压互相独立', () => {
    const g = makeGroup({ defaultValue: 'free' })
    g.service.send({ type: 'PRESS.START', value: 'pro' })
    expect(pressed(g, 'pro')).toBe('')
    expect(pressed(g, 'free')).toBeUndefined()
    expect(g.api().value).toBe('free')
    g.service.send({ type: 'PRESS.END', value: 'free' })
    expect(pressed(g, 'pro')).toBe('')
    g.service.send({ type: 'PRESS.END', value: 'pro' })
    expect(pressed(g, 'pro')).toBeUndefined()
    g.stop()
  })

  it('按住 Space 经跟踪器进出并在 keydown 那一刻选中，长按重复键不重报，失焦即撤下；Enter 不是 radio 的激活键，不进', () => {
    const g = makeGroup()
    const pro = g.items[2]!
    pro.dispatchEvent(keyEvent('keydown', ' '))
    expect(pressed(g, 'pro')).toBe('')
    expect(g.api().value).toBe('pro')
    pro.dispatchEvent(keyEvent('keydown', ' ', { repeat: true }))
    expect(pressed(g, 'pro')).toBe('')
    pro.dispatchEvent(keyEvent('keyup', ' '))
    expect(pressed(g, 'pro')).toBeUndefined()
    pro.dispatchEvent(keyEvent('keydown', ' '))
    expect(pressed(g, 'pro')).toBe('')
    pro.dispatchEvent(new FocusEvent('blur'))
    expect(pressed(g, 'pro')).toBeUndefined()
    pro.dispatchEvent(keyEvent('keydown', 'Enter'))
    expect(pressed(g, 'pro')).toBeUndefined()
    g.stop()
  })

  it('触屏按下进按压面，抬起或指针取消撤下；鼠标按下不走这一路', () => {
    const g = makeGroup()
    const free = g.items[0]!
    free.dispatchEvent(pointerEvent('pointerdown', 'mouse'))
    expect(pressed(g, 'free')).toBeUndefined()
    free.dispatchEvent(pointerEvent('pointerdown', 'touch'))
    expect(pressed(g, 'free')).toBe('')
    free.dispatchEvent(pointerEvent('pointercancel', 'touch'))
    expect(pressed(g, 'free')).toBeUndefined()
    free.dispatchEvent(pointerEvent('pointerdown', 'touch'))
    expect(pressed(g, 'free')).toBe('')
    free.dispatchEvent(pointerEvent('pointerup', 'touch'))
    expect(pressed(g, 'free')).toBeUndefined()
    g.stop()
  })

  it('禁用条目、整组禁用与只读都不进按压面', () => {
    const g = makeGroup({ collection: [{ value: 'free' }, { value: 'standard', disabled: true }, { value: 'pro' }] })
    g.items[1]!.dispatchEvent(keyEvent('keydown', ' '))
    expect(pressed(g, 'standard')).toBeUndefined()
    g.setProps({ disabled: true })
    g.items[0]!.dispatchEvent(keyEvent('keydown', ' '))
    expect(pressed(g, 'free')).toBeUndefined()
    g.setProps({ disabled: false, readOnly: true })
    g.items[0]!.dispatchEvent(pointerEvent('pointerdown', 'touch'))
    expect(pressed(g, 'free')).toBeUndefined()
    g.stop()
  })

  it('按住途中整组转入禁用或只读：不会再来 keyup，机器自己撤下', () => {
    const g = makeGroup()
    g.items[0]!.dispatchEvent(keyEvent('keydown', ' '))
    expect(pressed(g, 'free')).toBe('')
    g.setProps({ disabled: true })
    expect(pressed(g, 'free')).toBeUndefined()
    g.setProps({ disabled: false })
    g.items[0]!.dispatchEvent(keyEvent('keydown', ' '))
    expect(pressed(g, 'free')).toBe('')
    g.setProps({ readOnly: true })
    expect(pressed(g, 'free')).toBeUndefined()
    g.stop()
  })
})
