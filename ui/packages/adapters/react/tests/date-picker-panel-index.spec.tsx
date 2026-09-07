// @vitest-environment jsdom
//
// 面板号写在日历上一处：面板内的标题、网格与格子跟着它走，自己写了仍按自己写的算。
// 共享一致性套件咬不到这一层——它的 fixture 是单面板的，落点恒为 0，
// 「跟着所在的日历走」这条路一次都不走。
//
// 一律用 defaultOpen 挂：展开态初值为真时，浮层的焦点域在编排机挂载那一刻就把焦点
// 送进格子，而日历那台机器排在它后面才挂载——这几条同时钉住那一下不再抛。
import type { CalendarPanel } from '@xihan-ui/headless'
import type { ReactNode } from 'react'
import type { XhDatePickerRootProps } from '../src'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, describe, expect, it } from 'vitest'
import {
  XhDatePickerCalendar,
  XhDatePickerCell,
  XhDatePickerCellTrigger,
  XhDatePickerContent,
  XhDatePickerControl,
  XhDatePickerGrid,
  XhDatePickerGridBody,
  XhDatePickerHeading,
  XhDatePickerPositioner,
  XhDatePickerRoot,
  XhDatePickerSegment,
  XhDatePickerSegmentGroup,
  XhDatePickerWeekRow,
} from '../src'

let host: HTMLElement | null = null
let root: ReturnType<typeof createRoot> | null = null

afterEach(async () => {
  // 日历落焦推迟一拍：先把这一拍走完再拆，免得回调落到已经拆掉的机器上
  await settle()
  ;(document.activeElement as HTMLElement | null)?.blur?.()
  await act(async () => {
    root?.unmount()
  })
  host?.remove()
  root = null
  host = null
  document.body.innerHTML = ''
})

async function settle(): Promise<void> {
  for (let i = 0; i < 5; i++) {
    await act(async () => {
      await Promise.resolve()
    })
  }
  await act(async () => {
    await new Promise(r => setTimeout(r, 0))
  })
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

const BASE: XhDatePickerRootProps = {
  locale: 'zh-CN',
  timeZone: 'UTC',
  selectionMode: 'range',
  defaultOpen: true,
  defaultValue: ['2026-07-01', '2026-08-05'],
}

/** 双面板区间：面板号只写在日历上，标题与格子都不写。 */
function twoPanels(panels: readonly CalendarPanel[]): ReactNode {
  return panels.map(panel => (
    <XhDatePickerCalendar key={panel.index} index={panel.index}>
      <XhDatePickerHeading />
      <XhDatePickerGrid>
        <XhDatePickerGridBody>
          {panel.weeks.map(week => (
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
  ))
}

function headings(): string[] {
  return [...document.querySelectorAll('[data-scope="calendar"][data-part="heading"]')]
    .map(el => el.textContent ?? '')
}

/** 第 panelIndex 张日历里那一天的格子。 */
function cellsOf(panelIndex: number, value: string): Element | null {
  const calendars = document.querySelectorAll('[data-scope="date-picker"][data-part="calendar"]')
  return calendars[panelIndex]?.querySelector(`[data-part="cell"][data-value="${value}"]`) ?? null
}

describe('双面板的面板号写在日历上', () => {
  const TREE = (
    <XhDatePickerRoot {...BASE}>
      {({ panels }) => (
        <>
          <XhDatePickerControl>
            <XhDatePickerSegmentGroup>
              <XhDatePickerSegment index={0} />
            </XhDatePickerSegmentGroup>
          </XhDatePickerControl>
          <XhDatePickerPositioner>
            <XhDatePickerContent>{twoPanels(panels)}</XhDatePickerContent>
          </XhDatePickerPositioner>
        </>
      )}
    </XhDatePickerRoot>
  )

  it('两张标题各是各的月份', async () => {
    await mount(TREE)
    expect(headings()).toEqual(['2026年7月', '2026年8月'])
  })

  it('每张网格各有自己那行标题当名字', async () => {
    await mount(TREE)
    const grids = [...document.querySelectorAll('[data-scope="calendar"][data-part="grid"]')]
    expect(headings()).toHaveLength(2)
    expect(grids).toHaveLength(2)
    expect(grids[0]!.getAttribute('aria-labelledby')).not.toBe(grids[1]!.getAttribute('aria-labelledby'))
  })

  it('邻月的格子按所在面板判，区间与端点只在认领它的那张上画', async () => {
    await mount(TREE)
    // 8/1 既在七月网格的末行，也在八月网格里
    expect(cellsOf(0, '2026-08-01')?.hasAttribute('data-outside-month')).toBe(true)
    expect(cellsOf(1, '2026-08-01')?.hasAttribute('data-outside-month')).toBe(false)
    expect(cellsOf(0, '2026-08-01')?.hasAttribute('data-in-range')).toBe(false)
    expect(cellsOf(1, '2026-08-01')?.hasAttribute('data-in-range')).toBe(true)
    // 区间终点 8/5 只在八月那张上是端点
    expect(cellsOf(1, '2026-08-05')?.hasAttribute('data-range-end')).toBe(true)
  })

  it('部件自己写了面板号仍按自己写的算', async () => {
    await mount(
      <XhDatePickerRoot {...BASE}>
        {({ panels }) => (
          <>
            <XhDatePickerControl>
              <XhDatePickerSegmentGroup>
                <XhDatePickerSegment index={0} />
              </XhDatePickerSegmentGroup>
            </XhDatePickerControl>
            <XhDatePickerPositioner>
              <XhDatePickerContent>
                {panels.map(panel => (
                  // 日历自报 0，标题偏要写 1
                  <XhDatePickerCalendar key={panel.index} index={0}>
                    <XhDatePickerHeading index={1} />
                  </XhDatePickerCalendar>
                ))}
              </XhDatePickerContent>
            </XhDatePickerPositioner>
          </>
        )}
      </XhDatePickerRoot>,
    )
    expect(headings()).toEqual(['2026年8月', '2026年8月'])
  })
})
