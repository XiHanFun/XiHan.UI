/**
 * 方向键在 trigger 之间搬焦点要真实的活 DOM：集合是在事件那一刻现查的。
 *
 * @vitest-environment jsdom
 */

import type { AccordionSchema, AccordionValueChangeDetails } from '../src/accordion'
import { createService, normalizeProps } from '@xihan-ui/core'
import { createVanillaRuntime } from '@xihan-ui/core/vanilla'
import { afterEach, describe, expect, it } from 'vitest'
import { accordionMachine, connectAccordion } from '../src/accordion'

type Props = AccordionSchema['props']

const VALUES = ['install', 'theme', 'a11y'] as const

const listeners = new WeakMap<HTMLElement, Map<string, EventListener>>()
function spread(el: HTMLElement, props: Record<string, unknown>): void {
  for (const [key, raw] of Object.entries(props)) {
    if (key.length > 2 && key.startsWith('on')) {
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
    if (key === 'style')
      continue
    // 条件属性（data-pressed 这类）撤下时要真的从节点上摘掉，否则中间帧看不到「撤下」
    if (raw === undefined || raw === null || raw === false) {
      el.removeAttribute(key)
      continue
    }
    el.setAttribute(key, raw === true ? '' : String(raw))
  }
}

function makeAccordion(initial: Props = {}) {
  const changes: AccordionValueChangeDetails[] = []
  const runtime = createVanillaRuntime()
  const props = runtime.signal<Props>({ ...initial, onValueChange: d => changes.push(d) })
  const service = createService(accordionMachine, { props: () => props.get(), runtime })
  const root = document.createElement('div')
  const triggers = VALUES.map(() => document.createElement('button'))
  for (const t of triggers) {
    const item = document.createElement('div')
    item.append(t)
    root.append(item)
  }
  document.body.append(root)
  runtime.start()

  const wire = (): void => {
    const api = connectAccordion(service, normalizeProps)
    spread(root, api.getRootProps() as Record<string, unknown>)
    triggers.forEach((el, i) => spread(el, api.getTriggerProps({ value: VALUES[i]! }) as Record<string, unknown>))
  }
  runtime.subscribe(wire)
  wire()

  return {
    service,
    triggers,
    changes,
    api: () => connectAccordion(service, normalizeProps),
    setProps: (next: Props) => props.set({ ...props.get(), ...next }),
    key: (i: number, key: string) => {
      const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true })
      triggers[i]!.dispatchEvent(event)
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

describe('connectAccordion 投影', () => {
  it('trigger 是 type=button，与 content 互指；header 报三级标题；收起的 content 带 hidden 与 inert', () => {
    const a = makeAccordion({ defaultValue: ['install'] })
    const open = a.api().getTriggerProps({ value: 'install' }) as Record<string, unknown>
    const openContent = a.api().getContentProps({ value: 'install' }) as Record<string, unknown>
    expect(open).toMatchObject({ 'type': 'button', 'aria-expanded': 'true', 'aria-disabled': 'false', 'data-state': 'open' })
    // 标题栏接 Action Control 的 disclosure-trigger 档：ghost 形态、按下只换面，档位随 size 走
    expect(open).toMatchObject({
      'data-xh-action-control': '',
      'data-xh-action-profile': 'disclosure-trigger',
      'data-xh-action-variant': 'ghost',
      'data-xh-action-display': 'always',
      'data-xh-action-size': 'md',
    })
    expect(open['aria-controls']).toBe(openContent.id)
    expect(openContent).toMatchObject({ role: 'region', hidden: undefined, inert: undefined })
    expect(openContent['aria-labelledby']).toBe(open.id)
    // 不做 roving tabindex：每个 trigger 都是独立的 Tab 停靠点
    expect(open.tabindex).toBeUndefined()

    const closed = a.api().getContentProps({ value: 'theme' }) as Record<string, unknown>
    expect(closed).toMatchObject({ 'hidden': true, 'inert': true, 'data-state': 'closed' })
    expect(a.api().getHeaderProps({ value: 'theme' })).toMatchObject({ 'role': 'heading', 'aria-level': 3, 'data-state': 'closed' })
    expect(a.api().getIndicatorProps({ value: 'theme' })).toMatchObject({ 'aria-hidden': true })
    expect(a.api().getItemSeparatorProps()).toMatchObject({ 'aria-hidden': true })
    a.stop()
  })

  it('根落方向与三轴；collection 推出文本、正文与禁用，部件上写的禁用优先，整组禁用一票通过', () => {
    const a = makeAccordion({ collection: [{ value: 'install' }, { value: 'theme', label: '换皮肤', content: '覆写令牌', disabled: true }], variant: 'outline', tone: 'brand', size: 'sm' })
    expect(a.api().getRootProps()).toMatchObject({ 'data-orientation': 'vertical', 'data-variant': 'outline', 'data-tone': 'brand', 'data-size': 'sm' })
    expect(a.api().collection).toEqual([
      { value: 'install', label: 'install', content: undefined, disabled: false },
      { value: 'theme', label: '换皮肤', content: '覆写令牌', disabled: true },
    ])
    expect((a.api().getTriggerProps({ value: 'theme' }) as Record<string, unknown>)['aria-disabled']).toBe('true')
    expect((a.api().getTriggerProps({ value: 'theme' }) as Record<string, unknown>)['data-xh-action-size']).toBe('sm')
    expect((a.api().getTriggerProps({ value: 'theme', disabled: false }) as Record<string, unknown>)['aria-disabled']).toBe('false')
    a.setProps({ disabled: true })
    expect(a.api().getRootProps()).toMatchObject({ 'data-disabled': '' })
    expect((a.api().getTriggerProps({ value: 'install' }) as Record<string, unknown>)['aria-disabled']).toBe('true')
    a.stop()
  })

  it('形态恒有值：不写 variant 时 root 落 ghost，写了 outline / subtle 如实落', () => {
    const a = makeAccordion()
    expect(a.api().getRootProps()).toMatchObject({ 'data-variant': 'ghost' })
    a.setProps({ variant: 'outline' })
    expect(a.api().getRootProps()).toMatchObject({ 'data-variant': 'outline' })
    a.setProps({ variant: 'subtle' })
    expect(a.api().getRootProps()).toMatchObject({ 'data-variant': 'subtle' })
    a.stop()
  })
})

describe('accordionMachine 开合', () => {
  it('单开：点开一项即收起另一项；缺省不许全收，最后一项点不掉', () => {
    const a = makeAccordion({ defaultValue: ['install'] })
    a.triggers[1]!.click()
    expect(a.api().value).toEqual(['theme'])
    a.triggers[1]!.click()
    expect(a.api().value).toEqual(['theme'])
    expect(a.changes).toEqual([{ value: ['theme'] }])
    a.stop()
  })

  it('collapsible 允许全部收起；multiple 允许多开', () => {
    const c = makeAccordion({ defaultValue: ['install'], collapsible: true })
    c.triggers[0]!.click()
    expect(c.api().value).toEqual([])
    c.stop()

    const m = makeAccordion({ defaultValue: ['install'], multiple: true })
    m.triggers[1]!.click()
    expect(m.api().value).toEqual(['install', 'theme'])
    m.triggers[0]!.click()
    expect(m.api().value).toEqual(['theme'])
    expect(m.api().isOpen('theme')).toBe(true)
    expect(m.api().isOpen('install')).toBe(false)
    m.stop()
  })

  it('禁用条目点不动；setValue 单开只取第一个，不许全收时空数组不落', () => {
    const a = makeAccordion({ collection: [{ value: 'install' }, { value: 'theme', disabled: true }, { value: 'a11y' }], defaultValue: ['install'] })
    a.triggers[1]!.click()
    expect(a.api().value).toEqual(['install'])
    a.api().setValue(['theme', 'a11y'])
    expect(a.api().value).toEqual(['theme'])
    a.api().setValue([])
    expect(a.api().value).toEqual(['theme'])
    a.stop()
  })

  it('受控 value：点击只发意图不自改，宿主写回后才变', () => {
    const a = makeAccordion({ value: ['install'] })
    a.triggers[2]!.click()
    expect(a.api().value).toEqual(['install'])
    expect(a.changes).toEqual([{ value: ['a11y'] }])
    a.setProps({ value: ['a11y'] })
    expect(a.api().value).toEqual(['a11y'])
    a.stop()
  })
})

describe('accordionMachine 首帧不播开合', () => {
  const instant = (a: ReturnType<typeof makeAccordion>, value: string): unknown[] => [
    (a.api().getContentProps({ value }) as Record<string, unknown>)['data-instant'],
    (a.api().getIndicatorProps({ value }) as Record<string, unknown>)['data-instant'],
  ]

  it('首帧就在的展开与收起都带 data-instant：内容与箭头直接呈现', () => {
    const a = makeAccordion({ defaultValue: ['install'] })
    expect(instant(a, 'install')).toEqual(['', ''])
    expect(instant(a, 'theme')).toEqual(['', ''])
    a.stop()
  })

  it('开合过的条目撤掉标记，从此按动效走；没动过的照旧直接呈现', () => {
    const a = makeAccordion({ defaultValue: ['install'] })
    a.triggers[1]!.click()
    // install 收起、theme 展开：两项都变过
    expect(instant(a, 'install')).toEqual([undefined, undefined])
    expect(instant(a, 'theme')).toEqual([undefined, undefined])
    expect(instant(a, 'a11y')).toEqual(['', ''])
    // 再点回去，变过的不会再带回标记
    a.triggers[0]!.click()
    expect(instant(a, 'install')).toEqual([undefined, undefined])
    a.stop()
  })

  it('受控 value 由宿主改写，变动的条目同样撤掉标记', () => {
    const a = makeAccordion({ value: ['install'] })
    a.setProps({ value: ['a11y'] })
    expect(instant(a, 'install')).toEqual([undefined, undefined])
    expect(instant(a, 'a11y')).toEqual([undefined, undefined])
    expect(instant(a, 'theme')).toEqual(['', ''])
    a.stop()
  })
})

describe('connectAccordion 键盘', () => {
  it('方向键只在 trigger 之间搬焦点、不改展开集合；缺省不回绕，loop 才回绕；横排换成左右键', () => {
    const a = makeAccordion({ defaultValue: ['install'] })
    a.triggers[0]!.focus()
    expect(a.key(0, 'ArrowDown')).toBe(true)
    expect(document.activeElement).toBe(a.triggers[1])
    expect(a.key(1, 'End')).toBe(true)
    expect(document.activeElement).toBe(a.triggers[2])
    expect(a.key(2, 'ArrowDown')).toBe(true)
    expect(document.activeElement).toBe(a.triggers[2])
    expect(a.key(2, 'Home')).toBe(true)
    expect(document.activeElement).toBe(a.triggers[0])
    // 横排里上下键不归导航管，不 preventDefault
    a.setProps({ orientation: 'horizontal' })
    expect(a.key(0, 'ArrowDown')).toBe(false)
    expect(a.key(0, 'ArrowRight')).toBe(true)
    expect(document.activeElement).toBe(a.triggers[1])
    expect(a.api().value).toEqual(['install'])
    a.stop()

    const loop = makeAccordion({ loop: true })
    loop.triggers[2]!.focus()
    loop.key(2, 'ArrowDown')
    expect(document.activeElement).toBe(loop.triggers[0])
    loop.stop()
  })
})

// ══ 按压通道 ══

describe('accordionMachine 按压通道：Space / Enter 与触屏按住投影 data-pressed，按住的是哪个 trigger 就只落在哪个上', () => {
  const pressedOf = (el: HTMLElement): boolean => el.hasAttribute('data-pressed')
  const keyEvent = (type: 'keydown' | 'keyup', key: string): KeyboardEvent =>
    new KeyboardEvent(type, { key, bubbles: true, cancelable: true })
  const pointer = (type: string, pointerType: string): PointerEvent =>
    new PointerEvent(type, { pointerType, bubbles: true, cancelable: true })

  it('keydown 在场、keyup 撤下；触屏按下在场、抬起 / 取消撤下；失焦撤下；鼠标按下不走这一路；展开集合不动', () => {
    const a = makeAccordion()
    const t = a.triggers[0]!
    expect(pressedOf(t)).toBe(false)
    t.focus()
    t.dispatchEvent(keyEvent('keydown', ' '))
    expect(pressedOf(t)).toBe(true)
    t.dispatchEvent(keyEvent('keyup', ' '))
    expect(pressedOf(t)).toBe(false)
    t.dispatchEvent(keyEvent('keydown', 'Enter'))
    expect(pressedOf(t)).toBe(true)
    t.blur()
    expect(pressedOf(t)).toBe(false)
    t.dispatchEvent(pointer('pointerdown', 'touch'))
    expect(pressedOf(t)).toBe(true)
    t.dispatchEvent(pointer('pointercancel', 'touch'))
    expect(pressedOf(t)).toBe(false)
    t.dispatchEvent(pointer('pointerdown', 'touch'))
    expect(pressedOf(t)).toBe(true)
    t.dispatchEvent(pointer('pointerup', 'touch'))
    expect(pressedOf(t)).toBe(false)
    t.dispatchEvent(pointer('pointerdown', 'mouse'))
    expect(pressedOf(t)).toBe(false)
    expect(a.api().value).toEqual([])
    a.stop()
  })

  it('只亮按住的那一个，别的 trigger 的 keyup 松不开它；方向键照常在 trigger 之间搬焦点', () => {
    const a = makeAccordion()
    const [first, second] = [a.triggers[0]!, a.triggers[1]!]
    first.focus()
    first.dispatchEvent(keyEvent('keydown', ' '))
    expect(pressedOf(first)).toBe(true)
    expect(pressedOf(second)).toBe(false)
    second.dispatchEvent(keyEvent('keyup', ' '))
    expect(pressedOf(first)).toBe(true)
    first.dispatchEvent(keyEvent('keyup', ' '))
    expect(pressedOf(first)).toBe(false)
    // 同一个 keydown 处理器：跟踪器与导航共用，方向键不进按压面、照常搬焦点
    expect(a.key(0, 'ArrowDown')).toBe(true)
    expect(document.activeElement).toBe(second)
    expect(pressedOf(first)).toBe(false)
    expect(pressedOf(second)).toBe(false)
    a.stop()
  })

  it('按住途中翻面：Enter 在 keydown 即切换展开态，按压面不随之丢，keyup 才撤下', () => {
    const a = makeAccordion()
    const t = a.triggers[0]!
    t.focus()
    t.dispatchEvent(keyEvent('keydown', 'Enter'))
    expect(pressedOf(t)).toBe(true)
    // 原生按钮把 Enter 翻成 click：这里直接派 click 模拟
    t.click()
    expect(a.api().value).toEqual(['install'])
    expect(pressedOf(t)).toBe(true)
    t.dispatchEvent(keyEvent('keyup', 'Enter'))
    expect(pressedOf(t)).toBe(false)
    a.stop()
  })

  it('整组禁用 / 条目禁用不进；经 signal 转整组禁用时按住的 trigger 自收', () => {
    const off = makeAccordion({ disabled: true })
    off.triggers[0]!.dispatchEvent(keyEvent('keydown', ' '))
    expect(pressedOf(off.triggers[0]!)).toBe(false)
    off.triggers[0]!.dispatchEvent(pointer('pointerdown', 'touch'))
    expect(pressedOf(off.triggers[0]!)).toBe(false)
    off.stop()

    const item = makeAccordion({ collection: [{ value: 'install' }, { value: 'theme', disabled: true }, { value: 'a11y' }] })
    item.triggers[1]!.dispatchEvent(keyEvent('keydown', ' '))
    expect(pressedOf(item.triggers[1]!)).toBe(false)
    item.triggers[1]!.dispatchEvent(pointer('pointerdown', 'touch'))
    expect(pressedOf(item.triggers[1]!)).toBe(false)
    item.triggers[0]!.dispatchEvent(keyEvent('keydown', ' '))
    expect(pressedOf(item.triggers[0]!)).toBe(true)
    item.setProps({ disabled: true })
    expect(pressedOf(item.triggers[0]!)).toBe(false)
    item.stop()
  })
})
