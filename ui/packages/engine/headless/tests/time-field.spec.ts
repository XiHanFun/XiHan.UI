// @vitest-environment jsdom
import type { TimeDraft, TimeFieldSchema, TimeSegmentType } from '../src/time-field'
import { normalizeProps } from '@xihan-ui/kernel'
import { createService } from '@xihan-ui/machine'
import { createVanillaRuntime } from '@xihan-ui/machine/vanilla'
import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  appendSegmentDigit,
  clearTimeSegment,
  connectTimeField,
  cycleTimeSegment,
  dayPeriodLabel,
  draftFromTime,
  emptyTimeDraft,
  formatTimeValue,
  isTimeOutOfRange,
  parseTimeValue,
  resolveHourCycle,
  resolveTimeDraft,
  sameTimeDraft,
  segmentNumber,
  segmentRange,
  setTimeDayPeriod,
  setTimeSegment,
  timeFieldMachine,
  timeSegments,
  timeSegmentText,
  to12Hour,
  to24Hour,
} from '../src/time-field'

type Props = TimeFieldSchema['props']

const ALL_SEGMENTS: TimeSegmentType[] = ['hour', 'minute', 'second', 'dayPeriod']

function draft(hour: number | null, minute: number | null = null, second: number | null = null, dayPeriod: TimeDraft['dayPeriod'] = null): TimeDraft {
  return { hour, minute, second, dayPeriod }
}

// 迷你 spreader：与 WC 侧同语义（事件 addEventListener、布尔属性用 toggleAttribute、
// undefined/null/false 视为撤掉属性）。connect 的产出只有真打到节点上才验得到行为。
const BOOLEAN_ATTRS = new Set(['hidden', 'disabled', 'readonly'])

function applyProps(node: HTMLElement, props: Record<string, unknown>, bound: Map<string, EventListener>): void {
  for (const [key, value] of Object.entries(props)) {
    const isEvent = key.length > 2 && key.startsWith('on') && key[2]! >= 'A' && key[2]! <= 'Z'
    if (isEvent) {
      const name = key.slice(2).toLowerCase()
      const prev = bound.get(name)
      if (prev)
        node.removeEventListener(name, prev)
      if (typeof value === 'function') {
        node.addEventListener(name, value as EventListener)
        bound.set(name, value as EventListener)
      }
      continue
    }
    if (key === 'value') {
      (node as HTMLInputElement).value = String(value ?? '')
      continue
    }
    if (value === undefined || value === null || value === false) {
      node.removeAttribute(key)
      continue
    }
    if (BOOLEAN_ATTRS.has(key)) {
      node.toggleAttribute(key, true)
      continue
    }
    node.setAttribute(key, String(value))
  }
}

interface Mounted {
  root: HTMLElement
  control: HTMLElement
  label: HTMLElement
  hidden: HTMLInputElement
  clear: HTMLButtonElement
  seg: (type: TimeSegmentType) => HTMLElement
  api: () => ReturnType<typeof connectTimeField>
  /** 手动重打一遍。props 是宿主那侧的东西，改了不会触发 cell 通知，得自己推一拍。 */
  rerender: () => void
  destroy: () => void
}

function mount(props: Props = {}): Mounted {
  const runtime = createVanillaRuntime()
  const service = createService(timeFieldMachine, { props: () => props, runtime })
  runtime.start()

  const root = document.createElement('div')
  document.body.appendChild(root)
  const label = document.createElement('label')
  root.appendChild(label)
  const control = document.createElement('div')
  root.appendChild(control)
  const nodes = new Map<TimeSegmentType, HTMLElement>()
  for (const type of ALL_SEGMENTS) {
    const el = document.createElement('span')
    control.appendChild(el)
    nodes.set(type, el)
  }
  const clear = document.createElement('button')
  control.appendChild(clear)
  const hidden = document.createElement('input')
  root.appendChild(hidden)

  const listeners = new Map<HTMLElement, Map<string, EventListener>>()
  const bound = (el: HTMLElement): Map<string, EventListener> => {
    let m = listeners.get(el)
    if (!m) {
      m = new Map()
      listeners.set(el, m)
    }
    return m
  }

  const render = (): void => {
    const api = connectTimeField(service, normalizeProps)
    applyProps(root, api.getRootProps() as Record<string, unknown>, bound(root))
    applyProps(label, api.getLabelProps() as Record<string, unknown>, bound(label))
    applyProps(control, api.getControlProps() as Record<string, unknown>, bound(control))
    for (const [type, el] of nodes) {
      applyProps(el, api.getSegmentProps({ segment: type }) as Record<string, unknown>, bound(el))
      // 两个适配器都由自己填段上的文字（spreader 不碰文本节点），这里照做
      el.textContent = api.getSegmentText({ segment: type })
    }
    applyProps(clear, api.getClearTriggerProps() as Record<string, unknown>, bound(clear))
    applyProps(hidden, api.getHiddenInputProps() as Record<string, unknown>, bound(hidden))
  }
  // 任一 cell 变化就整体重打，与 WC 宿主的 wire() 同语义
  runtime.subscribe(render)
  render()

  return {
    root,
    control,
    label,
    hidden,
    clear,
    seg: type => nodes.get(type)!,
    api: () => connectTimeField(service, normalizeProps),
    rerender: render,
    destroy: () => {
      runtime.stop()
      root.remove()
    },
  }
}

function pressKey(el: HTMLElement, key: string, init: KeyboardEventInit = {}): KeyboardEvent {
  const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true, ...init })
  el.dispatchEvent(event)
  return event
}

function typeDigits(m: Mounted, start: TimeSegmentType, digits: string): void {
  let current = start
  for (const digit of digits) {
    const el = m.seg(current)
    el.focus()
    pressKey(el, digit)
    const active = document.activeElement as HTMLElement | null
    const next = ALL_SEGMENTS.find(t => m.seg(t) === active)
    if (next)
      current = next
  }
}

function texts(m: Mounted): string[] {
  return ALL_SEGMENTS.filter(t => !m.seg(t).hasAttribute('hidden')).map(t => m.seg(t).textContent ?? '')
}

function focusedType(m: Mounted): TimeSegmentType | null {
  return ALL_SEGMENTS.find(t => m.seg(t) === document.activeElement) ?? null
}

const mounted: Mounted[] = []
function open(props: Props = {}): Mounted {
  const m = mount(props)
  mounted.push(m)
  return m
}

afterEach(() => {
  while (mounted.length) mounted.pop()!.destroy()
  document.body.innerHTML = ''
})

describe('12/24 小时换算', () => {
  it('0 点显示 12 AM、12 点显示 12 PM', () => {
    expect(to12Hour(0)).toEqual({ hour: 12, period: 'am' })
    expect(to12Hour(12)).toEqual({ hour: 12, period: 'pm' })
  })

  it('其余小时取 12 的余数并带上下午', () => {
    expect(to12Hour(1)).toEqual({ hour: 1, period: 'am' })
    expect(to12Hour(11)).toEqual({ hour: 11, period: 'am' })
    expect(to12Hour(13)).toEqual({ hour: 1, period: 'pm' })
    expect(to12Hour(23)).toEqual({ hour: 11, period: 'pm' })
  })

  it('越界的小时先回绕再换算', () => {
    expect(to12Hour(24)).toEqual({ hour: 12, period: 'am' })
    expect(to12Hour(25)).toEqual({ hour: 1, period: 'am' })
    expect(to12Hour(-1)).toEqual({ hour: 11, period: 'pm' })
  })

  it('12 → 24：12 AM 是 0 点、12 PM 是 12 点', () => {
    expect(to24Hour(12, 'am')).toBe(0)
    expect(to24Hour(12, 'pm')).toBe(12)
    expect(to24Hour(1, 'am')).toBe(1)
    expect(to24Hour(1, 'pm')).toBe(13)
    expect(to24Hour(11, 'pm')).toBe(23)
  })

  it('0-23 每一个小时都能原样往返', () => {
    for (let h = 0; h < 24; h++) {
      const { hour, period } = to12Hour(h)
      expect(to24Hour(hour, period)).toBe(h)
    }
  })
})

describe('拆解与回填', () => {
  it('parseTimeValue 收 ISO 串，写坏的串返回 null 而不是抛', () => {
    expect(parseTimeValue('13:45')?.hour).toBe(13)
    expect(parseTimeValue('13:45')?.minute).toBe(45)
    expect(parseTimeValue('13:45:30')?.second).toBe(30)
    expect(parseTimeValue('25:00')).toBeNull()
    expect(parseTimeValue('下午一点')).toBeNull()
    expect(parseTimeValue('')).toBeNull()
    expect(parseTimeValue(undefined)).toBeNull()
  })

  it('draftFromTime 拆成逐段值，空时间拆成全空', () => {
    expect(draftFromTime(parseTimeValue('13:45:30'))).toEqual(draft(13, 45, 30))
    expect(draftFromTime(null)).toEqual(emptyTimeDraft())
  })

  it('formatTimeValue 按 granularity 回填，任一必填段为空即空串', () => {
    expect(formatTimeValue(draft(13, 45, 30), 'second')).toBe('13:45:30')
    expect(formatTimeValue(draft(13, 45, 30), 'minute')).toBe('13:45')
    expect(formatTimeValue(draft(9, 5, 3), 'second')).toBe('09:05:03')
    // 只填了小时，精度到分就还不成一个时间
    expect(formatTimeValue(draft(13), 'minute')).toBe('')
    expect(formatTimeValue(draft(13, 45), 'second')).toBe('')
    expect(formatTimeValue(emptyTimeDraft(), 'minute')).toBe('')
  })

  it('精度只到时：分位不必填，但宿主给的分数原样留着，缺省才补 00', () => {
    expect(formatTimeValue(draft(13), 'hour')).toBe('13:00')
    // 用户只改时段，分位不该被悄悄清零
    expect(formatTimeValue(draft(13, 45, 30), 'hour')).toBe('13:45')
  })

  it('串 → 逐段 → 串 原样往返', () => {
    for (const iso of ['00:00', '09:05', '13:45', '23:59']) {
      expect(formatTimeValue(draftFromTime(parseTimeValue(iso)), 'minute')).toBe(iso)
    }
    expect(formatTimeValue(draftFromTime(parseTimeValue('23:59:59')), 'second')).toBe('23:59:59')
  })

  it('resolveTimeDraft：值解析得动就以值为准，否则才用缓冲', () => {
    const buffer = draft(9, null, null, 'pm')
    expect(resolveTimeDraft('13:45', buffer)).toEqual(draft(13, 45, 0))
    expect(resolveTimeDraft('', buffer)).toBe(buffer)
    expect(resolveTimeDraft('坏串', buffer)).toBe(buffer)
  })

  it('sameTimeDraft 逐段比内容', () => {
    expect(sameTimeDraft(draft(1, 2, 3), draft(1, 2, 3))).toBe(true)
    expect(sameTimeDraft(draft(1, 2, 3), draft(1, 2, 4))).toBe(false)
    expect(sameTimeDraft(draft(null, null, null, 'am'), draft(null, null, null, 'pm'))).toBe(false)
    expect(sameTimeDraft(draft(1), undefined)).toBe(false)
  })
})

describe('段的构成与取值域', () => {
  it('timeSegments 随 granularity 与 hourCycle 增减', () => {
    expect(timeSegments('minute', 24)).toEqual(['hour', 'minute'])
    expect(timeSegments('second', 24)).toEqual(['hour', 'minute', 'second'])
    expect(timeSegments('hour', 24)).toEqual(['hour'])
    expect(timeSegments('minute', 12)).toEqual(['hour', 'minute', 'dayPeriod'])
    expect(timeSegments('second', 12)).toEqual(['hour', 'minute', 'second', 'dayPeriod'])
  })

  it('segmentRange：12 小时制的时段是 1-12，24 小时制是 0-23', () => {
    expect(segmentRange('hour', 12)).toEqual({ min: 1, max: 12 })
    expect(segmentRange('hour', 24)).toEqual({ min: 0, max: 23 })
    expect(segmentRange('minute', 24)).toEqual({ min: 0, max: 59 })
    expect(segmentRange('second', 12)).toEqual({ min: 0, max: 59 })
    expect(segmentRange('dayPeriod', 12)).toEqual({ min: 0, max: 1 })
  })

  it('segmentNumber 给的是段上显示的那个数', () => {
    expect(segmentNumber(draft(13, 45), 'hour', 24)).toBe(13)
    expect(segmentNumber(draft(13, 45), 'hour', 12)).toBe(1)
    expect(segmentNumber(draft(0, 45), 'hour', 12)).toBe(12)
    expect(segmentNumber(draft(13, 45), 'dayPeriod', 12)).toBe(1)
    expect(segmentNumber(draft(9, 45), 'dayPeriod', 12)).toBe(0)
    // 小时还没填时上下午看缓冲里记着的那次按键
    expect(segmentNumber(draft(null, null, null, 'pm'), 'dayPeriod', 12)).toBe(1)
    expect(segmentNumber(emptyTimeDraft(), 'dayPeriod', 12)).toBeNull()
    expect(segmentNumber(emptyTimeDraft(), 'hour', 24)).toBeNull()
  })

  it('timeSegmentText：空段是占位串，数字段补零，上下午取语言文字', () => {
    expect(timeSegmentText(draft(9, 5), 'hour')).toBe('09')
    expect(timeSegmentText(draft(13, 5), 'hour', { hourCycle: 12 })).toBe('01')
    expect(timeSegmentText(draft(13, 5), 'minute')).toBe('05')
    expect(timeSegmentText(emptyTimeDraft(), 'hour')).toBe('--')
    expect(timeSegmentText(emptyTimeDraft(), 'hour', { placeholder: 'h' })).toBe('hh')
    expect(timeSegmentText(draft(13), 'dayPeriod', { hourCycle: 12 })).toBe('PM')
    expect(timeSegmentText(draft(9), 'dayPeriod', { hourCycle: 12, locale: 'en-US' })).toBe('AM')
  })
})

describe('段的写入与加减', () => {
  it('setTimeSegment 在 12 小时制下把 1-12 换算回 0-23', () => {
    expect(setTimeSegment(draft(13, 30), 'hour', 3, 12)).toEqual(draft(15, 30))
    expect(setTimeSegment(draft(9, 30), 'hour', 3, 12)).toEqual(draft(3, 30))
    // 小时还空着：按缓冲里记下的上下午算，没有就按上午
    expect(setTimeSegment(emptyTimeDraft(), 'hour', 3, 12)).toEqual(draft(3))
    expect(setTimeSegment(draft(null, null, null, 'pm'), 'hour', 3, 12)).toEqual(draft(15, null, null, 'pm'))
    expect(setTimeSegment(emptyTimeDraft(), 'hour', 12, 12)).toEqual(draft(0))
  })

  it('setTimeSegment 把越界的数夹回区间', () => {
    expect(setTimeSegment(emptyTimeDraft(), 'minute', 99).minute).toBe(59)
    expect(setTimeSegment(emptyTimeDraft(), 'minute', -5).minute).toBe(0)
    expect(setTimeSegment(emptyTimeDraft(), 'hour', 99, 24).hour).toBe(23)
  })

  it('setTimeDayPeriod 换的是小时本身；小时还空着时先记下来', () => {
    expect(setTimeDayPeriod(draft(9, 30), 'pm')).toEqual(draft(21, 30, null, 'pm'))
    expect(setTimeDayPeriod(draft(21, 30), 'am')).toEqual(draft(9, 30, null, 'am'))
    expect(setTimeDayPeriod(draft(0, 30), 'pm')).toEqual(draft(12, 30, null, 'pm'))
    expect(setTimeDayPeriod(emptyTimeDraft(), 'pm')).toEqual(draft(null, null, null, 'pm'))
  })

  it('cycleTimeSegment 到头回绕', () => {
    expect(cycleTimeSegment(draft(23, 0), 'hour', 1, 24).hour).toBe(0)
    expect(cycleTimeSegment(draft(0, 0), 'hour', -1, 24).hour).toBe(23)
    expect(cycleTimeSegment(draft(0, 59), 'minute', 1).minute).toBe(0)
    expect(cycleTimeSegment(draft(0, 0), 'minute', -1).minute).toBe(59)
    expect(cycleTimeSegment(draft(0, 0, 59), 'second', 1).second).toBe(0)
  })

  it('12 小时制下加减时段不跨上下午', () => {
    // 上午 11 点加一格是上午 12 点（0 点），不会跳成下午
    expect(cycleTimeSegment(draft(11, 0), 'hour', 1, 12).hour).toBe(0)
    // 下午 11 点（23）加一格回到下午 12 点（12）
    expect(cycleTimeSegment(draft(23, 0), 'hour', 1, 12).hour).toBe(12)
    expect(cycleTimeSegment(draft(12, 0), 'hour', -1, 12).hour).toBe(23)
  })

  it('空段加减落到该段的边界上', () => {
    expect(cycleTimeSegment(emptyTimeDraft(), 'hour', 1, 24).hour).toBe(0)
    expect(cycleTimeSegment(emptyTimeDraft(), 'hour', -1, 24).hour).toBe(23)
    expect(cycleTimeSegment(emptyTimeDraft(), 'minute', 1).minute).toBe(0)
    expect(cycleTimeSegment(emptyTimeDraft(), 'minute', -1).minute).toBe(59)
    // 12 小时制的时段下界是 1 点、上界是 12 点（也就是 0 点）
    expect(cycleTimeSegment(emptyTimeDraft(), 'hour', 1, 12).hour).toBe(1)
    expect(cycleTimeSegment(emptyTimeDraft(), 'hour', -1, 12).hour).toBe(0)
  })

  it('上下午段的加减就是翻面，空段按方向落到上午/下午', () => {
    expect(cycleTimeSegment(draft(9, 0), 'dayPeriod', 1, 12).hour).toBe(21)
    expect(cycleTimeSegment(draft(21, 0), 'dayPeriod', 1, 12).hour).toBe(9)
    expect(cycleTimeSegment(draft(21, 0), 'dayPeriod', -1, 12).hour).toBe(9)
    expect(cycleTimeSegment(emptyTimeDraft(), 'dayPeriod', 1, 12).dayPeriod).toBe('am')
    expect(cycleTimeSegment(emptyTimeDraft(), 'dayPeriod', -1, 12).dayPeriod).toBe('pm')
  })

  it('清时段时把上下午留下来，别的段各清各的', () => {
    expect(clearTimeSegment(draft(21, 30), 'hour')).toEqual(draft(null, 30, null, 'pm'))
    expect(clearTimeSegment(draft(9, 30), 'hour')).toEqual(draft(null, 30, null, 'am'))
    expect(clearTimeSegment(draft(9, 30), 'minute')).toEqual(draft(9, null))
    expect(clearTimeSegment(draft(9, 30, 15), 'second')).toEqual(draft(9, 30, null))
    // 小时还在时单清上下午没有意义（它是小时的一部分），原样返回
    expect(clearTimeSegment(draft(21, 30), 'dayPeriod')).toEqual(draft(21, 30))
    expect(clearTimeSegment(draft(null, 30, null, 'pm'), 'dayPeriod')).toEqual(draft(null, 30))
  })
})

describe('数字直输', () => {
  const hour24 = { min: 0, max: 23 }
  const hour12 = { min: 1, max: 12 }
  const minute = { min: 0, max: 59 }

  it('一位就填满的（再吃一位必越界）当场收工', () => {
    expect(appendSegmentDigit('', '6', minute)).toEqual({ value: 6, buffer: '', done: true })
    expect(appendSegmentDigit('', '3', hour24)).toEqual({ value: 3, buffer: '', done: true })
  })

  it('还能吃第二位的先记着不收工', () => {
    expect(appendSegmentDigit('', '2', hour24)).toEqual({ value: 2, buffer: '2', done: false })
    expect(appendSegmentDigit('2', '3', hour24)).toEqual({ value: 23, buffer: '', done: true })
    expect(appendSegmentDigit('', '5', minute)).toEqual({ value: 5, buffer: '5', done: false })
    expect(appendSegmentDigit('5', '9', minute)).toEqual({ value: 59, buffer: '', done: true })
  })

  it('拼上去越界就另起一段，不把整串作废', () => {
    // 时段先敲 2 再敲 5：25 填不进去，落到的是 5
    expect(appendSegmentDigit('2', '5', hour24)).toEqual({ value: 5, buffer: '', done: true })
    expect(appendSegmentDigit('1', '5', hour12)).toEqual({ value: 5, buffer: '', done: true })
  })

  it('还不到下界时只记着不落值（12 小时制敲 0 等第二位）', () => {
    expect(appendSegmentDigit('', '0', hour12)).toEqual({ value: null, buffer: '0', done: false })
    expect(appendSegmentDigit('0', '9', hour12)).toEqual({ value: 9, buffer: '', done: true })
    // 24 小时制的下界是 0，同一个 0 是个合法值
    expect(appendSegmentDigit('', '0', hour24)).toEqual({ value: 0, buffer: '0', done: false })
  })

  it('宽度用满即收工', () => {
    expect(appendSegmentDigit('0', '0', minute)).toEqual({ value: 0, buffer: '', done: true })
    expect(appendSegmentDigit('1', '2', hour12)).toEqual({ value: 12, buffer: '', done: true })
  })
})

describe('小时制推断与上下午文字', () => {
  it('prop 说了算', () => {
    expect(resolveHourCycle(12, 'de-DE')).toBe(12)
    expect(resolveHourCycle(24, 'en-US')).toBe(24)
  })

  it('prop 没给就问 locale，locale 也没有就用 24', () => {
    expect(resolveHourCycle(undefined, 'en-US')).toBe(12)
    expect(resolveHourCycle(undefined, 'de-DE')).toBe(24)
    expect(resolveHourCycle(undefined, undefined)).toBe(24)
    // 认不出的 locale 不该把组件带崩
    expect(resolveHourCycle(undefined, '这不是一个语言标记')).toBe(24)
  })

  it('没给 locale 时上下午恒为 AM/PM，不落到运行环境的默认语言', () => {
    expect(dayPeriodLabel('am')).toBe('AM')
    expect(dayPeriodLabel('pm')).toBe('PM')
    expect(dayPeriodLabel('am', 'en-US')).toBe('AM')
    expect(dayPeriodLabel('pm', '这不是一个语言标记')).toBe('PM')
  })
})

describe('越界标注', () => {
  it('只在填全之后判，且不改写值', () => {
    expect(isTimeOutOfRange('08:00', '09:00', '18:00')).toBe(true)
    expect(isTimeOutOfRange('19:00', '09:00', '18:00')).toBe(true)
    expect(isTimeOutOfRange('09:00', '09:00', '18:00')).toBe(false)
    expect(isTimeOutOfRange('18:00', '09:00', '18:00')).toBe(false)
    expect(isTimeOutOfRange('', '09:00', '18:00')).toBe(false)
    expect(isTimeOutOfRange('08:00')).toBe(false)
    expect(isTimeOutOfRange('08:00', undefined, '18:00')).toBe(false)
  })
})

describe('timeFieldMachine', () => {
  function service(props: Props = {}) {
    const runtime = createVanillaRuntime()
    const s = createService(timeFieldMachine, { props: () => props, runtime })
    runtime.start()
    return s
  }

  it('vALUE.SET 按 granularity 收窄，写坏的串等同清空', () => {
    const s = service({ granularity: 'minute' })
    s.send({ type: 'VALUE.SET', value: '13:45:30' })
    expect(s.context.get('value')).toBe('13:45')
    s.send({ type: 'VALUE.SET', value: '坏串' })
    expect(s.context.get('value')).toBe('')
    expect(s.context.get('draft')).toEqual(emptyTimeDraft())
  })

  it('逐段填满才产出值，中途是空串', () => {
    const onValueChange = vi.fn()
    const s = service({ onValueChange })
    s.send({ type: 'SEGMENT.STEP', segment: 'hour', delta: 1 })
    expect(s.context.get('value')).toBe('')
    expect(s.context.get('draft').hour).toBe(0)
    expect(onValueChange).not.toHaveBeenCalled()
    s.send({ type: 'SEGMENT.STEP', segment: 'minute', delta: -1 })
    expect(s.context.get('value')).toBe('00:59')
    expect(onValueChange).toHaveBeenCalledTimes(1)
    expect(onValueChange).toHaveBeenCalledWith({ value: '00:59' })
  })

  it('清掉一段会把值退回空串，且只通知一次', () => {
    const onValueChange = vi.fn()
    const s = service({ defaultValue: '13:45', onValueChange })
    s.send({ type: 'SEGMENT.CLEAR', segment: 'minute' })
    expect(s.context.get('value')).toBe('')
    expect(s.context.get('draft')).toEqual(draft(13, null, 0))
    expect(onValueChange).toHaveBeenCalledTimes(1)
    // 同一段再清一次：值本来就没了，不该再报一遍
    s.send({ type: 'SEGMENT.CLEAR', segment: 'minute' })
    expect(onValueChange).toHaveBeenCalledTimes(1)
  })

  it('数字直输逐位并进当前段', () => {
    const s = service({ granularity: 'minute' })
    s.send({ type: 'SEGMENT.FOCUS', segment: 'hour' })
    s.send({ type: 'SEGMENT.DIGIT', segment: 'hour', digit: '1' })
    expect(s.context.get('draft').hour).toBe(1)
    expect(s.context.get('typeBuffer')).toBe('1')
    s.send({ type: 'SEGMENT.DIGIT', segment: 'hour', digit: '3' })
    expect(s.context.get('draft').hour).toBe(13)
    expect(s.context.get('typeBuffer')).toBe('')
  })

  it('换段会把敲了一半的数字缓冲清掉', () => {
    const s = service()
    s.send({ type: 'SEGMENT.FOCUS', segment: 'hour' })
    s.send({ type: 'SEGMENT.DIGIT', segment: 'hour', digit: '1' })
    expect(s.context.get('typeBuffer')).toBe('1')
    s.send({ type: 'SEGMENT.FOCUS', segment: 'minute' })
    expect(s.context.get('typeBuffer')).toBe('')
    // 上一段留下的 1 若续了过来，这里会得到 15 而不是 5
    s.send({ type: 'SEGMENT.DIGIT', segment: 'minute', digit: '5' })
    expect(s.context.get('draft').minute).toBe(5)
  })

  it('12 小时制：先按 P 再填小时，落存的是下午', () => {
    const s = service({ hourCycle: 12, granularity: 'minute' })
    s.send({ type: 'SEGMENT.PERIOD', period: 'pm' })
    expect(s.context.get('draft').dayPeriod).toBe('pm')
    s.send({ type: 'SEGMENT.DIGIT', segment: 'hour', digit: '3' })
    expect(s.context.get('draft').hour).toBe(15)
  })

  it('disabled 与 readOnly 都推不动值', () => {
    for (const props of [{ disabled: true }, { readOnly: true }]) {
      const s = service({ defaultValue: '13:45', ...props })
      s.send({ type: 'SEGMENT.STEP', segment: 'hour', delta: 1 })
      s.send({ type: 'SEGMENT.CLEAR', segment: 'minute' })
      s.send({ type: 'SEGMENT.DIGIT', segment: 'hour', digit: '9' })
      s.send({ type: 'VALUE.CLEAR' })
      expect(s.context.get('value')).toBe('13:45')
    }
  })

  it('受控 value：内部不自改，仍照发 onValueChange', () => {
    const onValueChange = vi.fn()
    const s = service({ value: '13:45', onValueChange })
    s.send({ type: 'SEGMENT.STEP', segment: 'hour', delta: 1 })
    expect(s.context.get('value')).toBe('13:45')
    expect(onValueChange).toHaveBeenCalledWith({ value: '14:45' })
  })

  it('受控且宿主不写回时，下一次加减仍从宿主那份值起步', () => {
    const onValueChange = vi.fn()
    const s = service({ value: '13:45', onValueChange })
    s.send({ type: 'SEGMENT.STEP', segment: 'hour', delta: 1 })
    s.send({ type: 'SEGMENT.STEP', segment: 'hour', delta: 1 })
    // 缓冲里虽然留着 14:45，但显示与编辑都以 value 为准，两次都该报 14:45
    expect(onValueChange).toHaveBeenNthCalledWith(2, { value: '14:45' })
  })

  it('宿主从外面改 value：缓冲跟着拨过去', () => {
    let value = '13:45'
    const runtime = createVanillaRuntime()
    const s = createService(timeFieldMachine, { props: () => ({ value }), runtime })
    runtime.start()
    expect(s.context.get('draft')).toEqual(draft(13, 45, 0))
    value = '09:05'
    // 受控值是宿主从外面换掉的，不经过 cell 的 set；推一拍全局冲刷让 track 去拉取比对
    runtime.signal(0).set(1)
    expect(s.context.get('draft')).toEqual(draft(9, 5, 0))
  })

  it('填了一半时不会被 syncDraft 抹掉（值是空串，缓冲说了算）', () => {
    const s = service({ granularity: 'minute' })
    s.send({ type: 'SEGMENT.DIGIT', segment: 'hour', digit: '9' })
    expect(s.context.get('value')).toBe('')
    expect(s.context.get('draft').hour).toBe(9)
    s.send({ type: 'SEGMENT.DIGIT', segment: 'minute', digit: '5' })
    expect(s.context.get('draft').hour).toBe(9)
  })
})

describe('connectTimeField 属性输出', () => {
  it('control 是 group 并由 label 命名，段是 spinbutton', () => {
    const m = open({ defaultValue: '13:45' })
    const api = m.api()
    const label = api.getLabelProps() as Record<string, unknown>
    expect(m.control.getAttribute('role')).toBe('group')
    expect(m.control.getAttribute('aria-labelledby')).toBe(label.id)
    expect(m.seg('hour').getAttribute('role')).toBe('spinbutton')
    expect(m.seg('hour').getAttribute('aria-label')).toBe('hour')
    expect(m.seg('hour').getAttribute('data-value')).toBe('hour')
  })

  it('aria 布尔一律显式写出，不省略', () => {
    const m = open()
    for (const el of [m.control, m.seg('hour')]) {
      expect(el.getAttribute('aria-disabled')).toBe('false')
      expect(el.getAttribute('aria-invalid')).toBe('false')
    }
    expect(m.seg('hour').getAttribute('aria-readonly')).toBe('false')
    expect(m.seg('hour').getAttribute('aria-required')).toBe('false')
  })

  it('group 只带全局属性，只读与必填落在段上', () => {
    const m = open({ readOnly: true, required: true })
    expect(m.control.hasAttribute('aria-readonly')).toBe(false)
    expect(m.control.hasAttribute('aria-required')).toBe(false)
    expect(m.seg('hour').getAttribute('aria-readonly')).toBe('true')
    expect(m.seg('hour').getAttribute('aria-required')).toBe('true')
  })

  it('段上带取值域；空段不写 aria-valuenow', () => {
    const m = open({ defaultValue: '13:45' })
    expect(m.seg('hour').getAttribute('aria-valuemin')).toBe('0')
    expect(m.seg('hour').getAttribute('aria-valuemax')).toBe('23')
    expect(m.seg('hour').getAttribute('aria-valuenow')).toBe('13')
    expect(m.seg('hour').getAttribute('aria-valuetext')).toBe('13')
    const empty = open()
    expect(empty.seg('hour').hasAttribute('aria-valuenow')).toBe(false)
    expect(empty.seg('hour').getAttribute('aria-valuetext')).toBe('--')
    expect(empty.seg('hour').getAttribute('data-placeholder')).toBe('')
  })

  it('granularity 决定哪些段显示，收起的段带 hidden 且不占 Tab 位', () => {
    const m = open({ granularity: 'minute' })
    expect(m.seg('hour').hasAttribute('hidden')).toBe(false)
    expect(m.seg('minute').hasAttribute('hidden')).toBe(false)
    expect(m.seg('second').hasAttribute('hidden')).toBe(true)
    expect(m.seg('second').hasAttribute('tabindex')).toBe(false)
    expect(m.seg('dayPeriod').hasAttribute('hidden')).toBe(true)
    expect(open({ granularity: 'second' }).seg('second').hasAttribute('hidden')).toBe(false)
    expect(open({ granularity: 'hour' }).seg('minute').hasAttribute('hidden')).toBe(true)
  })

  it('12 小时制多出上下午段，时段显示 1-12', () => {
    const m = open({ hourCycle: 12, defaultValue: '13:45' })
    expect(m.seg('dayPeriod').hasAttribute('hidden')).toBe(false)
    expect(m.api().segments).toEqual(['hour', 'minute', 'dayPeriod'])
    expect(texts(m)).toEqual(['01', '45', 'PM'])
    expect(m.seg('hour').getAttribute('aria-valuemin')).toBe('1')
    expect(m.seg('hour').getAttribute('aria-valuemax')).toBe('12')
    expect(m.seg('dayPeriod').getAttribute('aria-valuenow')).toBe('1')
  })

  it('0 点在 12 小时制显示 12 AM、12 点显示 12 PM', () => {
    expect(texts(open({ hourCycle: 12, defaultValue: '00:30' }))).toEqual(['12', '30', 'AM'])
    expect(texts(open({ hourCycle: 12, defaultValue: '12:30' }))).toEqual(['12', '30', 'PM'])
  })

  it('locale 没给 hourCycle 时决定小时制与上下午文字', () => {
    expect(open({ locale: 'en-US' }).api().hourCycle).toBe(12)
    expect(open({ locale: 'de-DE' }).api().hourCycle).toBe(24)
    expect(open({ locale: 'en-US', defaultValue: '13:30' }).seg('dayPeriod').textContent).toBe('PM')
  })

  it('roving tabindex：整组只占一个 Tab 位，锚点跟焦点走', () => {
    const m = open({ granularity: 'second' })
    expect(m.seg('hour').getAttribute('tabindex')).toBe('0')
    expect(m.seg('minute').getAttribute('tabindex')).toBe('-1')
    m.seg('minute').focus()
    expect(m.seg('minute').getAttribute('tabindex')).toBe('0')
    expect(m.seg('hour').getAttribute('tabindex')).toBe('-1')
    expect(m.seg('minute').getAttribute('data-focus')).toBe('')
  })

  it('焦点记着的那一段被收起时锚点退回首段（不然整组一个 Tab 位都没有）', () => {
    const props: Props = { granularity: 'second' }
    const m = open(props)
    m.seg('second').focus()
    expect(m.seg('second').getAttribute('tabindex')).toBe('0')
    // 精度调小，秒段收起；焦点却还记在秒段上。锚点若跟着它走，整组就一个 Tab 位都没有了
    props.granularity = 'minute'
    m.rerender()
    expect(m.api().focusedSegment).toBe('second')
    expect(m.seg('second').hasAttribute('hidden')).toBe(true)
    expect(m.seg('second').hasAttribute('tabindex')).toBe(false)
    expect(m.seg('hour').getAttribute('tabindex')).toBe('0')
  })

  it('disabled：整组退出 Tab 序列，隐藏输入不参与提交', () => {
    const m = open({ defaultValue: '13:45', disabled: true, name: 'start' })
    expect(m.seg('hour').hasAttribute('tabindex')).toBe(false)
    expect(m.seg('hour').getAttribute('aria-disabled')).toBe('true')
    expect(m.root.getAttribute('data-disabled')).toBe('')
    expect(m.hidden.hasAttribute('disabled')).toBe(true)
  })

  it('readOnly：仍占 Tab 位、仍可在段间走，只是改不动', () => {
    const m = open({ defaultValue: '13:45', readOnly: true })
    expect(m.seg('hour').getAttribute('tabindex')).toBe('0')
    expect(m.seg('hour').getAttribute('aria-readonly')).toBe('true')
    m.seg('hour').focus()
    pressKey(m.seg('hour'), 'ArrowRight')
    expect(focusedType(m)).toBe('minute')
    pressKey(m.seg('minute'), 'ArrowUp')
    expect(m.api().value).toBe('13:45')
  })

  it('隐藏输入承载 ISO 串', () => {
    const m = open({ defaultValue: '13:45', name: 'start' })
    expect(m.hidden.getAttribute('type')).toBe('hidden')
    expect(m.hidden.getAttribute('name')).toBe('start')
    expect(m.hidden.value).toBe('13:45')
    expect(open({ defaultValue: '13:45' }).hidden.hasAttribute('name')).toBe(false)
  })

  it('min/max 越界只做标注，不改写值', () => {
    const m = open({ defaultValue: '08:00', min: '09:00', max: '18:00' })
    expect(m.api().value).toBe('08:00')
    expect(m.api().outOfRange).toBe(true)
    expect(m.root.getAttribute('data-out-of-range')).toBe('')
    expect(m.root.getAttribute('data-invalid')).toBe('')
    expect(m.seg('hour').getAttribute('aria-invalid')).toBe('true')
    const ok = open({ defaultValue: '10:00', min: '09:00', max: '18:00' })
    expect(ok.root.hasAttribute('data-out-of-range')).toBe(false)
    expect(ok.seg('hour').getAttribute('aria-invalid')).toBe('false')
  })

  it('data-empty 随"填全了没有"翻转', () => {
    const m = open({ granularity: 'minute' })
    expect(m.root.getAttribute('data-empty')).toBe('')
    m.seg('hour').focus()
    pressKey(m.seg('hour'), 'ArrowUp')
    // 只填了小时还不成一个时间
    expect(m.root.getAttribute('data-empty')).toBe('')
    m.seg('minute').focus()
    pressKey(m.seg('minute'), 'ArrowUp')
    expect(m.root.hasAttribute('data-empty')).toBe(false)
    expect(m.hidden.value).toBe('00:00')
  })
})

describe('connectTimeField 键盘', () => {
  it('上下键加减本段并拦下默认行为', () => {
    const m = open({ defaultValue: '13:45' })
    m.seg('hour').focus()
    const up = pressKey(m.seg('hour'), 'ArrowUp')
    expect(up.defaultPrevented).toBe(true)
    expect(m.api().value).toBe('14:45')
    pressKey(m.seg('hour'), 'ArrowDown')
    expect(m.api().value).toBe('13:45')
    m.seg('minute').focus()
    pressKey(m.seg('minute'), 'ArrowDown')
    expect(m.api().value).toBe('13:44')
  })

  it('加减到头回绕', () => {
    const m = open({ defaultValue: '23:59' })
    m.seg('hour').focus()
    pressKey(m.seg('hour'), 'ArrowUp')
    expect(m.api().value).toBe('00:59')
    m.seg('minute').focus()
    pressKey(m.seg('minute'), 'ArrowUp')
    expect(m.api().value).toBe('00:00')
  })

  it('左右键换段，两端停住不回绕', () => {
    const m = open({ granularity: 'second', defaultValue: '13:45:30' })
    m.seg('hour').focus()
    const left = pressKey(m.seg('hour'), 'ArrowLeft')
    expect(left.defaultPrevented).toBe(true)
    expect(focusedType(m)).toBe('hour')
    pressKey(m.seg('hour'), 'ArrowRight')
    expect(focusedType(m)).toBe('minute')
    pressKey(m.seg('minute'), 'ArrowRight')
    expect(focusedType(m)).toBe('second')
    // 末段再往右停住
    pressKey(m.seg('second'), 'ArrowRight')
    expect(focusedType(m)).toBe('second')
    pressKey(m.seg('second'), 'ArrowLeft')
    expect(focusedType(m)).toBe('minute')
  })

  it('换段跳过被收起的段', () => {
    const m = open({ granularity: 'minute', hourCycle: 12 })
    m.seg('hour').focus()
    pressKey(m.seg('hour'), 'ArrowRight')
    expect(focusedType(m)).toBe('minute')
    // 秒段收起了，下一站是上下午段
    pressKey(m.seg('minute'), 'ArrowRight')
    expect(focusedType(m)).toBe('dayPeriod')
  })

  it('home / End 到首末段', () => {
    const m = open({ granularity: 'second' })
    m.seg('minute').focus()
    pressKey(m.seg('minute'), 'End')
    expect(focusedType(m)).toBe('second')
    pressKey(m.seg('second'), 'Home')
    expect(focusedType(m)).toBe('hour')
  })

  it('数字直输：填满本段自动跳下一段', () => {
    const m = open({ granularity: 'minute' })
    typeDigits(m, 'hour', '13')
    expect(focusedType(m)).toBe('minute')
    typeDigits(m, 'minute', '45')
    expect(m.api().value).toBe('13:45')
    expect(texts(m)).toEqual(['13', '45'])
  })

  it('一位就填满的数字当场跳段', () => {
    const m = open({ granularity: 'minute' })
    m.seg('hour').focus()
    pressKey(m.seg('hour'), '5')
    expect(m.seg('hour').textContent).toBe('05')
    expect(focusedType(m)).toBe('minute')
  })

  it('拼上去越界的第二位另起一段，不留下填不进去的数', () => {
    const m = open({ granularity: 'minute' })
    m.seg('hour').focus()
    pressKey(m.seg('hour'), '2')
    expect(m.seg('hour').textContent).toBe('02')
    pressKey(m.seg('hour'), '5')
    expect(m.seg('hour').textContent).toBe('05')
    expect(focusedType(m)).toBe('minute')
  })

  it('12 小时制敲 0 先不落值，凑成 09 才落', () => {
    const m = open({ hourCycle: 12, granularity: 'minute' })
    m.seg('hour').focus()
    pressKey(m.seg('hour'), '0')
    expect(m.seg('hour').textContent).toBe('--')
    pressKey(m.seg('hour'), '9')
    expect(m.seg('hour').textContent).toBe('09')
    expect(focusedType(m)).toBe('minute')
  })

  it('backspace 清掉本段，焦点不动', () => {
    const m = open({ defaultValue: '13:45' })
    m.seg('minute').focus()
    const event = pressKey(m.seg('minute'), 'Backspace')
    expect(event.defaultPrevented).toBe(true)
    expect(texts(m)).toEqual(['13', '--'])
    expect(m.api().value).toBe('')
    expect(focusedType(m)).toBe('minute')
  })

  it('delete 与 Backspace 同义', () => {
    const m = open({ defaultValue: '13:45' })
    m.seg('hour').focus()
    pressKey(m.seg('hour'), 'Delete')
    expect(texts(m)).toEqual(['--', '45'])
  })

  it('12 小时制：a / p 切上下午，上下键翻面', () => {
    const m = open({ hourCycle: 12, defaultValue: '09:30' })
    m.seg('dayPeriod').focus()
    expect(m.seg('dayPeriod').textContent).toBe('AM')
    const event = pressKey(m.seg('dayPeriod'), 'p')
    expect(event.defaultPrevented).toBe(true)
    expect(m.api().value).toBe('21:30')
    expect(m.seg('dayPeriod').textContent).toBe('PM')
    pressKey(m.seg('dayPeriod'), 'A')
    expect(m.api().value).toBe('09:30')
    pressKey(m.seg('dayPeriod'), 'ArrowUp')
    expect(m.api().value).toBe('21:30')
    pressKey(m.seg('dayPeriod'), 'ArrowDown')
    expect(m.api().value).toBe('09:30')
  })

  it('a / p 只在上下午段上起作用', () => {
    const m = open({ hourCycle: 12, defaultValue: '09:30' })
    m.seg('hour').focus()
    const event = pressKey(m.seg('hour'), 'p')
    expect(event.defaultPrevented).toBe(false)
    expect(m.api().value).toBe('09:30')
  })

  it('带 Ctrl/Meta 的组合不被吞掉', () => {
    const m = open({ defaultValue: '13:45' })
    m.seg('hour').focus()
    const event = pressKey(m.seg('hour'), 'ArrowUp', { ctrlKey: true })
    expect(event.defaultPrevented).toBe(false)
    expect(m.api().value).toBe('13:45')
  })

  it('不归时间框管的键一律放行', () => {
    const m = open({ defaultValue: '13:45' })
    m.seg('hour').focus()
    for (const key of ['Enter', 'Escape', 'Tab', 'x']) {
      const event = pressKey(m.seg('hour'), key)
      expect(event.defaultPrevented).toBe(false)
    }
    expect(m.api().value).toBe('13:45')
  })

  it('disabled 下直接派键也推不动值、也不换段', () => {
    // 禁用时段上没有 tabindex，焦点根本落不进去；只有直接派发才碰得到守卫
    const m = open({ defaultValue: '13:45', disabled: true })
    pressKey(m.seg('hour'), 'ArrowUp')
    pressKey(m.seg('hour'), 'Backspace')
    pressKey(m.seg('hour'), '9')
    pressKey(m.seg('hour'), 'ArrowRight')
    expect(m.api().value).toBe('13:45')
    expect(focusedType(m)).toBeNull()
  })

  it('别的段迟到的失焦不会把当前锚点抹掉', () => {
    const m = open({ granularity: 'second' })
    m.seg('minute').focus()
    // 焦点已经落在分段，秒段再补派一次 blur：浏览器换焦点时两条事件的先后并不总如愿
    m.seg('second').dispatchEvent(new FocusEvent('blur'))
    expect(m.api().focusedSegment).toBe('minute')
    expect(m.seg('minute').getAttribute('data-focus')).toBe('')
  })

  it('点标题落到第一段（段不是能被 label for 指向的原生控件）', () => {
    const m = open({ granularity: 'minute' })
    m.label.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    expect(focusedType(m)).toBe('hour')
  })

  it('禁用时点标题不抢焦点', () => {
    const m = open({ disabled: true })
    m.label.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    expect(focusedType(m)).toBeNull()
  })
})

describe('connectTimeField 受控与命令式出口', () => {
  it('受控 value：宿主不写回则界面纹丝不动，回调照发', () => {
    const onValueChange = vi.fn()
    const m = open({ value: '13:45', onValueChange })
    m.seg('hour').focus()
    pressKey(m.seg('hour'), 'ArrowUp')
    expect(texts(m)).toEqual(['13', '45'])
    expect(m.hidden.value).toBe('13:45')
    expect(onValueChange).toHaveBeenCalledWith({ value: '14:45' })
  })

  it('setValue / clear 走同一条写入口', () => {
    const m = open({ granularity: 'minute' })
    m.api().setValue('13:45')
    expect(texts(m)).toEqual(['13', '45'])
    expect(m.hidden.value).toBe('13:45')
    m.api().clear()
    expect(texts(m)).toEqual(['--', '--'])
    expect(m.api().empty).toBe(true)
  })

  it('清空钮：没值收起，有值显形且不占 Tab 位、不对读屏隐藏', () => {
    const m = open({ granularity: 'minute' })
    expect(m.clear.hasAttribute('hidden')).toBe(true)
    expect(m.api().canClear).toBe(false)
    m.api().setValue('13:45')
    expect(m.clear.hasAttribute('hidden')).toBe(false)
    expect(m.clear.getAttribute('tabindex')).toBe('-1')
    expect(m.clear.hasAttribute('aria-hidden')).toBe(false)
    expect(m.clear.hasAttribute('disabled')).toBe(false)
    expect(m.clear.getAttribute('aria-label')).toBe('Clear')
    expect(m.api().canClear).toBe(true)
  })

  it('清空钮：aria-label 走 translations.clearTrigger', () => {
    const m = open({
      defaultValue: '13:45',
      translations: { hour: '时', minute: '分', second: '秒', dayPeriod: '上下午', clearTrigger: '清空' },
    })
    expect(m.clear.getAttribute('aria-label')).toBe('清空')
  })

  it('清空钮：disabled / readOnly 下即使有值也收起', () => {
    expect(open({ defaultValue: '13:45', disabled: true }).clear.hasAttribute('hidden')).toBe(true)
    expect(open({ defaultValue: '13:45', readOnly: true }).clear.hasAttribute('hidden')).toBe(true)
  })

  it('清空钮：点一下清空全部段，焦点回到第一段', () => {
    const onValueChange = vi.fn()
    const m = open({ defaultValue: '13:45', granularity: 'minute', onValueChange })
    m.seg('minute').focus()
    m.clear.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    expect(m.api().value).toBe('')
    expect(texts(m)).toEqual(['--', '--'])
    expect(onValueChange).toHaveBeenCalledWith({ value: '' })
    expect(focusedType(m)).toBe('hour')
    expect(m.clear.hasAttribute('hidden')).toBe(true)
  })

  it('清空钮：主键按下被拦住，焦点不会从段上被夺走', () => {
    const m = open({ defaultValue: '13:45' })
    const down = new PointerEvent('pointerdown', { button: 0, bubbles: true, cancelable: true })
    m.clear.dispatchEvent(down)
    expect(down.defaultPrevented).toBe(true)
    const right = new PointerEvent('pointerdown', { button: 2, bubbles: true, cancelable: true })
    m.clear.dispatchEvent(right)
    expect(right.defaultPrevented).toBe(false)
  })

  it('getSegmentText 与段上的文字是同一份（两个适配器都拿它填文本）', () => {
    const m = open({ hourCycle: 12, defaultValue: '13:45' })
    const api = m.api()
    for (const type of ['hour', 'minute', 'dayPeriod'] as TimeSegmentType[])
      expect(m.seg(type).textContent).toBe(api.getSegmentText({ segment: type }))
  })
})
