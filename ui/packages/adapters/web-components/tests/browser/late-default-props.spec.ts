import { afterEach, describe, expect, it } from 'vitest'
import { userEvent } from 'vitest/browser'
import { defineXhElements } from '../../src/define'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

defineXhElements()

// 元素写在 HTML 里、脚本随后才给 default* 赋值：解析器先把元素升级并连上，脚本排在之后的任务里。
// 文档站的示例、真实页面里分开加载的模块脚本都是这个时序。

interface CalendarHost extends HTMLElement {
  defaultValue?: string[]
  defaultFocusedValue?: string
  readonly weeks: Array<Array<{ start: string, day: number }>>
  readonly headingLabel: string
}

interface ChartHost extends HTMLElement {
  data?: unknown[]
  series?: unknown[]
  zoom?: string
  defaultWindow?: { x?: readonly [string, string] }
}

const hosts: HTMLElement[] = []

afterEach(() => {
  for (const host of hosts.splice(0)) host.remove()
})

async function settle(): Promise<void> {
  await Promise.resolve()
  await new Promise<void>(resolve => requestAnimationFrame(() => resolve()))
  await Promise.resolve()
}

/** 排到下一个任务：模块脚本、setTimeout 回调都落在这之后。 */
function nextTask(): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, 0))
}

function mount(html: string): HTMLElement {
  const host = document.createElement('div')
  host.innerHTML = html
  document.body.prepend(host)
  hosts.push(host)
  return host.firstElementChild as HTMLElement
}

const CALENDAR = `<xh-calendar-picker locale="en-US" fixed-weeks>
  <div data-xh-part="root">
    <div data-xh-part="header">
      <button data-xh-part="prev-trigger" aria-label="Previous month"></button>
      <div data-xh-part="heading"></div>
      <button data-xh-part="next-trigger" aria-label="Next month"></button>
    </div>
    <div data-xh-part="grid">
      <div data-xh-part="grid-body"></div>
    </div>
  </div>
</xh-calendar-picker>`

/** 按元素当下的 weeks 重画格子，与文档站示例的画法相同。 */
function paintCalendar(calendar: CalendarHost): void {
  const body = calendar.querySelector('[data-xh-part="grid-body"]')!
  body.replaceChildren(...calendar.weeks.map((week) => {
    const row = document.createElement('div')
    row.dataset.xhPart = 'week-row'
    for (const day of week) {
      const cell = document.createElement('div')
      cell.dataset.xhPart = 'cell'
      cell.setAttribute('value', day.start)
      const trigger = document.createElement('div')
      trigger.dataset.xhPart = 'cell-trigger'
      trigger.textContent = String(day.day)
      cell.append(trigger)
      row.append(cell)
    }
    return row
  }))
}

function cellOf(calendar: HTMLElement, iso: string): HTMLElement {
  return calendar.querySelector<HTMLElement>(`[data-part="cell"][value="${iso}"]`)!
}

async function mountCalendar(): Promise<CalendarHost> {
  const calendar = mount(CALENDAR) as CalendarHost
  paintCalendar(calendar)
  await settle()
  return calendar
}

describe('wc 连接之后才赋值的 default*', () => {
  it('日历：连上之后赋 defaultValue / defaultFocusedValue，界面按新初值选中并翻到那个月', async () => {
    const calendar = await mountCalendar()
    await nextTask()

    calendar.defaultFocusedValue = '2026-03-13'
    calendar.defaultValue = ['2026-03-18']
    await settle()
    paintCalendar(calendar)
    await settle()

    expect(calendar.headingLabel).toBe('March 2026')
    expect(cellOf(calendar, '2026-03-18').getAttribute('aria-selected')).toBe('true')
    expect(cellOf(calendar, '2026-03-13').querySelector('[data-part="cell-trigger"]')!.getAttribute('tabindex')).toBe('0')
  })

  it('日历：升级前赋在实例上的 defaultValue 在建机器时就算数', async () => {
    const template = document.createElement('template')
    template.innerHTML = CALENDAR
    const fragment = template.content.cloneNode(true) as DocumentFragment
    const calendar = fragment.querySelector('xh-calendar-picker') as CalendarHost
    // 模板里的节点还没升级，这两个值落在实例自己身上
    calendar.defaultFocusedValue = '2026-03-13'
    calendar.defaultValue = ['2026-03-18']
    const host = document.createElement('div')
    host.append(fragment)
    document.body.prepend(host)
    hosts.push(host)

    // 一连上就能读到按初值排好的月份，画格子不必等首轮更新
    expect(calendar.headingLabel).toBe('March 2026')
    paintCalendar(calendar)
    await settle()

    expect(cellOf(calendar, '2026-03-18').getAttribute('aria-selected')).toBe('true')
  })

  it('日历：用户已经选过一天，之后再赋 defaultValue 不改当前选中', async () => {
    const calendar = await mountCalendar()
    const [first] = calendar.weeks[1]!
    await userEvent.click(cellOf(calendar, first!.start).querySelector('[data-part="cell-trigger"]')!)
    await settle()
    expect(cellOf(calendar, first!.start).getAttribute('aria-selected')).toBe('true')

    const other = calendar.weeks[2]![3]!.start
    calendar.defaultValue = [other]
    await settle()

    expect(cellOf(calendar, first!.start).getAttribute('aria-selected')).toBe('true')
    expect(cellOf(calendar, other).getAttribute('aria-selected')).toBe('false')
  })

  it('复选框：连上之后赋 defaultChecked，状态机从新的初态起', async () => {
    const checkbox = mount(`<xh-checkbox>
      <label data-xh-part="label">
        <button data-xh-part="root"><span data-xh-part="indicator"></span><input data-xh-part="hidden-input" /></button>
        <span data-xh-part="text">接收产品更新</span>
      </label>
    </xh-checkbox>`) as HTMLElement & { defaultChecked?: boolean }
    await settle()
    await nextTask()

    checkbox.defaultChecked = true
    await settle()

    const root = checkbox.querySelector('[data-part="root"]')!
    expect(root.getAttribute('aria-checked')).toBe('true')
  })

  it('复选框：用户点过之后再赋 defaultChecked，不改当前勾选', async () => {
    const checkbox = mount(`<xh-checkbox>
      <label data-xh-part="label">
        <button data-xh-part="root"><span data-xh-part="indicator"></span><input data-xh-part="hidden-input" /></button>
        <span data-xh-part="text">接收产品更新</span>
      </label>
    </xh-checkbox>`) as HTMLElement & { defaultChecked?: boolean }
    await settle()
    const root = checkbox.querySelector<HTMLElement>('[data-part="root"]')!
    await userEvent.click(root)
    await settle()
    expect(root.getAttribute('aria-checked')).toBe('true')

    checkbox.defaultChecked = false
    await settle()

    expect(root.getAttribute('aria-checked')).toBe('true')
  })

  it('折叠面板：连上之后赋 defaultOpen，内容展开', async () => {
    const collapsible = mount(`<xh-collapsible>
      <div data-xh-part="root">
        <button data-xh-part="trigger">展开详情<span data-xh-part="indicator"></span></button>
        <div data-xh-part="content">详情</div>
      </div>
    </xh-collapsible>`) as HTMLElement & { defaultOpen?: boolean }
    await settle()
    await nextTask()

    collapsible.defaultOpen = true
    await settle()

    expect(collapsible.querySelector('[data-part="trigger"]')!.getAttribute('aria-expanded')).toBe('true')
    expect(collapsible.querySelector<HTMLElement>('[data-part="content"]')!.checkVisibility()).toBe(true)
  })

  it('直角坐标图：连上之后赋 defaultWindow，缩放条落在那段窗口上', async () => {
    const chart = mount(`<xh-cartesian-chart style="display:block;inline-size:480px">
      <figure data-xh-part="root">
        <figcaption data-xh-part="caption">月度销售额</figcaption>
        <div data-xh-part="viewport" style="block-size:240px"><svg data-xh-part="plot"></svg><div data-xh-part="empty"></div></div>
        <div data-xh-part="zoom-slider"></div>
      </figure>
    </xh-cartesian-chart>`) as ChartHost
    chart.data = ['一月', '二月', '三月', '四月', '五月', '六月'].map((month, i) => ({ month, amount: 1000 + i * 100 }))
    chart.series = [{ mark: 'bar', x: 'month', y: 'amount', name: '销售额' }]
    chart.zoom = 'x'
    await settle()
    await settle()
    const start = (): number => Number(chart.querySelector('[data-part="zoom-handle"][data-placement="start"]')!.getAttribute('aria-valuenow'))
    expect(start()).toBe(0)
    await nextTask()

    chart.defaultWindow = { x: ['三月', '五月'] }
    await settle()
    await settle()

    expect(start()).toBeGreaterThan(0)
  })
})
