// @vitest-environment jsdom
//
// 日期时间族里，connect 派的 focus / pointerenter / pointerleave 三样都不冒泡。
// React 的合成事件全部委派在根容器上、只在冒泡阶段派发：onFocus 挂的是 focusin，
// onPointerEnter / onPointerLeave 是从 pointerover / pointerout 合出来的，
// 直接送到节点上的那一种一个都到不了。
//
// 共享一致性套件咬不到这一路：它走的是真实的 el.focus()（focusin 会冒泡），
// 接线断了照样绿。这里按 DOM 的送达路径直接派发，核的是
// 「处理器装在它自己点名的那个事件上」。
//
// date-picker 的段位与格子更绕一层：它们的 props 是 connectDateField / connectCalendar
// 算出来的，本组件自己的 connect 里一个不冒泡的处理器都没有。
import type { ReactNode } from 'react'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, describe, expect, it } from 'vitest'
import {
  XhCalendarCell,
  XhCalendarCellTrigger,
  XhCalendarGrid,
  XhCalendarGridBody,
  XhCalendarRoot,
  XhCalendarWeekRow,
  XhDateFieldControl,
  XhDateFieldRoot,
  XhDateFieldSegment,
  XhDateFieldSegmentGroup,
  XhDatePickerCalendar,
  XhDatePickerCell,
  XhDatePickerCellTrigger,
  XhDatePickerContent,
  XhDatePickerControl,
  XhDatePickerGrid,
  XhDatePickerGridBody,
  XhDatePickerPositioner,
  XhDatePickerRoot,
  XhDatePickerSegment,
  XhDatePickerSegmentGroup,
  XhDatePickerTrigger,
  XhDatePickerWeekRow,
  XhTimeFieldControl,
  XhTimeFieldRoot,
  XhTimeFieldSegment,
  XhTimeFieldSegmentGroup,
  XhTimePickerColumn,
  XhTimePickerContent,
  XhTimePickerControl,
  XhTimePickerItem,
  XhTimePickerPositioner,
  XhTimePickerRoot,
  XhTimePickerSegment,
  XhTimePickerSegmentGroup,
  XhTimePickerTrigger,
} from '../src'

let host: HTMLElement | null = null
let root: ReturnType<typeof createRoot> | null = null

afterEach(async () => {
  await act(async () => {
    root?.unmount()
  })
  host?.remove()
  root = null
  host = null
})

/** 机器的效应排在提交之后，多催几拍让 DOM 落定。 */
async function settle(): Promise<void> {
  for (let i = 0; i < 5; i++) {
    await act(async () => {
      await Promise.resolve()
    })
  }
}

async function mount(tree: ReactNode): Promise<void> {
  host = document.createElement('div')
  document.body.append(host)
  root = createRoot(host)
  ;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true
  await act(async () => {
    root!.render(tree)
  })
  await settle()
}

/** 按 DOM 的送达路径派：这三样都不冒泡。 */
async function fire(el: Element, event: Event): Promise<void> {
  await act(async () => {
    el.dispatchEvent(event)
  })
  await settle()
}

function one(selector: string): HTMLElement {
  const el = document.querySelector<HTMLElement>(selector)
  if (!el)
    throw new Error(`找不到 ${selector}`)
  return el
}

function all(selector: string): HTMLElement[] {
  return [...document.querySelectorAll<HTMLElement>(selector)]
}

/** 某个 scope 下的日期格触发器，按 ISO 串取。 */
function day(scope: string, value: string): HTMLElement {
  return one(`[data-scope="${scope}"][data-part="cell-trigger"][data-value="${value}"]`)
}

const ANCHOR = '2024-02-15'
const CAL_PROPS = { defaultFocusedValue: ANCHOR, locale: 'zh-CN', timeZone: 'UTC' } as const

/** 网格由作者照 weeks 铺，与套件里那棵 fixture 同形。 */
function calendarTree(selectionMode?: 'single' | 'range'): ReactNode {
  return (
    <XhCalendarRoot {...CAL_PROPS} selectionMode={selectionMode}>
      {({ weeks }) => (
        <XhCalendarGrid>
          <XhCalendarGridBody>
            {weeks.map(week => (
              <XhCalendarWeekRow key={week[0]!.value}>
                {week.map(d => (
                  <XhCalendarCell key={d.value} value={d.value}>
                    <XhCalendarCellTrigger>{d.day}</XhCalendarCellTrigger>
                  </XhCalendarCell>
                ))}
              </XhCalendarWeekRow>
            ))}
          </XhCalendarGridBody>
        </XhCalendarGrid>
      )}
    </XhCalendarRoot>
  )
}

const DATE_FIELD_TREE = (
  <XhDateFieldRoot locale="zh-CN" timeZone="UTC" defaultValue={ANCHOR}>
    <XhDateFieldControl>
      <XhDateFieldSegmentGroup>
        <XhDateFieldSegment index={0} />
        <XhDateFieldSegment index={1} />
        <XhDateFieldSegment index={2} />
      </XhDateFieldSegmentGroup>
    </XhDateFieldControl>
  </XhDateFieldRoot>
)

const TIME_FIELD_TREE = (
  <XhTimeFieldRoot defaultValue="09:30">
    <XhTimeFieldControl>
      <XhTimeFieldSegmentGroup>
        <XhTimeFieldSegment segment="hour" />
        <XhTimeFieldSegment segment="minute" />
      </XhTimeFieldSegmentGroup>
    </XhTimeFieldControl>
  </XhTimeFieldRoot>
)

const TIME_PICKER_TREE = (
  <XhTimePickerRoot defaultOpen defaultValue="09:30" min="08:00" max="11:00" step={30}>
    <XhTimePickerControl>
      <XhTimePickerSegmentGroup>
        <XhTimePickerSegment segment="hour" />
        <XhTimePickerSegment segment="minute" />
      </XhTimePickerSegmentGroup>
      <XhTimePickerTrigger>选择</XhTimePickerTrigger>
    </XhTimePickerControl>
    <XhTimePickerPositioner>
      <XhTimePickerContent>
        <XhTimePickerColumn unit="hour">
          {['08', '09', '10', '11'].map(v => <XhTimePickerItem key={v} value={v} />)}
        </XhTimePickerColumn>
        <XhTimePickerColumn unit="minute">
          {['00', '30'].map(v => <XhTimePickerItem key={v} value={v} />)}
        </XhTimePickerColumn>
      </XhTimePickerContent>
    </XhTimePickerPositioner>
  </XhTimePickerRoot>
)

const DATE_PICKER_TREE = (
  <XhDatePickerRoot defaultOpen defaultValue={ANCHOR} locale="zh-CN" timeZone="UTC">
    {({ weeks }) => (
      <>
        <XhDatePickerControl>
          <XhDatePickerSegmentGroup>
            <XhDatePickerSegment index={0} />
            <XhDatePickerSegment index={1} />
            <XhDatePickerSegment index={2} />
          </XhDatePickerSegmentGroup>
          <XhDatePickerTrigger>选择</XhDatePickerTrigger>
        </XhDatePickerControl>
        <XhDatePickerPositioner>
          <XhDatePickerContent>
            <XhDatePickerCalendar>
              <XhDatePickerGrid>
                <XhDatePickerGridBody>
                  {weeks.map(week => (
                    <XhDatePickerWeekRow key={week[0]!.value}>
                      {week.map(d => (
                        <XhDatePickerCell key={d.value} value={d.value}>
                          <XhDatePickerCellTrigger>{d.day}</XhDatePickerCellTrigger>
                        </XhDatePickerCell>
                      ))}
                    </XhDatePickerWeekRow>
                  ))}
                </XhDatePickerGridBody>
              </XhDatePickerGrid>
            </XhDatePickerCalendar>
          </XhDatePickerContent>
        </XhDatePickerPositioner>
      </>
    )}
  </XhDatePickerRoot>
)

describe('日历的不冒泡事件按 DOM 语义送达', () => {
  it('格子自己得焦：聚焦锚点改记它，roving tabindex 跟着换人', async () => {
    await mount(calendarTree())

    await fire(day('calendar', '2024-02-20'), new Event('focus'))

    expect(day('calendar', '2024-02-20').getAttribute('data-focus')).toBe('')
    expect(day('calendar', '2024-02-20').getAttribute('tabindex')).toBe('0')
    expect(day('calendar', ANCHOR).getAttribute('data-focus')).toBeNull()
    expect(day('calendar', ANCHOR).getAttribute('tabindex')).toBe('-1')
  })

  it('指针扫过格子：区间预览跟着走；指针离开整张网格，预览收回起点', async () => {
    await mount(calendarTree('range'))
    // 先落起点，随后的预览才有可比的一端
    await act(async () => {
      day('calendar', ANCHOR).click()
    })
    await settle()
    expect(day('calendar', '2024-02-17').getAttribute('data-in-range')).toBeNull()

    await fire(day('calendar', '2024-02-18'), new PointerEvent('pointerenter', { pointerType: 'mouse' }))
    expect(day('calendar', '2024-02-17').getAttribute('data-in-range')).toBe('')

    // 离开挂在网格上而非格子上：格子间挪动会成对发 leave/enter，预览会闪
    await fire(
      one('[data-scope="calendar"][data-part="grid"]'),
      new PointerEvent('pointerleave', { pointerType: 'mouse', relatedTarget: document.body }),
    )
    expect(day('calendar', '2024-02-17').getAttribute('data-in-range')).toBeNull()
  })
})

describe('分段输入的不冒泡事件按 DOM 语义送达', () => {
  it('分段日期：某一段自己得焦，整组的 Tab 锚点改记它', async () => {
    await mount(DATE_FIELD_TREE)
    const segments = all('[data-scope="date-field"][data-part="segment"]')
    expect(segments.map(el => el.getAttribute('tabindex'))).toEqual(['0', '-1', '-1'])

    await fire(segments[2]!, new Event('focus'))

    expect(segments.map(el => el.getAttribute('tabindex'))).toEqual(['-1', '-1', '0'])
  })

  it('分段时间：某一段自己得焦，整组的 Tab 锚点改记它', async () => {
    await mount(TIME_FIELD_TREE)
    const segments = all('[data-scope="time-field"][data-part="segment"]')
    expect(segments.map(el => el.getAttribute('tabindex'))).toEqual(['0', '-1'])

    await fire(segments[1]!, new Event('focus'))

    expect(segments.map(el => el.getAttribute('tabindex'))).toEqual(['-1', '0'])
  })
})

describe('时间选择器的不冒泡事件按 DOM 语义送达', () => {
  it('段位自己得焦：整组的 Tab 锚点改记它', async () => {
    await mount(TIME_PICKER_TREE)
    const segments = all('[data-scope="time-picker"][data-part="segment"]')
    expect(segments.map(el => el.getAttribute('tabindex'))).toEqual(['0', '-1'])

    await fire(segments[1]!, new Event('focus'))

    expect(segments.map(el => el.getAttribute('tabindex'))).toEqual(['-1', '0'])
  })

  it('浮层里的选项自己得焦：高亮改记它', async () => {
    await mount(TIME_PICKER_TREE)
    const hours = all('[data-scope="time-picker"][data-part="column"][data-value="hour"] [data-part="item"]')

    await fire(hours[3]!, new Event('focus'))

    expect(hours[3]!.getAttribute('data-highlighted')).toBe('')
    expect(hours[1]!.getAttribute('data-highlighted')).toBeNull()
  })
})

describe('日期选择器转交出去的那两家，不冒泡事件同样按 DOM 语义送达', () => {
  it('段位自己得焦：整组的 Tab 锚点改记它（处理器是分段输入那一份派的）', async () => {
    await mount(DATE_PICKER_TREE)
    const segments = all('[data-scope="date-field"][data-part="segment"]')
    expect(segments.map(el => el.getAttribute('tabindex'))).toEqual(['0', '-1', '-1'])

    await fire(segments[2]!, new Event('focus'))

    expect(segments.map(el => el.getAttribute('tabindex'))).toEqual(['-1', '-1', '0'])
  })

  it('格子自己得焦：聚焦锚点改记它（处理器是日历那一份派的）', async () => {
    await mount(DATE_PICKER_TREE)

    await fire(day('calendar', '2024-02-20'), new Event('focus'))

    expect(day('calendar', '2024-02-20').getAttribute('data-focus')).toBe('')
    expect(day('calendar', '2024-02-20').getAttribute('tabindex')).toBe('0')
    expect(day('calendar', ANCHOR).getAttribute('tabindex')).toBe('-1')
  })
})
