// @vitest-environment jsdom
import type { Anchor, PositionEnginePort, PositionOptions, PositionResult, RuntimeConfig } from '@xihan-ui/core'
import type { ExitLease, PresenceHandle } from '@xihan-ui/core/presence'
import type { VanillaRuntime } from '@xihan-ui/core/vanilla'
import type { DateRangePickerApi, DateRangePickerSchema, DateRangePickerServices } from '../src/date-range-picker'
import { createCounterIdGenerator, createRuntimeConfig, createScope, createService, normalizeProps } from '@xihan-ui/core'
import { today } from '@xihan-ui/core/date'
import { createPresence } from '@xihan-ui/core/presence'
import { createVanillaRuntime } from '@xihan-ui/core/vanilla'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { calendarRangePickerMachine } from '../src/calendar-range-picker'
import { dateFieldMachine } from '../src/date-field'
import {
  connectDateRangePicker,
  dateRangePickerCalendarProps,
  dateRangePickerFieldEndProps,
  dateRangePickerFieldProps,
  dateRangePickerMachine,
  dateRangePickerPresetMonth,
  dateRangePickerPresetRange,
  dateRangePickerPresetYear,
  findDateRangePickerCellEl,
} from '../src/date-range-picker'

type Props = DateRangePickerSchema['props']

/** 段位节点数：作者写足六个，精度用不上的那几个由连接层收起、不卸载。 */
const SEGMENT_NODES = 6

const listeners = new WeakMap<HTMLElement, Map<string, EventListener>>()
const BOOLEAN_ATTRS = new Set(['disabled', 'hidden', 'readonly', 'required'])
// 隐藏输入的 value 只能走 DOM property：与 WC 侧的 spreader 同一套规则
const PROP_KEYS = new Set(['value'])

/**
 * 最小 spread：与 WC 侧同一套翻译规则（on 之后全小写做事件名，布尔属性 toggle，value 落 property）。
 * 有它才跑得到真实事件流——纯粹比对 connect 的返回值只能验静态属性，
 * 「敲满一段之后焦点落在哪一格」这类事实必须有活 DOM 才立得住。
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

interface MountOptions {
  /** 定位引擎；不给即缺省，机器照常转移但不产出位置结果。 */
  position?: PositionEnginePort
  /** 本层被移出层栈时调一次，用来记拆除顺序。 */
  onLayerDispose?: () => void
  /** 注入真实 Presence，验证行为资源延迟到视觉退场完成后释放。 */
  withPresence?: boolean
}

interface Harness {
  api: () => DateRangePickerApi
  config: RuntimeConfig
  presence: PresenceHandle | null
  root: HTMLElement
  label: HTMLElement
  control: HTMLElement
  /** 起点那组分段容器。 */
  input: HTMLElement
  /** 终点那组分段容器。 */
  inputEnd: HTMLElement
  separator: HTMLElement
  trigger: HTMLButtonElement
  clear: HTMLButtonElement
  content: HTMLElement
  calendarEl: HTMLElement
  grid: HTMLElement
  heading: HTMLElement
  prev: HTMLButtonElement
  next: HTMLButtonElement
  hiddenInput: HTMLInputElement
  /** 终点那份表单出口。 */
  hiddenInputEnd: HTMLInputElement
  /** 起点那组的段位，文档序。 */
  segments: () => HTMLElement[]
  /** 终点那组的段位，文档序。 */
  segmentsEnd: () => HTMLElement[]
  /** 起点那组段位的可见文字，文档序。 */
  segmentTexts: () => string[]
  /** 终点那组段位的可见文字，文档序。 */
  segmentEndTexts: () => string[]
  /** 当前渲染出来的某一天的 cell-trigger；不在这个月的网格里就抛。 */
  cell: (value: string) => HTMLElement
  /** 同一天的 cell（外层 gridcell）。 */
  gridcell: (value: string) => HTMLElement
  /** 网格里全部日期的 ISO 串，文档序。 */
  rendered: () => string[]
  setProps: (next: Partial<Props>) => void
  state: () => string
  value: () => string[]
  focusedValue: () => string | null
  returnFocus: () => boolean
  /** 被定位的浮层容器。 */
  positioner: HTMLElement
  position: () => PositionResult | null
  /** 换掉锚点 / 浮层 ref，用来验它们缺席时不挂订阅。 */
  setRef: (key: 'getAnchorEl' | 'getFloatingEl', value: () => HTMLElement | null) => void
}

const runtimes: VanillaRuntime[] = []

/**
 * 挂载一台完整的日期范围选择器：编排机 + 内嵌范围日历 + 两台内嵌分段输入共用一个运行时与一份 scope，
 * 网格随聚焦日重画——这正是作者该做的事（连接层只给数据，不生成节点）。
 * 重画只在「这个月的日期集合真的换了」时发生，与 Vue 的 keyed diff 同语义。
 */
function mount(initial: Partial<Props> = {}, options: MountOptions = {}): Harness {
  const doc = document
  const runtime = createVanillaRuntime()
  runtimes.push(runtime)
  // props 挂在 signal 上：布尔态受控（open）靠 watch 里的 track 回写，
  // 而 track 只在有值真的变过时才复查——直接改一个普通对象，宿主的写回就被静默吞掉了
  const props = runtime.signal<Partial<Props>>({ locale: 'zh-CN', timeZone: 'UTC', ...initial })

  const idGen = createCounterIdGenerator()
  const scope = createScope(null, idGen)

  const root = doc.createElement('div')
  const label = doc.createElement('span')
  label.textContent = '有效期'
  const control = doc.createElement('div')
  const input = doc.createElement('div')
  const segmentEls = Array.from({ length: SEGMENT_NODES }, () => doc.createElement('div'))
  input.append(...segmentEls)
  const separator = doc.createElement('span')
  const inputEnd = doc.createElement('div')
  const segmentEndEls = Array.from({ length: SEGMENT_NODES }, () => doc.createElement('div'))
  inputEnd.append(...segmentEndEls)
  const clear = doc.createElement('button')
  const trigger = doc.createElement('button')
  control.append(input, separator, inputEnd, clear, trigger)
  const hiddenInput = doc.createElement('input')
  const hiddenInputEnd = doc.createElement('input')
  const positioner = doc.createElement('div')
  const content = doc.createElement('div')
  const calendarEl = doc.createElement('div')
  const header = doc.createElement('div')
  const prev = doc.createElement('button')
  const heading = doc.createElement('div')
  const next = doc.createElement('button')
  header.append(prev, heading, next)
  const grid = doc.createElement('div')
  const gridHead = doc.createElement('div')
  const headRow = doc.createElement('div')
  const weekDayEls = Array.from({ length: 7 }, () => doc.createElement('span'))
  headRow.append(...weekDayEls)
  gridHead.appendChild(headRow)
  const gridBody = doc.createElement('div')
  grid.append(gridHead, gridBody)
  calendarEl.append(header, grid)
  content.appendChild(calendarEl)
  positioner.appendChild(content)
  root.append(label, control, hiddenInput, hiddenInputEnd, positioner)
  doc.body.appendChild(root)

  // 顺序要紧：内嵌机器的 props 都从编排机现读，编排机必须先立起来
  const rootService = createService(dateRangePickerMachine, { props: () => props.get(), runtime, scope })
  const calendarService = createService(calendarRangePickerMachine, {
    props: () => dateRangePickerCalendarProps(rootService),
    runtime,
    scope,
  })
  const fieldService = createService(dateFieldMachine, {
    props: () => dateRangePickerFieldProps(rootService),
    runtime,
    scope,
  })
  const fieldEndService = createService(dateFieldMachine, {
    props: () => dateRangePickerFieldEndProps(rootService),
    runtime,
    scope,
  })
  const services: DateRangePickerServices = {
    root: rootService,
    calendar: calendarService,
    field: fieldService,
    fieldEnd: fieldEndService,
  }

  const config: RuntimeConfig = createRuntimeConfig({ scope, idGenerator: idGen })
  const presence = options.withPresence
    ? createPresence({ open: (initial.open ?? initial.defaultOpen) ?? false, onRenderedChange: () => {} })
    : null
  rootService.refs.set('config', config)
  rootService.refs.set('presence', presence)
  rootService.refs.set('registerLayer', () => {
    const handle = config.layerRegistry.register({
      kind: 'popover',
      node: () => content,
      // 整个输入行记为本层分支：点 trigger 算层内交互，开合交给它自己切换。
      // 否则同一次点击先被判为层外交互关一次、再被 click 打开一次，等于关不掉
      branches: () => [control],
      isModal: () => false,
      surfaces: () => [],
    })
    return {
      layer: handle.layer,
      dispose: () => {
        handle.dispose()
        options.onLayerDispose?.()
      },
    }
  })
  if (options.position)
    rootService.refs.set('position', options.position)
  rootService.refs.set('getAnchorEl', () => control)
  rootService.refs.set('getFloatingEl', () => positioner)
  rootService.refs.set('getContentEl', () => content)
  calendarService.refs.set('getGridEl', () => grid)

  const triggers = new Map<string, HTMLElement>()
  const cells = new Map<string, HTMLElement>()
  let painted = ''

  const rebuild = (weeks: readonly (readonly { start: string }[])[]): void => {
    gridBody.textContent = ''
    triggers.clear()
    cells.clear()
    for (const week of weeks) {
      const row = doc.createElement('div')
      for (const day of week) {
        const cell = doc.createElement('div')
        const cellTrigger = doc.createElement('div')
        cellTrigger.textContent = day.start.slice(-2)
        cell.appendChild(cellTrigger)
        row.appendChild(cell)
        cells.set(day.start, cell)
        triggers.set(day.start, cellTrigger)
      }
      gridBody.appendChild(row)
    }
  }

  const render = (): void => {
    const api = connectDateRangePicker(services, normalizeProps)
    const key = api.calendar.weeks.map(w => w.map(d => d.start).join()).join('|')
    if (key !== painted) {
      painted = key
      rebuild(api.calendar.weeks)
    }
    spread(root, api.getRootProps() as Record<string, unknown>)
    spread(label, api.getLabelProps() as Record<string, unknown>)
    spread(control, api.getControlProps() as Record<string, unknown>)
    spread(input, api.getSegmentGroupProps() as Record<string, unknown>)
    spread(separator, api.getRangeSeparatorProps() as Record<string, unknown>)
    spread(inputEnd, api.getSegmentGroupProps({ index: 1 }) as Record<string, unknown>)
    spread(clear, api.getClearTriggerProps() as Record<string, unknown>)
    spread(trigger, api.getTriggerProps() as Record<string, unknown>)
    spread(hiddenInput, api.field.getHiddenInputProps() as Record<string, unknown>)
    spread(hiddenInputEnd, api.fieldEnd.getHiddenInputProps() as Record<string, unknown>)
    segmentEls.forEach((el, index) => {
      spread(el, api.field.getSegmentProps({ index }) as Record<string, unknown>)
      // 段位的文字归适配器写：连接层只管属性与事件
      el.textContent = api.field.segments[index]?.text ?? ''
    })
    segmentEndEls.forEach((el, index) => {
      spread(el, api.fieldEnd.getSegmentProps({ index }) as Record<string, unknown>)
      el.textContent = api.fieldEnd.segments[index]?.text ?? ''
    })
    spread(positioner, api.getPositionerProps() as Record<string, unknown>)
    spread(content, api.getContentProps() as Record<string, unknown>)
    spread(calendarEl, api.getCalendarProps() as Record<string, unknown>)
    spread(header, api.calendar.getHeaderProps() as Record<string, unknown>)
    spread(prev, api.calendar.getPrevTriggerProps() as Record<string, unknown>)
    spread(heading, api.calendar.getHeadingProps() as Record<string, unknown>)
    heading.textContent = api.calendar.headingLabel
    spread(next, api.calendar.getNextTriggerProps() as Record<string, unknown>)
    spread(grid, api.calendar.getGridProps() as Record<string, unknown>)
    spread(gridHead, api.calendar.getGridHeadProps() as Record<string, unknown>)
    spread(headRow, api.calendar.getWeekRowProps() as Record<string, unknown>)
    weekDayEls.forEach((el, i) => spread(el, api.calendar.getWeekDayProps({ value: i }) as Record<string, unknown>))
    spread(gridBody, api.calendar.getGridBodyProps() as Record<string, unknown>)
    for (const row of Array.from(gridBody.children))
      spread(row as HTMLElement, api.calendar.getWeekRowProps() as Record<string, unknown>)
    for (const [value, cell] of cells)
      spread(cell, api.calendar.getCellProps({ value }) as Record<string, unknown>)
    for (const [value, cellTrigger] of triggers)
      spread(cellTrigger, api.calendar.getCellTriggerProps({ value }) as Record<string, unknown>)
  }

  runtime.start()
  // 任一 cell 变化即重渲，与两个适配器同语义（受控时内部不写值，因此也不会重渲——
  // 那一路要宿主自己写回 props，由 setProps 承担）
  runtime.subscribe(render)
  render()

  return {
    api: () => connectDateRangePicker(services, normalizeProps),
    config,
    presence,
    root,
    label,
    control,
    input,
    inputEnd,
    separator,
    trigger: trigger as HTMLButtonElement,
    clear: clear as HTMLButtonElement,
    content,
    calendarEl,
    grid,
    heading,
    prev: prev as HTMLButtonElement,
    next: next as HTMLButtonElement,
    hiddenInput: hiddenInput as HTMLInputElement,
    hiddenInputEnd: hiddenInputEnd as HTMLInputElement,
    segments: () => segmentEls,
    segmentsEnd: () => segmentEndEls,
    segmentTexts: () => segmentEls.map(el => el.textContent ?? ''),
    segmentEndTexts: () => segmentEndEls.map(el => el.textContent ?? ''),
    cell: (value) => {
      const el = triggers.get(value)
      if (!el)
        throw new Error(`网格里没有 ${value} 这一格（当前展示 ${heading.textContent}）`)
      return el
    },
    gridcell: (value) => {
      const el = cells.get(value)
      if (!el)
        throw new Error(`网格里没有 ${value} 这一格（当前展示 ${heading.textContent}）`)
      return el
    },
    rendered: () => [...triggers.keys()],
    setProps: (next2) => {
      props.set({ ...props.get(), ...next2 })
      render()
    },
    state: () => rootService.state.get(),
    value: () => rootService.context.get('value'),
    focusedValue: () => rootService.context.get('focusedValue'),
    returnFocus: () => rootService.context.get('returnFocus'),
    positioner,
    position: () => rootService.context.get('position'),
    setRef: (key, value) => rootService.refs.set(key, value),
  }
}

/** 合成事件默认 cancelable=false，那样 preventDefault 是空操作、defaultPrevented 永远为假。 */
function press(el: HTMLElement, key: string, init: KeyboardEventInit = {}): KeyboardEvent {
  const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true, ...init })
  el.dispatchEvent(event)
  return event
}

function click(el: HTMLElement, init: MouseEventInit = {}): void {
  el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, ...init }))
}

function active(): HTMLElement {
  return (document.activeElement as HTMLElement | null) ?? document.body
}

/** flush 在 vanilla 运行时是一枚微任务；消解层的交互再等一枚微任务武装。 */
function tick(): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, 0))
}

/** 焦点域的挂载聚焦排在 requestAnimationFrame 上，最多重试三帧。 */
function settle(): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, 80))
}

/** 展开浮层并等到焦点落定：trigger 先聚焦，焦点归还才有去处。 */
async function open(initial: Partial<Props> = {}): Promise<Harness> {
  const h = mount(initial)
  h.trigger.focus()
  click(h.trigger)
  await settle()
  await tick()
  return h
}

/** 挑一段：先落起点再落终点，两下都在当前网格里。 */
function pickRange(h: Harness, start: string, end: string): void {
  click(h.cell(start))
  click(h.cell(end))
}

const RANGE = ['2026-07-28', '2026-08-02']

afterEach(() => {
  for (const runtime of runtimes.splice(0)) runtime.stop()
  document.body.innerHTML = ''
})

describe('开合与受控', () => {
  it('默认收起，defaultOpen 决定初态；收起态 content 带 hidden', () => {
    const closed = mount()
    expect(closed.state()).toBe('closed')
    expect(closed.content.hasAttribute('hidden')).toBe(true)
    expect(mount({ defaultOpen: true }).state()).toBe('open')
  })

  it('trigger 自报浮层是对话框，开合切 aria-expanded 并通知', () => {
    const onOpenChange = vi.fn()
    const h = mount({ onOpenChange })
    expect(h.trigger.getAttribute('aria-haspopup')).toBe('dialog')
    expect(h.trigger.getAttribute('aria-expanded')).toBe('false')
    expect(h.content.getAttribute('role')).toBe('dialog')
    expect(h.content.getAttribute('aria-modal')).toBe('false')
    // aria-controls 指得到真的 content
    expect(h.trigger.getAttribute('aria-controls')).toBe(h.content.getAttribute('id'))

    click(h.trigger)
    expect(h.state()).toBe('open')
    expect(h.trigger.getAttribute('aria-expanded')).toBe('true')
    expect(h.content.hasAttribute('hidden')).toBe(false)
    expect(onOpenChange).toHaveBeenLastCalledWith({ open: true })

    click(h.trigger)
    expect(h.state()).toBe('closed')
    expect(h.content.hasAttribute('hidden')).toBe(true)
    expect(onOpenChange).toHaveBeenLastCalledWith({ open: false })
  })

  it('受控 open：点 trigger 只发意图不自改状态，宿主写回后才转移', () => {
    const onOpenChange = vi.fn()
    const h = mount({ open: false, onOpenChange })
    click(h.trigger)
    expect(h.state()).toBe('closed')
    expect(onOpenChange).toHaveBeenCalledWith({ open: true })

    h.setProps({ open: true })
    expect(h.state()).toBe('open')
    // 宿主写回不是新的用户意图，不再发一次
    expect(onOpenChange).toHaveBeenCalledTimes(1)
  })

  it('禁用：trigger 转原生 disabled，程序化点击也推不动开合', () => {
    const h = mount({ disabled: true })
    expect(h.trigger.disabled).toBe(true)
    expect(h.root.getAttribute('data-disabled')).toBe('')
    // 禁用的按钮上 el.click() 会被激活行为短路，只有直接派事件才碰得到守卫
    click(h.trigger)
    expect(h.state()).toBe('closed')
  })

  it('只读：浮层照常展得开（改不动值不等于看不了日历）', () => {
    const h = mount({ readOnly: true })
    expect(h.trigger.disabled).toBe(false)
    click(h.trigger)
    expect(h.state()).toBe('open')
  })
})

describe('选中值的三个入口', () => {
  it('值恒为两端按位存放：空缺的一端用空串占位，两端都空即空集合', () => {
    expect(mount({ defaultValue: RANGE }).value()).toEqual(RANGE)
    expect(mount({ defaultValue: ['', '2026-07-09'] }).value()).toEqual(['', '2026-07-09'])
    expect(mount({ defaultValue: ['2026-07-09'] }).value()).toEqual(['2026-07-09'])
    expect(mount().value()).toEqual([])
    expect(mount({ defaultValue: RANGE }).api().start).toBe('2026-07-28')
    expect(mount({ defaultValue: ['', '2026-07-09'] }).api().start).toBeNull()
    expect(mount({ defaultValue: ['', '2026-07-09'] }).api().end).toBe('2026-07-09')
  })

  it('setValue 整份写入：丢掉占位、去重并按先后排好，最多两端', () => {
    const h = mount()
    h.api().setValue(['2026-07-30', '2026-07-02', '2026-07-02'])
    expect(h.value()).toEqual(['2026-07-02', '2026-07-30'])
    h.api().setValue(['2026-08-01', '', '2026-07-20'])
    expect(h.value()).toEqual(['2026-07-20', '2026-08-01'])
    h.api().setValue(['2026-07-30', '2026-07-02', '2026-08-15'])
    expect(h.value()).toEqual(['2026-07-02', '2026-07-30'])
  })

  it('日历里先落起点再落终点：两端一起落进编排机，两组段位与隐藏输入跟着对齐', () => {
    const onValueChange = vi.fn()
    const h = mount({ defaultOpen: true, defaultFocusedValue: '2026-07-15', onValueChange })
    click(h.cell('2026-07-10'))
    // 起点只记在日历里，选择器的值要等终点落下才写
    expect(h.value()).toEqual([])
    expect(onValueChange).not.toHaveBeenCalled()
    click(h.cell('2026-07-20'))
    expect(h.value()).toEqual(['2026-07-10', '2026-07-20'])
    expect(onValueChange).toHaveBeenLastCalledWith({ value: ['2026-07-10', '2026-07-20'] })
    // 值同步的落点：两组分段输入都是被编排机受控的，日历一选中它们就得跟着改口
    expect(h.segmentTexts().slice(0, 3)).toEqual(['2026', '07', '10'])
    expect(h.segmentEndTexts().slice(0, 3)).toEqual(['2026', '07', '20'])
    expect(h.hiddenInput.value).toBe('2026-07-10')
    expect(h.hiddenInputEnd.value).toBe('2026-07-20')
  })

  it('在起点段位里敲日期：值回到编排机，日历翻到那一天所在的月并把它标成区间起点', () => {
    const h = mount({ defaultOpen: true, defaultValue: RANGE })
    expect(h.rendered()).toContain('2026-07-01')
    const [year, month, day] = h.segments()
    month!.focus()
    press(month!, 'ArrowDown')
    expect(h.value()).toEqual(['2026-06-28', '2026-08-02'])
    expect(h.focusedValue()).toBe('2026-06-28')
    // 网格真的翻过去了：2026 年 7 月中旬的日子已经不在了
    expect(h.rendered()).not.toContain('2026-07-15')
    expect(h.gridcell('2026-06-28').getAttribute('aria-selected')).toBe('true')
    expect(h.gridcell('2026-06-28').getAttribute('data-range-start')).toBe('')
    expect(year!.getAttribute('data-segment')).toBe('year')
    expect(day!.getAttribute('data-segment')).toBe('day')
  })

  it('清空：无值收起 → 有值才出现，点完两端都清空、焦点回首段', () => {
    const empty = mount()
    expect(empty.clear.hidden).toBe(true)
    expect(empty.clear.hasAttribute('disabled')).toBe(false)
    expect(empty.clear.hasAttribute('data-disabled')).toBe(false)

    const h = mount({ defaultValue: RANGE })
    expect(h.clear.hidden).toBe(false)
    click(h.clear)
    expect(h.value()).toEqual([])
    expect(h.hiddenInput.value).toBe('')
    expect(h.hiddenInputEnd.value).toBe('')
    expect(h.segmentTexts().slice(0, 3)).toEqual(['yyyy', 'mm', 'dd'])
    expect(h.segmentEndTexts().slice(0, 3)).toEqual(['yyyy', 'mm', 'dd'])
    expect(active()).toBe(h.segments()[0])

    // 只填了一端也算有值，照样能清
    const half = mount({ defaultValue: ['', '2026-07-09'] })
    expect(half.clear.hidden).toBe(false)
  })

  it('范围分隔符是纯视觉部件，退出可访问树', () => {
    const h = mount()
    expect(h.separator.getAttribute('data-part')).toBe('range-separator')
    expect(h.separator.getAttribute('aria-hidden')).toBe('true')
    expect(h.separator.hasAttribute('hidden')).toBe(false)
  })

  it('受控 value：宿主不写回则两侧都纹丝不动，回调照发；写回才跟着走', () => {
    const onValueChange = vi.fn()
    const h = mount({ value: RANGE, defaultOpen: true, onValueChange })
    pickRange(h, '2026-07-15', '2026-07-20')
    expect(onValueChange).toHaveBeenCalledWith({ value: ['2026-07-15', '2026-07-20'] })
    expect(h.value()).toEqual(RANGE)
    expect(h.segmentTexts().slice(0, 3)).toEqual(['2026', '07', '28'])
    expect(h.segmentEndTexts().slice(0, 3)).toEqual(['2026', '08', '02'])

    h.setProps({ value: ['2026-07-15', '2026-07-20'] })
    expect(h.value()).toEqual(['2026-07-15', '2026-07-20'])
    expect(h.segmentTexts().slice(0, 3)).toEqual(['2026', '07', '15'])
    expect(h.segmentEndTexts().slice(0, 3)).toEqual(['2026', '07', '20'])
  })

  it('只读：日历点不动值，段位也改不动', () => {
    const h = mount({ readOnly: true, defaultOpen: true, defaultValue: RANGE })
    pickRange(h, '2026-07-15', '2026-07-20')
    expect(h.value()).toEqual(RANGE)
    const year = h.segments()[0]!
    year.focus()
    press(year, 'ArrowUp')
    expect(h.value()).toEqual(RANGE)
    const yearEnd = h.segmentsEnd()[0]!
    yearEnd.focus()
    press(yearEnd, 'ArrowUp')
    expect(h.value()).toEqual(RANGE)
  })
})

describe('起止两组段位', () => {
  it('两组各管一端：敲终点只改 value[1]，起点原封不动', () => {
    const h = mount({ defaultValue: ['2026-07-01', '2026-07-09'] })
    const day = h.segmentsEnd()[2]!
    day.focus()
    press(day, 'ArrowUp')
    expect(h.value()).toEqual(['2026-07-01', '2026-07-10'])
    expect(h.segmentTexts().slice(0, 3)).toEqual(['2026', '07', '01'])
    expect(h.segmentEndTexts().slice(0, 3)).toEqual(['2026', '07', '10'])
    expect(h.hiddenInput.value).toBe('2026-07-01')
    expect(h.hiddenInputEnd.value).toBe('2026-07-10')
  })

  it('只敲终点：起点那一格留空占位，对外照位报出；换段不越出本组', () => {
    const onValueChange = vi.fn()
    const h = mount({ onValueChange })
    h.segmentsEnd()[0]!.focus()
    // 逐位敲满年月日，敲满一段就跳下一段
    for (const digit of '20261119')
      press(active(), digit)

    expect(h.segmentsEnd()).toContain(active())
    expect(h.value()).toEqual(['', '2026-11-19'])
    expect(h.segmentTexts().slice(0, 3)).toEqual(['yyyy', 'mm', 'dd'])
    expect(h.hiddenInput.value).toBe('')
    expect(h.hiddenInputEnd.value).toBe('2026-11-19')
    // 前面的空缺照位留着，受控回写才认得出这是终点
    expect(onValueChange).toHaveBeenLastCalledWith({ value: ['', '2026-11-19'] })
  })

  it('只敲起点：对外只报一端，尾部不补占位', () => {
    const onValueChange = vi.fn()
    const h = mount({ onValueChange })
    h.segments()[0]!.focus()
    for (const digit of '20261119')
      press(active(), digit)
    expect(h.value()).toEqual(['2026-11-19', ''])
    expect(onValueChange).toHaveBeenLastCalledWith({ value: ['2026-11-19'] })
    expect(h.api().end).toBeNull()
  })

  it('终点早于起点也照位存放：段位那一路不排序、不去重', () => {
    const h = mount({ defaultValue: ['2026-07-20', '2026-07-25'] })
    const day = h.segmentsEnd()[2]!
    day.focus()
    // 5 后面再接一位最小也是 50，越过当月天数，这一下当场敲定
    press(day, '5')
    expect(h.value()).toEqual(['2026-07-20', '2026-07-05'])
    expect(h.segmentTexts().slice(0, 3)).toEqual(['2026', '07', '20'])
    // 日历跟着终点走，不被拽回起点
    expect(h.focusedValue()).toBe('2026-07-05')
  })

  it('起点组末段再往右停住，不跨进终点组；终点组首段往左也不回起点组', () => {
    const h = mount()
    const start = h.segments()
    const end = h.segmentsEnd()
    start[2]!.focus()
    press(start[2]!, 'ArrowRight')
    expect(active()).toBe(start[2])
    press(start[2]!, 'End')
    expect(active()).toBe(start[2])

    end[0]!.focus()
    press(end[0]!, 'ArrowLeft')
    expect(active()).toBe(end[0])
    press(end[0]!, 'Home')
    expect(active()).toBe(end[0])
  })
})

describe('closeOnSelect', () => {
  it('只落起点不收起，两端都落定才收起', () => {
    const h = mount({ defaultOpen: true })
    const days = h.rendered()
    click(h.cell(days[10]!))
    expect(h.value()).toEqual([])
    expect(h.api().calendar.rangeAnchor).toBe(days[10])
    expect(h.state()).toBe('open')

    click(h.cell(days[14]!))
    expect(h.value()).toEqual([days[10], days[14]])
    expect(h.state()).toBe('closed')
  })

  it('closeOnSelect=false：两端落定也留在展开态，接着挑', () => {
    const h = mount({ defaultOpen: true, closeOnSelect: false })
    const days = h.rendered()
    pickRange(h, days[10]!, days[14]!)
    expect(h.value()).toHaveLength(2)
    expect(h.state()).toBe('open')
  })

  it('段位里敲出完整日期不会把浮层收起——那时用户还在打字', () => {
    const h = mount({ defaultOpen: true, defaultValue: RANGE })
    const day = h.segmentsEnd()[2]!
    day.focus()
    press(day, 'ArrowUp')
    expect(h.value()).toEqual(['2026-07-28', '2026-08-03'])
    expect(h.state()).toBe('open')
  })

  it('受控 open 下两端落定：只发关闭意图，状态等宿主写回', () => {
    const onOpenChange = vi.fn()
    const h = mount({ open: true, onOpenChange })
    const days = h.rendered()
    pickRange(h, days[10]!, days[14]!)
    expect(h.state()).toBe('open')
    expect(onOpenChange).toHaveBeenLastCalledWith({ open: false })
    // 值这一路不受 open 受控影响，照落不误
    expect(h.value()).toHaveLength(2)
  })
})

describe('段位之间的移动（编排机自己接管的那一段）', () => {
  it('左右键换段，两端停住不回绕；收起的段不算一站', () => {
    const h = mount()
    const seg = h.segments()
    seg[0]!.focus()
    press(seg[0]!, 'ArrowLeft')
    expect(active()).toBe(seg[0])

    press(seg[0]!, 'ArrowRight')
    expect(active()).toBe(seg[1])
    press(seg[1]!, 'ArrowRight')
    expect(active()).toBe(seg[2])
    // 精度只到天：第四段起是收起的，末段再往右也不许绕过去
    press(seg[2]!, 'ArrowRight')
    expect(active()).toBe(seg[2])
    expect(seg[3]!.hasAttribute('hidden')).toBe(true)
  })

  it('home / End 到本组首末段', () => {
    const h = mount()
    const seg = h.segmentsEnd()
    seg[1]!.focus()
    press(seg[1]!, 'End')
    expect(active()).toBe(seg[2])
    press(seg[2]!, 'Home')
    expect(active()).toBe(seg[0])
  })

  it('数字敲满一段就跳下一段，值由分段输入自己算', () => {
    const h = mount({ locale: 'en-US' })
    const seg = h.segments()
    // en-US 段序是月、日、年
    seg[0]!.focus()
    press(seg[0]!, '1')
    // 还能再接一位（10/11/12），先留在本段
    expect(active()).toBe(seg[0])
    expect(seg[0]!.getAttribute('aria-valuenow')).toBe('1')
    press(seg[0]!, '2')
    expect(seg[0]!.getAttribute('aria-valuenow')).toBe('12')
    expect(active()).toBe(seg[1])
  })

  it('禁用与只读都不跳段：值都改不动，光标更没有理由自己跑', () => {
    const readOnly = mount({ readOnly: true })
    const seg = readOnly.segments()
    seg[0]!.focus()
    press(seg[0]!, '2')
    expect(active()).toBe(seg[0])

    const disabled = mount({ disabled: true })
    const seg2 = disabled.segments()
    // 禁用时段位没有 tabindex，焦点落不上去，只有直接派事件才碰得到守卫
    press(seg2[0]!, 'ArrowRight')
    expect(active()).not.toBe(seg2[1])
  })

  it('带 Ctrl/Cmd 的组合不归段位管（Ctrl+Home 之类归浏览器与读屏）', () => {
    const h = mount()
    const seg = h.segments()
    seg[0]!.focus()
    press(seg[0]!, 'End', { ctrlKey: true })
    expect(active()).toBe(seg[0])
  })

  it('点标题把焦点送进起点组首段；禁用时不送', () => {
    const h = mount()
    click(h.label)
    expect(active()).toBe(h.segments()[0])

    const off = mount({ disabled: true })
    off.label.focus()
    click(off.label)
    expect(active()).not.toBe(off.segments()[0])
  })
})

describe('点输入行即展开', () => {
  it('点段位就展开，且焦点留在段上——那一下的用意是打字，不是挑日子', async () => {
    const h = mount({ defaultValue: RANGE })
    const segment = h.segmentsEnd()[0]!
    segment.focus()
    click(segment)
    await settle()
    await tick()
    expect(h.state()).toBe('open')
    // 关键断言：焦点没被搬进浮层
    expect(active()).toBe(segment)
    expect(active()).not.toBe(h.cell('2026-07-28'))
  })

  it('再点输入行收起：点开与收起对称，指针那条路才有出口', async () => {
    const h = mount({ defaultValue: RANGE })
    const segment = h.segments()[0]!
    segment.focus()
    click(segment)
    await settle()
    await tick()
    expect(h.state()).toBe('open')
    click(segment)
    await tick()
    expect(h.state()).toBe('closed')
    // 再点一下还能开回来
    click(segment)
    await settle()
    await tick()
    expect(h.state()).toBe('open')
  })

  it('点范围分隔符也算点输入行', async () => {
    const h = mount({ defaultValue: RANGE })
    click(h.separator)
    await settle()
    await tick()
    expect(h.state()).toBe('open')
  })

  it('点触发钮那一路照旧把焦点送进浮层，落在起点那一格', async () => {
    const h = await open({ defaultValue: RANGE })
    expect(active()).toBe(h.cell('2026-07-28'))
  })

  it('点清空钮不当成展开', async () => {
    const h = mount({ defaultValue: RANGE })
    click(h.clear)
    await tick()
    expect(h.state()).toBe('closed')
  })

  it('段上 Enter 收起：敲出来的值不触发选完即收，得给一个我填完了的手势', async () => {
    const h = await open()
    expect(h.state()).toBe('open')
    press(h.inputEnd, 'Enter')
    await tick()
    expect(h.state()).toBe('closed')
  })

  it('收起态按 Enter 不会反手把它打开', async () => {
    const h = mount()
    press(h.input, 'Enter')
    await tick()
    expect(h.state()).toBe('closed')
  })

  it('段上 Alt+ArrowDown 展开并把焦点送进浮层——触发钮是可选部件，键盘不能只靠它', async () => {
    const h = mount({ defaultValue: RANGE })
    const segment = h.segmentsEnd()[0]!
    segment.focus()
    press(segment, 'ArrowDown', { altKey: true })
    await settle()
    await tick()
    expect(h.state()).toBe('open')
    expect(active()).toBe(h.cell('2026-07-28'))
  })

  it('禁用时点输入行推不开', async () => {
    const h = mount({ disabled: true })
    click(h.segments()[0]!)
    await tick()
    expect(h.state()).toBe('closed')
  })
})

describe('浮层：焦点、消解与归还', () => {
  it('展开后焦点落到聚焦日那一格，不是浮层里第一个可聚焦元素', async () => {
    const h = await open({ defaultValue: RANGE })
    expect(active()).toBe(h.cell('2026-07-28'))
    expect(active()).not.toBe(h.prev)
  })

  it('无选中时展开：聚焦日落到今天', async () => {
    const h = await open()
    const todayValue = h.focusedValue()!
    expect(todayValue).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    expect(active()).toBe(h.cell(todayValue))
  })

  it('escape 收起并把焦点还给 trigger，选中值不变', async () => {
    const h = await open({ defaultValue: RANGE })
    press(active(), 'Escape')
    expect(h.state()).toBe('closed')
    expect(h.value()).toEqual(RANGE)
    expect(h.returnFocus()).toBe(true)
    await settle()
    expect(active()).toBe(h.trigger)
  })

  it('层外交互关闭时不抢回焦点：用户已经点中别的东西了', async () => {
    const h = await open()
    const outside = document.createElement('button')
    document.body.appendChild(outside)
    outside.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }))
    await tick()
    expect(h.state()).toBe('closed')
    expect(h.returnFocus()).toBe(false)
  })

  it('层只在展开期间待在栈里', async () => {
    const h = mount()
    h.trigger.focus()
    click(h.trigger)
    await settle()
    await tick()
    press(active(), 'Escape')
    expect(h.state()).toBe('closed')
    // 收起之后 Escape 不再有人接：再按一次不会抛，也不会把状态推乱
    press(document.body, 'Escape')
    expect(h.state()).toBe('closed')
  })

  it('重新展开会把聚焦日拉回当前起点：上一轮翻到别处的月份不留到下一次', async () => {
    const h = await open({ defaultValue: RANGE })
    press(active(), 'PageDown')
    expect(h.focusedValue()).toBe('2026-08-28')
    press(active(), 'Escape')
    await settle()

    click(h.trigger)
    await settle()
    expect(h.focusedValue()).toBe('2026-07-28')
    expect(h.heading.textContent).toContain('7')
  })
})

describe('defaultFocusedValue 决定先落在哪一页', () => {
  it('没选值时按它铺，不再落到今天那一页', () => {
    const h = mount({ defaultFocusedValue: '2026-11-05' })
    expect(h.api().calendar.panels[0]!.month).toBe(11)
    expect(h.api().focusedValue).toBe('2026-11-05')
  })

  it('给了初始选中值就以它为准，聚焦日仍从 defaultFocusedValue 起步', () => {
    const h = mount({ defaultFocusedValue: '2026-11-05', defaultValue: ['2026-03-09', '2026-03-20'] })
    expect(h.api().value).toEqual(['2026-03-09', '2026-03-20'])
    expect(h.api().calendar.panels[0]!.month).toBe(11)
  })

  it('不给就退回起点；起点空缺退回终点', () => {
    expect(mount({ defaultValue: ['2026-03-09', '2026-05-20'] }).api().calendar.panels[0]!.month).toBe(3)
    expect(mount({ defaultValue: ['', '2026-05-20'] }).api().calendar.panels[0]!.month).toBe(5)
  })
})

describe('区间的校验与可选范围', () => {
  it('终点早于起点即不合法：根与输入行带 data-invalid，api.invalid 同一口径', () => {
    const h = mount({ defaultValue: ['2026-08-20', '2026-08-10'] })
    expect(h.api().invalid).toBe(true)
    expect(h.root.getAttribute('data-invalid')).toBe('')
    expect(h.control.getAttribute('data-invalid')).toBe('')
    h.api().setValue(['2026-08-10', '2026-08-20'])
    expect(h.api().invalid).toBe(false)
    expect(h.root.hasAttribute('data-invalid')).toBe(false)
  })

  it('只填了一端不算不合法', () => {
    expect(mount({ defaultValue: ['', '2026-08-10'] }).api().invalid).toBe(false)
    expect(mount({ defaultValue: ['2026-08-10'] }).api().invalid).toBe(false)
  })

  it('allowsNonContiguousRanges 与 isDateUnavailable 的起点参数原样交给内嵌日历', () => {
    const anchors: (string | null)[] = []
    const h = mount({
      defaultOpen: true,
      visibleCount: 2,
      defaultFocusedValue: '2026-08-10',
      allowsNonContiguousRanges: true,
      isDateUnavailable: (value, anchor) => {
        anchors.push(anchor)
        return value === '2026-08-12'
      },
    })
    click(h.cell('2026-08-10'))
    expect(anchors).toContain('2026-08-10')
    // 允许跨过不可用日：终点落在它之后照样收成区间，中间那一天不铺轨道
    click(h.cell('2026-08-14'))
    expect(h.api().value).toEqual(['2026-08-10', '2026-08-14'])
    expect(h.gridcell('2026-08-12').hasAttribute('data-in-range')).toBe(false)
    expect(h.gridcell('2026-08-13').getAttribute('data-in-range')).toBe('')
  })

  it('不允许跨过不可用日时，起点之后的第一个不可用日就是终点的上限', () => {
    const h = mount({
      defaultOpen: true,
      visibleCount: 2,
      defaultFocusedValue: '2026-08-10',
      isDateUnavailable: value => value === '2026-08-12',
    })
    click(h.cell('2026-08-10'))
    expect(h.cell('2026-08-14').getAttribute('aria-disabled')).toBe('true')
    click(h.cell('2026-08-14'))
    expect(h.api().value).toEqual([])
    click(h.cell('2026-08-11'))
    expect(h.api().value).toEqual(['2026-08-10', '2026-08-11'])
  })
})

describe('值被整份改写后区间不再跟着鼠标走', () => {
  it('点了起点再整份写值（快捷选项 / 清空 / setValue）：那个起点作废，指针扫过不再铺预览带', () => {
    // 钉住铺开的那一页：不给就落到「今天」那一页，用例里写死的八月格子会随日历时钟消失
    const h = mount({
      defaultOpen: true,
      visibleCount: 2,
      defaultFocusedValue: '2026-08-10',
      presets: [{ value: '2026-08-01/2026-08-31', label: '整月' }],
    })
    // 先落一个起点，区间进入「挑到一半」
    click(h.cell('2026-08-10'))
    expect(h.api().value).toEqual([])
    expect(h.api().calendar.rangeAnchor).toBe('2026-08-10')

    // 整份写进去，与点快捷选项同一条路：起点作废
    h.api().setValue(['2026-08-01', '2026-08-31'])
    expect(h.api().value).toEqual(['2026-08-01', '2026-08-31'])
    expect(h.api().calendar.rangeAnchor).toBeNull()

    // 指针扫过 8/20：区间仍是 8/01–8/31，不是从 8/10 铺到 8/20
    h.cell('2026-08-20').dispatchEvent(new Event('pointerenter'))
    expect(h.gridcell('2026-08-05').hasAttribute('data-in-range')).toBe(true)
    expect(h.gridcell('2026-08-25').hasAttribute('data-in-range')).toBe(true)
    expect(h.gridcell('2026-08-01').getAttribute('data-range-start')).toBe('')
    expect(h.gridcell('2026-08-31').getAttribute('data-range-end')).toBe('')
  })

  it('作废之后再点一格，是重新起一段而不是接着旧起点收口', () => {
    const h = mount({ defaultOpen: true, visibleCount: 2, defaultFocusedValue: '2026-08-10' })
    click(h.cell('2026-08-10'))
    h.api().setValue([])
    click(h.cell('2026-08-20'))
    expect(h.api().value).toEqual([])
    expect(h.api().calendar.rangeAnchor).toBe('2026-08-20')
    click(h.cell('2026-08-22'))
    expect(h.api().value).toEqual(['2026-08-20', '2026-08-22'])
  })

  it('escape 撤掉起点后浮层照常收起，原来的区间原样还在', () => {
    const h = mount({ defaultOpen: true, visibleCount: 2, defaultFocusedValue: '2026-08-10', defaultValue: ['2026-08-03', '2026-08-05'] })
    click(h.cell('2026-08-10'))
    expect(h.api().calendar.rangeAnchor).toBe('2026-08-10')
    h.grid.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }))
    expect(h.api().calendar.rangeAnchor).toBeNull()
    expect(h.api().value).toEqual(['2026-08-03', '2026-08-05'])
  })
})

describe('日历面板数量', () => {
  it('默认只铺一个面板，区间跨月也不自动加页', () => {
    expect(mount({ defaultFocusedValue: '2026-08-17' }).api().calendar.panels.map(p => [p.year, p.month])).toEqual([[2026, 8]])
    expect(mount({ defaultValue: ['2026-07-01', '2026-08-05'] }).api().calendar.panels).toHaveLength(1)
    expect(mount({ defaultValue: ['2026-07-01'] }).api().calendar.panels).toHaveLength(1)
    expect(mount({ granularity: 'month', defaultValue: ['2026-02-01', '2027-03-01'] }).api().calendar.panels).toHaveLength(1)
  })

  it('visibleCount 显式给了以它为准', () => {
    expect(mount({ visibleCount: 3, defaultFocusedValue: '2026-08-17' }).api().calendar.panels).toHaveLength(3)
    expect(mount({ visibleCount: 1, defaultFocusedValue: '2026-08-17' }).api().calendar.panels).toHaveLength(1)
    const two = mount({ visibleCount: 2, defaultValue: ['2026-07-01', '2026-07-31'] }).api().calendar.panels
    expect(two.map(p => [p.year, p.month])).toEqual([[2026, 7], [2026, 8]])
  })

  it('恒六行：五行月与六行月的网格一样高，关掉才按实际周数收', () => {
    // 2026 年 7 月是五行月，8 月是六行月
    expect(mount({ defaultValue: ['2026-07-15', '2026-07-20'] }).api().calendar.panels[0]!.weeks).toHaveLength(6)
    expect(mount({ defaultValue: ['2026-08-15', '2026-08-20'] }).api().calendar.panels[0]!.weeks).toHaveLength(6)
    expect(mount({ fixedWeeks: false, defaultValue: ['2026-07-15', '2026-07-20'] }).api().calendar.panels[0]!.weeks).toHaveLength(5)
  })
})

describe('内嵌范围日历原样复用，不重写一条', () => {
  it('翻月按钮与方向键都归日历，编排机只是跟着记聚焦日', () => {
    const h = mount({ defaultOpen: true, defaultValue: RANGE })
    click(h.next)
    expect(h.focusedValue()).toBe('2026-08-28')
    expect(h.rendered()).toContain('2026-08-15')
    // 值一动没动：翻月不是选日期
    expect(h.value()).toEqual(RANGE)

    const cell = h.cell('2026-08-28')
    cell.focus()
    press(cell, 'ArrowRight')
    expect(h.focusedValue()).toBe('2026-08-29')
  })

  it('聚焦日变化对外播报：网格是作者渲染的，这是「该重画了」的唯一信号', () => {
    const onFocusedValueChange = vi.fn()
    const h = mount({ defaultValue: RANGE, onFocusedValueChange })
    // 展开那一刻把聚焦日拉到起点
    click(h.trigger)
    expect(onFocusedValueChange).toHaveBeenLastCalledWith({ focusedValue: '2026-07-28' })

    click(h.next)
    expect(onFocusedValueChange).toHaveBeenLastCalledWith({ focusedValue: '2026-08-28' })

    const before = onFocusedValueChange.mock.calls.length
    // 落回同一天：值没变就不重复发
    h.cell('2026-08-28').focus()
    expect(onFocusedValueChange).toHaveBeenCalledTimes(before)
  })

  it('min / max 与 isDateUnavailable 一并转给日历', () => {
    const h = mount({
      defaultOpen: true,
      defaultValue: ['2026-07-15', '2026-07-18'],
      min: '2026-07-10',
      isDateUnavailable: (value: string) => value === '2026-07-20',
    })
    expect(h.cell('2026-07-09').getAttribute('aria-disabled')).toBe('true')
    expect(h.cell('2026-07-11').getAttribute('aria-disabled')).toBe('false')
    expect(h.cell('2026-07-20').getAttribute('aria-disabled')).toBe('true')
    click(h.cell('2026-07-20'))
    expect(h.value()).toEqual(['2026-07-15', '2026-07-18'])
    expect(h.api().calendar.rangeAnchor).toBeNull()
  })

  it('locale 同时决定周首日与段序：同一份标记换个 locale 就换一副面孔', () => {
    const zh = mount({ defaultValue: RANGE })
    expect(zh.segments()[0]!.getAttribute('data-segment')).toBe('year')
    expect(zh.segmentsEnd()[0]!.getAttribute('data-segment')).toBe('year')
    const en = mount({ locale: 'en-US', defaultValue: RANGE })
    expect(en.segments()[0]!.getAttribute('data-segment')).toBe('month')
    expect(en.segmentsEnd()[0]!.getAttribute('data-segment')).toBe('month')
  })

  it('calendar 挂载点自己戴本组件的标记，范围日历那套 part 挂在它里面', () => {
    const h = mount({ defaultOpen: true })
    expect(h.calendarEl.getAttribute('data-scope')).toBe('date-range-picker')
    expect(h.calendarEl.getAttribute('data-part')).toBe('calendar')
    expect(h.grid.getAttribute('data-scope')).toBe('calendar-range-picker')
    expect(h.grid.getAttribute('role')).toBe('grid')
    // 段位同理：两组 segment-group 是本组件的挂载点，里面各是一份分段输入的解剖
    expect(h.input.getAttribute('data-part')).toBe('segment-group')
    expect(h.input.getAttribute('data-index')).toBe('0')
    expect(h.input.getAttribute('role')).toBe('group')
    expect(h.inputEnd.getAttribute('data-part')).toBe('segment-group')
    expect(h.inputEnd.getAttribute('data-index')).toBe('1')
    expect(h.input.getAttribute('id')).not.toBe(h.inputEnd.getAttribute('id'))
    expect(h.segments()[0]!.getAttribute('data-scope')).toBe('date-field')
    expect(h.segmentsEnd()[0]!.getAttribute('data-scope')).toBe('date-field')
  })
})

describe('无障碍与表单出口', () => {
  it('两组分段容器各自报「开始日期」「结束日期」，禁用态显式报出来', () => {
    const h = mount({ disabled: true })
    expect(h.input.getAttribute('aria-label')).toBe('Start date')
    expect(h.inputEnd.getAttribute('aria-label')).toBe('End date')
    expect(h.input.getAttribute('aria-disabled')).toBe('true')
    expect(h.inputEnd.getAttribute('aria-disabled')).toBe('true')
    expect(h.segments()[0]!.getAttribute('aria-disabled')).toBe('true')
    expect(h.segmentsEnd()[0]!.getAttribute('aria-disabled')).toBe('true')
    // 触发钮与浮层借标题命名
    expect(h.trigger.getAttribute('aria-labelledby')).toBe(h.label.getAttribute('id'))
    expect(h.content.getAttribute('aria-labelledby')).toBe(h.label.getAttribute('id'))

    const named = mount({ translations: { startDate: '开始日期', endDate: '结束日期' } })
    expect(named.input.getAttribute('aria-label')).toBe('开始日期')
    expect(named.inputEnd.getAttribute('aria-label')).toBe('结束日期')
  })

  it('invalid / required 一路传到两组段位', () => {
    const h = mount({ invalid: true, required: true })
    expect(h.root.getAttribute('data-invalid')).toBe('')
    expect(h.segments()[0]!.getAttribute('aria-invalid')).toBe('true')
    expect(h.segments()[0]!.getAttribute('aria-required')).toBe('true')
    expect(h.segmentsEnd()[0]!.getAttribute('aria-invalid')).toBe('true')
    expect(h.segmentsEnd()[0]!.getAttribute('aria-required')).toBe('true')
  })

  it('任一端落在 min/max 之外时整份输入都标成不合法，不只是那一组段位', () => {
    const start = mount({ defaultValue: ['2020-01-01', '2026-07-28'], min: '2026-01-01' })
    expect(start.input.getAttribute('data-invalid')).toBe('')
    expect(start.inputEnd.hasAttribute('data-invalid')).toBe(false)
    // 红边长在 control 上：只标段位那一层，用户看不出整份输入出了错
    expect(start.root.getAttribute('data-invalid')).toBe('')
    expect(start.control.getAttribute('data-invalid')).toBe('')

    const end = mount({ defaultValue: ['2026-07-10', '2030-07-10'], max: '2026-12-31' })
    expect(end.input.hasAttribute('data-invalid')).toBe(false)
    expect(end.inputEnd.getAttribute('data-invalid')).toBe('')
    expect(end.root.getAttribute('data-invalid')).toBe('')
    expect(end.control.getAttribute('data-invalid')).toBe('')

    const ok = mount({ defaultValue: RANGE, min: '2026-01-01', max: '2026-12-31' })
    expect(ok.root.hasAttribute('data-invalid')).toBe(false)
    expect(ok.control.hasAttribute('data-invalid')).toBe(false)
  })

  it('name 与 endName 各自决定两份表单出口参不参与提交；禁用的控件也不提交', () => {
    const anonymous = mount({ defaultValue: RANGE })
    expect(anonymous.hiddenInput.hasAttribute('name')).toBe(false)
    expect(anonymous.hiddenInputEnd.hasAttribute('name')).toBe(false)

    const named = mount({ defaultValue: RANGE, name: 'from', endName: 'to' })
    expect(named.hiddenInput.getAttribute('name')).toBe('from')
    expect(named.hiddenInput.value).toBe('2026-07-28')
    expect(named.hiddenInputEnd.getAttribute('name')).toBe('to')
    expect(named.hiddenInputEnd.value).toBe('2026-08-02')

    // 只给 name：终点那份不参与提交
    const half = mount({ defaultValue: RANGE, name: 'from' })
    expect(half.hiddenInput.getAttribute('name')).toBe('from')
    expect(half.hiddenInputEnd.hasAttribute('name')).toBe(false)

    const off = mount({ defaultValue: RANGE, name: 'from', endName: 'to', disabled: true })
    expect(off.hiddenInput.disabled).toBe(true)
    expect(off.hiddenInputEnd.disabled).toBe(true)
  })

  it('清空按钮不占 Tab 位但带名字：读屏能找到它', () => {
    const h = mount({ defaultValue: RANGE })
    expect(h.clear.getAttribute('tabindex')).toBe('-1')
    expect(h.clear.hasAttribute('aria-hidden')).toBe(false)
    expect(h.clear.getAttribute('aria-label')).toBe('Clear')

    const named = mount({ defaultValue: RANGE, translations: { clearTrigger: '清空' } })
    expect(named.clear.getAttribute('aria-label')).toBe('清空')
  })
})

describe('findDateRangePickerCellEl', () => {
  it('按 ISO 串在浮层里找到那一格；找不到与空值都给 null', () => {
    const h = mount({ defaultOpen: true, defaultValue: RANGE })
    expect(findDateRangePickerCellEl(h.content, '2026-07-28')).toBe(h.cell('2026-07-28'))
    expect(findDateRangePickerCellEl(h.content, '1999-01-01')).toBeNull()
    expect(findDateRangePickerCellEl(h.content, null)).toBeNull()
    expect(findDateRangePickerCellEl(null, '2026-07-28')).toBeNull()
  })
})

describe('granularity 与输入行段集联动', () => {
  it('按月挑：两组各出「年-月」，段位只剩两块', () => {
    const h = mount({ granularity: 'month', defaultValue: ['2026-05-01', '2026-08-01'] })
    expect(h.api().field.segments.map(s => s.type)).toEqual(['year', 'month'])
    expect(h.api().field.segments.map(s => s.text)).toEqual(['2026', '05'])
    expect(h.api().fieldEnd.segments.map(s => s.text)).toEqual(['2026', '08'])
  })

  it('按季度挑：输入行出「2026-Q2」', () => {
    const h = mount({ granularity: 'quarter', defaultValue: ['2026-04-01', '2026-10-01'] })
    expect(h.api().field.segments.map(s => s.text)).toEqual(['2026', 'Q2'])
    expect(h.api().fieldEnd.segments.map(s => s.text)).toEqual(['2026', 'Q4'])
  })

  it('按年挑：输入行只剩年那一块', () => {
    const h = mount({ granularity: 'year', defaultValue: ['2026-01-01', '2028-01-01'] })
    expect(h.api().field.segments.map(s => s.text)).toEqual(['2026'])
    expect(h.api().fieldEnd.segments.map(s => s.text)).toEqual(['2028'])
  })

  it('按天挑照旧走 locale 那条路，段序不变', () => {
    expect(mount({ granularity: 'day', defaultValue: RANGE }).api().field.segments.map(s => s.type))
      .toEqual(['year', 'month', 'day'])
    expect(mount({ locale: 'en-US', defaultValue: RANGE }).api().fieldEnd.segments.map(s => s.type))
      .toEqual(['month', 'day', 'year'])
  })

  it('作者显式给 segments 时压过按 granularity 推出来的那一份，两组一起听', () => {
    const h = mount({ granularity: 'month', segments: ['year'], defaultValue: ['2026-05-01', '2026-08-01'] })
    expect(h.api().field.segments.map(s => s.type)).toEqual(['year'])
    expect(h.api().fieldEnd.segments.map(s => s.type)).toEqual(['year'])
  })

  it('切换粒度由内嵌日历清空旧选择并同步两组输入段', () => {
    const h = mount({ defaultValue: ['2026-05-12', '2026-05-20'] })
    h.setProps({ granularity: 'month' })
    expect(h.value()).toEqual([])
    expect(h.api().granularity).toBe('month')
    expect(h.api().field.segments.map(s => s.type)).toEqual(['year', 'month'])
    expect(h.api().fieldEnd.segments.map(s => s.type)).toEqual(['year', 'month'])
  })

  it('终点段位里改季度，终点落到那一季的头一天', () => {
    const h = mount({ granularity: 'quarter', defaultValue: ['2026-01-01', '2026-04-01'] })
    // 段位第 1 格是季度
    h.segmentsEnd()[1]!.focus()
    press(h.segmentsEnd()[1]!, '4')
    expect(h.value()).toEqual(['2026-01-01', '2026-10-01'])
  })

  it('周粒度：两端各出周序号，值统一存周期首日', () => {
    const h = mount({
      granularity: 'week',
      defaultValue: ['2026-08-10', '2026-09-07'],
    })
    // 起点是第 33 周，终点是第 37 周
    expect(h.api().field.segments.map(s => s.text)).toEqual(['2026', '33'])
    expect(h.api().fieldEnd.segments.map(s => s.text)).toEqual(['2026', '37'])
    // 把终点改成第 40 周：落的是那一周的周首日
    h.segmentsEnd()[1]!.focus()
    press(h.segmentsEnd()[1]!, '4')
    press(h.segmentsEnd()[1]!, '0')
    expect(h.value()).toEqual(['2026-08-10', '2026-09-28'])
  })

  it('对外同时提供可直接查询的周期首尾与回显键；缺一端即 null', () => {
    expect(mount({
      granularity: 'quarter',
      defaultValue: ['2026-01-01', '2026-07-01'],
    }).api().periodValue).toEqual({
      granularity: 'quarter',
      start: '2026-01-01',
      end: '2026-09-30',
      keys: ['2026-Q1', '2026-Q3'],
    })
    expect(mount({ granularity: 'quarter', defaultValue: ['2026-01-01'] }).api().periodValue).toBeNull()
    expect(mount({ granularity: 'quarter', defaultValue: ['', '2026-07-01'] }).api().periodValue).toBeNull()
  })
})

describe('浮层里的标题钻取', () => {
  it('日历的钻取经编排机收口，两边看到的是同一层', async () => {
    const h = await open({ defaultValue: ['2026-02-18', '2026-02-20'] })
    expect(h.api().activeView).toBe('day')
    h.api().setActiveView('year')
    expect(h.api().activeView).toBe('year')
    expect(h.api().calendar.activeView).toBe('year')
    expect(h.api().calendar.panels[0]!.headingLabel).toBe('2020年-2029年')
  })

  it('收起再展开回到作者要的那一档，不停在钻上去的那一层', async () => {
    const h = await open({ defaultValue: ['2026-02-18', '2026-02-20'] })
    h.api().setActiveView('year')
    expect(h.api().activeView).toBe('year')
    h.api().setOpen(false)
    await tick()
    h.api().setOpen(true)
    await tick()
    expect(h.api().activeView).toBe('day')
  })

  it('按月挑时展开就在月那一档', async () => {
    const h = await open({ granularity: 'month', defaultValue: ['2026-05-01', '2026-08-01'] })
    expect(h.api().activeView).toBe('month')
    expect(h.api().calendar.canZoomOutMonth).toBe(false)
    expect(h.api().calendar.canZoomOutYear).toBe(true)
  })

  it('钻到的层对外播报，宿主接得到', async () => {
    const onActiveViewChange = vi.fn()
    const h = await open({ defaultValue: ['2026-02-18', '2026-02-20'], onActiveViewChange })
    h.api().setActiveView('month')
    expect(onActiveViewChange).toHaveBeenLastCalledWith({ activeView: 'month' })
  })
})

describe('快捷选项', () => {
  const pick = (h: Harness, value: string): void => {
    (h.api().getPresetProps({ value }) as { onClick: () => void }).onClick()
  }

  it('只认恰好两端的那条：单日或三段以上按不下去，整段一次写进去并收起', () => {
    const h = mount({
      defaultOpen: true,
      presets: [
        { value: '2026-07-10', label: '某日' },
        { value: '2026-07-01/2026-07-31', label: '整月' },
        { value: '2026-07-01/2026-07-10/2026-07-20', label: '三段' },
      ],
    })
    expect(h.api().presets.map(p => p.disabled)).toEqual([true, false, true])
    pick(h, '2026-07-10')
    expect(h.value()).toEqual([])
    pick(h, '2026-07-01/2026-07-31')
    expect(h.value()).toEqual(['2026-07-01', '2026-07-31'])
    expect(h.state()).toBe('closed')
    expect(h.api().presets.map(p => p.selected)).toEqual([false, true, false])
  })

  it('任一端落在 min/max 之外或被作者判不可用的，按不下去', () => {
    const h = mount({
      min: '2026-07-05',
      max: '2026-07-25',
      isDateUnavailable: v => v === '2026-07-15',
      presets: [
        { value: '2026-07-01/2026-07-10', label: '界外' },
        { value: '2026-07-10/2026-07-15', label: '不可用' },
        { value: '2026-07-10/2026-07-20', label: '可用' },
      ],
    })
    expect(h.api().presets.map(p => p.disabled)).toEqual([true, true, false])
    pick(h, '2026-07-01/2026-07-10')
    expect(h.value()).toEqual([])
    pick(h, '2026-07-10/2026-07-20')
    expect(h.value()).toEqual(['2026-07-10', '2026-07-20'])
  })

  it('空值那条不算命中当前值；Tab 落点落在命中且可按的那条上', () => {
    const h = mount({
      defaultValue: ['2026-07-10', '2026-07-20'],
      presets: [
        { value: '', label: '空' },
        { value: '2026-07-10/2026-07-20', label: '命中', disabled: true },
        { value: '2026-07-01/2026-07-31', label: '可用' },
      ],
    })
    expect(h.api().presets.map(p => p.selected)).toEqual([false, true, false])
    const tabs = h.api().presets.map(p => (h.api().getPresetProps({ value: p.value }) as { tabindex: number }).tabindex)
    expect(tabs).toEqual([-1, -1, 0])
  })

  it('快捷区间工具函数按传入时区算今天，两端拼成一个串', () => {
    const base = today('UTC')
    const iso = (d: typeof base): string => d.toString()
    expect(dateRangePickerPresetRange(-6, 0, 'UTC')).toBe(`${iso(base.subtract({ days: 6 }))}/${iso(base)}`)
    // 顺序无所谓
    expect(dateRangePickerPresetRange(0, -6, 'UTC')).toBe(dateRangePickerPresetRange(-6, 0, 'UTC'))
    expect(dateRangePickerPresetMonth(0, 'UTC')).toMatch(/^\d{4}-\d{2}-01\/\d{4}-\d{2}-(28|29|30|31)$/)
    expect(dateRangePickerPresetYear(0, 'UTC')).toBe(`${base.year}-01-01/${base.year}-12-31`)
    expect(dateRangePickerPresetYear(-1, 'UTC')).toBe(`${base.year - 1}-01-01/${base.year - 1}-12-31`)
  })
})

function fakeEngine(): {
  port: PositionEnginePort
  calls: { anchor: Anchor, floating: HTMLElement, options: PositionOptions, emit: (r: PositionResult) => void }[]
  stops: () => number
} {
  const calls: { anchor: Anchor, floating: HTMLElement, options: PositionOptions, emit: (r: PositionResult) => void }[] = []
  let stops = 0
  return {
    calls,
    stops: () => stops,
    port: {
      attach: (anchor, floating, options, onResult) => {
        calls.push({ anchor, floating: floating as HTMLElement, options, emit: onResult })
        return () => {
          stops += 1
        }
      },
    },
  }
}

const POSITION_RESULT: PositionResult = { x: 12, y: 34, placement: 'bottom-start', hidden: false }

describe('connectDateRangePicker 形态轴', () => {
  it('不写 variant 时 root、positioner 与 control 都落 outline；写 subtle 如实落', () => {
    const fallback = mount()
    expect(fallback.root.getAttribute('data-variant')).toBe('outline')
    expect(fallback.positioner.getAttribute('data-variant')).toBe('outline')
    expect(fallback.control.getAttribute('data-variant')).toBe('outline')
    const subtle = mount({ variant: 'subtle' })
    expect(subtle.root.getAttribute('data-variant')).toBe('subtle')
    expect(subtle.positioner.getAttribute('data-variant')).toBe('subtle')
    expect(subtle.control.getAttribute('data-variant')).toBe('subtle')
  })
})

describe('connectDateRangePicker 家族角色', () => {
  it('control 投影 Field Chrome 的稳定角色与尺寸档（缺省 md），三个状态属性都在盒上', () => {
    const h = mount({ readOnly: true, invalid: true })
    expect(h.control.getAttribute('data-xh-field-chrome')).toBe('')
    expect(h.control.getAttribute('data-xh-field-size')).toBe('md')
    expect(h.control.getAttribute('data-readonly')).toBe('')
    expect(h.control.getAttribute('data-invalid')).toBe('')
    expect(mount({ disabled: true }).control.getAttribute('data-disabled')).toBe('')
    expect(mount({ size: 'lg' }).control.getAttribute('data-xh-field-size')).toBe('lg')
  })

  it('日历钮常驻、清空钮按 has-value 显隐，都走 field-inset ghost 档，尺寸档随 size 缺省 md', () => {
    const h = mount()
    for (const el of [h.trigger, h.clear]) {
      expect(el.getAttribute('data-xh-action-control')).toBe('')
      expect(el.getAttribute('data-xh-action-profile')).toBe('field-inset')
      expect(el.getAttribute('data-xh-action-variant')).toBe('ghost')
      expect(el.getAttribute('data-xh-action-size')).toBe('md')
    }
    expect(h.trigger.getAttribute('data-xh-action-display')).toBe('always')
    expect(h.clear.getAttribute('data-xh-action-display')).toBe('has-value')
    expect(h.clear.hasAttribute('data-xh-action-has-value')).toBe(false)
    expect(mount({ defaultValue: ['2026-08-01', '2026-08-31'] }).clear.getAttribute('data-xh-action-has-value')).toBe('')
    expect(mount({ size: 'sm' }).trigger.getAttribute('data-xh-action-size')).toBe('sm')
  })

  it('快捷选项投影 Collection Item 的 overlay 语境与尺寸档', () => {
    const presets = [{ value: '2026-08-01/2026-08-31', label: '整月' }]
    const preset = mount({ presets }).api().getPresetProps({ value: presets[0]!.value }) as Record<string, unknown>
    expect(preset['data-xh-collection-item']).toBe('')
    expect(preset['data-xh-collection-size']).toBe('md')
    expect(preset['data-xh-collection-context']).toBe('overlay')
    expect((mount({ size: 'lg', presets }).api().getPresetProps({ value: presets[0]!.value }) as Record<string, unknown>)['data-xh-collection-size']).toBe('lg')
  })
})

describe('浮层定位', () => {
  it('等 DOM 落定才挂：进入展开态那一刻还没碰引擎，一拍之后才把锚点与浮层交进去', async () => {
    const engine = fakeEngine()
    const h = mount({}, { position: engine.port })
    h.api().setOpen(true)
    expect(engine.calls).toHaveLength(0)
    await tick()
    expect(engine.calls).toHaveLength(1)
    expect(engine.calls[0]!.anchor).toBe(h.control)
    expect(engine.calls[0]!.floating).toBe(h.positioner)
  })

  it('交给引擎的参数：缺省 bottom-start 与 8px，坐标系走视口，要可用空间，不要箭头', async () => {
    const engine = fakeEngine()
    const h = mount({}, { position: engine.port })
    h.api().setOpen(true)
    await tick()
    const options = engine.calls[0]!.options
    expect(options.placement).toBe('bottom-start')
    expect(options.offset).toBe(8)
    expect(options.strategy).toBe('fixed')
    expect(options.size).toBe(true)
    expect(options.dir).toBeUndefined()
    expect(options.arrow).toBeUndefined()
  })

  it('placement / offset / dir 由 props 覆盖', async () => {
    const engine = fakeEngine()
    const h = mount({ placement: 'top-end', offset: 2, dir: 'rtl' }, { position: engine.port })
    h.api().setOpen(true)
    await tick()
    const options = engine.calls[0]!.options
    expect(options.placement).toBe('top-end')
    expect(options.offset).toBe(2)
    expect(options.dir).toBe('rtl')
  })

  it('引擎回报的结果写进 context，连接层据此认落位', async () => {
    const engine = fakeEngine()
    const h = mount({}, { position: engine.port })
    h.api().setOpen(true)
    await tick()
    expect((h.api().getPositionerProps() as Record<string, unknown>)['data-positioned']).toBeUndefined()
    engine.calls[0]!.emit(POSITION_RESULT)
    expect(h.position()).toEqual(POSITION_RESULT)
    expect((h.api().getPositionerProps() as Record<string, unknown>)['data-positioned']).toBe('')
  })

  it('重新展开先把上一轮坐标清掉：再次落位之前不算已定位', async () => {
    const engine = fakeEngine()
    const h = mount({}, { position: engine.port })
    h.api().setOpen(true)
    await tick()
    engine.calls[0]!.emit(POSITION_RESULT)
    h.api().setOpen(false)
    // 收起中坐标还留着，退场要用
    expect(h.position()).toEqual(POSITION_RESULT)
    h.api().setOpen(true)
    expect(h.position()).toBeNull()
  })

  it('收起即撤订阅', async () => {
    const engine = fakeEngine()
    const h = mount({}, { position: engine.port })
    h.api().setOpen(true)
    await tick()
    expect(engine.stops()).toBe(0)
    h.api().setOpen(false)
    expect(engine.stops()).toBe(1)
  })

  it('展开当拍又收起：那一拍到来时不再挂订阅', async () => {
    const engine = fakeEngine()
    const h = mount({}, { position: engine.port })
    h.api().setOpen(true)
    h.api().setOpen(false)
    await tick()
    expect(engine.calls).toHaveLength(0)
  })

  it('锚点或浮层缺席都不挂', async () => {
    const engine = fakeEngine()
    const noAnchor = mount({}, { position: engine.port })
    noAnchor.setRef('getAnchorEl', () => null)
    noAnchor.api().setOpen(true)
    await tick()
    expect(engine.calls).toHaveLength(0)

    const noFloating = mount({}, { position: engine.port })
    noFloating.setRef('getFloatingEl', () => null)
    noFloating.api().setOpen(true)
    await tick()
    expect(engine.calls).toHaveLength(0)
  })

  it('没有引擎照常转移，坐标仍被显式置空', async () => {
    const h = mount()
    h.api().setOpen(true)
    await tick()
    expect(h.state()).toBe('open')
    expect(h.position()).toBeNull()
  })
})

describe('dateRangePicker 真实退场资源', () => {
  it('逻辑关闭立即失活，Layer 与焦点域等 Presence 完成才释放；中途重开复用原登记', () => {
    const h = mount({ defaultOpen: true }, { withPresence: true })
    const presence = h.presence!
    const original = h.config.layerRegistry.list()[0]
    expect(original).toBeDefined()

    const leases: ExitLease[] = []
    const stopExit = presence.onBeforeExit(() => {
      leases.push(presence.claimExit(`date-range-picker exit ${leases.length + 1}`))
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

describe('层的拆除顺序', () => {
  it('逆序拆：先撤焦点域与消解层的订阅，最后才把层移出栈', async () => {
    const order: string[] = []
    const h = mount({}, { onLayerDispose: () => order.push('layer') })
    h.trigger.focus()
    click(h.trigger)
    await settle()
    await tick()
    const remove = document.removeEventListener.bind(document)
    const spy = vi.spyOn(document, 'removeEventListener').mockImplementation(((type: string, listener: EventListener, opts?: boolean | EventListenerOptions) => {
      // focusout 只有焦点域摘、pointerdown 只有消解层摘，拿它们当各自的拆除标记
      if (type === 'focusout')
        order.push('focus-scope')
      if (type === 'pointerdown')
        order.push('dismiss')
      remove(type, listener, opts)
    }) as typeof document.removeEventListener)
    h.api().setOpen(false)
    spy.mockRestore()
    expect(order).toEqual(['focus-scope', 'dismiss', 'layer'])
  })
})

describe('按压通道：Space / Enter 与触屏按住投影 data-pressed', () => {
  const key = (el: HTMLElement, type: 'keydown' | 'keyup', k: string): void => {
    el.dispatchEvent(new KeyboardEvent(type, { key: k, bubbles: true, cancelable: true }))
  }
  const pointer = (el: HTMLElement, type: string, pointerType: string): PointerEvent => {
    const event = new PointerEvent(type, { pointerType, bubbles: true, cancelable: true })
    el.dispatchEvent(event)
    return event
  }
  const pressed = (el: HTMLElement): boolean => el.hasAttribute('data-pressed')
  /** 夹具不渲染快捷选项列，直接拿 getter 的处理器驱动。 */
  type Handlers = Record<string, (e?: unknown) => void> & { 'data-pressed'?: string }
  const presetProps = (h: Harness, value: string): Handlers => h.api().getPresetProps({ value }) as unknown as Handlers
  const fakeKey = (k: string): KeyboardEventInit => ({ key: k, repeat: false, isComposing: false })
  const RANGE = ['2026-07-10', '2026-07-20'] as const

  it('触发钮：keydown 在场、keyup 撤下；失焦撤下；触屏按下在场、抬起 / 取消撤下；鼠标不走这一路；按住本身不开合', () => {
    const h = mount()
    expect(pressed(h.trigger)).toBe(false)
    key(h.trigger, 'keydown', ' ')
    expect(pressed(h.trigger)).toBe(true)
    key(h.trigger, 'keyup', ' ')
    expect(pressed(h.trigger)).toBe(false)
    key(h.trigger, 'keydown', 'Enter')
    expect(pressed(h.trigger)).toBe(true)
    h.trigger.dispatchEvent(new FocusEvent('blur'))
    expect(pressed(h.trigger)).toBe(false)
    pointer(h.trigger, 'pointerdown', 'touch')
    expect(pressed(h.trigger)).toBe(true)
    pointer(h.trigger, 'pointercancel', 'touch')
    expect(pressed(h.trigger)).toBe(false)
    pointer(h.trigger, 'pointerdown', 'touch')
    expect(pressed(h.trigger)).toBe(true)
    pointer(h.trigger, 'pointerup', 'touch')
    expect(pressed(h.trigger)).toBe(false)
    pointer(h.trigger, 'pointerdown', 'mouse')
    expect(pressed(h.trigger)).toBe(false)
    expect(h.state()).toBe('closed')
  })

  it('清空钮：按住投影且不清值，触屏按下仍拦掉默认聚焦', () => {
    const h = mount({ defaultValue: [...RANGE] })
    key(h.clear, 'keydown', 'Enter')
    expect(pressed(h.clear)).toBe(true)
    expect(pressed(h.trigger)).toBe(false)
    // 另一个部件的 keyup 松不开正按着的这个
    key(h.trigger, 'keyup', 'Enter')
    expect(pressed(h.clear)).toBe(true)
    key(h.clear, 'keyup', 'Enter')
    expect(pressed(h.clear)).toBe(false)
    expect(pointer(h.clear, 'pointerdown', 'touch').defaultPrevented).toBe(true)
    expect(pressed(h.clear)).toBe(true)
    pointer(h.clear, 'pointerup', 'touch')
    expect(pressed(h.clear)).toBe(false)
    expect(h.value()).toEqual([...RANGE])
  })

  it('快捷选项：按住投影，按值只亮那一条；Enter 写值收起后由展开态的 exit 松开', () => {
    const h = mount({ defaultOpen: true, presets: [{ value: '2026-07-01/2026-07-31', label: '整月' }, { value: '2026-08-01/2026-08-31', label: '下月' }] })
    presetProps(h, '2026-07-01/2026-07-31').onKeyDown!(fakeKey('Enter'))
    expect(presetProps(h, '2026-07-01/2026-07-31')['data-pressed']).toBe('')
    expect(presetProps(h, '2026-08-01/2026-08-31')['data-pressed']).toBeUndefined()
    presetProps(h, '2026-07-01/2026-07-31').onKeyUp!(fakeKey('Enter'))
    expect(presetProps(h, '2026-07-01/2026-07-31')['data-pressed']).toBeUndefined()
    presetProps(h, '2026-07-01/2026-07-31').onKeyDown!(fakeKey('Enter'))
    presetProps(h, '2026-07-01/2026-07-31').onClick!()
    expect(h.value()).toEqual(['2026-07-01', '2026-07-31'])
    expect(h.state()).toBe('closed')
    expect(presetProps(h, '2026-07-01/2026-07-31')['data-pressed']).toBeUndefined()
  })

  it('不进：整体禁用谁都不进；只读时清空钮与快捷选项不进（触发钮照常展开，照有回执）；按不下去的快捷选项不进', () => {
    const disabled = mount({ disabled: true, defaultOpen: true, defaultValue: [...RANGE], presets: [{ value: '2026-07-01/2026-07-31', label: '整月' }] })
    key(disabled.trigger, 'keydown', ' ')
    pointer(disabled.trigger, 'pointerdown', 'touch')
    key(disabled.clear, 'keydown', ' ')
    presetProps(disabled, '2026-07-01/2026-07-31').onKeyDown!(fakeKey('Enter'))
    expect(pressed(disabled.trigger)).toBe(false)
    expect(pressed(disabled.clear)).toBe(false)
    expect(presetProps(disabled, '2026-07-01/2026-07-31')['data-pressed']).toBeUndefined()

    const readOnly = mount({ readOnly: true, defaultOpen: true, defaultValue: [...RANGE], presets: [{ value: '2026-07-01/2026-07-31', label: '整月' }] })
    key(readOnly.clear, 'keydown', ' ')
    presetProps(readOnly, '2026-07-01/2026-07-31').onKeyDown!(fakeKey('Enter'))
    expect(pressed(readOnly.clear)).toBe(false)
    expect(presetProps(readOnly, '2026-07-01/2026-07-31')['data-pressed']).toBeUndefined()
    key(readOnly.trigger, 'keydown', ' ')
    expect(pressed(readOnly.trigger)).toBe(true)
    key(readOnly.trigger, 'keyup', ' ')

    const bounded = mount({ defaultOpen: true, min: '2026-07-05', presets: [
      { value: '2026-07-10', label: '单日' },
      { value: '2026-07-01/2026-07-10', label: '界外' },
      { value: '2026-07-10/2026-07-20', label: '禁用', disabled: true },
    ] })
    for (const value of ['2026-07-10', '2026-07-01/2026-07-10', '2026-07-10/2026-07-20']) {
      presetProps(bounded, value).onKeyDown!(fakeKey('Enter'))
      expect(presetProps(bounded, value)['data-pressed']).toBeUndefined()
    }
    // 没有值时清空钮藏着
    key(bounded.clear, 'keydown', ' ')
    expect(pressed(bounded.clear)).toBe(false)
  })

  it('按住途中转入禁用 / 只读或值被清空：部件随即失效，不会再来 keyup，按压面由机器自己收', () => {
    const inert = mount({ defaultValue: [...RANGE] })
    key(inert.trigger, 'keydown', 'Enter')
    expect(pressed(inert.trigger)).toBe(true)
    // 只读不拦触发钮
    inert.setProps({ readOnly: true })
    expect(pressed(inert.trigger)).toBe(true)
    inert.setProps({ disabled: true })
    expect(pressed(inert.trigger)).toBe(false)

    const readOnly = mount({ defaultOpen: true, presets: [{ value: '2026-07-01/2026-07-31', label: '整月' }] })
    presetProps(readOnly, '2026-07-01/2026-07-31').onKeyDown!(fakeKey('Enter'))
    expect(presetProps(readOnly, '2026-07-01/2026-07-31')['data-pressed']).toBe('')
    readOnly.setProps({ readOnly: true })
    expect(presetProps(readOnly, '2026-07-01/2026-07-31')['data-pressed']).toBeUndefined()

    const cleared = mount({ defaultValue: [...RANGE] })
    key(cleared.clear, 'keydown', 'Enter')
    expect(pressed(cleared.clear)).toBe(true)
    cleared.api().clear()
    expect(cleared.value()).toEqual([])
    expect(cleared.clear.hidden).toBe(true)
    expect(pressed(cleared.clear)).toBe(false)
  })
})
