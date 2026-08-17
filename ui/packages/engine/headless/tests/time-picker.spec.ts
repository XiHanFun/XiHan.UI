// @vitest-environment jsdom
import type { RuntimeConfig } from '@xihan-ui/kernel'
import type { VanillaRuntime } from '@xihan-ui/machine/vanilla'
import type { TimeSegmentType } from '../src/time-field'
import type { TimePickerApi, TimePickerColumnUnit, TimePickerSchema } from '../src/time-picker'
import { createCounterIdGenerator, createRuntimeConfig, createScope, normalizeProps } from '@xihan-ui/kernel'
import { createService } from '@xihan-ui/machine'
import { createVanillaRuntime } from '@xihan-ui/machine/vanilla'
import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  connectTimePicker,
  resolveTimeStep,
  timePickerColumns,
  timePickerColumnsFor,
  timePickerItemValue,
  timePickerMachine,
} from '../src/time-picker'

type Props = TimePickerSchema['props']

const ALL_SEGMENTS: TimeSegmentType[] = ['hour', 'minute', 'second', 'dayPeriod']
const ALL_UNITS: TimePickerColumnUnit[] = ['hour', 'minute', 'second', 'dayPeriod']
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
  api: () => TimePickerApi
  root: HTMLElement
  label: HTMLElement
  control: HTMLElement
  trigger: HTMLButtonElement
  clear: HTMLButtonElement
  content: HTMLElement
  hiddenInput: HTMLInputElement
  segment: (type: TimeSegmentType) => HTMLElement
  column: (unit: TimePickerColumnUnit) => HTMLElement
  option: (unit: TimePickerColumnUnit, value: string) => HTMLElement
  setProps: (next: Partial<Props>) => void
  render: () => void
  state: () => string
  value: () => string
  destroy: () => void
}

const runtimes: VanillaRuntime[] = []

/**
 * 浮层里的选项按「不设界的全量网格」渲染一次就固定住：
 * min/max 是运行期才收窄的，作者若跟着重渲，被裁掉的格子就再也验不到 aria-disabled 了。
 * 真实作者会照 api.columns 渲染，那是这份网格的子集。
 */
function mount(initial: Partial<Props> = {}): Harness {
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
  label.textContent = '开始时间'
  const control = doc.createElement('div')
  const segments = new Map<TimeSegmentType, HTMLElement>()
  for (const type of ALL_SEGMENTS) {
    const el = doc.createElement('span')
    control.appendChild(el)
    segments.set(type, el)
  }
  const trigger = doc.createElement('button')
  const clear = doc.createElement('button')
  control.append(trigger, clear)
  const positioner = doc.createElement('div')
  const content = doc.createElement('div')
  positioner.appendChild(content)
  const hiddenInput = doc.createElement('input')
  root.append(label, control, positioner, hiddenInput)

  const grid = timePickerColumns({
    granularity: 'second',
    hourCycle: initial.hourCycle,
    step: initial.step,
  })
  const columns = new Map<TimePickerColumnUnit, HTMLElement>()
  const options = new Map<string, HTMLElement>()
  for (const unit of ALL_UNITS) {
    const columnEl = doc.createElement('div')
    columns.set(unit, columnEl)
    content.appendChild(columnEl)
    for (const value of grid.find(c => c.unit === unit)?.options ?? DAY_PERIOD_OPTIONS) {
      const optionEl = doc.createElement('div')
      optionEl.textContent = value
      columnEl.appendChild(optionEl)
      options.set(`${unit}:${value}`, optionEl)
    }
  }
  doc.body.appendChild(root)

  const service = createService(timePickerMachine, { props: () => props.get(), runtime, scope })

  const config: RuntimeConfig = createRuntimeConfig({ scope, idGenerator: idGen })
  service.refs.set('config', config)
  service.refs.set('registerLayer', () => config.layerRegistry.register({
    kind: 'popover',
    node: () => content,
    // 输入行记为本层分支：点触发器算层内交互，开合交给它自己切换
    branches: () => [control],
    isModal: () => false,
    setModal: () => {},
    surfaces: () => [],
  }))
  service.refs.set('getAnchorEl', () => control)
  service.refs.set('getFloatingEl', () => positioner)
  service.refs.set('getContentEl', () => content)

  const api = (): TimePickerApi => connectTimePicker(service, normalizeProps)

  const render = (): void => {
    const current = api()
    spread(root, current.getRootProps() as Record<string, unknown>)
    spread(label, current.getLabelProps() as Record<string, unknown>)
    spread(control, current.getControlProps() as Record<string, unknown>)
    for (const [type, el] of segments) {
      spread(el, current.getInputProps({ segment: type }) as Record<string, unknown>)
      // 两个适配器都由自己填段上的文字（spreader 不碰文本节点），这里照做
      el.textContent = current.getSegmentText({ segment: type })
    }
    spread(trigger, current.getTriggerProps() as Record<string, unknown>)
    spread(clear, current.getClearTriggerProps() as Record<string, unknown>)
    spread(positioner, current.getPositionerProps() as Record<string, unknown>)
    spread(content, current.getContentProps() as Record<string, unknown>)
    for (const [unit, el] of columns)
      spread(el, current.getColumnProps({ unit }) as Record<string, unknown>)
    for (const [key, el] of options) {
      const [unit, value] = key.split(':') as [TimePickerColumnUnit, string]
      spread(el, current.getItemProps({ unit, value }) as Record<string, unknown>)
      // 两个适配器都由自己填格子上的文字（spreader 不碰文本节点），这里照做
      el.textContent = current.getItemText({ unit, value })
    }
    spread(hiddenInput, current.getHiddenInputProps() as Record<string, unknown>)
  }

  runtime.start()
  // 任一 cell 变化就整体重打，与 WC 宿主的 wire() 同语义
  runtime.subscribe(render)
  render()

  return {
    api,
    root,
    label,
    control,
    trigger: trigger as HTMLButtonElement,
    clear: clear as HTMLButtonElement,
    content,
    hiddenInput: hiddenInput as HTMLInputElement,
    segment: type => segments.get(type)!,
    column: unit => columns.get(unit)!,
    option: (unit, value) => options.get(`${unit}:${value}`)!,
    setProps: (next) => {
      props.set({ ...props.get(), ...next })
      render()
    },
    render,
    state: () => service.state.get(),
    value: () => service.context.get('value'),
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

/**
 * 连等 n 个动画帧。
 * 每一拍都由上一拍的回调里排下一拍，与被等的那一方逐帧重试的排法对齐；
 * 不用定时器换算毫秒，帧的疏密由环境说了算。
 */
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

/** 一列里此刻还可选的那些格（被 min/max 裁掉的自报 aria-disabled）。 */
function enabledValues(el: HTMLElement): string[] {
  return [...el.children]
    .filter(child => child.getAttribute('aria-disabled') !== 'true')
    .map(child => child.getAttribute('data-value') ?? '')
}

describe('可选值列表（纯函数）', () => {
  it('默认排时分两列：时 0-23、分逐分钟，全部两位补零', () => {
    const columns = timePickerColumns()
    expect(columns.map(c => c.unit)).toEqual(['hour', 'minute'])
    expect(columns[0]!.options).toHaveLength(24)
    expect(columns[0]!.options[0]).toBe('00')
    expect(columns[0]!.options[23]).toBe('23')
    expect(columns[1]!.options).toHaveLength(60)
    expect(columns[1]!.options[5]).toBe('05')
  })

  it('granularity 决定排几列：hour 只有时列，second 多一列逐秒', () => {
    expect(timePickerColumns({ granularity: 'hour' }).map(c => c.unit)).toEqual(['hour'])
    const second = timePickerColumns({ granularity: 'second' })
    expect(second.map(c => c.unit)).toEqual(['hour', 'minute', 'second'])
    expect(second[2]!.options).toHaveLength(60)
  })

  it('step 只决定分列的粒度，秒列照旧逐秒', () => {
    const columns = timePickerColumns({ granularity: 'second', step: 15 })
    expect(columns[1]!.options).toEqual(['00', '15', '30', '45'])
    expect(columns[2]!.options).toHaveLength(60)
  })

  it('step 写坏了回落到逐分钟：0 会让循环停不下来，60 及以上只剩一格', () => {
    expect(resolveTimeStep(0)).toBe(1)
    expect(resolveTimeStep(-5)).toBe(1)
    expect(resolveTimeStep(60)).toBe(1)
    expect(resolveTimeStep(Number.NaN)).toBe(1)
    expect(resolveTimeStep(undefined)).toBe(1)
    expect(resolveTimeStep(7.9)).toBe(7)
    expect(timePickerColumns({ step: 0 })[1]!.options).toHaveLength(60)
  })

  it('12 小时制下时列是 1-12', () => {
    expect(timePickerColumns({ hourCycle: 12 })[0]!.options).toEqual(
      ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'],
    )
  })

  it('上下午成列，只在 12 小时制下出现且恒排末位', () => {
    expect(timePickerColumns({ hourCycle: 12 }).map(c => c.unit)).toEqual(['hour', 'minute', 'dayPeriod'])
    expect(timePickerColumns({ hourCycle: 12, granularity: 'second' }).map(c => c.unit))
      .toEqual(['hour', 'minute', 'second', 'dayPeriod'])
    // granularity=hour 也照给：上下午与精度无关
    expect(timePickerColumns({ hourCycle: 12, granularity: 'hour' }).map(c => c.unit))
      .toEqual(['hour', 'dayPeriod'])
    // 24 小时制没有这一列
    expect(timePickerColumns({ granularity: 'second' }).some(c => c.unit === 'dayPeriod')).toBe(false)
  })

  it('上下午两格写的是 00 / 01，与这一段上报的数同一个域', () => {
    expect(timePickerColumns({ hourCycle: 12 }).at(-1)!.options).toEqual(['00', '01'])
  })

  it('上下午列在小时已选中且换算过去出界时才收窄', () => {
    // 还没挑小时：两格都留着
    expect(timePickerColumns({ hourCycle: 12, min: '09:00', max: '18:00' }).at(-1)!.options).toEqual(['00', '01'])
    // 挑的是 9 点（显示 09）：上午 9 点在界内，下午 9 点是 21 点、出界
    expect(timePickerColumns({ hourCycle: 12, min: '09:00', max: '18:00', hour: 9 }).at(-1)!.options).toEqual(['00'])
    // 挑的是 15 点（显示 03）：上午 3 点在界外，只剩下午
    expect(timePickerColumns({ hourCycle: 12, min: '09:00', max: '18:00', hour: 15 }).at(-1)!.options).toEqual(['01'])
    // 挑的是 10 点（显示 10）：上午 10 点、下午 22 点，只剩上午
    expect(timePickerColumns({ hourCycle: 12, min: '09:00', max: '18:00', hour: 10 }).at(-1)!.options).toEqual(['00'])
  })

  it('min/max 裁掉时列两端', () => {
    expect(timePickerColumns({ min: '09:00', max: '11:00' })[0]!.options).toEqual(['09', '10', '11'])
  })

  it('下界落在半点上时，那一个整点仍留着（它下面还有分可选）', () => {
    const columns = timePickerColumns({ min: '09:30', hour: 9 })
    expect(columns[0]!.options[0]).toBe('09')
    // 9 点这一格里，30 分之前的都不可选
    expect(columns[1]!.options[0]).toBe('30')
    expect(columns[1]!.options).toHaveLength(30)
  })

  it('分列只在时已选中且正好卡在界上时才收窄', () => {
    // 还没挑时：不替用户先限死
    expect(timePickerColumns({ min: '09:30' })[1]!.options).toHaveLength(60)
    // 挑的是界内的另一个整点：整列都可选
    expect(timePickerColumns({ min: '09:30', hour: 10 })[1]!.options).toHaveLength(60)
    // 上界那一侧同理
    expect(timePickerColumns({ max: '11:15', hour: 11 })[1]!.options).toEqual(['00', '01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13', '14', '15'])
    expect(timePickerColumns({ max: '11:15', hour: 10 })[1]!.options).toHaveLength(60)
  })

  it('秒列只在时与分都卡在界上时才收窄', () => {
    const onBound = timePickerColumns({ granularity: 'second', min: '09:30:20', hour: 9, minute: 30 })
    expect(onBound[2]!.options[0]).toBe('20')
    expect(onBound[2]!.options).toHaveLength(40)
    const inside = timePickerColumns({ granularity: 'second', min: '09:30:20', hour: 9, minute: 31 })
    expect(inside[2]!.options).toHaveLength(60)
  })

  it('12 小时制的裁剪按换算回去的真实小时判，上午下午各裁各的', () => {
    // 上午：09:00-18:00 之间只剩 9/10/11（12 上午是 0 点，在界外）
    expect(timePickerColumns({ hourCycle: 12, min: '09:00', max: '18:00', dayPeriod: 'am' })[0]!.options)
      .toEqual(['09', '10', '11'])
    // 下午：12(=12 点) 与 1-6(=13-18 点) 可选，7 点之后（19 点起）出界
    expect(timePickerColumns({ hourCycle: 12, min: '09:00', max: '18:00', dayPeriod: 'pm' })[0]!.options)
      .toEqual(['01', '02', '03', '04', '05', '06', '12'])
  })

  it('界写坏了当作没设界', () => {
    expect(timePickerColumns({ min: '不是时间', max: '' })[0]!.options).toHaveLength(24)
  })

  it('timePickerColumnsFor 从逐段缓冲里取上午/下午：小时已填时由它说了算', () => {
    const columns = timePickerColumnsFor(
      { hour: 15, minute: null, second: null, dayPeriod: 'am' },
      { hourCycle: 12, min: '09:00', max: '18:00' },
    )
    // 小时是 15（下午 3 点），缓冲里那个 am 不作数
    expect(columns[0]!.options).toEqual(['01', '02', '03', '04', '05', '06', '12'])
  })

  it('timePickerItemValue 一律两位补零，与段上的文字同一套写法', () => {
    expect(timePickerItemValue(0)).toBe('00')
    expect(timePickerItemValue(9)).toBe('09')
    expect(timePickerItemValue(23)).toBe('23')
  })
})

describe('开合', () => {
  it('默认收起：content 带 hidden、触发器报 aria-expanded=false', () => {
    const h = open()
    expect(h.state()).toBe('closed')
    expect(h.content.hasAttribute('hidden')).toBe(true)
    expect(h.trigger.getAttribute('aria-expanded')).toBe('false')
    expect(h.root.getAttribute('data-state')).toBe('closed')
  })

  it('点触发器展开并对外通知一次', () => {
    const onOpenChange = vi.fn()
    const h = open({ onOpenChange })
    h.trigger.click()
    expect(h.state()).toBe('open')
    expect(h.content.hasAttribute('hidden')).toBe(false)
    expect(h.trigger.getAttribute('aria-expanded')).toBe('true')
    expect(onOpenChange).toHaveBeenCalledWith({ open: true })
  })

  it('触发器上按上下键展开；Enter 不在按键里接（默认激活会再合成一次 click）', () => {
    const h = open()
    const down = pressKey(h.trigger, 'ArrowDown')
    expect(h.state()).toBe('open')
    expect(down.defaultPrevented).toBe(true)
    const enter = pressKey(h.trigger, 'Enter')
    expect(enter.defaultPrevented).toBe(false)
  })

  it('指针点开且这一段还空着：不预落锚点，Tab 位归时列容器', () => {
    const h = open()
    h.trigger.click()
    expect(h.api().focusedColumn).toBeNull()
    expect(h.api().focusedItem).toBeNull()
    expect(h.option('hour', '00').getAttribute('data-highlighted')).toBeNull()
    expect(h.option('hour', '00').getAttribute('tabindex')).toBe('-1')
    expect(h.column('hour').getAttribute('tabindex')).toBe('0')
  })

  it('键盘打开：下键落首格、上键落末格', () => {
    const down = open()
    pressKey(down.trigger, 'ArrowDown')
    expect(down.api().focusedItem).toBe('00')

    const up = open()
    pressKey(up.trigger, 'ArrowUp')
    expect(up.api().focusedItem).toBe('23')
  })

  it('enter 翻出来的那次 click 认得出自己是键盘入口，照样落首格；指针点的不落', () => {
    const byKey = open()
    // 平台的按钮激活：keydown 先到，紧接着才是那次 click
    pressKey(byKey.trigger, 'Enter')
    byKey.trigger.click()
    expect(byKey.api().focusedItem).toBe('00')

    const byPointer = open()
    byPointer.trigger.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }))
    byPointer.trigger.click()
    expect(byPointer.api().focusedItem).toBeNull()
  })

  it('展开时把焦点锚点落到时列：已选的时仍可选就停在它上面', () => {
    const h = open({ defaultValue: '09:30' })
    h.trigger.click()
    expect(h.api().focusedColumn).toBe('hour')
    expect(h.api().focusedItem).toBe('09')
  })

  it('点段位就展开，且焦点留在段上——那一下的用意是打字，不是挑时间', async () => {
    const h = open({ defaultValue: '09:30' })
    const segment = h.segment('hour')
    segment.focus()
    segment.click()
    await flushFrames(3)
    expect(h.state()).toBe('open')
    // 关键断言：焦点没被搬进浮层
    expect(document.activeElement).toBe(segment)
    expect(document.activeElement).not.toBe(h.option('hour', '09'))
  })

  it('已经展开时再点输入行不会把它关掉：正在编辑段位', async () => {
    const h = open({ defaultValue: '09:30' })
    h.trigger.click()
    await flushFrames(3)
    h.segment('hour').click()
    await flushFrames(1)
    expect(h.state()).toBe('open')
  })

  it('段上 Enter 收起：敲出来的值不触发选完即收，得给一个我填完了的手势', async () => {
    const h = open({ defaultValue: '09:30' })
    h.trigger.click()
    await flushFrames(3)
    expect(h.state()).toBe('open')
    pressKey(h.segment('hour'), 'Enter')
    await flushFrames(1)
    expect(h.state()).toBe('closed')
  })

  it('段上 Alt+ArrowDown 展开——触发钮是可选部件，键盘不能只靠它', async () => {
    const h = open({ defaultValue: '09:30' })
    const segment = h.segment('hour')
    segment.focus()
    pressKey(segment, 'ArrowDown', { altKey: true })
    await flushFrames(3)
    expect(h.state()).toBe('open')
    expect(document.activeElement).toBe(h.option('hour', '09'))
  })

  it('禁用时点输入行推不开', async () => {
    const h = open({ disabled: true })
    h.segment('hour').click()
    await flushFrames(1)
    expect(h.state()).toBe('closed')
  })

  it('指针点开且无锚点时，焦点域把焦点交给时列容器而不是首格', async () => {
    const h = open()
    h.trigger.click()
    await flushFrames(3)
    expect(document.activeElement).toBe(h.column('hour'))
  })

  it('焦点域把焦点交给锚点那一格，而不是落在容器上', async () => {
    const h = open({ defaultValue: '09:30' })
    h.trigger.click()
    // 落焦排在帧上：效应先于 open 的 entry 动作挂载，同步那一趟锚点还没算出来、
    // content 也还带着 hidden，焦点域要到下一帧才拿得到落点，最多重试三帧
    await flushFrames(3)
    expect(document.activeElement).toBe(h.option('hour', '09'))
  })

  it('已选的时被 min/max 裁掉时，锚点退回该列首格', () => {
    const h = open({ defaultValue: '02:30', min: '09:00', max: '11:00' })
    h.trigger.click()
    expect(h.api().focusedItem).toBe('09')
  })

  it('禁用：触发器用原生 disabled，点不开', () => {
    const h = open({ disabled: true })
    expect(h.trigger.disabled).toBe(true)
    // 原生 disabled 的按钮 click() 被激活行为短路，事件压根不派发，只能直接送给机器
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

  it('escape 收起（消解层收口），值不变', async () => {
    const h = open({ defaultValue: '09:30' })
    h.trigger.click()
    expect(h.state()).toBe('open')
    // 消解层的监听是延后注册的（免得打开自己的那次交互立刻把自己关掉），得让出一拍
    await new Promise(resolve => setTimeout(resolve, 0))
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
    expect(h.state()).toBe('closed')
    expect(h.value()).toBe('09:30')
  })

  it('tab 收起且不拦按键，焦点不抢回触发器', () => {
    const h = open()
    h.trigger.click()
    const event = pressKey(h.content, 'Tab')
    expect(event.defaultPrevented).toBe(false)
    expect(h.state()).toBe('closed')
  })
})

describe('浮层里的列与选项', () => {
  it('列是 listbox 并自报单位；精度不到秒时秒列收起', () => {
    const h = open()
    expect(h.column('hour').getAttribute('role')).toBe('listbox')
    expect(h.column('hour').getAttribute('data-value')).toBe('hour')
    expect(h.column('hour').getAttribute('aria-multiselectable')).toBe('false')
    expect(h.column('minute').hasAttribute('hidden')).toBe(false)
    expect(h.column('second').hasAttribute('hidden')).toBe(true)
  })

  it('granularity=second 时秒列显出', () => {
    const h = open({ granularity: 'second' })
    expect(h.column('second').hasAttribute('hidden')).toBe(false)
  })

  it('选项是 option，选中的那一格报 aria-selected=true，其余显式 false', () => {
    const h = open({ defaultValue: '09:30' })
    expect(h.option('hour', '09').getAttribute('aria-selected')).toBe('true')
    expect(h.option('hour', '10').getAttribute('aria-selected')).toBe('false')
    expect(h.option('minute', '30').getAttribute('aria-selected')).toBe('true')
  })

  it('min/max 之外的格留在列表里但不可选（aria-disabled，不是原生 disabled）', () => {
    const h = open({ min: '09:00', max: '11:00' })
    expect(h.option('hour', '08').getAttribute('aria-disabled')).toBe('true')
    expect(h.option('hour', '09').getAttribute('aria-disabled')).toBe('false')
    expect(h.option('hour', '08').hasAttribute('disabled')).toBe(false)
    expect(enabledValues(h.column('hour'))).toEqual(['09', '10', '11'])
  })

  it('选了整点之后分列跟着收窄：可选的分随当前的时变', () => {
    const h = open({ min: '09:30' })
    h.trigger.click()
    expect(enabledValues(h.column('minute'))).toHaveLength(60)
    h.option('hour', '09').click()
    expect(h.value()).toBe('')
    expect(enabledValues(h.column('minute'))[0]).toBe('30')
    expect(enabledValues(h.column('minute'))).toHaveLength(30)
  })

  it('每列各留一个 Tab 位：锚点那一格是 0，其余 -1', () => {
    const h = open({ defaultValue: '09:30' })
    h.trigger.click()
    expect(h.option('hour', '09').getAttribute('tabindex')).toBe('0')
    expect(h.option('hour', '10').getAttribute('tabindex')).toBe('-1')
    // 焦点不在分列上，分列的锚点落在它自己选中的那一格
    expect(h.option('minute', '30').getAttribute('tabindex')).toBe('0')
    expect(h.column('hour').getAttribute('tabindex')).toBe('-1')
  })

  it('整列被界卡空时由列本身兜底进 Tab 序列，否则键盘永远进不去', () => {
    // 09:00-09:00 之间只有 9 点整；把时选成 9 之后分列只剩 00
    const h = open({ min: '10:00', max: '09:00' })
    expect(h.api().columns[0]!.options).toEqual([])
    expect(h.column('hour').getAttribute('tabindex')).toBe('0')
  })
})

describe('浮层键盘', () => {
  it('上下键在列内走，走到尽头回绕', () => {
    const h = open({ defaultValue: '00:00' })
    h.trigger.click()
    pressKey(h.content, 'ArrowDown')
    expect(document.activeElement).toBe(h.option('hour', '01'))
    expect(h.api().focusedItem).toBe('01')
    pressKey(h.content, 'ArrowUp')
    pressKey(h.content, 'ArrowUp')
    // 00 再往上回绕到末格
    expect(document.activeElement).toBe(h.option('hour', '23'))
  })

  it('上下键跳过被界裁掉的格', () => {
    const h = open({ min: '09:00', max: '11:00', defaultValue: '11:00' })
    h.trigger.click()
    expect(h.api().focusedItem).toBe('11')
    // 11 是可选的末格，往下回绕应落到 09 而不是 12
    pressKey(h.content, 'ArrowDown')
    expect(document.activeElement).toBe(h.option('hour', '09'))
  })

  it('home / End 到本列首末格', () => {
    const h = open({ defaultValue: '09:30' })
    h.trigger.click()
    pressKey(h.content, 'End')
    expect(document.activeElement).toBe(h.option('hour', '23'))
    pressKey(h.content, 'Home')
    expect(document.activeElement).toBe(h.option('hour', '00'))
  })

  it('左右键换列并落到目标列的锚点上；两端停住不回绕', () => {
    const h = open({ defaultValue: '09:30' })
    h.trigger.click()
    pressKey(h.content, 'ArrowRight')
    expect(document.activeElement).toBe(h.option('minute', '30'))
    expect(h.api().focusedColumn).toBe('minute')
    // 精度到分，分列已是末列，再往右停住
    pressKey(h.content, 'ArrowRight')
    expect(document.activeElement).toBe(h.option('minute', '30'))
    pressKey(h.content, 'ArrowLeft')
    expect(document.activeElement).toBe(h.option('hour', '09'))
    pressKey(h.content, 'ArrowLeft')
    expect(document.activeElement).toBe(h.option('hour', '09'))
  })

  it('换列跳过收起的列', () => {
    const h = open({ granularity: 'hour' })
    h.trigger.click()
    // 分列与秒列都被 granularity 关掉，右键无处可去
    pressKey(h.content, 'ArrowRight')
    expect(h.api().focusedColumn).toBe('hour')
  })

  it('enter 选中焦点所在的格，浮层不收起', () => {
    const h = open()
    h.trigger.click()
    // 指针打开不预落锚点：第一按落到首格，它才是这次要选的那一格
    pressKey(h.content, 'ArrowDown')
    expect(h.api().focusedItem).toBe('00')
    pressKey(h.content, 'Enter')
    expect(h.api().isItemSelected({ unit: 'hour', value: '00' })).toBe(true)
    expect(h.state()).toBe('open')
  })

  it('禁用的格按确认键不认', () => {
    const h = open({ min: '09:00' })
    h.trigger.click()
    // 直接把焦点搁在被裁掉的 00 上（焦点是事实不是许可）
    h.option('hour', '00').focus()
    expect(h.api().focusedItem).toBe('00')
    pressKey(h.content, 'Enter')
    expect(h.api().isItemSelected({ unit: 'hour', value: '00' })).toBe(false)
  })
})

describe('两条路写的是同一个值', () => {
  it('点选项写进对应的段，段上的文字与隐藏输入同步跟上', () => {
    const onValueChange = vi.fn()
    const h = open({ name: 'start', onValueChange })
    h.trigger.click()
    h.option('hour', '13').click()
    // 分还没选，凑不成一个时间
    expect(h.value()).toBe('')
    expect(h.segment('hour').textContent).toBe('13')
    h.option('minute', '45').click()
    expect(h.value()).toBe('13:45')
    expect(h.segment('minute').textContent).toBe('45')
    expect(h.hiddenInput.value).toBe('13:45')
    expect(onValueChange).toHaveBeenLastCalledWith({ value: '13:45' })
  })

  it('段上敲进去的值，浮层里立刻显示成选中', () => {
    const h = open()
    const hour = h.segment('hour')
    hour.focus()
    pressKey(hour, '1')
    pressKey(hour, '3')
    expect(h.option('hour', '13').getAttribute('aria-selected')).toBe('true')
    expect(h.option('hour', '12').getAttribute('aria-selected')).toBe('false')
  })

  it('段上按上下键加减，浮层的选中跟着挪', () => {
    const h = open({ defaultValue: '09:30' })
    const hour = h.segment('hour')
    hour.focus()
    pressKey(hour, 'ArrowUp')
    expect(h.value()).toBe('10:30')
    expect(h.option('hour', '10').getAttribute('aria-selected')).toBe('true')
    expect(h.option('hour', '09').getAttribute('aria-selected')).toBe('false')
  })

  it('12 小时制：时列写的是显示值，落到哪个真实小时由上下午段说了算', () => {
    const h = open({ hourCycle: 12, defaultValue: '09:30' })
    h.trigger.click()
    // 上午 9 点 → 选 1 点得到上午 1 点
    h.option('hour', '01').click()
    expect(h.value()).toBe('01:30')
    // 把上下午段翻到下午，再选 1 点就是 13 点
    const period = h.segment('dayPeriod')
    period.focus()
    pressKey(period, 'p')
    expect(h.value()).toBe('13:30')
    h.option('hour', '01').click()
    expect(h.value()).toBe('13:30')
    h.option('hour', '02').click()
    expect(h.value()).toBe('14:30')
  })

  it('12 小时制下时列跟着上下午重新裁剪', () => {
    const h = open({ hourCycle: 12, min: '09:00', max: '18:00', defaultValue: '09:30' })
    expect(enabledValues(h.column('hour'))).toEqual(['09', '10', '11'])
    const period = h.segment('dayPeriod')
    period.focus()
    pressKey(period, 'p')
    expect(h.value()).toBe('21:30')
    expect(enabledValues(h.column('hour'))).toEqual(['01', '02', '03', '04', '05', '06', '12'])
  })

  it('浮层里挑上下午与段上按 a/p 是同一条路：都改真实小时', () => {
    const h = open({ hourCycle: 12, defaultValue: '09:30' })
    h.trigger.click()
    expect(h.api().isItemSelected({ unit: 'dayPeriod', value: '00' })).toBe(true)
    // 挑「下午」：9 点 → 21 点，段上的文字与选中态一并跟上
    h.option('dayPeriod', '01').click()
    expect(h.value()).toBe('21:30')
    expect(h.api().isItemSelected({ unit: 'dayPeriod', value: '01' })).toBe(true)
    expect(h.segment('dayPeriod').getAttribute('aria-valuenow')).toBe('1')
    // 挑回「上午」
    h.option('dayPeriod', '00').click()
    expect(h.value()).toBe('09:30')
  })

  it('时还空着时挑上下午先记着，等填了时再落到真实小时上', () => {
    const h = open({ hourCycle: 12 })
    h.trigger.click()
    h.option('dayPeriod', '01').click()
    // 只挑了上下午还凑不成一个时间
    expect(h.value()).toBe('')
    h.option('hour', '03').click()
    h.option('minute', '15').click()
    expect(h.value()).toBe('15:15')
  })

  it('上下午列在 24 小时制下收起，作者写了也不显出', () => {
    const h = open({ hourCycle: 24, defaultValue: '09:30' })
    h.trigger.click()
    expect(h.column('dayPeriod').hasAttribute('hidden')).toBe(true)
    expect(h.column('hour').hasAttribute('hidden')).toBe(false)
  })

  it('上下午格上的文字按 locale 译，值仍是 00 / 01', () => {
    const zh = open({ hourCycle: 12, locale: 'zh-CN', defaultValue: '09:30' })
    zh.trigger.click()
    expect(zh.option('dayPeriod', '00').textContent).toBe('上午')
    expect(zh.option('dayPeriod', '01').textContent).toBe('下午')
    expect(zh.option('dayPeriod', '01').getAttribute('data-value')).toBe('01')
    // 没给 locale 时退回 AM / PM
    const plain = open({ hourCycle: 12, defaultValue: '09:30' })
    plain.trigger.click()
    expect(plain.api().getItemText({ unit: 'dayPeriod', value: '00' })).toBe('AM')
    expect(plain.api().getItemText({ unit: 'dayPeriod', value: '01' })).toBe('PM')
    // 数字列照旧写什么显示什么
    expect(plain.api().getItemText({ unit: 'hour', value: '09' })).toBe('09')
  })
})

describe('分段输入（委派给 TimeField 的那套语义）', () => {
  it('段是 spinbutton，整组只占一个 Tab 位；秒段与上下午段按 granularity/hourCycle 收起', () => {
    const h = open()
    expect(h.segment('hour').getAttribute('role')).toBe('spinbutton')
    expect(h.segment('hour').getAttribute('tabindex')).toBe('0')
    expect(h.segment('minute').getAttribute('tabindex')).toBe('-1')
    expect(h.segment('second').hasAttribute('hidden')).toBe(true)
    expect(h.segment('dayPeriod').hasAttribute('hidden')).toBe(true)
  })

  it('左右键换段，末段停住不回绕', () => {
    const h = open({ granularity: 'second' })
    const hour = h.segment('hour')
    hour.focus()
    pressKey(hour, 'ArrowLeft')
    expect(document.activeElement).toBe(hour)
    pressKey(hour, 'ArrowRight')
    expect(document.activeElement).toBe(h.segment('minute'))
    pressKey(h.segment('minute'), 'ArrowRight')
    expect(document.activeElement).toBe(h.segment('second'))
    pressKey(h.segment('second'), 'ArrowRight')
    expect(document.activeElement).toBe(h.segment('second'))
  })

  it('数字填满本段自动跳下一段', () => {
    const h = open()
    const hour = h.segment('hour')
    hour.focus()
    pressKey(hour, '1')
    pressKey(hour, '3')
    expect(document.activeElement).toBe(h.segment('minute'))
    expect(h.segment('hour').textContent).toBe('13')
  })

  it('backspace 清掉本段，值退回空串但其余段留着', () => {
    const h = open({ defaultValue: '13:45' })
    const minute = h.segment('minute')
    minute.focus()
    pressKey(minute, 'Backspace')
    expect(h.value()).toBe('')
    expect(h.segment('hour').textContent).toBe('13')
    expect(h.segment('minute').textContent).toBe('--')
    expect(h.root.hasAttribute('data-empty')).toBe(true)
  })

  it('点标题把焦点送到第一段', () => {
    const h = open()
    h.label.click()
    expect(document.activeElement).toBe(h.segment('hour'))
  })
})

describe('禁用 / 只读 / 越界 / 清空', () => {
  it('只读：浮层照常展开、列里照常走，但选不中也清不掉', () => {
    const h = open({ readOnly: true, defaultValue: '09:30' })
    h.trigger.click()
    expect(h.state()).toBe('open')
    pressKey(h.content, 'ArrowDown')
    expect(document.activeElement).toBe(h.option('hour', '10'))
    pressKey(h.content, 'Enter')
    expect(h.value()).toBe('09:30')
    h.option('hour', '11').click()
    expect(h.value()).toBe('09:30')
    expect(h.clear.disabled).toBe(true)
    expect(h.segment('hour').getAttribute('aria-readonly')).toBe('true')
  })

  it('禁用：整列的格都不可选，段整组退出 Tab 序列，隐藏输入不参与提交', () => {
    const h = open({ disabled: true, defaultValue: '09:30' })
    expect(h.option('hour', '09').getAttribute('aria-disabled')).toBe('true')
    expect(h.segment('hour').hasAttribute('tabindex')).toBe(false)
    expect(h.hiddenInput.disabled).toBe(true)
    expect(h.control.getAttribute('aria-disabled')).toBe('true')
  })

  it('越界只做标注，不改写值', () => {
    const h = open({ defaultValue: '08:00', min: '09:00', max: '18:00' })
    expect(h.root.hasAttribute('data-out-of-range')).toBe(true)
    expect(h.root.hasAttribute('data-invalid')).toBe(true)
    expect(h.control.getAttribute('aria-invalid')).toBe('true')
    expect(h.value()).toBe('08:00')
    expect(h.hiddenInput.value).toBe('08:00')
  })

  it('清空按钮：填了一半也能按，按完段回到占位符', () => {
    const h = open()
    expect(h.clear.disabled).toBe(true)
    const hour = h.segment('hour')
    hour.focus()
    pressKey(hour, '9')
    expect(h.value()).toBe('')
    expect(h.clear.disabled).toBe(false)
    h.clear.click()
    expect(h.segment('hour').textContent).toBe('--')
    expect(h.clear.disabled).toBe(true)
    // 这个按钮对读屏隐身也不占 Tab 位，清完得把焦点送回首段
    expect(document.activeElement).toBe(h.segment('hour'))
  })

  it('group 只带全局属性，只读与必填落在段上', () => {
    const h = open({ required: true, readOnly: true })
    expect(h.control.hasAttribute('aria-required')).toBe(false)
    expect(h.control.hasAttribute('aria-readonly')).toBe(false)
    expect(h.control.getAttribute('aria-invalid')).toBe('false')
    expect(h.segment('hour').getAttribute('aria-required')).toBe('true')
    expect(h.segment('hour').getAttribute('aria-readonly')).toBe('true')
  })
})

describe('受控值', () => {
  it('宿主不写回则界面纹丝不动，回调照发；写回后才跟着走', () => {
    const onValueChange = vi.fn()
    const h = open({ value: '13:45', onValueChange })
    h.trigger.click()
    h.option('hour', '09').click()
    expect(h.value()).toBe('13:45')
    expect(h.segment('hour').textContent).toBe('13')
    expect(onValueChange).toHaveBeenCalledWith({ value: '09:45' })
    h.setProps({ value: '09:45' })
    expect(h.segment('hour').textContent).toBe('09')
    expect(h.option('hour', '09').getAttribute('aria-selected')).toBe('true')
  })

  it('setValue 走一遍解析：写坏的串等同于清空', () => {
    const h = open({ defaultValue: '13:45' })
    h.api().setValue('25:00')
    expect(h.value()).toBe('')
    h.api().setValue('09:05')
    expect(h.value()).toBe('09:05')
  })
})
