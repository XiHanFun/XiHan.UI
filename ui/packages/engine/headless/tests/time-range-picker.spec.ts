// @vitest-environment jsdom
import type { RuntimeConfig } from '@xihan-ui/core'
import type { ExitLease, PresenceHandle } from '@xihan-ui/core/presence'
import type { VanillaRuntime } from '@xihan-ui/core/vanilla'
import type { TimeSegmentType } from '../src/time-field'
import type { TimePickerColumnUnit } from '../src/time-picker'
import type { TimeRangePickerApi, TimeRangePickerEndIndex, TimeRangePickerSchema } from '../src/time-range-picker'
import { createCounterIdGenerator, createRuntimeConfig, createScope, createService, normalizeProps } from '@xihan-ui/core'
import { createPresence } from '@xihan-ui/core/presence'
import { createVanillaRuntime } from '@xihan-ui/core/vanilla'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { timePickerColumns } from '../src/time-picker'
import {
  connectTimeRangePicker,
  resolveTimeRangePickerEndIndex,
  timeRangePickerBoundsAt,
  timeRangePickerMachine,
  timeRangePickerPresetFromNow,
  timeRangePickerPresetTimes,
  timeRangePickerPresetValue,
  trimTimeRangeHoles,
} from '../src/time-range-picker'

type Props = TimeRangePickerSchema['props']

const ALL_SEGMENTS: TimeSegmentType[] = ['hour', 'minute', 'second', 'dayPeriod']
const ALL_UNITS: TimePickerColumnUnit[] = ['hour', 'minute', 'second', 'dayPeriod']
const ENDS: TimeRangePickerEndIndex[] = [0, 1]
/** 上下午列的两格；24 小时制下生成函数不给这一列，夹具仍把它摆上，好让「作者写了、组件收起」也跑到。 */
const DAY_PERIOD_OPTIONS = ['00', '01'] as const

const listeners = new WeakMap<HTMLElement, Map<string, EventListener>>()
const BOOLEAN_ATTRS = new Set(['disabled', 'hidden', 'readonly', 'required'])
// 隐藏输入的 value 只能走 DOM property：与 WC 侧的 spreader 同一套规则
const PROP_KEYS = new Set(['value'])

/**
 * 最小 spread：与 WC 侧同一套翻译规则（on 之后全小写做事件名，布尔属性 toggle，value 落 property）。
 * 有它才跑得到真实事件流——纯粹比对 connect 的返回值只能验静态属性，
 * 「按键落到哪一格上」这类事实必须有活 DOM 才立得住。
 */
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
    if (key === 'style')
      continue
    if (raw === undefined || raw === null || raw === false) {
      el.removeAttribute(key)
      continue
    }
    if (PROP_KEYS.has(key)) {
      (el as unknown as Record<string, unknown>)[key] = raw
      continue
    }
    if (BOOLEAN_ATTRS.has(key)) {
      el.toggleAttribute(key, Boolean(raw))
      continue
    }
    el.setAttribute(key, String(raw))
  }
}

interface Harness {
  api: () => TimeRangePickerApi
  config: RuntimeConfig
  presence: PresenceHandle | null
  root: HTMLElement
  label: HTMLElement
  control: HTMLElement
  separator: HTMLElement
  trigger: HTMLButtonElement
  clear: HTMLButtonElement
  content: HTMLElement
  /** 第 index 组分段容器。 */
  group: (index: TimeRangePickerEndIndex) => HTMLElement
  /** 第 index 份表单出口。 */
  hiddenInput: (index: TimeRangePickerEndIndex) => HTMLInputElement
  segment: (index: TimeRangePickerEndIndex, type: TimeSegmentType) => HTMLElement
  columnGroup: (index: TimeRangePickerEndIndex) => HTMLElement
  column: (index: TimeRangePickerEndIndex, unit: TimePickerColumnUnit) => HTMLElement
  option: (index: TimeRangePickerEndIndex, unit: TimePickerColumnUnit, value: string) => HTMLElement
  setProps: (next: Partial<Props>) => void
  render: () => void
  state: () => string
  value: () => string[]
  /** 表单重置：由表单派发 FORM.RESET，不经 api。 */
  reset: () => void
  destroy: () => void
}

interface MountOptions {
  /** 注入真实 Presence，验证行为资源延迟到视觉退场完成后释放。 */
  withPresence?: boolean
}

const runtimes: VanillaRuntime[] = []

/**
 * 浮层里的选项按「不设界的全量网格」渲染一次就固定住：
 * min/max 与另一端是运行期才收窄的，作者若跟着重渲，被裁掉的格子就再也验不到 aria-disabled 了。
 * 真实作者会照 api.columnGroups 渲染，那是这份网格的子集。
 */
function mount(initial: Partial<Props> = {}, mountOptions: MountOptions = {}): Harness {
  const doc = document
  const runtime = createVanillaRuntime()
  runtimes.push(runtime)
  // props 挂在 signal 上：布尔态受控（open）靠 watch 里的 track 回写，
  // 而 track 只在有值真的变过时才复查——直接改一个普通对象，宿主的写回就被静默吞掉了
  const props = runtime.signal<Partial<Props>>({ ...initial })

  const idGen = createCounterIdGenerator()
  const scope = createScope(null, idGen)

  const root = doc.createElement('div')
  const label = doc.createElement('label')
  label.textContent = '营业时段'
  const control = doc.createElement('div')
  const groups = new Map<TimeRangePickerEndIndex, HTMLElement>()
  const segments = new Map<string, HTMLElement>()
  const separator = doc.createElement('span')
  separator.textContent = '-'
  for (const index of ENDS) {
    const groupEl = doc.createElement('div')
    groups.set(index, groupEl)
    for (const type of ALL_SEGMENTS) {
      const el = doc.createElement('span')
      groupEl.appendChild(el)
      segments.set(`${index}:${type}`, el)
    }
    if (index === 1)
      control.appendChild(separator)
    control.appendChild(groupEl)
  }
  const trigger = doc.createElement('button')
  const clear = doc.createElement('button')
  control.append(trigger, clear)
  const positioner = doc.createElement('div')
  const content = doc.createElement('div')
  positioner.appendChild(content)
  const hiddenInputs = new Map<TimeRangePickerEndIndex, HTMLInputElement>()
  for (const index of ENDS)
    hiddenInputs.set(index, doc.createElement('input'))
  root.append(label, control, positioner, hiddenInputs.get(0)!, hiddenInputs.get(1)!)

  const grid = timePickerColumns({
    granularity: 'second',
    hourCycle: initial.hourCycle,
    step: initial.step,
  })
  const columnGroups = new Map<TimeRangePickerEndIndex, HTMLElement>()
  const columns = new Map<string, HTMLElement>()
  const options = new Map<string, HTMLElement>()
  for (const index of ENDS) {
    const groupEl = doc.createElement('div')
    columnGroups.set(index, groupEl)
    content.appendChild(groupEl)
    for (const unit of ALL_UNITS) {
      const columnEl = doc.createElement('div')
      columns.set(`${index}:${unit}`, columnEl)
      groupEl.appendChild(columnEl)
      for (const value of grid.find(c => c.unit === unit)?.options ?? DAY_PERIOD_OPTIONS) {
        const optionEl = doc.createElement('div')
        optionEl.textContent = value
        columnEl.appendChild(optionEl)
        options.set(`${index}:${unit}:${value}`, optionEl)
      }
    }
  }
  doc.body.appendChild(root)

  const service = createService(timeRangePickerMachine, { props: () => props.get(), runtime, scope })

  const config: RuntimeConfig = createRuntimeConfig({ scope, idGenerator: idGen })
  const presence = mountOptions.withPresence
    ? createPresence({ config, open: (initial.open ?? initial.defaultOpen) ?? false, onRenderedChange: () => {} })
    : null
  service.refs.set('config', config)
  service.refs.set('presence', presence)
  service.refs.set('registerLayer', () => config.layerRegistry.register({
    kind: 'popover',
    node: () => content,
    // 输入行记为本层分支：点触发器算层内交互，开合交给它自己切换
    branches: () => [control],
    isModal: () => false,
    surfaces: () => [],
  }))
  service.refs.set('getAnchorEl', () => control)
  service.refs.set('getFloatingEl', () => positioner)
  service.refs.set('getContentEl', () => content)

  const api = (): TimeRangePickerApi => connectTimeRangePicker(service, normalizeProps)

  const render = (): void => {
    const current = api()
    spread(root, current.getRootProps() as Record<string, unknown>)
    spread(label, current.getLabelProps() as Record<string, unknown>)
    spread(control, current.getControlProps() as Record<string, unknown>)
    spread(separator, current.getRangeSeparatorProps() as Record<string, unknown>)
    for (const [index, groupEl] of groups)
      spread(groupEl, current.getSegmentGroupProps({ index }) as Record<string, unknown>)
    for (const [key, el] of segments) {
      const [i, type] = key.split(':') as [string, TimeSegmentType]
      const index = Number(i) as TimeRangePickerEndIndex
      spread(el, current.getSegmentProps({ index, segment: type }) as Record<string, unknown>)
      // 两个适配器都由自己填段上的文字（spreader 不碰文本节点），这里照做
      el.textContent = current.getSegmentText({ index, segment: type })
    }
    spread(trigger, current.getTriggerProps() as Record<string, unknown>)
    spread(clear, current.getClearTriggerProps() as Record<string, unknown>)
    spread(positioner, current.getPositionerProps() as Record<string, unknown>)
    spread(content, current.getContentProps() as Record<string, unknown>)
    for (const [index, el] of columnGroups)
      spread(el, current.getColumnGroupProps({ index }) as Record<string, unknown>)
    for (const [key, el] of columns) {
      const [i, unit] = key.split(':') as [string, TimePickerColumnUnit]
      spread(el, current.getColumnProps({ index: Number(i) as TimeRangePickerEndIndex, unit }) as Record<string, unknown>)
    }
    for (const [key, el] of options) {
      const [i, unit, value] = key.split(':') as [string, TimePickerColumnUnit, string]
      const index = Number(i) as TimeRangePickerEndIndex
      spread(el, current.getItemProps({ index, unit, value }) as Record<string, unknown>)
      el.textContent = current.getItemText({ unit, value })
    }
    for (const [index, el] of hiddenInputs)
      spread(el, current.getHiddenInputProps({ index }) as Record<string, unknown>)
  }

  runtime.start()
  // 任一 cell 变化就整体重打，与 WC 宿主的 wire() 同语义
  runtime.subscribe(render)
  render()

  return {
    api,
    config,
    presence,
    root,
    label,
    control,
    separator,
    trigger: trigger as HTMLButtonElement,
    clear: clear as HTMLButtonElement,
    content,
    group: index => groups.get(index)!,
    hiddenInput: index => hiddenInputs.get(index)!,
    segment: (index, type) => segments.get(`${index}:${type}`)!,
    columnGroup: index => columnGroups.get(index)!,
    column: (index, unit) => columns.get(`${index}:${unit}`)!,
    option: (index, unit, value) => options.get(`${index}:${unit}:${value}`)!,
    setProps: (next) => {
      props.set({ ...props.get(), ...next })
      render()
    },
    render,
    state: () => service.state.get(),
    value: () => service.context.get('value'),
    reset: () => service.send({ type: 'FORM.RESET' }),
    destroy: () => {
      runtime.stop()
      root.remove()
    },
  }
}

const mounted: Harness[] = []
function open(props: Partial<Props> = {}): Harness {
  const h = mount(props)
  mounted.push(h)
  return h
}

afterEach(() => {
  while (mounted.length) mounted.pop()!.destroy()
  while (runtimes.length) runtimes.pop()
  document.body.innerHTML = ''
})

function pressKey(el: HTMLElement, key: string, init: KeyboardEventInit = {}): KeyboardEvent {
  const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true, ...init })
  el.dispatchEvent(event)
  return event
}

/** 连等 n 个动画帧，与被等的那一方逐帧重试的排法对齐。 */
function flushFrames(n: number): Promise<void> {
  return new Promise((resolve) => {
    const step = (left: number): void => {
      if (left <= 0) {
        resolve()
        return
      }
      requestAnimationFrame(() => step(left - 1))
    }
    step(n)
  })
}

/** 一列里此刻还可选的那些格（被裁掉的自报 aria-disabled）。 */
function enabledValues(el: HTMLElement): string[] {
  return [...el.children]
    .filter(child => child.getAttribute('aria-disabled') !== 'true')
    .map(child => child.getAttribute('data-value') ?? '')
}

describe('纯函数', () => {
  it('trimTimeRangeHoles 裁掉尾部空位，前面的空缺原样留着', () => {
    expect(trimTimeRangeHoles(['09:00', ''])).toEqual(['09:00'])
    expect(trimTimeRangeHoles(['', '18:00'])).toEqual(['', '18:00'])
    expect(trimTimeRangeHoles(['', ''])).toEqual([])
  })

  it('resolveTimeRangePickerEndIndex 只认精确的 1，其余归起点', () => {
    expect(resolveTimeRangePickerEndIndex(1)).toBe(1)
    expect(resolveTimeRangePickerEndIndex('1')).toBe(1)
    expect(resolveTimeRangePickerEndIndex(0)).toBe(0)
    expect(resolveTimeRangePickerEndIndex(undefined)).toBe(0)
    expect(resolveTimeRangePickerEndIndex('x')).toBe(0)
  })

  it('timeRangePickerBoundsAt：终点以起点为下界、起点以终点为上界，另一端没填不收窄', () => {
    expect(timeRangePickerBoundsAt(['09:00', '18:00'], 1, undefined, undefined)).toEqual({ min: '09:00', max: undefined })
    expect(timeRangePickerBoundsAt(['09:00', '18:00'], 0, undefined, undefined)).toEqual({ min: undefined, max: '18:00' })
    // 作者的界更紧时以作者的为准
    expect(timeRangePickerBoundsAt(['09:00', '18:00'], 1, '10:00', '17:00')).toEqual({ min: '10:00', max: '17:00' })
    expect(timeRangePickerBoundsAt(['', '18:00'], 1, '08:00', undefined)).toEqual({ min: '08:00', max: undefined })
    expect(timeRangePickerBoundsAt([], 0, undefined, undefined)).toEqual({ min: undefined, max: undefined })
  })

  it('快捷选项的值用 / 拼两端，拆回来不是恰好两端即 null', () => {
    expect(timeRangePickerPresetValue('09:00', '18:00')).toBe('09:00/18:00')
    expect(timeRangePickerPresetTimes('09:00/18:00')).toEqual(['09:00', '18:00'])
    expect(timeRangePickerPresetTimes('09:00')).toBeNull()
    expect(timeRangePickerPresetTimes('09:00/12:00/18:00')).toBeNull()
  })

  it('timeRangePickerPresetFromNow 从此刻起往后若干分钟，不越过当天末尾', () => {
    const value = timeRangePickerPresetFromNow(60)
    const times = timeRangePickerPresetTimes(value)!
    expect(times[0]).toMatch(/^\d{2}:\d{2}$/)
    expect(times[1] >= times[0]).toBe(true)
    expect(timeRangePickerPresetTimes(timeRangePickerPresetFromNow(24 * 60))![1]).toBe('23:59')
  })
})

describe('connectTimeRangePicker 形态轴', () => {
  it('不写 variant 时 root、positioner 与 control 都落 outline；写 subtle 如实落', () => {
    const fallback = open()
    const fallbackPositioner = fallback.root.querySelector('[data-part="positioner"]')!
    expect(fallback.root.getAttribute('data-variant')).toBe('outline')
    expect(fallbackPositioner.getAttribute('data-variant')).toBe('outline')
    expect(fallback.control.getAttribute('data-variant')).toBe('outline')
    const subtle = open({ variant: 'subtle' })
    const subtlePositioner = subtle.root.querySelector('[data-part="positioner"]')!
    expect(subtle.root.getAttribute('data-variant')).toBe('subtle')
    expect(subtlePositioner.getAttribute('data-variant')).toBe('subtle')
    expect(subtle.control.getAttribute('data-variant')).toBe('subtle')
  })
})

describe('connectTimeRangePicker 家族角色', () => {
  it('control 投影 Field Chrome 的稳定角色与尺寸档（缺省 md），三个状态属性都在盒上', () => {
    const h = open({ readOnly: true, invalid: true })
    expect(h.control.getAttribute('data-xh-field-chrome')).toBe('')
    expect(h.control.getAttribute('data-xh-field-size')).toBe('md')
    expect(h.control.getAttribute('data-readonly')).toBe('')
    expect(h.control.getAttribute('data-invalid')).toBe('')
    expect(open({ disabled: true }).control.getAttribute('data-disabled')).toBe('')
    expect(open({ size: 'lg' }).control.getAttribute('data-xh-field-size')).toBe('lg')
  })

  it('展开钮常驻、清空钮按 has-value 显隐，都走 field-inset ghost 档，尺寸档随 size 缺省 md', () => {
    const h = open()
    for (const el of [h.trigger, h.clear]) {
      expect(el.getAttribute('data-xh-action-control')).toBe('')
      expect(el.getAttribute('data-xh-action-profile')).toBe('field-inset')
      expect(el.getAttribute('data-xh-action-variant')).toBe('ghost')
      expect(el.getAttribute('data-xh-action-size')).toBe('md')
    }
    expect(h.trigger.getAttribute('data-xh-action-display')).toBe('always')
    expect(h.clear.getAttribute('data-xh-action-display')).toBe('has-value')
    expect(h.clear.hasAttribute('data-xh-action-has-value')).toBe(false)
    expect(open({ defaultValue: ['09:00', '12:00'] }).clear.getAttribute('data-xh-action-has-value')).toBe('')
    expect(open({ size: 'sm' }).trigger.getAttribute('data-xh-action-size')).toBe('sm')
  })

  it('快捷选项与时间格都投影 Collection Item 的 overlay 语境与尺寸档', () => {
    const h = open({ presets: [{ value: '09:00/12:00', label: '上午' }] })
    const preset = h.api().getPresetProps({ value: '09:00/12:00' }) as Record<string, unknown>
    const item = h.api().getItemProps({ index: 0, unit: 'hour', value: '08' }) as Record<string, unknown>
    for (const row of [preset, item]) {
      expect(row['data-xh-collection-item']).toBe('')
      expect(row['data-xh-collection-size']).toBe('md')
      expect(row['data-xh-collection-context']).toBe('overlay')
    }
    expect((open({ size: 'lg' }).api().getItemProps({ index: 1, unit: 'hour', value: '08' }) as Record<string, unknown>)['data-xh-collection-size']).toBe('lg')
  })
})

describe('开合', () => {
  it('默认收起：content 带 hidden、触发器报 aria-expanded=false', () => {
    const h = open()
    expect(h.state()).toBe('closed')
    expect(h.content.hasAttribute('hidden')).toBe(true)
    expect(h.trigger.getAttribute('aria-expanded')).toBe('false')
    expect(h.trigger.getAttribute('aria-haspopup')).toBe('dialog')
    expect(h.trigger.getAttribute('aria-controls')).toBe(h.content.id)
  })

  it('点触发器展开并对外通知一次', () => {
    const onOpenChange = vi.fn()
    const h = open({ onOpenChange })
    h.trigger.click()
    expect(h.state()).toBe('open')
    expect(h.content.hasAttribute('hidden')).toBe(false)
    expect(onOpenChange).toHaveBeenCalledTimes(1)
    expect(onOpenChange).toHaveBeenCalledWith({ open: true })
  })

  it('指针点触发器打开空值：焦点锚点落到起点那组时列的第一项', () => {
    const h = open()
    h.trigger.click()
    expect(h.api().focusedColumn).toEqual({ index: 0, unit: 'hour' })
    expect(h.api().focusedItem).toBe('00')
  })

  it('键盘打开：下键落首格、上键落末格', () => {
    const h = open()
    pressKey(h.trigger, 'ArrowDown')
    expect(h.api().focusedColumn).toEqual({ index: 0, unit: 'hour' })
    expect(h.api().focusedItem).toBe('00')
    h.api().setOpen(false)
    pressKey(h.trigger, 'ArrowUp')
    expect(h.api().focusedItem).toBe('23')
  })

  it('展开时把焦点锚点落到起点那组的时列：已选的时仍可选就停在它上面', () => {
    const h = open({ defaultValue: ['09:30', '18:00'] })
    h.trigger.click()
    expect(h.api().focusedColumn).toEqual({ index: 0, unit: 'hour' })
    expect(h.api().focusedItem).toBe('09')
  })

  it('焦点正停在终点那组段位上时展开：锚点落到终点那组的时列', () => {
    const h = open({ defaultValue: ['09:30', '18:00'] })
    h.segment(1, 'hour').focus()
    pressKey(h.segment(1, 'hour'), 'ArrowDown', { altKey: true })
    expect(h.state()).toBe('open')
    expect(h.api().focusedColumn).toEqual({ index: 1, unit: 'hour' })
    expect(h.api().focusedItem).toBe('18')
  })

  it('点段位就展开，且焦点留在段上——那一下的用意是打字，不是挑时间', async () => {
    const h = open()
    const seg = h.segment(1, 'minute')
    seg.focus()
    seg.click()
    await flushFrames(3)
    expect(h.state()).toBe('open')
    expect(document.activeElement).toBe(seg)
  })

  it('段上 Enter 收起：敲出来的值不触发选完即收，得给一个我填完了的手势', async () => {
    const h = open({ defaultOpen: true })
    const seg = h.segment(1, 'hour')
    seg.focus()
    pressKey(seg, 'Enter')
    await flushFrames(1)
    expect(h.state()).toBe('closed')
  })

  it('禁用：触发器用原生 disabled，点不开', () => {
    const h = open({ disabled: true })
    expect(h.trigger.disabled).toBe(true)
    h.trigger.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    expect(h.state()).toBe('closed')
  })

  it('受控 open：宿主不写回则状态不动，回调照发；写回后才跟着走', () => {
    const onOpenChange = vi.fn()
    const h = open({ open: false, onOpenChange })
    h.trigger.click()
    expect(h.state()).toBe('closed')
    expect(onOpenChange).toHaveBeenCalledWith({ open: true })
    h.setProps({ open: true })
    expect(h.state()).toBe('open')
  })

  it('escape 收起（消解层收口），两端不变', async () => {
    const h = open({ defaultValue: ['09:00', '18:00'] })
    h.trigger.click()
    await flushFrames(2)
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
    expect(h.state()).toBe('closed')
    expect(h.value()).toEqual(['09:00', '18:00'])
  })

  it('tab 收起且不拦按键，焦点不抢回触发器', () => {
    const h = open({ defaultOpen: true })
    const event = pressKey(h.content, 'Tab')
    expect(event.defaultPrevented).toBe(false)
    expect(h.state()).toBe('closed')
  })
})

describe('两组时列', () => {
  it('列组是 group、各报各的名字并自报是哪一端；列是 listbox；精度不到秒时秒列收起', () => {
    const h = open({ defaultOpen: true })
    expect(h.columnGroup(0).getAttribute('role')).toBe('group')
    expect(h.columnGroup(0).getAttribute('aria-label')).toBe('Start time')
    expect(h.columnGroup(1).getAttribute('aria-label')).toBe('End time')
    expect(h.columnGroup(0).getAttribute('data-value')).toBe('0')
    expect(h.columnGroup(1).getAttribute('data-index')).toBe('1')
    for (const index of ENDS) {
      expect(h.column(index, 'hour').getAttribute('role')).toBe('listbox')
      expect(h.column(index, 'hour').getAttribute('data-value')).toBe('hour')
      expect(h.column(index, 'second').hasAttribute('hidden')).toBe(true)
      expect(h.column(index, 'dayPeriod').hasAttribute('hidden')).toBe(true)
    }
    expect(h.api().columnGroups.map(g => g.columns.map(c => c.unit))).toEqual([['hour', 'minute'], ['hour', 'minute']])
  })

  it('文案覆盖两端的名字', () => {
    const h = open({ defaultOpen: true, translations: { startTime: '开始时间', endTime: '结束时间' } })
    expect(h.columnGroup(0).getAttribute('aria-label')).toBe('开始时间')
    expect(h.group(1).getAttribute('aria-label')).toBe('结束时间')
  })

  it('选了起点之后终点那组以它为下界：界外的格留在列表里但不可选', () => {
    const h = open({ defaultOpen: true, defaultValue: ['09:30', ''] })
    expect(enabledValues(h.column(1, 'hour'))[0]).toBe('09')
    expect(h.option(1, 'hour', '08').getAttribute('aria-disabled')).toBe('true')
    expect(h.option(1, 'hour', '09').getAttribute('aria-disabled')).toBe('false')
    // 起点那组不受自己影响
    expect(h.option(0, 'hour', '08').getAttribute('aria-disabled')).toBe('false')
  })

  it('选了终点之后起点那组以它为上界；终点那组的分列在时卡在界上时跟着收窄', () => {
    const h = open({ defaultOpen: true, defaultValue: ['09:30', '18:15'] })
    expect(enabledValues(h.column(0, 'hour')).at(-1)).toBe('18')
    expect(h.option(0, 'hour', '19').getAttribute('aria-disabled')).toBe('true')
    // 终点选中 18 时，起点那组把 18 点当作上界：分列只到 15
    expect(h.api().isItemDisabled({ index: 0, unit: 'minute', value: '20' })).toBe(false)
    h.api().setValue(['18:00', '18:15'])
    expect(h.api().isItemDisabled({ index: 0, unit: 'minute', value: '20' })).toBe(true)
    expect(h.api().isItemDisabled({ index: 1, unit: 'minute', value: '00' })).toBe(false)
  })

  it('作者的 min/max 与另一端叠着裁，取更紧的那一道', () => {
    const h = open({ defaultOpen: true, min: '08:00', max: '20:00', defaultValue: ['09:00', ''] })
    expect(enabledValues(h.column(1, 'hour'))[0]).toBe('09')
    expect(enabledValues(h.column(1, 'hour')).at(-1)).toBe('20')
    expect(enabledValues(h.column(0, 'hour'))[0]).toBe('08')
  })

  it('isTimeUnavailable 收得到是哪一端', () => {
    const calls: TimeRangePickerEndIndex[] = []
    const h = open({
      defaultOpen: true,
      isTimeUnavailable: (value, unit, index) => {
        calls.push(index)
        return index === 1 && unit === 'minute' && value === '30'
      },
    })
    expect(h.option(1, 'minute', '30').getAttribute('aria-disabled')).toBe('true')
    expect(h.option(0, 'minute', '30').getAttribute('aria-disabled')).toBe('false')
    expect(calls).toContain(0)
    expect(calls).toContain(1)
  })

  it('每列各留一个 Tab 位：锚点那一格是 0，其余 -1；两组各自独立', () => {
    const h = open({ defaultOpen: true, defaultValue: ['09:30', '18:00'] })
    expect(h.option(0, 'hour', '09').getAttribute('tabindex')).toBe('0')
    expect(h.option(0, 'hour', '10').getAttribute('tabindex')).toBe('-1')
    expect(h.option(1, 'hour', '18').getAttribute('tabindex')).toBe('0')
    expect(h.option(1, 'minute', '00').getAttribute('tabindex')).toBe('0')
  })
})

describe('浮层键盘', () => {
  it('上下键在列内走，跳过被另一端裁掉的格', () => {
    const h = open({ defaultOpen: true, defaultValue: ['09:30', '10:00'] })
    // 起点那组的时列以终点 10 点为上界：从 09 往下走一格是 10，再走回绕到 00
    h.option(0, 'hour', '09').focus()
    pressKey(h.content, 'ArrowDown')
    expect(document.activeElement).toBe(h.option(0, 'hour', '10'))
    pressKey(h.content, 'ArrowDown')
    expect(document.activeElement).toBe(h.option(0, 'hour', '00'))
  })

  it('左右键跨组换列：起点那组的末列再往右进终点那组的首列，落在它的锚点上', () => {
    const h = open({ defaultOpen: true, defaultValue: ['09:30', '18:15'] })
    h.option(0, 'hour', '09').focus()
    pressKey(h.content, 'ArrowRight')
    expect(document.activeElement).toBe(h.option(0, 'minute', '30'))
    pressKey(h.content, 'ArrowRight')
    expect(document.activeElement).toBe(h.option(1, 'hour', '18'))
    expect(h.api().focusedColumn).toEqual({ index: 1, unit: 'hour' })
    pressKey(h.content, 'ArrowRight')
    expect(document.activeElement).toBe(h.option(1, 'minute', '15'))
    // 最后一列再往右不动
    pressKey(h.content, 'ArrowRight')
    expect(document.activeElement).toBe(h.option(1, 'minute', '15'))
    // 往左一路回到起点那组
    pressKey(h.content, 'ArrowLeft')
    pressKey(h.content, 'ArrowLeft')
    expect(document.activeElement).toBe(h.option(0, 'minute', '30'))
  })

  it('enter 选中焦点所在的格，只改那一端对应的段，浮层不收起', () => {
    const h = open({ defaultOpen: true, defaultValue: ['09:30', '18:15'] })
    h.option(1, 'hour', '20').focus()
    pressKey(h.content, 'Enter')
    expect(h.value()).toEqual(['09:30', '20:15'])
    expect(h.state()).toBe('open')
    expect(h.segment(1, 'hour').textContent).toBe('20')
    expect(h.segment(0, 'hour').textContent).toBe('09')
  })

  it('禁用的格按确认键不认', () => {
    const h = open({ defaultOpen: true, defaultValue: ['09:30', ''] })
    h.option(1, 'hour', '08').focus()
    pressKey(h.content, 'Enter')
    expect(h.value()).toEqual(['09:30', ''])
  })
})

describe('两条路写的是同一个值', () => {
  it('点终点那组的选项写进终点的段，段上的文字与隐藏输入同步跟上', () => {
    const onValueChange = vi.fn()
    const h = open({ defaultOpen: true, defaultValue: ['09:00', ''], onValueChange })
    h.option(1, 'hour', '18').click()
    expect(h.value()).toEqual(['09:00', ''])
    expect(h.segment(1, 'hour').textContent).toBe('18')
    h.option(1, 'minute', '30').click()
    expect(h.value()).toEqual(['09:00', '18:30'])
    expect(h.hiddenInput(0).value).toBe('09:00')
    expect(h.hiddenInput(1).value).toBe('18:30')
    expect(onValueChange).toHaveBeenLastCalledWith({ value: ['09:00', '18:30'] })
    expect(h.api().start).toBe('09:00')
    expect(h.api().end).toBe('18:30')
  })

  it('段上敲进去的值，浮层里立刻显示成选中；两组各管各的', () => {
    const h = open({ defaultOpen: true })
    const hour = h.segment(1, 'hour')
    hour.focus()
    pressKey(hour, '1')
    pressKey(hour, '8')
    expect(h.option(1, 'hour', '18').getAttribute('aria-selected')).toBe('true')
    expect(h.option(0, 'hour', '18').getAttribute('aria-selected')).toBe('false')
    // 数字填满本段自动跳到本组下一段
    expect(document.activeElement).toBe(h.segment(1, 'minute'))
  })

  it('段上按上下键加减，浮层的选中跟着挪', () => {
    const h = open({ defaultOpen: true, defaultValue: ['09:30', '18:15'] })
    const minute = h.segment(0, 'minute')
    minute.focus()
    pressKey(minute, 'ArrowUp')
    expect(h.value()).toEqual(['09:31', '18:15'])
    expect(h.option(0, 'minute', '31').getAttribute('aria-selected')).toBe('true')
  })

  it('只敲终点：起点留空占位，对外照位报出', () => {
    const onValueChange = vi.fn()
    const h = open({ onValueChange })
    const hour = h.segment(1, 'hour')
    hour.focus()
    pressKey(hour, '1')
    pressKey(hour, '8')
    const minute = h.segment(1, 'minute')
    pressKey(minute, '3')
    pressKey(minute, '0')
    expect(h.value()).toEqual(['', '18:30'])
    expect(onValueChange).toHaveBeenLastCalledWith({ value: ['', '18:30'] })
    expect(h.api().start).toBeNull()
    expect(h.api().end).toBe('18:30')
    expect(h.group(0).getAttribute('data-empty')).toBe('')
    expect(h.group(1).getAttribute('data-complete')).toBe('')
  })

  it('12 小时制下两组各自换算上午/下午，上下午列也受另一端裁剪', () => {
    const h = open({ defaultOpen: true, hourCycle: 12, defaultValue: ['06:00', '18:00'] })
    expect(h.segment(0, 'dayPeriod').textContent).toBe('AM')
    expect(h.segment(1, 'dayPeriod').textContent).toBe('PM')
    expect(h.option(1, 'hour', '06').getAttribute('aria-selected')).toBe('true')
    // 终点换成上午是 06:00，不早于起点 06:00，此刻还可选
    expect(h.option(1, 'dayPeriod', '00').getAttribute('aria-disabled')).toBe('false')
    // 起点换成下午：06:00 → 18:00，不晚于终点，写得进去
    h.option(0, 'dayPeriod', '01').click()
    expect(h.value()).toEqual(['18:00', '18:00'])
    expect(h.segment(0, 'dayPeriod').textContent).toBe('PM')
    // 起点已到 18:00，终点再换成上午就早于起点了：那一格被裁掉
    expect(h.option(1, 'dayPeriod', '00').getAttribute('aria-disabled')).toBe('true')
    h.option(1, 'dayPeriod', '00').click()
    expect(h.value()).toEqual(['18:00', '18:00'])
  })

  it('12 小时制下另一端形成边界时仍保留完整小时列，只把界外项标为禁用', () => {
    const h = open({ defaultOpen: true, hourCycle: 12, defaultValue: ['', '03:00'] })
    const hours = Array.from({ length: 12 }, (_, index) => String(index + 1).padStart(2, '0'))

    expect(h.api().columnGroups[0].columns.find(column => column.unit === 'hour')?.options).toEqual(hours)
    expect(h.option(0, 'hour', '04').getAttribute('aria-disabled')).toBe('true')
    expect(h.option(0, 'hour', '12').getAttribute('aria-disabled')).toBe('false')

    h.option(0, 'hour', '03').click()
    expect(h.value()).toEqual(['', '03:00'])
    expect(h.api().columnGroups[0].columns.find(column => column.unit === 'hour')?.options).toEqual(hours)

    h.option(0, 'minute', '00').click()
    expect(h.value()).toEqual(['03:00', '03:00'])
    expect(h.api().columnGroups[1].columns.find(column => column.unit === 'hour')?.options).toEqual(hours)
    expect(h.option(1, 'hour', '02').getAttribute('aria-disabled')).toBe('true')
  })
})

describe('分段输入', () => {
  it('两组各是一个 group、各报各的名字、各占一个 Tab 位；分隔符退出可访问树', () => {
    const h = open()
    expect(h.group(0).getAttribute('role')).toBe('group')
    expect(h.group(0).getAttribute('aria-label')).toBe('Start time')
    expect(h.group(1).getAttribute('aria-label')).toBe('End time')
    expect(h.group(0).getAttribute('data-index')).toBe('0')
    expect(h.group(0).id).not.toBe(h.group(1).id)
    expect(h.segment(0, 'hour').getAttribute('tabindex')).toBe('0')
    expect(h.segment(0, 'minute').getAttribute('tabindex')).toBe('-1')
    expect(h.segment(1, 'hour').getAttribute('tabindex')).toBe('0')
    expect(h.segment(1, 'second').hasAttribute('hidden')).toBe(true)
    expect(h.separator.getAttribute('aria-hidden')).toBe('true')
    expect(h.control.getAttribute('role')).toBe('group')
    expect(h.control.getAttribute('aria-labelledby')).toBe(h.label.id)
  })

  it('左右键换段不跨组：起点末段停住，终点首段停住', () => {
    const h = open()
    const minute0 = h.segment(0, 'minute')
    minute0.focus()
    pressKey(minute0, 'ArrowRight')
    expect(document.activeElement).toBe(minute0)
    const hour1 = h.segment(1, 'hour')
    hour1.focus()
    pressKey(hour1, 'ArrowLeft')
    expect(document.activeElement).toBe(hour1)
    pressKey(hour1, 'End')
    expect(document.activeElement).toBe(h.segment(1, 'minute'))
  })

  it('换端就重开一轮数字输入：起点敲了一位再去终点敲，两组互不串', () => {
    const h = open()
    const hour0 = h.segment(0, 'hour')
    hour0.focus()
    pressKey(hour0, '1')
    const hour1 = h.segment(1, 'hour')
    hour1.focus()
    pressKey(hour1, '9')
    expect(h.segment(1, 'hour').textContent).toBe('09')
    expect(h.segment(0, 'hour').textContent).toBe('01')
  })

  it('backspace 清掉本段，那一端退回空串但另一端留着', () => {
    const h = open({ defaultValue: ['09:30', '18:15'] })
    const hour = h.segment(1, 'hour')
    hour.focus()
    pressKey(hour, 'Backspace')
    expect(h.value()).toEqual(['09:30', ''])
    expect(h.segment(1, 'minute').textContent).toBe('15')
  })

  it('点标题把焦点送到起点那组的第一段', () => {
    const h = open()
    h.label.click()
    expect(document.activeElement).toBe(h.segment(0, 'hour'))
  })
})

describe('校验、禁用、只读与清空', () => {
  it('终点早于起点即不合法：根、输入行与两组段位带 data-invalid，api.invalid 同一口径', () => {
    const h = open({ defaultValue: ['18:00', '09:00'] })
    expect(h.api().reversed).toBe(true)
    expect(h.api().invalid).toBe(true)
    expect(h.root.getAttribute('data-invalid')).toBe('')
    expect(h.control.getAttribute('aria-invalid')).toBe('true')
    expect(h.group(1).getAttribute('data-invalid')).toBe('')
    expect(h.segment(0, 'hour').getAttribute('aria-invalid')).toBe('true')
    h.api().setValue(['09:00', '18:00'])
    expect(h.api().invalid).toBe(false)
    expect(h.root.hasAttribute('data-invalid')).toBe(false)
  })

  it('只填了一端不算不合法；任一端越界只做标注不改写', () => {
    expect(open({ defaultValue: ['', '09:00'] }).api().invalid).toBe(false)
    const h = open({ defaultValue: ['07:00', '18:00'], min: '08:00' })
    expect(h.api().outOfRange).toBe(true)
    expect(h.api().invalid).toBe(true)
    expect(h.group(0).getAttribute('data-out-of-range')).toBe('')
    expect(h.group(1).hasAttribute('data-out-of-range')).toBe(false)
    expect(h.value()).toEqual(['07:00', '18:00'])
  })

  it('只读：浮层照常展开、列里照常走，但选不中也清不掉', () => {
    const h = open({ readOnly: true, defaultValue: ['09:00', '18:00'] })
    h.trigger.click()
    expect(h.state()).toBe('open')
    h.option(1, 'hour', '20').click()
    expect(h.value()).toEqual(['09:00', '18:00'])
    expect(h.clear.hasAttribute('hidden')).toBe(true)
  })

  it('禁用：两组的格都不可选，段整组退出 Tab 序列，两份隐藏输入都不参与提交', () => {
    const h = open({ disabled: true, defaultValue: ['09:00', '18:00'], name: 'from', endName: 'to' })
    expect(h.option(0, 'hour', '09').getAttribute('aria-disabled')).toBe('true')
    expect(h.option(1, 'hour', '18').getAttribute('aria-disabled')).toBe('true')
    expect(h.segment(0, 'hour').hasAttribute('tabindex')).toBe(false)
    expect(h.segment(1, 'hour').hasAttribute('tabindex')).toBe(false)
    expect(h.hiddenInput(0).disabled).toBe(true)
    expect(h.hiddenInput(1).disabled).toBe(true)
  })

  it('name 与 endName 各自决定两份隐藏输入参不参与提交', () => {
    const anonymous = open({ defaultValue: ['09:00', '18:00'] })
    expect(anonymous.hiddenInput(0).hasAttribute('name')).toBe(false)
    expect(anonymous.hiddenInput(1).hasAttribute('name')).toBe(false)
    const named = open({ defaultValue: ['09:00', '18:00'], name: 'from', endName: 'to' })
    expect(named.hiddenInput(0).getAttribute('name')).toBe('from')
    expect(named.hiddenInput(0).value).toBe('09:00')
    expect(named.hiddenInput(1).getAttribute('name')).toBe('to')
    expect(named.hiddenInput(1).value).toBe('18:00')
    expect(named.hiddenInput(1).getAttribute('type')).toBe('hidden')
    const half = open({ defaultValue: ['09:00', '18:00'], name: 'from' })
    expect(half.hiddenInput(1).hasAttribute('name')).toBe(false)
  })

  it('清空按钮：填了一半也能按，按完两端都回到占位符、焦点回起点首段', () => {
    const empty = open()
    expect(empty.clear.hasAttribute('hidden')).toBe(true)
    const h = open({ defaultValue: ['', '18:00'] })
    expect(h.clear.hasAttribute('hidden')).toBe(false)
    h.clear.click()
    expect(h.value()).toEqual([])
    expect(h.segment(1, 'hour').textContent).toBe('--')
    expect(h.segment(0, 'hour').textContent).toBe('--')
    expect(document.activeElement).toBe(h.segment(0, 'hour'))
    expect(h.clear.hasAttribute('hidden')).toBe(true)
  })

  it('清空按钮：不对读屏隐身，名字走 translations.clearTrigger，缺省 Clear', () => {
    const h = open({ defaultValue: ['09:00', '18:00'] })
    expect(h.clear.getAttribute('tabindex')).toBe('-1')
    expect(h.clear.hasAttribute('aria-hidden')).toBe(false)
    expect(h.clear.getAttribute('aria-label')).toBe('Clear')
    expect(open({ defaultValue: ['09:00', '18:00'], translations: { clearTrigger: '清空' } }).clear.getAttribute('aria-label')).toBe('清空')
  })
})

describe('快捷选项', () => {
  const pick = (h: Harness, value: string): void => {
    (h.api().getPresetProps({ value }) as { onClick: () => void }).onClick()
  }

  it('只认恰好两端的那条：单个时刻、颠倒的、越界的都按不下去；按下把两端整份写进去并收起', () => {
    const h = open({
      defaultOpen: true,
      min: '08:00',
      presets: [
        { value: '09:00/12:00', label: '上午' },
        { value: '13:00', label: '单个' },
        { value: '18:00/09:00', label: '颠倒' },
        { value: '07:00/12:00', label: '越界' },
        { value: '09:00/18:00:30', label: '全天' },
      ],
    })
    expect(h.api().presets.map(p => p.disabled)).toEqual([false, true, true, true, false])
    // 作者多写的秒按精度截掉
    expect(h.api().presets[4]!.times).toEqual(['09:00', '18:00'])
    pick(h, '13:00')
    expect(h.value()).toEqual([])
    pick(h, '09:00/18:00:30')
    expect(h.value()).toEqual(['09:00', '18:00'])
    expect(h.state()).toBe('closed')
    expect(h.api().presets.map(p => p.selected)).toEqual([false, false, false, false, true])
  })

  it('命中当前值的那条报 aria-selected 并占 Tab 位', () => {
    const h = open({
      defaultValue: ['09:00', '12:00'],
      presets: [{ value: '09:00/12:00', label: '上午' }, { value: '13:00/18:00', label: '下午' }],
    })
    const first = h.api().getPresetProps({ value: '09:00/12:00' }) as Record<string, unknown>
    const second = h.api().getPresetProps({ value: '13:00/18:00' }) as Record<string, unknown>
    expect(first['aria-selected']).toBe('true')
    expect(first.tabindex).toBe(0)
    expect(second['aria-selected']).toBe('false')
    expect(second.tabindex).toBe(-1)
  })
})

describe('受控值', () => {
  it('宿主不写回则界面纹丝不动，回调照发；写回后才跟着走', () => {
    const onValueChange = vi.fn()
    const h = open({ value: ['09:00', '18:00'], defaultOpen: true, onValueChange })
    h.option(1, 'hour', '20').click()
    expect(onValueChange).toHaveBeenCalledWith({ value: ['09:00', '20:00'] })
    expect(h.value()).toEqual(['09:00', '18:00'])
    expect(h.segment(1, 'hour').textContent).toBe('18')
    h.setProps({ value: ['09:00', '20:00'] })
    expect(h.value()).toEqual(['09:00', '20:00'])
    expect(h.segment(1, 'hour').textContent).toBe('20')
  })

  it('setValue 整份写入两端，写坏的那一端等同于清空', () => {
    const h = open({ defaultValue: ['09:00', '18:00'] })
    h.api().setValue(['10:00', 'nope'])
    expect(h.value()).toEqual(['10:00', ''])
    h.api().setValue([])
    expect(h.value()).toEqual([])
  })

  it('表单重置回到 defaultValue，两组段位与浮层选中一并拨回', () => {
    const h = open({ defaultValue: ['09:00', '18:00'] })
    h.api().setValue(['10:00', '11:00'])
    expect(h.segment(0, 'hour').textContent).toBe('10')
    h.reset()
    expect(h.value()).toEqual(['09:00', '18:00'])
    expect(h.segment(0, 'hour').textContent).toBe('09')
    expect(h.segment(1, 'hour').textContent).toBe('18')
  })
})

describe('timeRangePicker 真实退场资源', () => {
  it('逻辑关闭立即失活，Layer 与焦点域等 Presence 完成才释放；中途重开复用原登记', () => {
    const h = mount({ defaultOpen: true }, { withPresence: true })
    mounted.push(h)
    const presence = h.presence!
    const original = h.config.layerRegistry.list()[0]
    expect(original).toBeDefined()

    const leases: ExitLease[] = []
    const stopExit = presence.onBeforeExit(() => {
      leases.push(presence.claimExit(`time-range-picker exit ${leases.length + 1}`))
    })
    h.api().setOpen(false)
    const closing = h.api().getContentProps() as Record<string, unknown>
    expect(closing.inert).toBe(true)
    expect(closing['aria-hidden']).toBe(true)
    expect(h.config.layerRegistry.list()).toEqual([original])
    presence.update(false)
    expect(leases).toHaveLength(1)

    h.api().setOpen(true)
    expect(leases[0]!.settled).toBe(true)
    expect(h.config.layerRegistry.list()).toEqual([original])

    h.api().setOpen(false)
    presence.update(false)
    expect(leases).toHaveLength(2)
    leases[1]!.done()
    expect(h.config.layerRegistry.list()).toHaveLength(0)

    stopExit()
    presence.dispose()
  })
})
