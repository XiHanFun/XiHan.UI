// @vitest-environment jsdom
import type { RuntimeConfig } from '@xihan-ui/core'
import type { VanillaRuntime } from '@xihan-ui/core/vanilla'
import type { DatePickerApi, DatePickerSchema, DatePickerServices, DatePickerTimeUnit } from '../src/date-picker'
import { createCounterIdGenerator, createRuntimeConfig, createScope, createService, normalizeProps } from '@xihan-ui/core'
import { createVanillaRuntime } from '@xihan-ui/core/vanilla'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { calendarMachine } from '../src/calendar'
import { dateFieldMachine } from '../src/date-field'
import {
  connectDatePicker,
  datePickerCalendarProps,
  datePickerFieldEndProps,
  datePickerFieldProps,
  datePickerMachine,
  datePickerSegmentSet,
  findDatePickerCellEl,
} from '../src/date-picker'

type Props = DatePickerSchema['props']

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

interface Harness {
  api: () => DatePickerApi
  root: HTMLElement
  label: HTMLElement
  control: HTMLElement
  input: HTMLElement
  /** 终点那组分段容器；只有区间模式挂进文档。 */
  inputEnd: HTMLElement
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
  segments: () => HTMLElement[]
  /** 终点那组的段位，文档序。 */
  segmentsEnd: () => HTMLElement[]
  /** 段位的可见文字，文档序。 */
  /** 某一列的容器与逐格节点；没开 showTime 时列仍在但带 hidden。 */
  timeColumn: (unit: DatePickerTimeUnit) => { col: HTMLElement, items: Map<string, HTMLElement> }
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
}

const runtimes: VanillaRuntime[] = []

/**
 * 挂载一台完整的日期选择器：编排机 + 内嵌日历 + 两台内嵌分段输入共用一个运行时与一份 scope，
 * 网格随聚焦日重画——这正是作者该做的事（连接层只给数据，不生成节点）。
 * 重画只在「这个月的日期集合真的换了」时发生，与 Vue 的 keyed diff 同语义。
 *
 * 机器一律建两台，终点那组的节点只有区间模式才挂进文档，与两个适配器同语义。
 */
function mount(initial: Partial<Props> = {}): Harness {
  const doc = document
  const runtime = createVanillaRuntime()
  runtimes.push(runtime)
  const range = (initial.selectionMode ?? 'single') === 'range'
  // props 挂在 signal 上：布尔态受控（open）靠 watch 里的 track 回写，
  // 而 track 只在有值真的变过时才复查——直接改一个普通对象，宿主的写回就被静默吞掉了
  const props = runtime.signal<Partial<Props>>({ locale: 'zh-CN', timeZone: 'UTC', ...initial })

  const idGen = createCounterIdGenerator()
  const scope = createScope(null, idGen)

  const root = doc.createElement('div')
  const label = doc.createElement('span')
  label.textContent = '截止日期'
  const control = doc.createElement('div')
  const input = doc.createElement('div')
  const segmentEls = Array.from({ length: SEGMENT_NODES }, () => doc.createElement('div'))
  input.append(...segmentEls)
  const inputEnd = doc.createElement('div')
  const segmentEndEls = Array.from({ length: SEGMENT_NODES }, () => doc.createElement('div'))
  inputEnd.append(...segmentEndEls)
  const clear = doc.createElement('button')
  const trigger = doc.createElement('button')
  control.append(input, ...(range ? [inputEnd] : []), clear, trigger)
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
  // showTime 的时间列：作者照 timeColumns 铺，收起时由连接层打 hidden
  const timeWrap = doc.createElement('div')
  content.appendChild(timeWrap)
  positioner.appendChild(content)
  root.append(label, control, hiddenInput, ...(range ? [hiddenInputEnd] : []), positioner)
  doc.body.appendChild(root)

  // 顺序要紧：内嵌机器的 props 都从编排机现读，编排机必须先立起来
  const rootService = createService(datePickerMachine, { props: () => props.get(), runtime, scope })
  const calendarService = createService(calendarMachine, {
    props: () => datePickerCalendarProps(rootService),
    runtime,
    scope,
  })
  const fieldService = createService(dateFieldMachine, {
    props: () => datePickerFieldProps(rootService),
    runtime,
    scope,
  })
  const fieldEndService = createService(dateFieldMachine, {
    props: () => datePickerFieldEndProps(rootService),
    runtime,
    scope,
  })
  const services: DatePickerServices = {
    root: rootService,
    calendar: calendarService,
    field: fieldService,
    fieldEnd: fieldEndService,
  }

  const config: RuntimeConfig = createRuntimeConfig({ scope, idGenerator: idGen })
  rootService.refs.set('config', config)
  rootService.refs.set('registerLayer', () => config.layerRegistry.register({
    kind: 'popover',
    node: () => content,
    // 整个输入行记为本层分支：点 trigger 算层内交互，开合交给它自己切换。
    // 否则同一次点击先被判为层外交互关一次、再被 click 打开一次，等于关不掉
    branches: () => [control],
    isModal: () => false,
    setModal: () => {},
    surfaces: () => [],
  }))
  rootService.refs.set('getAnchorEl', () => control)
  rootService.refs.set('getFloatingEl', () => positioner)
  rootService.refs.set('getContentEl', () => content)
  calendarService.refs.set('getGridEl', () => grid)

  const timeEls = new Map<DatePickerTimeUnit, { col: HTMLElement, items: Map<string, HTMLElement> }>()
  let timePainted = ''
  const triggers = new Map<string, HTMLElement>()
  const cells = new Map<string, HTMLElement>()
  let painted = ''

  const rebuild = (weeks: readonly (readonly { value: string }[])[]): void => {
    gridBody.textContent = ''
    triggers.clear()
    cells.clear()
    for (const week of weeks) {
      const row = doc.createElement('div')
      for (const day of week) {
        const cell = doc.createElement('div')
        const cellTrigger = doc.createElement('div')
        cellTrigger.textContent = day.value.slice(-2)
        cell.appendChild(cellTrigger)
        row.appendChild(cell)
        cells.set(day.value, cell)
        triggers.set(day.value, cellTrigger)
      }
      gridBody.appendChild(row)
    }
  }

  const render = (): void => {
    const api = connectDatePicker(services, normalizeProps)
    const key = api.calendar.weeks.map(w => w.map(d => d.value).join()).join('|')
    if (key !== painted) {
      painted = key
      rebuild(api.calendar.weeks)
    }
    spread(root, api.getRootProps() as Record<string, unknown>)
    spread(label, api.getLabelProps() as Record<string, unknown>)
    spread(control, api.getControlProps() as Record<string, unknown>)
    spread(input, api.getSegmentGroupProps() as Record<string, unknown>)
    spread(clear, api.getClearTriggerProps() as Record<string, unknown>)
    spread(trigger, api.getTriggerProps() as Record<string, unknown>)
    spread(hiddenInput, api.field.getHiddenInputProps() as Record<string, unknown>)
    segmentEls.forEach((el, index) => {
      spread(el, api.field.getSegmentProps({ index }) as Record<string, unknown>)
      // 段位的文字归适配器写：连接层只管属性与事件
      el.textContent = api.field.segments[index]?.text ?? ''
    })
    // 终点那一组：非区间模式连接层不露出它，节点也就不接线
    const fieldEnd = api.fieldEnd
    if (fieldEnd) {
      spread(inputEnd, api.getSegmentGroupProps({ index: 1 }) as Record<string, unknown>)
      spread(hiddenInputEnd, fieldEnd.getHiddenInputProps() as Record<string, unknown>)
      segmentEndEls.forEach((el, index) => {
        spread(el, fieldEnd.getSegmentProps({ index }) as Record<string, unknown>)
        el.textContent = fieldEnd.segments[index]?.text ?? ''
      })
    }
    // 时间列逐列铺：列数与选项数由 granularity 决定，变了就重建
    const timeKey = api.timeColumns.map(c => `${c.unit}:${c.options.length}`).join('|')
    if (timeKey !== timePainted) {
      timePainted = timeKey
      timeWrap.textContent = ''
      timeEls.clear()
      for (const column of api.timeColumns) {
        const col = doc.createElement('div')
        const items = new Map<string, HTMLElement>()
        for (const option of column.options) {
          const item = doc.createElement('div')
          item.textContent = option
          col.appendChild(item)
          items.set(option, item)
        }
        timeWrap.appendChild(col)
        timeEls.set(column.unit, { col, items })
      }
    }
    for (const [unit, { col, items }] of timeEls) {
      spread(col, api.getTimeColumnProps({ unit }) as Record<string, unknown>)
      for (const [value, el] of items)
        spread(el, api.getTimeItemProps({ unit, value }) as Record<string, unknown>)
    }
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
    api: () => connectDatePicker(services, normalizeProps),
    root,
    label,
    control,
    input,
    inputEnd,
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
    timeColumn: (unit: DatePickerTimeUnit) => {
      const found = timeEls.get(unit)
      if (!found)
        throw new Error(`没有 ${unit} 这一列（此刻 timeColumns 是 ${[...timeEls.keys()].join()}）`)
      return found
    },
    state: () => rootService.state.get(),
    value: () => rootService.context.get('value'),
    focusedValue: () => rootService.context.get('focusedValue'),
    returnFocus: () => rootService.context.get('returnFocus'),
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

/** flush 在 vanilla 运行时是 queueMicrotask；消解层的监听器注册还要过一个 setTimeout。 */
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
  it('裸串是单选简写，内部一律归一成数组', () => {
    expect(mount({ defaultValue: '2026-07-28' }).value()).toEqual(['2026-07-28'])
    expect(mount({ defaultValue: ['2026-07-01', '2026-07-09'], selectionMode: 'range' }).value())
      .toEqual(['2026-07-01', '2026-07-09'])
    expect(mount().value()).toEqual([])
  })

  it('setValue 单选截断到一个；区间去重并按先后排好', () => {
    const single = mount()
    single.api().setValue(['2026-07-28', '2026-08-01'])
    expect(single.value()).toEqual(['2026-07-28'])

    const range = mount({ selectionMode: 'range' })
    range.api().setValue(['2026-07-30', '2026-07-02', '2026-07-02'])
    expect(range.value()).toEqual(['2026-07-02', '2026-07-30'])
  })

  it('点日历里的一天：值落进编排机，段位与隐藏输入跟着对齐', () => {
    const onValueChange = vi.fn()
    const h = mount({ defaultOpen: true, defaultValue: '2026-07-28', onValueChange })
    click(h.cell('2026-07-15'))
    expect(h.value()).toEqual(['2026-07-15'])
    expect(onValueChange).toHaveBeenLastCalledWith({ value: ['2026-07-15'] })
    // 值同步的落点：分段输入是被编排机受控的，日历一选中它就得跟着改口
    expect(h.segmentTexts().slice(0, 3)).toEqual(['2026', '07', '15'])
    expect(h.hiddenInput.value).toBe('2026-07-15')
  })

  it('在段位里敲日期：值回到编排机，日历翻到那一天所在的月并把它标成选中', () => {
    const h = mount({ defaultOpen: true, defaultValue: '2026-07-28' })
    expect(h.rendered()).toContain('2026-07-01')
    const [year, month, day] = h.segments()
    year!.focus()
    press(year!, 'ArrowUp')
    expect(h.value()).toEqual(['2027-07-28'])
    expect(h.focusedValue()).toBe('2027-07-28')
    // 网格真的翻过去了：2026 年 7 月的日子已经不在了
    expect(h.rendered()).not.toContain('2026-07-15')
    expect(h.gridcell('2027-07-28').getAttribute('aria-selected')).toBe('true')
    expect(month!.getAttribute('data-segment')).toBe('month')
    expect(day!.getAttribute('data-segment')).toBe('day')
  })

  it('清空：无值收起 → 有值才出现，点完值清空、焦点回首段', () => {
    const empty = mount()
    expect(empty.clear.hidden).toBe(true)
    expect(empty.clear.hasAttribute('disabled')).toBe(false)
    expect(empty.clear.hasAttribute('data-disabled')).toBe(false)

    const h = mount({ defaultValue: '2026-07-28' })
    expect(h.clear.hidden).toBe(false)
    click(h.clear)
    expect(h.value()).toEqual([])
    expect(h.hiddenInput.value).toBe('')
    expect(h.segmentTexts().slice(0, 3)).toEqual(['yyyy', 'mm', 'dd'])
    expect(active()).toBe(h.segments()[0])
  })

  it('受控 value：宿主不写回则两侧都纹丝不动，回调照发；写回才跟着走', () => {
    const onValueChange = vi.fn()
    const h = mount({ value: '2026-07-28', defaultOpen: true, onValueChange })
    click(h.cell('2026-07-15'))
    expect(onValueChange).toHaveBeenCalledWith({ value: ['2026-07-15'] })
    expect(h.value()).toEqual(['2026-07-28'])
    expect(h.segmentTexts().slice(0, 3)).toEqual(['2026', '07', '28'])

    h.setProps({ value: '2026-07-15' })
    expect(h.value()).toEqual(['2026-07-15'])
    expect(h.segmentTexts().slice(0, 3)).toEqual(['2026', '07', '15'])
  })

  it('只读：日历点不动值，段位也改不动', () => {
    const h = mount({ readOnly: true, defaultOpen: true, defaultValue: '2026-07-28' })
    click(h.cell('2026-07-15'))
    expect(h.value()).toEqual(['2026-07-28'])
    const year = h.segments()[0]!
    year.focus()
    press(year, 'ArrowUp')
    expect(h.value()).toEqual(['2026-07-28'])
  })
})

describe('区间：起止两组段位', () => {
  it('两组各管一端：敲终点只改 value[1]，起点原封不动', () => {
    const h = mount({ selectionMode: 'range', defaultValue: ['2026-07-01', '2026-07-09'] })
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
    const h = mount({ selectionMode: 'range', onValueChange })
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

  it('终点早于起点也照位存放：段位那一路不排序、不去重', () => {
    const h = mount({ selectionMode: 'range', defaultValue: ['2026-07-20', '2026-07-25'] })
    const day = h.segmentsEnd()[2]!
    day.focus()
    // 5 后面再接一位最小也是 50，越过当月天数，这一下当场敲定
    press(day, '5')
    expect(h.value()).toEqual(['2026-07-20', '2026-07-05'])
    expect(h.segmentTexts().slice(0, 3)).toEqual(['2026', '07', '20'])
    // 日历跟着终点走，不被拽回起点
    expect(h.focusedValue()).toBe('2026-07-05')
  })
})

describe('closeOnSelect', () => {
  it('单选：选中即收起', () => {
    const h = mount({ defaultOpen: true })
    click(h.cell(h.rendered()[10]!))
    expect(h.state()).toBe('closed')
  })

  it('closeOnSelect=false：选完留在展开态，接着挑', () => {
    const h = mount({ defaultOpen: true, closeOnSelect: false })
    click(h.cell(h.rendered()[10]!))
    expect(h.value()).toHaveLength(1)
    expect(h.state()).toBe('open')
  })

  it('区间：只落起点不收起，两端都落定才收起', () => {
    const h = mount({ defaultOpen: true, selectionMode: 'range' })
    const days = h.rendered()
    click(h.cell(days[10]!))
    expect(h.value()).toEqual([days[10]])
    expect(h.state()).toBe('open')

    click(h.cell(days[14]!))
    expect(h.value()).toEqual([days[10], days[14]])
    expect(h.state()).toBe('closed')
  })

  it('多选：选多少次都不收起', () => {
    const h = mount({ defaultOpen: true, selectionMode: 'multiple' })
    const days = h.rendered()
    click(h.cell(days[10]!))
    click(h.cell(days[12]!))
    expect(h.value()).toHaveLength(2)
    expect(h.state()).toBe('open')
  })

  it('段位里敲出完整日期不会把浮层收起——那时用户还在打字', () => {
    const h = mount({ defaultOpen: true, defaultValue: '2026-07-28' })
    const year = h.segments()[0]!
    year.focus()
    press(year, 'ArrowUp')
    expect(h.value()).toEqual(['2027-07-28'])
    expect(h.state()).toBe('open')
  })

  it('受控 open 下选中日期：只发关闭意图，状态等宿主写回', () => {
    const onOpenChange = vi.fn()
    const h = mount({ open: true, onOpenChange })
    click(h.cell(h.rendered()[10]!))
    expect(h.state()).toBe('open')
    expect(onOpenChange).toHaveBeenLastCalledWith({ open: false })
    // 值这一路不受 open 受控影响，照落不误
    expect(h.value()).toHaveLength(1)
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

  it('home / End 到首末段', () => {
    const h = mount()
    const seg = h.segments()
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

  it('点标题把焦点送进首段；禁用时不送', () => {
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
    const h = mount({ defaultValue: '2026-07-28' })
    const segment = h.segments()[0]!
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
    const h = mount({ defaultValue: '2026-07-28' })
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

  it('点触发钮那一路照旧把焦点送进浮层', async () => {
    const h = await open({ defaultValue: '2026-07-28' })
    expect(active()).toBe(h.cell('2026-07-28'))
  })

  it('点清空钮不当成展开', async () => {
    const h = mount({ defaultValue: '2026-07-28' })
    click(h.clear)
    await tick()
    expect(h.state()).toBe('closed')
  })

  it('段上 Enter 收起：敲出来的值不触发选完即收，得给一个我填完了的手势', async () => {
    const h = await open({ selectionMode: 'range' })
    expect(h.state()).toBe('open')
    const group = h.input
    press(group, 'Enter')
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
    const h = mount({ defaultValue: '2026-07-28' })
    const segment = h.segments()[0]!
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
    const h = await open({ defaultValue: '2026-07-28' })
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
    const h = await open({ defaultValue: '2026-07-28' })
    press(active(), 'Escape')
    expect(h.state()).toBe('closed')
    expect(h.value()).toEqual(['2026-07-28'])
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

  it('重新展开会把聚焦日拉回当前选中值：上一轮翻到别处的月份不留到下一次', async () => {
    const h = await open({ defaultValue: '2026-07-28' })
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
    const h = mount({ defaultFocusedValue: '2026-11-05', defaultValue: '2026-03-09' })
    expect(h.api().value).toEqual(['2026-03-09'])
    expect(h.api().calendar.panels[0]!.month).toBe(11)
  })

  it('不给就退回首个选中值', () => {
    expect(mount({ defaultValue: '2026-03-09' }).api().calendar.panels[0]!.month).toBe(3)
  })
})

describe('值被整份改写后区间不再跟着鼠标走', () => {
  it('点了起点再整份写值（快捷选项 / 清空 / setValue）：那个起点作废，指针扫过不再铺预览带', () => {
    // 钉住铺开的那一页：不给就落到「今天」那一页，用例里写死的八月格子会随日历时钟消失
    const h = mount({
      defaultOpen: true,
      selectionMode: 'range',
      defaultFocusedValue: '2026-08-10',
      presets: [{ value: '2026-08-01/2026-08-31', label: '整月' }],
    })
    // 先落一个起点，区间进入「挑到一半」
    click(h.cell('2026-08-10'))
    expect(h.api().value).toEqual(['2026-08-10'])

    // 整份写进去，与点快捷选项同一条路
    h.api().setValue(['2026-08-01', '2026-08-31'])
    expect(h.api().value).toEqual(['2026-08-01', '2026-08-31'])

    // 指针扫过 7/20：区间仍是 7/01–7/31，不是从 7/15 铺到 7/20
    h.cell('2026-08-20').dispatchEvent(new Event('pointerenter'))
    expect(h.gridcell('2026-08-05').hasAttribute('data-in-range')).toBe(true)
    expect(h.gridcell('2026-08-25').hasAttribute('data-in-range')).toBe(true)
    expect(h.gridcell('2026-08-01').getAttribute('data-range-start')).toBe('')
    expect(h.gridcell('2026-08-31').getAttribute('data-range-end')).toBe('')
  })

  it('作废之后再点一格，是重新起一段而不是接着旧起点收口', () => {
    const h = mount({ defaultOpen: true, selectionMode: 'range', defaultFocusedValue: '2026-08-10' })
    click(h.cell('2026-08-10'))
    h.api().setValue([])
    click(h.cell('2026-08-20'))
    expect(h.api().value).toEqual(['2026-08-20'])
  })
})

describe('区间铺几个面板按两端现算', () => {
  it('单选一个面板；区间没选完按两个铺——另一端常在下一页', () => {
    expect(mount({ defaultFocusedValue: '2026-08-17' }).api().calendar.panels).toHaveLength(1)
    const range = mount({ selectionMode: 'range', defaultFocusedValue: '2026-08-17' }).api()
    expect(range.calendar.panels.map(p => [p.year, p.month])).toEqual([[2026, 8], [2026, 9]])
  })

  it('两端落在同一个月里只铺一页，跨月才铺两页', () => {
    const sameMonth = mount({ selectionMode: 'range', defaultValue: ['2026-07-01', '2026-07-31'] }).api()
    expect(sameMonth.calendar.panels.map(p => [p.year, p.month])).toEqual([[2026, 7]])

    const crossMonth = mount({ selectionMode: 'range', defaultValue: ['2026-07-01', '2026-08-05'] }).api()
    expect(crossMonth.calendar.panels.map(p => [p.year, p.month])).toEqual([[2026, 7], [2026, 8]])
  })

  it('只落了一端仍按两页铺', () => {
    expect(mount({ selectionMode: 'range', defaultValue: ['2026-07-01'] }).api().calendar.panels).toHaveLength(2)
  })

  it('粗粒度的一页是一年：同一年里的两个月只铺一页', () => {
    const sameYear = mount({ selectionMode: 'range', view: 'month', defaultValue: ['2026-02-01', '2026-11-01'] }).api()
    expect(sameYear.calendar.panels).toHaveLength(1)
    const crossYear = mount({ selectionMode: 'range', view: 'month', defaultValue: ['2026-02-01', '2027-03-01'] }).api()
    expect(crossYear.calendar.panels).toHaveLength(2)
  })

  it('visibleCount 显式给了以它为准，两种模式都听它的', () => {
    expect(mount({ visibleCount: 3, defaultFocusedValue: '2026-08-17' }).api().calendar.panels).toHaveLength(3)
    expect(mount({ selectionMode: 'range', visibleCount: 1, defaultFocusedValue: '2026-08-17' }).api().calendar.panels).toHaveLength(1)
    expect(mount({ selectionMode: 'range', visibleCount: 2, defaultValue: ['2026-07-01', '2026-07-31'] }).api().calendar.panels).toHaveLength(2)
  })

  it('恒六行：五行月与六行月的网格一样高，关掉才按实际周数收', () => {
    // 2026 年 7 月是五行月，8 月是六行月
    expect(mount({ defaultValue: '2026-07-15' }).api().calendar.panels[0]!.weeks).toHaveLength(6)
    expect(mount({ defaultValue: '2026-08-15' }).api().calendar.panels[0]!.weeks).toHaveLength(6)
    expect(mount({ fixedWeeks: false, defaultValue: '2026-07-15' }).api().calendar.panels[0]!.weeks).toHaveLength(5)
  })
})

describe('内嵌日历原样复用，不重写一条', () => {
  it('翻月按钮与方向键都归日历，编排机只是跟着记聚焦日', () => {
    const h = mount({ defaultOpen: true, defaultValue: '2026-07-28' })
    click(h.next)
    expect(h.focusedValue()).toBe('2026-08-28')
    expect(h.rendered()).toContain('2026-08-15')
    // 值一动没动：翻月不是选日期
    expect(h.value()).toEqual(['2026-07-28'])

    const cell = h.cell('2026-08-28')
    cell.focus()
    press(cell, 'ArrowRight')
    expect(h.focusedValue()).toBe('2026-08-29')
  })

  it('聚焦日变化对外播报：网格是作者渲染的，这是「该重画了」的唯一信号', () => {
    const onFocusedValueChange = vi.fn()
    const h = mount({ defaultValue: '2026-07-28', onFocusedValueChange })
    // 展开那一刻把聚焦日拉到选中值
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
      defaultValue: '2026-07-15',
      min: '2026-07-10',
      isDateUnavailable: (value: string) => value === '2026-07-20',
    })
    expect(h.cell('2026-07-09').getAttribute('aria-disabled')).toBe('true')
    expect(h.cell('2026-07-11').getAttribute('aria-disabled')).toBe('false')
    expect(h.cell('2026-07-20').getAttribute('aria-disabled')).toBe('true')
    click(h.cell('2026-07-20'))
    expect(h.value()).toEqual(['2026-07-15'])
  })

  it('locale 同时决定周首日与段序：同一份标记换个 locale 就换一副面孔', () => {
    const zh = mount({ defaultValue: '2026-07-28' })
    expect(zh.segments()[0]!.getAttribute('data-segment')).toBe('year')
    const en = mount({ locale: 'en-US', defaultValue: '2026-07-28' })
    expect(en.segments()[0]!.getAttribute('data-segment')).toBe('month')
  })

  it('calendar 挂载点自己戴本组件的标记，日历那套 part 挂在它里面', () => {
    const h = mount({ defaultOpen: true })
    expect(h.calendarEl.getAttribute('data-scope')).toBe('date-picker')
    expect(h.calendarEl.getAttribute('data-part')).toBe('calendar')
    expect(h.grid.getAttribute('data-scope')).toBe('calendar')
    expect(h.grid.getAttribute('role')).toBe('grid')
    // 段位同理：segment-group 是本组件的挂载点，里面是分段输入那一份解剖
    expect(h.input.getAttribute('data-part')).toBe('segment-group')
    expect(h.input.getAttribute('role')).toBe('group')
    expect(h.segments()[0]!.getAttribute('data-scope')).toBe('date-field')
  })
})

describe('无障碍与表单出口', () => {
  it('分段容器由标题命名，禁用态显式报出来', () => {
    const h = mount({ disabled: true })
    expect(h.input.getAttribute('aria-labelledby')).toBe(h.label.getAttribute('id'))
    expect(h.input.getAttribute('aria-disabled')).toBe('true')
    expect(h.segments()[0]!.getAttribute('aria-disabled')).toBe('true')
  })

  it('invalid / required 一路传到段位', () => {
    const h = mount({ invalid: true, required: true })
    expect(h.root.getAttribute('data-invalid')).toBe('')
    expect(h.segments()[0]!.getAttribute('aria-invalid')).toBe('true')
    expect(h.segments()[0]!.getAttribute('aria-required')).toBe('true')
  })

  it('值落在 min/max 之外时整份输入都标成不合法，不只是那一组段位', () => {
    const h = mount({ defaultValue: '2020-01-01', min: '2026-01-01' })
    expect(h.input.getAttribute('data-invalid')).toBe('')
    // 红边长在 control 上：只标段位那一层，用户看不出整份输入出了错
    expect(h.root.getAttribute('data-invalid')).toBe('')
    expect(h.control.getAttribute('data-invalid')).toBe('')

    const ok = mount({ defaultValue: '2026-07-28', min: '2026-01-01' })
    expect(ok.root.hasAttribute('data-invalid')).toBe(false)
    expect(ok.control.hasAttribute('data-invalid')).toBe(false)
  })

  it('区间模式下终点那端越界，整份输入照样标成不合法', () => {
    const h = mount({ selectionMode: 'range', defaultValue: ['2026-07-10', '2030-07-10'], max: '2026-12-31' })
    expect(h.inputEnd.getAttribute('data-invalid')).toBe('')
    expect(h.root.getAttribute('data-invalid')).toBe('')
    expect(h.control.getAttribute('data-invalid')).toBe('')
  })

  it('name 缺省即不参与提交；禁用的控件也不提交', () => {
    const anonymous = mount({ defaultValue: '2026-07-28' })
    expect(anonymous.hiddenInput.hasAttribute('name')).toBe(false)

    const named = mount({ defaultValue: '2026-07-28', name: 'due' })
    expect(named.hiddenInput.getAttribute('name')).toBe('due')
    expect(named.hiddenInput.value).toBe('2026-07-28')

    const off = mount({ defaultValue: '2026-07-28', name: 'due', disabled: true })
    expect(off.hiddenInput.disabled).toBe(true)
  })

  it('清空按钮不占 Tab 位但带名字：读屏能找到它', () => {
    const h = mount({ defaultValue: '2026-07-28' })
    expect(h.clear.getAttribute('tabindex')).toBe('-1')
    expect(h.clear.hasAttribute('aria-hidden')).toBe(false)
    expect(h.clear.getAttribute('aria-label')).toBe('Clear')

    const named = mount({ defaultValue: '2026-07-28', translations: { clearTrigger: '清空' } })
    expect(named.clear.getAttribute('aria-label')).toBe('清空')
  })
})

describe('findDatePickerCellEl', () => {
  it('按 ISO 串在浮层里找到那一格；找不到与空值都给 null', () => {
    const h = mount({ defaultOpen: true, defaultValue: '2026-07-28' })
    expect(findDatePickerCellEl(h.content, '2026-07-28')).toBe(h.cell('2026-07-28'))
    expect(findDatePickerCellEl(h.content, '1999-01-01')).toBeNull()
    expect(findDatePickerCellEl(h.content, null)).toBeNull()
    expect(findDatePickerCellEl(null, '2026-07-28')).toBeNull()
  })
})

describe('view 与输入行段集联动', () => {
  it('挑的粒度决定输入行铺哪几块', () => {
    expect(datePickerSegmentSet('month')).toEqual(['year', 'month'])
    expect(datePickerSegmentSet('quarter')).toEqual(['year', 'quarter'])
    expect(datePickerSegmentSet('year')).toEqual(['year'])
    // 按天挑不给段集：留空才走 granularity 那条路，年月日按 locale 排
    expect(datePickerSegmentSet('day')).toBeUndefined()
    expect(datePickerSegmentSet(undefined)).toBeUndefined()
    // 周选挑的是整周，日号在输入行里没有意义
    expect(datePickerSegmentSet('day', true)).toEqual(['year', 'week'])
  })

  it('按月挑：输入行出「2026-05」，段位只剩两块', () => {
    const h = mount({ view: 'month', defaultValue: '2026-05-01' })
    const segments = h.api().field.segments
    expect(segments.map(s => s.type)).toEqual(['year', 'month'])
    expect(segments.map(s => s.text)).toEqual(['2026', '05'])
  })

  it('按季度挑：输入行出「2026-Q2」', () => {
    const h = mount({ view: 'quarter', defaultValue: '2026-04-01' })
    expect(h.api().field.segments.map(s => s.text)).toEqual(['2026', 'Q2'])
  })

  it('按年挑：输入行只剩年那一块', () => {
    const h = mount({ view: 'year', defaultValue: '2026-01-01' })
    expect(h.api().field.segments.map(s => s.text)).toEqual(['2026'])
  })

  it('按天挑照旧走 locale 那条路，段序不变', () => {
    expect(mount({ view: 'day', defaultValue: '2026-08-17' }).api().field.segments.map(s => s.type))
      .toEqual(['year', 'month', 'day'])
    expect(mount({ locale: 'en-US', defaultValue: '2026-08-17' }).api().field.segments.map(s => s.type))
      .toEqual(['month', 'day', 'year'])
  })

  it('作者显式给 segments 时压过按 view 推出来的那一份', () => {
    const h = mount({ view: 'month', segments: ['year'], defaultValue: '2026-05-01' })
    expect(h.api().field.segments.map(s => s.type)).toEqual(['year'])
  })

  it('段位里改季度，值落到那一季的头一天', () => {
    const h = mount({ view: 'quarter', defaultValue: '2026-04-01' })
    // 段位第 1 格是季度
    h.segments()[1]!.focus()
    press(h.segments()[1]!, '4')
    expect(h.value()).toEqual(['2026-10-01'])
  })

  it('周选：两端各出周序号，改终点那一格落的是那一周的周末日', () => {
    const h = mount({
      selectionMode: 'range',
      weekSelection: true,
      defaultValue: ['2026-08-10', '2026-09-13'],
    })
    // 起点是第 33 周，终点是第 37 周（2026-09-13 是周日，第 37 周的末日）
    expect(h.api().field.segments.map(s => s.text)).toEqual(['2026', '33'])
    expect(h.api().fieldEnd!.segments.map(s => s.text)).toEqual(['2026', '37'])
    // 把终点改成第 40 周：落的是那一周的周末日，不是周首日
    h.segmentsEnd()[1]!.focus()
    press(h.segmentsEnd()[1]!, '4')
    press(h.segmentsEnd()[1]!, '0')
    expect(h.value()).toEqual(['2026-08-10', '2026-10-04'])
  })
})

describe('浮层里的标题钻取', () => {
  it('日历的钻取经编排机收口，两边看到的是同一层', async () => {
    const h = await open({ defaultValue: '2026-02-18' })
    expect(h.api().activeView).toBe('day')
    h.api().setActiveView('year')
    expect(h.api().activeView).toBe('year')
    expect(h.api().calendar.activeView).toBe('year')
    expect(h.api().calendar.panels[0]!.headingLabel).toBe('2020年-2029年')
  })

  it('收起再展开回到作者要的那一档，不停在钻上去的那一层', async () => {
    const h = await open({ defaultValue: '2026-02-18' })
    h.api().setActiveView('year')
    expect(h.api().activeView).toBe('year')
    h.api().setOpen(false)
    await tick()
    h.api().setOpen(true)
    await tick()
    expect(h.api().activeView).toBe('day')
  })

  it('按月挑时展开就在月那一档', async () => {
    const h = await open({ view: 'month', defaultValue: '2026-05-01' })
    expect(h.api().activeView).toBe('month')
    expect(h.api().calendar.canZoomOutMonth).toBe(false)
    expect(h.api().calendar.canZoomOutYear).toBe(true)
  })

  it('钻到的层对外播报，宿主接得到', async () => {
    const onActiveViewChange = vi.fn()
    const h = await open({ defaultValue: '2026-02-18', onActiveViewChange })
    h.api().setActiveView('month')
    expect(onActiveViewChange).toHaveBeenLastCalledWith({ activeView: 'month' })
  })
})

describe('showTime 的时间列：键盘走得进去', () => {
  const AT = { showTime: true, defaultValue: '2026-08-17T09:30', timeGranularity: 'minute' as const }

  it('每列只有一个 Tab 位，落在选中那一格上', async () => {
    const h = await open(AT)
    const hour = h.timeColumn('hour')
    expect(hour.items.get('09')!.getAttribute('tabindex')).toBe('0')
    expect(hour.items.get('10')!.getAttribute('tabindex')).toBe('-1')
    // 列自己不占 Tab 位——格子里有落点
    expect(hour.col.getAttribute('tabindex')).toBe('-1')
    const minute = h.timeColumn('minute')
    expect(minute.items.get('30')!.getAttribute('tabindex')).toBe('0')
  })

  it('还没选过时间时落点是头一格', async () => {
    const h = await open({ showTime: true })
    expect(h.timeColumn('hour').items.get('00')!.getAttribute('tabindex')).toBe('0')
  })

  it('列是 listbox，方向与单选与否都显式说了', async () => {
    const h = await open(AT)
    const { col } = h.timeColumn('hour')
    expect(col.getAttribute('role')).toBe('listbox')
    expect(col.getAttribute('aria-orientation')).toBe('vertical')
    expect(col.getAttribute('aria-multiselectable')).toBe('false')
    expect(h.timeColumn('hour').items.get('09')!.getAttribute('aria-selected')).toBe('true')
    expect(h.timeColumn('hour').items.get('10')!.getAttribute('aria-selected')).toBe('false')
  })

  it('上下键在列内逐格走，到头回绕', async () => {
    const h = await open(AT)
    const { items } = h.timeColumn('hour')
    items.get('09')!.focus()
    press(items.get('09')!, 'ArrowDown')
    expect(active()).toBe(items.get('10'))
    press(items.get('10')!, 'ArrowUp')
    expect(active()).toBe(items.get('09'))
    // 头一格再往上回绕到末一格
    items.get('00')!.focus()
    press(items.get('00')!, 'ArrowUp')
    expect(active()).toBe(items.get('23'))
  })

  it('home / End 到本列两头', async () => {
    const h = await open(AT)
    const { items } = h.timeColumn('hour')
    items.get('09')!.focus()
    press(items.get('09')!, 'End')
    expect(active()).toBe(items.get('23'))
    press(items.get('23')!, 'Home')
    expect(active()).toBe(items.get('00'))
  })

  it('左右键换列，落到那一列的选中格上；两端停住', async () => {
    const h = await open(AT)
    const hour = h.timeColumn('hour')
    const minute = h.timeColumn('minute')
    hour.items.get('09')!.focus()
    press(hour.items.get('09')!, 'ArrowRight')
    // 分列的选中值是 30，落点就是它，不是头一格
    expect(active()).toBe(minute.items.get('30'))
    press(minute.items.get('30')!, 'ArrowLeft')
    expect(active()).toBe(hour.items.get('09'))
    // 首列再往左没有列可去
    press(hour.items.get('09')!, 'ArrowLeft')
    expect(active()).toBe(hour.items.get('09'))
  })

  it('回车选中聚焦的那一格，日期段原样留着', async () => {
    const h = await open(AT)
    const { items } = h.timeColumn('hour')
    items.get('09')!.focus()
    press(items.get('09')!, 'ArrowDown')
    press(items.get('10')!, 'Enter')
    expect(h.value()).toEqual(['2026-08-17T10:30'])
  })

  it('空格与回车同一条路', async () => {
    const h = await open(AT)
    const { items } = h.timeColumn('minute')
    items.get('30')!.focus()
    press(items.get('30')!, ' ')
    expect(h.value()).toEqual(['2026-08-17T09:30'])
  })

  it('选完之后 Tab 位跟着选中值走', async () => {
    const h = await open(AT)
    const hour = h.timeColumn('hour')
    click(hour.items.get('11')!)
    expect(h.value()).toEqual(['2026-08-17T11:30'])
    expect(hour.items.get('11')!.getAttribute('tabindex')).toBe('0')
    expect(hour.items.get('09')!.getAttribute('tabindex')).toBe('-1')
  })

  it('禁用时列不接键盘', async () => {
    const h = await open({ ...AT, disabled: true })
    const { col, items } = h.timeColumn('hour')
    expect(col.getAttribute('aria-disabled')).toBe('true')
    items.get('09')!.focus()
    const event = press(items.get('09')!, 'ArrowDown')
    expect(event.defaultPrevented).toBe(false)
  })

  it('带修饰键的组合一律放行', async () => {
    const h = await open(AT)
    const { items } = h.timeColumn('hour')
    items.get('09')!.focus()
    const event = press(items.get('09')!, 'ArrowDown', { ctrlKey: true })
    expect(event.defaultPrevented).toBe(false)
    expect(active()).toBe(items.get('09'))
  })

  it('没开 showTime 时列收起，也不占 Tab 位', async () => {
    const h = await open({ defaultValue: '2026-08-17' })
    // timeColumns 为空，作者那几个节点压根没铺出来
    expect(h.api().timeColumns).toEqual([])
  })
})

describe('快捷选项', () => {
  const pick = (h: Harness, value: string): void => {
    (h.api().getPresetProps({ value }) as { onClick: () => void }).onClick()
  }

  it('单日、区间各写各的；与模式不配的那条按不下去', () => {
    const single = mount({ defaultOpen: true, presets: [{ value: '2026-07-10', label: '某日' }, { value: '2026-07-01/2026-07-31', label: '整月' }] })
    expect(single.api().presets.map(p => p.disabled)).toEqual([false, true])
    pick(single, '2026-07-01/2026-07-31')
    expect(single.value()).toEqual([])
    pick(single, '2026-07-10')
    expect(single.value()).toEqual(['2026-07-10'])
    expect(single.state()).toBe('closed')

    const range = mount({ defaultOpen: true, selectionMode: 'range', presets: [{ value: '2026-07-10', label: '某日' }, { value: '2026-07-01/2026-07-31', label: '整月' }] })
    expect(range.api().presets.map(p => p.disabled)).toEqual([true, false])
    pick(range, '2026-07-01/2026-07-31')
    expect(range.value()).toEqual(['2026-07-01', '2026-07-31'])
    expect(range.state()).toBe('closed')
  })

  it('落在 min/max 之外或被作者判不可用的，按不下去', () => {
    const h = mount({
      min: '2026-07-05',
      max: '2026-07-25',
      isDateUnavailable: v => v === '2026-07-15',
      presets: [
        { value: '2026-07-01', label: '界外' },
        { value: '2026-07-15', label: '不可用' },
        { value: '2026-07-20', label: '可用' },
      ],
    })
    expect(h.api().presets.map(p => p.disabled)).toEqual([true, true, false])
    pick(h, '2026-07-01')
    expect(h.value()).toEqual([])
  })

  it('showTime：写日期时带上此刻的时间段，没有就零点；选中判定只看日期段', () => {
    const h = mount({ showTime: true, defaultValue: '2026-07-28T09:30', presets: [{ value: '2026-07-10', label: '某日' }, { value: '2026-07-28', label: '同日' }] })
    expect(h.api().presets.map(p => p.selected)).toEqual([false, true])
    pick(h, '2026-07-10')
    expect(h.value()).toEqual(['2026-07-10T09:30'])

    const empty = mount({ showTime: true, presets: [{ value: '2026-07-10', label: '某日' }] })
    pick(empty, '2026-07-10')
    expect(empty.value()).toEqual(['2026-07-10T00:00'])
  })

  it('空值那条不算命中当前值；Tab 落点落在命中且可按的那条上', () => {
    const h = mount({ presets: [{ value: '', label: '空' }, { value: '2026-07-10', label: '某日', disabled: true }, { value: '2026-07-20', label: '可用' }] })
    expect(h.api().presets.map(p => p.selected)).toEqual([false, false, false])
    const tabs = h.api().presets.map(p => (h.api().getPresetProps({ value: p.value }) as { tabindex: number }).tabindex)
    expect(tabs).toEqual([-1, -1, 0])
  })
})

describe('showTime 的时间列：名字不是内部枚举', () => {
  const columnLabel = (h: Harness, unit: 'hour' | 'minute' | 'second'): unknown =>
    (h.api().getTimeColumnProps({ unit }) as Record<string, unknown>)['aria-label']

  it('缺省名字与时间选择器那份逐字相同', () => {
    const h = mount({ showTime: true, timeGranularity: 'second', defaultValue: '2026-08-17T09:30:00', defaultOpen: true })
    expect(columnLabel(h, 'hour')).toBe('hour')
    expect(columnLabel(h, 'minute')).toBe('minute')
    expect(columnLabel(h, 'second')).toBe('second')
  })

  it('作者给了文案就用作者那份，三列各归各的', () => {
    const h = mount({
      showTime: true,
      timeGranularity: 'second',
      defaultValue: '2026-08-17T09:30:00',
      defaultOpen: true,
      translations: { hour: '时', minute: '分', second: '秒' },
    })
    expect(columnLabel(h, 'hour')).toBe('时')
    expect(columnLabel(h, 'minute')).toBe('分')
    expect(columnLabel(h, 'second')).toBe('秒')
  })
})
