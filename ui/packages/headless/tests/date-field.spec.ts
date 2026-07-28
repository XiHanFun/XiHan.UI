// @vitest-environment jsdom
import type { DateFieldSchema } from '../src/date-field'
import { today } from '@internationalized/date'
import { normalizeProps } from '@xihan-ui/core'
import { createService } from '@xihan-ui/machine'
import { createVanillaRuntime } from '@xihan-ui/machine/vanilla'
import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  applySegmentDigit,
  compareDateSegments,
  connectDateField,
  constrainSegments,
  dateFieldMachine,
  dateSegmentOrder,
  dateSegmentRange,
  dateSegmentText,
  granularitySegments,
  localeDateOrder,
  parseBoundary,
  parseIsoSegments,
  resolveTwoDigitYear,
  sameSegments,
  segmentsToIso,
  stepSegment,
  toValueString,
  wrapSegment,
} from '../src/date-field'

type Props = DateFieldSchema['props']

/** 作者最多写这么多段位节点；精度用不上的那几个由连接层收起。 */
const SEGMENT_NODES = 6

// 迷你 spreader：与 WC 侧同语义（事件 addEventListener、value 走 property、
// undefined/null/false 视为撤掉属性）。connect 的产出只有真打到节点上才验得到行为。
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
      else {
        bound.delete(name)
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
    node.setAttribute(key, value === true ? '' : String(value))
  }
}

interface Mounted {
  root: HTMLElement
  label: HTMLElement
  control: HTMLElement
  seg: HTMLElement[]
  hidden: HTMLInputElement
  api: () => ReturnType<typeof connectDateField>
  setProps: (next: Props) => void
  destroy: () => void
}

function mount(initial: Props = {}): Mounted {
  const runtime = createVanillaRuntime()
  // props 挂在 signal 上：受控回写要靠 watch 里的 track 复查，
  // 而 track 只在有值真的变过时才跑——直接改一个普通对象，宿主的写回会被静默吞掉
  const props = runtime.signal<Props>({ ...initial })
  const service = createService(dateFieldMachine, { props: () => props.get(), runtime })
  runtime.start()

  const root = document.createElement('div')
  document.body.appendChild(root)
  const label = document.createElement('span')
  root.appendChild(label)
  const control = document.createElement('div')
  root.appendChild(control)
  const seg: HTMLElement[] = []
  for (let i = 0; i < SEGMENT_NODES; i++) {
    const el = document.createElement('div')
    control.appendChild(el)
    seg.push(el)
  }
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
    const api = connectDateField(service, normalizeProps)
    applyProps(root, api.getRootProps() as Record<string, unknown>, bound(root))
    applyProps(label, api.getLabelProps() as Record<string, unknown>, bound(label))
    applyProps(control, api.getControlProps() as Record<string, unknown>, bound(control))
    seg.forEach((el, index) => {
      applyProps(el, api.getSegmentProps({ index }) as Record<string, unknown>, bound(el))
      // 段位的文字由适配器写（WC 侧 wire 里写 textContent，Vue 侧渲染文本子节点）
      el.textContent = api.segments[index]?.text ?? ''
    })
    applyProps(hidden, api.getHiddenInputProps() as Record<string, unknown>, bound(hidden))
  }
  runtime.subscribe(render)
  render()

  return {
    root,
    label,
    control,
    seg,
    hidden,
    api: () => connectDateField(service, normalizeProps),
    setProps: next => props.set({ ...props.get(), ...next }),
    destroy: () => {
      runtime.stop()
      root.remove()
    },
  }
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

function pressKey(el: HTMLElement, key: string, init: KeyboardEventInit = {}): KeyboardEvent {
  const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true, ...init })
  el.dispatchEvent(event)
  return event
}

/** 段序在按键之间会变（焦点移动导致重渲），每一下都要重新问当下焦点在哪个节点上。 */
function typeDigits(m: Mounted, from: number, digits: string): void {
  m.seg[from]!.focus()
  for (const digit of digits) {
    const active = (document.activeElement as HTMLElement | null) ?? m.seg[from]!
    pressKey(active, digit)
  }
}

function focusedIndex(m: Mounted): number {
  return m.seg.findIndex(el => el === document.activeElement)
}

function texts(m: Mounted): string[] {
  return m.seg.map(el => el.textContent ?? '')
}

function kinds(m: Mounted): (string | null)[] {
  return m.seg.map(el => el.getAttribute('data-segment'))
}

describe('段序：locale 决定年月日的先后，granularity 决定一共几段', () => {
  it('localeDateOrder 按 locale 排年月日', () => {
    expect(localeDateOrder('zh-CN')).toEqual(['year', 'month', 'day'])
    expect(localeDateOrder('ja-JP')).toEqual(['year', 'month', 'day'])
    expect(localeDateOrder('en-US')).toEqual(['month', 'day', 'year'])
    expect(localeDateOrder('de-DE')).toEqual(['day', 'month', 'year'])
    expect(localeDateOrder('en-GB')).toEqual(['day', 'month', 'year'])
  })

  it('语言标记写坏了退回年月日，不让整个组件塌掉', () => {
    expect(localeDateOrder('这不是语言标记')).toEqual(['year', 'month', 'day'])
  })

  it('dateSegmentOrder 把时间段按精度追加在日期三段之后', () => {
    expect(dateSegmentOrder('zh-CN', 'day')).toEqual(['year', 'month', 'day'])
    expect(dateSegmentOrder('zh-CN', 'hour')).toEqual(['year', 'month', 'day', 'hour'])
    expect(dateSegmentOrder('en-US', 'minute')).toEqual(['month', 'day', 'year', 'hour', 'minute'])
    expect(dateSegmentOrder('en-US', 'second')).toEqual(['month', 'day', 'year', 'hour', 'minute', 'second'])
  })

  it('granularitySegments 给出必须填齐的段（与顺序无关）', () => {
    expect(granularitySegments('day')).toEqual(['year', 'month', 'day'])
    expect(granularitySegments('minute')).toEqual(['year', 'month', 'day', 'hour', 'minute'])
  })
})

describe('iSO 串与段位互转', () => {
  it('parseIsoSegments 只留该精度用得上的段', () => {
    expect(parseIsoSegments('2026-07-28', 'day')).toEqual({ year: 2026, month: 7, day: 28 })
    expect(parseIsoSegments('2026-07-28T13:45', 'minute')).toEqual({ year: 2026, month: 7, day: 28, hour: 13, minute: 45 })
    // 精度只到天：串里带的时刻不该混进段位，否则两份等价的值会被判成不等
    expect(parseIsoSegments('2026-07-28T13:45', 'day')).toEqual({ year: 2026, month: 7, day: 28 })
  })

  it('认不出来的串一律当成"一段都没填"', () => {
    expect(parseIsoSegments('', 'day')).toEqual({})
    expect(parseIsoSegments(null, 'day')).toEqual({})
    expect(parseIsoSegments('昨天', 'day')).toEqual({})
    expect(parseIsoSegments('2026-13-40', 'day')).toEqual({})
  })

  it('段位没填齐就没有值', () => {
    expect(segmentsToIso({ year: 2026, month: 7 }, 'day')).toBeNull()
    expect(segmentsToIso({ year: 2026, month: 7, day: 28 }, 'day')).toBe('2026-07-28')
    // 精度要求时分，缺一段照样是 null
    expect(segmentsToIso({ year: 2026, month: 7, day: 28, hour: 13 }, 'minute')).toBeNull()
  })

  it('iSO 串截到 granularity 那一位为止', () => {
    const full = { year: 2026, month: 7, day: 28, hour: 13, minute: 45, second: 7 }
    expect(segmentsToIso(full, 'day')).toBe('2026-07-28')
    expect(segmentsToIso(full, 'hour')).toBe('2026-07-28T13')
    expect(segmentsToIso(full, 'minute')).toBe('2026-07-28T13:45')
    expect(segmentsToIso(full, 'second')).toBe('2026-07-28T13:45:07')
  })

  it('越界的日期组合由日历收敛，不产出 2 月 31 日这种串', () => {
    expect(segmentsToIso({ year: 2026, month: 2, day: 31 }, 'day')).toBe('2026-02-28')
    expect(segmentsToIso({ year: 2024, month: 2, day: 31 }, 'day')).toBe('2024-02-29')
  })

  it('constrainSegments 把年月日收敛到日历上真实存在的一天', () => {
    expect(constrainSegments({ year: 2026, month: 2, day: 31 })).toEqual({ year: 2026, month: 2, day: 28 })
    expect(constrainSegments({ year: 2024, month: 2, day: 31 })).toEqual({ year: 2024, month: 2, day: 29 })
    // 本来就成立的日子原样返回（同一个引用，省掉一次无谓的写）
    const ok = { year: 2026, month: 7, day: 28 }
    expect(constrainSegments(ok)).toBe(ok)
    // 缺段时无从收敛，原样返回
    expect(constrainSegments({ month: 2, day: 31 })).toEqual({ month: 2, day: 31 })
  })

  it('toValueString 把对外的 null 折成空串，undefined 原样透传', () => {
    // undefined 是"没给这个 prop"，受控与否的分界就在它上面
    expect(toValueString(undefined)).toBeUndefined()
    expect(toValueString(null)).toBe('')
    expect(toValueString('2026-07-28')).toBe('2026-07-28')
  })

  it('sameSegments 逐段比内容；compareDateSegments 比先后', () => {
    expect(sameSegments({ year: 2026 }, { year: 2026 })).toBe(true)
    expect(sameSegments({ year: 2026 }, { year: 2026, month: 7 })).toBe(false)
    expect(sameSegments({ year: 2026 }, undefined)).toBe(false)
    // 显式写成 undefined 的键与压根没有这个键是一回事
    expect(sameSegments({ year: 2026, day: undefined }, { year: 2026 })).toBe(true)
    expect(compareDateSegments({ year: 2026, month: 7, day: 1 }, { year: 2026, month: 7, day: 28 })).toBeLessThan(0)
    expect(compareDateSegments({ year: 2026, month: 8, day: 1 }, { year: 2026, month: 7, day: 28 })).toBeGreaterThan(0)
    // 缺席的段按 0 算：只精确到天的值落在当天的零点上
    expect(compareDateSegments({ year: 2026, month: 7, day: 28 }, { year: 2026, month: 7, day: 28, hour: 10 })).toBeLessThan(0)
  })
})

describe('段位区间：随月份长短与 min/max 收窄', () => {
  it('日的上界随当月天数走；年月未填时放宽到 31', () => {
    expect(dateSegmentRange('day', { year: 2026, month: 2 })).toEqual({ min: 1, max: 28 })
    expect(dateSegmentRange('day', { year: 2024, month: 2 })).toEqual({ min: 1, max: 29 })
    expect(dateSegmentRange('day', { year: 2026, month: 7 })).toEqual({ min: 1, max: 31 })
    expect(dateSegmentRange('day', {})).toEqual({ min: 1, max: 31 })
  })

  it('天然区间：年 1..9999、月 1..12、时 0..23、分秒 0..59', () => {
    expect(dateSegmentRange('year', {})).toEqual({ min: 1, max: 9999 })
    expect(dateSegmentRange('month', {})).toEqual({ min: 1, max: 12 })
    expect(dateSegmentRange('hour', {})).toEqual({ min: 0, max: 23 })
    expect(dateSegmentRange('minute', {})).toEqual({ min: 0, max: 59 })
    expect(dateSegmentRange('second', {})).toEqual({ min: 0, max: 59 })
  })

  it('min/max 只在高位贴着边界时才收窄低位', () => {
    const bounds = { min: parseBoundary('2026-07-28'), max: parseBoundary('2027-03-05') }
    expect(dateSegmentRange('year', { year: 2026 }, bounds)).toEqual({ min: 2026, max: 2027 })
    // 年贴着下界：月份下界跟着抬到 7
    expect(dateSegmentRange('month', { year: 2026 }, bounds)).toEqual({ min: 7, max: 12 })
    // 年贴着上界：月份上界压到 3
    expect(dateSegmentRange('month', { year: 2027 }, bounds)).toEqual({ min: 1, max: 3 })
    // 年月都贴着下界，日下界才是 28
    expect(dateSegmentRange('day', { year: 2026, month: 7 }, bounds)).toEqual({ min: 28, max: 31 })
    // 月份一旦离开下界，日下界必须退回 1——否则 8 月 1 日会被判成越界
    expect(dateSegmentRange('day', { year: 2026, month: 8 }, bounds)).toEqual({ min: 1, max: 31 })
  })

  it('时间段不受 min/max 收窄', () => {
    const bounds = { min: parseBoundary('2026-07-28T10:00:00'), max: null }
    expect(dateSegmentRange('hour', { year: 2026, month: 7, day: 28 }, bounds)).toEqual({ min: 0, max: 23 })
  })

  it('min 写得比 max 还大时退回天然区间，回绕不至于除零', () => {
    const bounds = { min: parseBoundary('2027-01-01'), max: parseBoundary('2026-01-01') }
    expect(dateSegmentRange('year', {}, bounds)).toEqual({ min: 1, max: 9999 })
  })

  it('parseBoundary 认不出来就是"没有这个边界"', () => {
    expect(parseBoundary(undefined)).toBeNull()
    expect(parseBoundary('')).toBeNull()
    expect(parseBoundary('随便写的')).toBeNull()
    expect(parseBoundary('2026-07-28')).toMatchObject({ year: 2026, month: 7, day: 28 })
  })
})

describe('加减与回绕', () => {
  it('wrapSegment 在区间两端回绕', () => {
    expect(wrapSegment(13, { min: 1, max: 12 })).toBe(1)
    expect(wrapSegment(0, { min: 1, max: 12 })).toBe(12)
    expect(wrapSegment(24, { min: 0, max: 23 })).toBe(0)
    expect(wrapSegment(-1, { min: 0, max: 23 })).toBe(23)
    // 收窄过的区间同样只在自己的两端回绕
    expect(wrapSegment(13, { min: 7, max: 12 })).toBe(7)
  })

  it('stepSegment：有值就加减并回绕，空段落到参照日的对应位', () => {
    const reference = { year: 2026, month: 7, day: 28, hour: 0, minute: 0, second: 0 }
    const range = { min: 1, max: 12 }
    expect(stepSegment({ month: 12 }, 'month', 1, { range, reference })).toBe(1)
    expect(stepSegment({ month: 1 }, 'month', -1, { range, reference })).toBe(12)
    expect(stepSegment({ month: 5 }, 'month', 1, { range, reference })).toBe(6)
    // 空段：从 0001 年按上键翻到今年是没人干的事
    expect(stepSegment({}, 'month', 1, { range, reference })).toBe(7)
    expect(stepSegment({}, 'month', -1, { range, reference })).toBe(7)
  })

  it('空段落到参照日时也要夹进区间', () => {
    const reference = { year: 2026, month: 7, day: 28 }
    expect(stepSegment({}, 'month', 1, { range: { min: 9, max: 12 }, reference })).toBe(9)
  })
})

describe('数字键直填', () => {
  const month = { range: { min: 1, max: 12 }, maxDigits: 2 }
  const year = { range: { min: 1, max: 9999 }, maxDigits: 4 }

  it('月份敲 1 再敲 2 得到 12 并收工', () => {
    const first = applySegmentDigit('', '1', month)
    expect(first).toEqual({ digits: '1', value: 1, complete: false })
    expect(applySegmentDigit(first!.digits, '2', month)).toEqual({ digits: '12', value: 12, complete: true })
  })

  it('再补一位必溢出就当场收工', () => {
    // 2 后面再接一位最小也是 20，越过 12，没有第二位可接了
    expect(applySegmentDigit('', '2', month)).toEqual({ digits: '2', value: 2, complete: true })
  })

  it('接上一位会溢出时按"重新起一段"处理，而不是丢弃', () => {
    // 已经是 1，再敲 9 得到 19；19 不是月份，用户十有八九是想改成 9 月
    expect(applySegmentDigit('1', '9', month)).toEqual({ digits: '9', value: 9, complete: true })
  })

  it('单独成段也超上界的那一位无处可去', () => {
    // 月份区间被 max 压到 1..8 时，9 放哪儿都不成立
    expect(applySegmentDigit('', '9', { range: { min: 1, max: 8 }, maxDigits: 2 })).toBeNull()
  })

  it('还凑不成合法值的中间态：缓冲留着，值先缺席', () => {
    // 月份敲个 0 是在打 01..09 的前奏
    expect(applySegmentDigit('', '0', month)).toEqual({ digits: '0', value: undefined, complete: false })
    expect(applySegmentDigit('0', '7', month)).toEqual({ digits: '07', value: 7, complete: true })
  })

  it('年份要敲满四位才收工', () => {
    expect(applySegmentDigit('', '2', year)).toMatchObject({ digits: '2', complete: false })
    expect(applySegmentDigit('2', '0', year)).toMatchObject({ digits: '20', complete: false })
    expect(applySegmentDigit('20', '2', year)).toMatchObject({ digits: '202', complete: false })
    expect(applySegmentDigit('202', '6', year)).toEqual({ digits: '2026', value: 2026, complete: true })
  })
})

describe('两位年份补全', () => {
  it('不超过两位的按世纪分水岭展开', () => {
    expect(resolveTwoDigitYear('26')).toBe(2026)
    expect(resolveTwoDigitYear('68')).toBe(2068)
    expect(resolveTwoDigitYear('69')).toBe(1969)
    expect(resolveTwoDigitYear('99')).toBe(1999)
    expect(resolveTwoDigitYear('0')).toBe(2000)
    expect(resolveTwoDigitYear('5')).toBe(2005)
  })

  it('三位以上是用户把年份写全了，原样收下', () => {
    expect(resolveTwoDigitYear('2026')).toBe(2026)
    expect(resolveTwoDigitYear('0026')).toBe(26)
    expect(resolveTwoDigitYear('999')).toBe(999)
  })
})

describe('段位显示文字', () => {
  it('未填显示占位，填好补零，正在敲则原样显示敲进去的数字串', () => {
    expect(dateSegmentText('month', undefined, { placeholder: 'mm' })).toBe('mm')
    expect(dateSegmentText('month', 7, { placeholder: 'mm' })).toBe('07')
    expect(dateSegmentText('year', 2026, { placeholder: 'yyyy' })).toBe('2026')
    // 补零会把刚敲下的 "2" 变成 "0002"
    expect(dateSegmentText('year', 2, { typing: '2', placeholder: 'yyyy' })).toBe('2')
    expect(dateSegmentText('month', undefined, { typing: '0', placeholder: 'mm' })).toBe('0')
  })
})

describe('dateFieldMachine', () => {
  function service(props: Props = {}) {
    const runtime = createVanillaRuntime()
    const s = createService(dateFieldMachine, { props: () => props, runtime })
    runtime.start()
    return s
  }

  it('段位填齐才产出 ISO 串，缺一段就是 null', () => {
    const onValueChange = vi.fn()
    const s = service({ locale: 'zh-CN', onValueChange })
    s.send({ type: 'SEGMENT.TYPE', segment: 'year', digit: '2' })
    s.send({ type: 'SEGMENT.TYPE', segment: 'year', digit: '0' })
    s.send({ type: 'SEGMENT.TYPE', segment: 'year', digit: '2' })
    s.send({ type: 'SEGMENT.TYPE', segment: 'year', digit: '6' })
    s.send({ type: 'SEGMENT.TYPE', segment: 'month', digit: '7' })
    expect(s.context.get('value')).toBe('')
    expect(onValueChange).not.toHaveBeenCalled()
    s.send({ type: 'SEGMENT.TYPE', segment: 'day', digit: '2' })
    s.send({ type: 'SEGMENT.TYPE', segment: 'day', digit: '8' })
    expect(s.context.get('value')).toBe('2026-07-28')
    expect(onValueChange).toHaveBeenCalledWith({ value: '2026-07-28' })
  })

  it('清掉一段：整份值退回 null，其余段一个都不许被抹掉', () => {
    const onValueChange = vi.fn()
    const s = service({ defaultValue: '2026-07-28', onValueChange })
    s.send({ type: 'SEGMENT.CLEAR', segment: 'day' })
    expect(s.context.get('segments')).toMatchObject({ year: 2026, month: 7 })
    expect(s.context.get('segments').day).toBeUndefined()
    expect(s.context.get('value')).toBe('')
    expect(onValueChange).toHaveBeenLastCalledWith({ value: null })
  })

  it('上下键在段区间里回绕', () => {
    const s = service({ defaultValue: '2026-12-31' })
    s.send({ type: 'SEGMENT.STEP', segment: 'month', delta: 1 })
    // 12 月加一回到 1 月；31 日在 1 月里仍然成立
    expect(s.context.get('value')).toBe('2026-01-31')
    s.send({ type: 'SEGMENT.STEP', segment: 'month', delta: -1 })
    expect(s.context.get('value')).toBe('2026-12-31')
  })

  it('翻月导致日不成立时，段位与值一起收敛，不许各说各的', () => {
    const s = service({ defaultValue: '2026-01-31' })
    s.send({ type: 'SEGMENT.STEP', segment: 'month', delta: 1 })
    // 只在拼串时收敛是不够的：段位里若留着 31，界面会显示 2 月 31 日
    expect(s.context.get('segments')).toEqual({ year: 2026, month: 2, day: 28 })
    expect(s.context.get('value')).toBe('2026-02-28')
  })

  it('空段上按上下键落到今天的对应位', () => {
    const s = service({ timeZone: 'UTC' })
    s.send({ type: 'SEGMENT.STEP', segment: 'month', delta: 1 })
    expect(s.context.get('segments').month).toBe(today('UTC').month)
  })

  it('两位年份在离开该段时才补全', () => {
    const s = service({ defaultValue: '2026-07-28' })
    s.send({ type: 'SEGMENT.FOCUS', segment: 'year' })
    s.send({ type: 'SEGMENT.TYPE', segment: 'year', digit: '9' })
    s.send({ type: 'SEGMENT.TYPE', segment: 'year', digit: '9' })
    // 还在这一段里：用户可能接着敲第三位，此刻不该擅自当成 1999
    expect(s.context.get('segments').year).toBe(99)
    s.send({ type: 'SEGMENT.FOCUS', segment: 'month' })
    expect(s.context.get('segments').year).toBe(1999)
    expect(s.context.get('value')).toBe('1999-07-28')
  })

  it('敲满四位的年份不再走两位补全', () => {
    const s = service({ defaultValue: '2000-07-28' })
    s.send({ type: 'SEGMENT.FOCUS', segment: 'year' })
    for (const digit of '0026') s.send({ type: 'SEGMENT.TYPE', segment: 'year', digit })
    s.send({ type: 'SEGMENT.BLUR' })
    expect(s.context.get('segments').year).toBe(26)
  })

  it('两位年份补全后要夹进 min/max', () => {
    const s = service({ min: '2020-01-01', max: '2030-12-31' })
    s.send({ type: 'SEGMENT.FOCUS', segment: 'year' })
    s.send({ type: 'SEGMENT.TYPE', segment: 'year', digit: '9' })
    s.send({ type: 'SEGMENT.TYPE', segment: 'year', digit: '9' })
    s.send({ type: 'SEGMENT.BLUR' })
    // 1999 落在下界之外，夹到 2020
    expect(s.context.get('segments').year).toBe(2020)
  })

  it('vALUE.SET 整份替换，VALUE.CLEAR 清空所有段', () => {
    const s = service({ granularity: 'minute' })
    s.send({ type: 'VALUE.SET', value: '2026-07-28T13:45' })
    expect(s.context.get('segments')).toEqual({ year: 2026, month: 7, day: 28, hour: 13, minute: 45 })
    expect(s.context.get('value')).toBe('2026-07-28T13:45')
    s.send({ type: 'VALUE.CLEAR' })
    expect(s.context.get('segments')).toEqual({})
    expect(s.context.get('value')).toBe('')
  })

  it('disabled / readOnly 挡下所有编辑事件', () => {
    for (const props of [{ disabled: true }, { readOnly: true }]) {
      const s = service({ defaultValue: '2026-07-28', ...props })
      s.send({ type: 'SEGMENT.STEP', segment: 'month', delta: 1 })
      s.send({ type: 'SEGMENT.TYPE', segment: 'day', digit: '1' })
      s.send({ type: 'SEGMENT.CLEAR', segment: 'year' })
      expect(s.context.get('value')).toBe('2026-07-28')
    }
  })

  it('受控 value：宿主不写回则段位一并退回去，回调照发', () => {
    const onValueChange = vi.fn()
    const s = service({ value: '2026-07-28', onValueChange })
    s.send({ type: 'SEGMENT.STEP', segment: 'day', delta: 1 })
    expect(s.context.get('value')).toBe('2026-07-28')
    // 段位不许自作主张：只改值不改段位会让界面显示 29、值却是 28
    expect(s.context.get('segments')).toEqual({ year: 2026, month: 7, day: 28 })
    expect(onValueChange).toHaveBeenCalledWith({ value: '2026-07-29' })
  })

  it('受控且当前为空时，半份日期仍留在段位里继续编辑', () => {
    const onValueChange = vi.fn()
    // 段位不完整时算不出 ISO 串，那种半份日期宿主根本表达不了，也就无所谓接受不接受
    const s = service({ value: '', onValueChange })
    s.send({ type: 'SEGMENT.TYPE', segment: 'month', digit: '7' })
    expect(s.context.get('segments').month).toBe(7)
    s.send({ type: 'SEGMENT.TYPE', segment: 'day', digit: '2' })
    s.send({ type: 'SEGMENT.TYPE', segment: 'day', digit: '8' })
    expect(s.context.get('segments')).toMatchObject({ month: 7, day: 28 })
    expect(onValueChange).not.toHaveBeenCalled()
  })

  it('受控且宿主按时写回时，多位数字接得上（缓冲不被误清）', () => {
    const runtime = createVanillaRuntime()
    const props = runtime.signal<Props>({ value: '2026-01-28' })
    const s = createService(dateFieldMachine, {
      // 宿主收到就写回：受控闭环的常态
      props: () => ({ ...props.get(), onValueChange: ({ value }) => props.set({ value: value ?? '' }) }),
      runtime,
    })
    runtime.start()
    s.send({ type: 'SEGMENT.FOCUS', segment: 'month' })
    s.send({ type: 'SEGMENT.TYPE', segment: 'month', digit: '1' })
    expect(s.context.get('value')).toBe('2026-01-28')
    // 第二位要能接在第一位后面凑成 12，而不是各算各的
    s.send({ type: 'SEGMENT.TYPE', segment: 'month', digit: '2' })
    expect(s.context.get('value')).toBe('2026-12-28')
  })

  it('宿主写回新值时段位跟着走', () => {
    const runtime = createVanillaRuntime()
    const props = runtime.signal<Props>({ value: '2026-07-28' })
    const s = createService(dateFieldMachine, { props: () => props.get(), runtime })
    runtime.start()
    expect(s.context.get('segments')).toEqual({ year: 2026, month: 7, day: 28 })
    props.set({ value: '2030-01-02' })
    expect(s.context.get('segments')).toEqual({ year: 2030, month: 1, day: 2 })
  })

  it('onValueChange 只在 ISO 串真的变了时通知', () => {
    const onValueChange = vi.fn()
    const s = service({ onValueChange })
    // 年月填了但日还空着：两次都算不出串，不该报值变了
    s.send({ type: 'SEGMENT.TYPE', segment: 'year', digit: '2' })
    s.send({ type: 'SEGMENT.TYPE', segment: 'month', digit: '7' })
    expect(onValueChange).not.toHaveBeenCalled()
  })
})

describe('connectDateField 结构与 ARIA', () => {
  it('control 是 group 并由 label 命名，段位是 spinbutton', () => {
    const m = open({ locale: 'zh-CN' })
    expect(m.control.getAttribute('role')).toBe('group')
    expect(m.control.getAttribute('aria-labelledby')).toBe(m.label.getAttribute('id'))
    expect(m.seg[0]!.getAttribute('role')).toBe('spinbutton')
    // 段位是 div，不是可被 <label for> 标注的控件
    expect(m.label.hasAttribute('for')).toBe(false)
  })

  it('段序随 locale 走：同一份标记换个 locale 就换一副面孔', () => {
    expect(kinds(open({ locale: 'zh-CN' }))).toEqual(['year', 'month', 'day', null, null, null])
    expect(kinds(open({ locale: 'en-US' }))).toEqual(['month', 'day', 'year', null, null, null])
    expect(kinds(open({ locale: 'de-DE' }))).toEqual(['day', 'month', 'year', null, null, null])
  })

  it('granularity 决定几段在用，用不上的收起而不是卸载', () => {
    const m = open({ locale: 'zh-CN', granularity: 'minute' })
    expect(kinds(m)).toEqual(['year', 'month', 'day', 'hour', 'minute', null])
    expect(m.seg[4]!.hasAttribute('hidden')).toBe(false)
    // 作者写的第六个节点还在文档里，只是收起了
    expect(m.seg[5]!.isConnected).toBe(true)
    expect(m.seg[5]!.hasAttribute('hidden')).toBe(true)
    expect(m.seg[5]!.getAttribute('role')).toBeNull()
  })

  it('未填时显示占位串，三个 aria-value* 显式给出', () => {
    const m = open({ locale: 'zh-CN' })
    expect(texts(m)).toEqual(['yyyy', 'mm', 'dd', '', '', ''])
    expect(m.seg[1]!.getAttribute('aria-valuemin')).toBe('1')
    expect(m.seg[1]!.getAttribute('aria-valuemax')).toBe('12')
    // 未填时不给 valuenow：0 会被念成"值是 0"，那和"还没填"是两回事
    expect(m.seg[1]!.hasAttribute('aria-valuenow')).toBe(false)
    expect(m.seg[1]!.getAttribute('aria-valuetext')).toBe('mm')
    expect(m.seg[1]!.getAttribute('data-placeholder')).toBe('')
  })

  it('填好之后补零显示，valuenow / valuetext 跟着走', () => {
    const m = open({ locale: 'zh-CN', defaultValue: '2026-07-08' })
    expect(texts(m).slice(0, 3)).toEqual(['2026', '07', '08'])
    expect(m.seg[2]!.getAttribute('aria-valuenow')).toBe('8')
    expect(m.seg[2]!.getAttribute('aria-valuetext')).toBe('08')
    expect(m.seg[2]!.hasAttribute('data-placeholder')).toBe(false)
    // 2026 年 7 月有 31 天
    expect(m.seg[2]!.getAttribute('aria-valuemax')).toBe('31')
  })

  it('placeholder 与 translations 逐段覆盖内置默认', () => {
    const m = open({
      locale: 'zh-CN',
      placeholder: { year: '年' },
      translations: { year: '年份' },
    })
    expect(texts(m).slice(0, 3)).toEqual(['年', 'mm', 'dd'])
    expect(m.seg[0]!.getAttribute('aria-label')).toBe('年份')
    expect(m.seg[1]!.getAttribute('aria-label')).toBe('month')
  })

  it('整组只占一个 Tab 位，锚点跟着焦点走', () => {
    const m = open({ locale: 'zh-CN' })
    expect(m.seg.slice(0, 3).map(el => el.getAttribute('tabindex'))).toEqual(['0', '-1', '-1'])
    m.seg[2]!.focus()
    expect(m.seg.slice(0, 3).map(el => el.getAttribute('tabindex'))).toEqual(['-1', '-1', '0'])
    expect(m.seg[2]!.getAttribute('data-focus')).toBe('')
    m.seg[2]!.blur()
    // 焦点离开整组后锚点退回首段，否则组内一个 Tab 位都不剩
    expect(m.seg[0]!.getAttribute('tabindex')).toBe('0')
  })

  it('别的段迟到的失焦不会把当前锚点抹掉', () => {
    const m = open({ locale: 'zh-CN' })
    m.seg[0]!.focus()
    m.seg[1]!.dispatchEvent(new FocusEvent('blur'))
    expect(m.api().focusedSegment).toBe('year')
    expect(m.seg[0]!.getAttribute('data-focus')).toBe('')
  })

  it('required / invalid / readOnly 落到段位与容器上', () => {
    const m = open({ locale: 'zh-CN', required: true, invalid: true, readOnly: true })
    expect(m.seg[0]!.getAttribute('aria-required')).toBe('true')
    expect(m.seg[0]!.getAttribute('aria-invalid')).toBe('true')
    expect(m.seg[0]!.getAttribute('aria-readonly')).toBe('true')
    expect(m.root.getAttribute('data-invalid')).toBe('')
    expect(m.root.getAttribute('data-readonly')).toBe('')
    // 只读仍可聚焦：改不动不等于读不到
    expect(m.seg[0]!.getAttribute('tabindex')).toBe('0')
  })

  it('禁用时整组退出 Tab 序，隐藏输入不参与提交', () => {
    const m = open({ locale: 'zh-CN', defaultValue: '2026-07-28', disabled: true, name: 'due' })
    expect(m.seg[0]!.hasAttribute('tabindex')).toBe(false)
    expect(m.seg[0]!.getAttribute('aria-disabled')).toBe('true')
    expect(m.root.getAttribute('data-disabled')).toBe('')
    expect(m.hidden.hasAttribute('disabled')).toBe(true)
  })

  it('隐藏输入承载 ISO 串，段位没填齐时是空串', () => {
    const m = open({ locale: 'zh-CN', name: 'due' })
    expect(m.hidden.getAttribute('type')).toBe('hidden')
    expect(m.hidden.getAttribute('name')).toBe('due')
    expect(m.hidden.value).toBe('')
    typeDigits(m, 0, '20260728')
    expect(m.hidden.value).toBe('2026-07-28')
    expect(m.root.getAttribute('data-complete')).toBe('')
  })

  it('valueAsDate 按 timeZone 换算；算不出来就是 null', () => {
    expect(open({ locale: 'zh-CN' }).api().valueAsDate).toBeNull()
    const m = open({ locale: 'zh-CN', defaultValue: '2026-07-28', timeZone: 'UTC' })
    expect(m.api().valueAsDate?.toISOString()).toBe('2026-07-28T00:00:00.000Z')
  })

  it('落在 min/max 之外时标出来，并顺带标成 invalid', () => {
    const m = open({ locale: 'zh-CN', defaultValue: '2020-01-01', min: '2026-01-01' })
    expect(m.api().outOfRange).toBe(true)
    expect(m.root.getAttribute('data-out-of-range')).toBe('')
    expect(m.seg[0]!.getAttribute('aria-invalid')).toBe('true')
  })
})

describe('connectDateField 键盘', () => {
  it('上下键加减当前段并回绕，且拦下页面滚动', () => {
    const m = open({ locale: 'zh-CN', defaultValue: '2026-12-31' })
    m.seg[1]!.focus()
    const event = pressKey(m.seg[1]!, 'ArrowUp')
    expect(event.defaultPrevented).toBe(true)
    expect(texts(m).slice(0, 3)).toEqual(['2026', '01', '31'])
    pressKey(m.seg[1]!, 'ArrowDown')
    expect(texts(m).slice(0, 3)).toEqual(['2026', '12', '31'])
  })

  it('左右键换段，两端停住不回绕', () => {
    const m = open({ locale: 'zh-CN' })
    m.seg[0]!.focus()
    const left = pressKey(m.seg[0]!, 'ArrowLeft')
    expect(left.defaultPrevented).toBe(true)
    expect(focusedIndex(m)).toBe(0)
    pressKey(m.seg[0]!, 'ArrowRight')
    expect(focusedIndex(m)).toBe(1)
    pressKey(m.seg[1]!, 'ArrowRight')
    expect(focusedIndex(m)).toBe(2)
    // 末段再往右没有段可去：收起的那三个节点不算
    pressKey(m.seg[2]!, 'ArrowRight')
    expect(focusedIndex(m)).toBe(2)
  })

  it('home / End 到首末段，同样跳过收起的段', () => {
    const m = open({ locale: 'zh-CN', granularity: 'hour' })
    m.seg[1]!.focus()
    pressKey(m.seg[1]!, 'End')
    expect(focusedIndex(m)).toBe(3)
    pressKey(m.seg[3]!, 'Home')
    expect(focusedIndex(m)).toBe(0)
  })

  it('数字键直填：月份敲 1 再敲 2 成 12 并跳到日', () => {
    // en-US 段序是月、日、年
    const m = open({ locale: 'en-US' })
    m.seg[0]!.focus()
    const event = pressKey(m.seg[0]!, '1')
    expect(event.defaultPrevented).toBe(true)
    // 还能再接一位，所以先留在本段，显示的是敲进去的原始数字串
    expect(focusedIndex(m)).toBe(0)
    expect(texts(m)[0]).toBe('1')
    pressKey(m.seg[0]!, '2')
    expect(texts(m)[0]).toBe('12')
    expect(focusedIndex(m)).toBe(1)
  })

  it('再补一位必溢出的那一下当场跳段', () => {
    const m = open({ locale: 'en-US' })
    m.seg[0]!.focus()
    pressKey(m.seg[0]!, '7')
    expect(texts(m)[0]).toBe('07')
    expect(focusedIndex(m)).toBe(1)
  })

  it('一路敲完三段拼出完整的值', () => {
    const m = open({ locale: 'en-US' })
    typeDigits(m, 0, '0728')
    expect(m.api().value).toBeNull()
    typeDigits(m, 2, '2026')
    expect(m.api().value).toBe('2026-07-28')
    expect(texts(m).slice(0, 3)).toEqual(['07', '28', '2026'])
  })

  it('backspace 清掉当前段，焦点不动，整份值退回 null', () => {
    const m = open({ locale: 'zh-CN', defaultValue: '2026-07-28' })
    m.seg[1]!.focus()
    const event = pressKey(m.seg[1]!, 'Backspace')
    expect(event.defaultPrevented).toBe(true)
    expect(texts(m).slice(0, 3)).toEqual(['2026', 'mm', '28'])
    expect(focusedIndex(m)).toBe(1)
    expect(m.api().value).toBeNull()
    expect(m.hidden.value).toBe('')
  })

  it('带 Ctrl/Meta 的组合一律放行（Ctrl+Home 之类不该被吞掉）', () => {
    const m = open({ locale: 'zh-CN' })
    m.seg[1]!.focus()
    const event = pressKey(m.seg[1]!, 'Home', { ctrlKey: true })
    expect(event.defaultPrevented).toBe(false)
    expect(focusedIndex(m)).toBe(1)
  })

  it('只读：可聚焦、可导航，但改不动', () => {
    const m = open({ locale: 'zh-CN', defaultValue: '2026-07-28', readOnly: true })
    m.seg[1]!.focus()
    const up = pressKey(m.seg[1]!, 'ArrowUp')
    // 不接管就不该拦下：上下键得留给页面滚动
    expect(up.defaultPrevented).toBe(false)
    pressKey(m.seg[1]!, '9')
    pressKey(m.seg[1]!, 'Backspace')
    expect(m.api().value).toBe('2026-07-28')
    // 换段仍然可用
    pressKey(m.seg[1]!, 'ArrowRight')
    expect(focusedIndex(m)).toBe(2)
  })

  it('禁用：直接往节点上派事件也推不动值', () => {
    // 禁用的段位没有 tabindex，focus 落不上去，只有直接派发才碰得到守卫
    const m = open({ locale: 'zh-CN', defaultValue: '2026-07-28', disabled: true })
    pressKey(m.seg[1]!, 'ArrowUp')
    pressKey(m.seg[1]!, '9')
    pressKey(m.seg[1]!, 'Backspace')
    expect(m.api().value).toBe('2026-07-28')
  })

  it('点标题把焦点送进首段', () => {
    const m = open({ locale: 'zh-CN' })
    m.label.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    expect(focusedIndex(m)).toBe(0)
  })

  it('禁用时点标题什么都不做', () => {
    const m = open({ locale: 'zh-CN', disabled: true })
    m.label.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    expect(focusedIndex(m)).toBe(-1)
  })
})

describe('connectDateField 受控与命令式出口', () => {
  it('受控且宿主未写回时界面纹丝不动，回调照发', () => {
    const onValueChange = vi.fn()
    const m = open({ locale: 'zh-CN', value: '2026-07-28', onValueChange })
    m.seg[2]!.focus()
    pressKey(m.seg[2]!, 'ArrowUp')
    expect(m.api().value).toBe('2026-07-28')
    expect(texts(m).slice(0, 3)).toEqual(['2026', '07', '28'])
    expect(onValueChange).toHaveBeenCalledWith({ value: '2026-07-29' })
    // 宿主写回后界面才跟着走
    m.setProps({ value: '2026-07-29' })
    expect(texts(m).slice(0, 3)).toEqual(['2026', '07', '29'])
    expect(m.hidden.value).toBe('2026-07-29')
  })

  it('受控值改成别的日期时段位整份重排', () => {
    const m = open({ locale: 'zh-CN', value: '2026-07-28' })
    m.setProps({ value: '2030-01-02' })
    expect(texts(m).slice(0, 3)).toEqual(['2030', '01', '02'])
  })

  it('setValue / clear 走同一条写入口', () => {
    const m = open({ locale: 'zh-CN' })
    m.api().setValue('2026-07-28')
    expect(texts(m).slice(0, 3)).toEqual(['2026', '07', '28'])
    expect(m.api().complete).toBe(true)
    m.api().clear()
    expect(texts(m).slice(0, 3)).toEqual(['yyyy', 'mm', 'dd'])
    expect(m.api().value).toBeNull()
    expect(m.api().empty).toBe(true)
  })
})
