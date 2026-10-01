// 密度写在局部容器上而不是文档根上：时间列高是引用控件高的派生令牌，
// 只在 :root 上求值的话，局部 compact 子树继承到的是宽松档的列高，列底比日历网格多出一截。
import type { App } from 'vue'
import type { DatePickerRootSlotProps } from '../../src/components/date-picker/date-picker'
import { afterEach, describe, expect, it } from 'vitest'
import { page } from 'vitest/browser'
import { createApp, h, nextTick } from 'vue'
import {
  XhDatePickerCalendar,
  XhDatePickerCell,
  XhDatePickerCellTrigger,
  XhDatePickerConfirmTrigger,
  XhDatePickerContent,
  XhDatePickerControl,
  XhDatePickerGrid,
  XhDatePickerGridBody,
  XhDatePickerGridHead,
  XhDatePickerHeader,
  XhDatePickerHeading,
  XhDatePickerPositioner,
  XhDatePickerRoot,
  XhDatePickerTimePanel,
  XhDatePickerTrigger,
  XhDatePickerWeekDay,
  XhDatePickerWeekRow,
} from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let app: App | null = null
let host: HTMLElement | null = null

async function settle(): Promise<void> {
  for (let i = 0; i < 3; i++) {
    await nextTick()
    await new Promise<void>(resolve => requestAnimationFrame(() => resolve()))
  }
}

async function mountInCompactSubtree(): Promise<void> {
  // 桌面宽度：日历与时间列放得下一行，视口高度也不构成限制
  await page.viewport(1200, 900)
  host = document.createElement('div')
  host.dataset.density = 'compact'
  document.body.append(host)
  app = createApp({
    render: () => h(XhDatePickerRoot, {
      locale: 'zh-CN',
      timeZone: 'UTC',
      showTime: true,
      open: true,
      defaultValue: ['2026-09-10T09:30'],
    }, {
      default: ({ weeks, weekDays }: DatePickerRootSlotProps) => [
        h(XhDatePickerControl, null, () => h(XhDatePickerTrigger)),
        h(XhDatePickerPositioner, null, () => [
          h(XhDatePickerContent, null, () => [
            h('div', { style: { display: 'flex', alignItems: 'stretch' } }, [
              h(XhDatePickerCalendar, null, () => [
                h(XhDatePickerHeader, null, () => h(XhDatePickerHeading)),
                h(XhDatePickerGrid, null, () => [
                  h(XhDatePickerGridHead, null, () => h(XhDatePickerWeekRow, null, () =>
                    weekDays.map(day => h(XhDatePickerWeekDay, { key: day.value, value: day.value })))),
                  h(XhDatePickerGridBody, null, () => weeks.map(week => h(XhDatePickerWeekRow, { key: week[0]!.start }, () =>
                    week.map(day => h(XhDatePickerCell, { key: day.start, value: day.start }, () =>
                      h(XhDatePickerCellTrigger, null, () => String(day.day))))))),
                ]),
              ]),
              h(XhDatePickerTimePanel),
            ]),
            h(XhDatePickerConfirmTrigger, null, () => '确定'),
          ]),
        ]),
      ],
    }),
  })
  app.mount(host)
  await settle()
}

function part(scope: string, name: string): HTMLElement {
  const el = document.querySelector<HTMLElement>(`[data-scope='${scope}'][data-part='${name}']`)
  if (!el)
    throw new Error(`缺少 ${scope}/${name}`)
  return el
}

afterEach(() => {
  app?.unmount()
  host?.remove()
  document.getElementById('xh-portal-root')?.remove()
  app = null
  host = null
})

describe('日期选择器挂在局部 compact 子树里', () => {
  it('时间列按收紧后的控件高结算，底边与日历网格对齐', async () => {
    await mountInCompactSubtree()
    expect(document.documentElement.hasAttribute('data-density')).toBe(false)
    // 浮层确实落在 compact 档里：两边都按宽松档排时同样对得齐，这条断言就验不出问题
    const content = part('date-picker', 'content')
    expect(getComputedStyle(content).getPropertyValue('--xh-control-h-sm').trim()).toBe('28px')

    const grid = part('calendar-picker', 'grid').getBoundingClientRect()
    const column = part('date-picker', 'time-column').getBoundingClientRect()
    // 时间列从网格头那一行起，与周名一行加六周同高
    expect(Math.abs(column.bottom - grid.bottom)).toBeLessThanOrEqual(1)
  })
})
