/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 日历选择器与日历范围选择器共用的单测夹具：挂一张会跟着聚焦日重画的活网格。

import type { MachineConfig, NormalizeProps, PropTypes, Service } from '@xihan-ui/core'
import type { CalendarBaseApi, CalendarBaseSchema } from '../src/shared/calendar'
import { createService, normalizeProps } from '@xihan-ui/core'
import { createVanillaRuntime } from '@xihan-ui/core/vanilla'

const listeners = new WeakMap<HTMLElement, Map<string, EventListener>>()

/**
 * 最小 spread：与 WC 侧同一套翻译规则（on 之后全小写做事件名，其余落属性）。
 * 有它才跑得到真实事件流——纯粹比对 connect 的返回值只能验静态属性，
 * "翻月之后焦点落在哪一格"这类事实必须有活 DOM 才立得住。
 */
export function spread(el: HTMLElement, props: Record<string, unknown>): void {
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
    if (raw === undefined || raw === null || raw === false) {
      el.removeAttribute(key)
      continue
    }
    el.setAttribute(key, String(raw))
  }
}

export interface CalendarHarness<S extends CalendarBaseSchema, A extends CalendarBaseApi> {
  api: () => A
  root: HTMLElement
  grid: HTMLElement
  heading: HTMLElement
  prev: HTMLElement
  next: HTMLElement
  /** 当前渲染出来的某一天的 cell-trigger；不在这个月的网格里就抛。 */
  cell: (value: string) => HTMLElement
  /** 同一天的 cell（外层 gridcell）。 */
  gridcell: (value: string) => HTMLElement
  weekDayEls: () => HTMLElement[]
  /** 网格里全部日期的 ISO 串，文档序。 */
  rendered: () => string[]
  setProps: (next: Partial<S['props']>) => void
  value: () => string[]
  focusedValue: () => string
}

export interface CalendarDrillHarness<S extends CalendarBaseSchema, A extends CalendarBaseApi> {
  api: () => A
  grid: HTMLElement
  yearTrigger: HTMLElement
  monthTrigger: HTMLElement
  cell: (value: string) => HTMLElement
  rendered: () => string[]
  setProps: (next: Partial<S['props']>) => void
  value: () => string[]
}

export type CalendarConnect<S extends CalendarBaseSchema, A extends CalendarBaseApi>
  = <T extends PropTypes>(service: Service<S>, normalize: NormalizeProps<T>) => A

/** 把两个日历组件各自的机器与连接层装进同一套夹具。 */
export function createCalendarHarness<S extends CalendarBaseSchema, A extends CalendarBaseApi>(
  machine: MachineConfig<S>,
  connect: CalendarConnect<S, A>,
): {
  mount: (initial?: Partial<S['props']>) => CalendarHarness<S, A>
  mountDrill: (initial?: Partial<S['props']>) => CalendarDrillHarness<S, A>
} {
  type Props = S['props']

  /**
   * 挂载一个会跟着聚焦日重画网格的日历——这正是作者该做的事（连接层只给数据，不生成节点）。
   * 重画只在"这个月的日期集合真的换了"时发生，与 Vue 的 keyed diff 同语义：
   * 同月内挪焦点不会把承载焦点的节点连根拔掉。
   */
  const mount = (initial: Partial<Props> = {}): CalendarHarness<S, A> => {
    const props: Partial<Props> = { ...initial }
    const runtime = createVanillaRuntime()
    const service = createService(machine, { props: () => props, runtime })

    const doc = document
    const root = doc.createElement('div')
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
    root.append(header, grid)
    doc.body.appendChild(root)

    service.refs.set('getGridEl', () => grid)
    runtime.start()

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
          const trigger = doc.createElement('div')
          trigger.textContent = day.start.slice(-2)
          cell.appendChild(trigger)
          row.appendChild(cell)
          cells.set(day.start, cell)
          triggers.set(day.start, trigger)
        }
        gridBody.appendChild(row)
      }
    }

    const render = (): void => {
      const api = connect(service, normalizeProps)
      const key = api.weeks.map(w => w.map(d => d.start).join()).join('|')
      if (key !== painted) {
        painted = key
        rebuild(api.weeks)
      }
      spread(root, api.getRootProps() as Record<string, unknown>)
      spread(header, api.getHeaderProps() as Record<string, unknown>)
      spread(prev, api.getPrevTriggerProps() as Record<string, unknown>)
      spread(next, api.getNextTriggerProps() as Record<string, unknown>)
      spread(heading, api.getHeadingProps() as Record<string, unknown>)
      heading.textContent = api.headingLabel
      spread(grid, api.getGridProps() as Record<string, unknown>)
      spread(gridHead, api.getGridHeadProps() as Record<string, unknown>)
      spread(headRow, api.getWeekRowProps() as Record<string, unknown>)
      weekDayEls.forEach((el, i) => {
        spread(el, api.getWeekDayProps({ value: i }) as Record<string, unknown>)
        el.textContent = api.weekDays[i]!.label
      })
      spread(gridBody, api.getGridBodyProps() as Record<string, unknown>)
      for (const row of Array.from(gridBody.children))
        spread(row as HTMLElement, api.getWeekRowProps() as Record<string, unknown>)
      for (const [value, cell] of cells)
        spread(cell, api.getCellProps({ value }) as Record<string, unknown>)
      for (const [value, trigger] of triggers)
        spread(trigger, api.getCellTriggerProps({ value }) as Record<string, unknown>)
    }

    runtime.subscribe(render)
    render()

    const need = (map: Map<string, HTMLElement>, value: string): HTMLElement => {
      const el = map.get(value)
      if (!el)
        throw new Error(`网格里没有 ${value} 这一格（当前展示 ${connect(service, normalizeProps).headingLabel}）`)
      return el
    }

    return {
      api: () => connect(service, normalizeProps),
      root,
      grid,
      heading,
      prev,
      next,
      cell: v => need(triggers, v),
      gridcell: v => need(cells, v),
      weekDayEls: () => weekDayEls,
      rendered: () => [...triggers.keys()],
      setProps: (next2) => {
        Object.assign(props, next2)
        render()
      },
      value: () => service.context.get('value'),
      focusedValue: () => connect(service, normalizeProps).focusedValue,
    }
  }

  /**
   * 会跟着 activeView 重画的日历：钻到哪一层就铺那一层的格子，标题里的年与月各是一个钮。
   * 钻取必须验渲染结果——只验 activeView 这个字段，看不出「钻上去之后网格还有没有 Tab 位」。
   */
  const mountDrill = (initial: Partial<Props> = {}): CalendarDrillHarness<S, A> => {
    const runtime = createVanillaRuntime()
    // props 挂在 signal 上：换 view 那一路要靠 watch 里的 track 复查，
    // 直接改一个普通对象，track 压根不会跑
    const props = runtime.signal<Partial<Props>>({ ...initial })
    const service = createService(machine, { props: () => props.get(), runtime })

    const doc = document
    const root = doc.createElement('div')
    const header = doc.createElement('div')
    const yearTrigger = doc.createElement('button')
    const monthTrigger = doc.createElement('button')
    header.append(yearTrigger, monthTrigger)
    const grid = doc.createElement('div')
    root.append(header, grid)
    doc.body.appendChild(root)

    service.refs.set('getGridEl', () => grid)
    runtime.start()

    const triggers = new Map<string, HTMLElement>()
    let painted = ''

    const render = (): void => {
      const api = connect(service, normalizeProps)
      // 日视图铺周行，粗粒度视图把格子直接铺进网格
      const items = api.activeView === 'day'
        ? api.panels[0]!.weeks.flat().map(d => d.start)
        : api.panels[0]!.cells.map(c => c.start)
      const key = `${api.activeView}|${items.join()}`
      if (key !== painted) {
        painted = key
        grid.textContent = ''
        triggers.clear()
        for (const value of items) {
          const cell = doc.createElement('div')
          const trigger = doc.createElement('div')
          cell.appendChild(trigger)
          grid.appendChild(cell)
          triggers.set(value, trigger)
        }
      }
      spread(root, api.getRootProps() as Record<string, unknown>)
      spread(yearTrigger, api.getHeadingYearTriggerProps() as Record<string, unknown>)
      yearTrigger.textContent = api.panels[0]!.headingYear
      spread(monthTrigger, api.getHeadingMonthTriggerProps() as Record<string, unknown>)
      monthTrigger.textContent = api.panels[0]!.headingMonth
      spread(grid, api.getGridProps() as Record<string, unknown>)
      for (const [value, trigger] of triggers)
        spread(trigger, api.getCellTriggerProps({ value }) as Record<string, unknown>)
    }

    runtime.subscribe(render)
    render()

    return {
      api: () => connect(service, normalizeProps),
      grid,
      yearTrigger,
      monthTrigger,
      cell: (value: string) => {
        const el = triggers.get(value)
        if (!el)
          throw new Error(`网格里没有 ${value} 这一格（此刻铺的是 ${connect(service, normalizeProps).activeView}）`)
        return el
      },
      rendered: () => [...triggers.keys()],
      setProps: (next: Partial<Props>) => props.set({ ...props.get(), ...next }),
      value: () => service.context.get('value'),
    }
  }

  return { mount, mountDrill }
}

/** 合成事件默认 cancelable=false，那样 preventDefault 是空操作、defaultPrevented 永远为假。 */
export function press(el: HTMLElement, key: string, init: KeyboardEventInit = {}): KeyboardEvent {
  const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true, ...init })
  el.dispatchEvent(event)
  return event
}

export function click(el: HTMLElement): void {
  el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))
}

export function hover(el: HTMLElement, pointerType = 'mouse'): void {
  el.dispatchEvent(new PointerEvent('pointerenter', { bubbles: false, pointerType }))
}

/** 有接触面的真实按下：宽高给足，免得被当成读屏合成的那一下。 */
export function pointerDown(el: HTMLElement, pointerType = 'mouse'): void {
  el.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, cancelable: true, button: 0, width: 8, height: 8, pressure: 0.5, pointerType }))
}

export function pointerUp(el: HTMLElement, pointerType = 'mouse'): void {
  el.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, cancelable: true, button: 0, width: 8, height: 8, pointerType }))
}

export function focused(): string | null {
  return document.activeElement?.getAttribute('data-value') ?? null
}

/** 两个日历的 scope 不同，Tab 位一并数：一次只会挂一个组件。 */
export function tabStops(): string[] {
  return [...document.querySelectorAll<HTMLElement>('[data-scope="calendar-picker"], [data-scope="calendar-range-picker"]')]
    .filter(el => el.getAttribute('tabindex') === '0')
    .map(el => el.getAttribute('data-value') ?? el.getAttribute('data-part')!)
}

/** 搬焦点推迟到宿主提交之后（vanilla 运行时用微任务），读焦点前得让那一拍先跑完。 */
export async function settle(): Promise<void> {
  await Promise.resolve()
  await Promise.resolve()
}
