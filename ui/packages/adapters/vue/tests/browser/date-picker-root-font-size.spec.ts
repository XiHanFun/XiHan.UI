// 根字号不是 16px 的宿主（管理端常见 14px）：日历网格、控件高与间距都按 px，
// 与网格并排的时间列与浮层上限也得按 px 结算，否则列底空出一截、带时刻的面板要滚动才看得到确认钮。
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

async function mount(rootFontSize: string, density?: 'compact'): Promise<void> {
  // 桌面宽度：日历与时间列放得下一行，视口高度也不构成限制
  await page.viewport(1200, 900)
  document.documentElement.style.fontSize = rootFontSize
  // 密度与根字号一样写在文档根上：管理端整站切换的写法
  if (density)
    document.documentElement.dataset.density = density
  host = document.createElement('div')
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
  document.documentElement.style.fontSize = ''
  delete document.documentElement.dataset.density
  app = null
  host = null
})

describe('日期选择器在非 16px 根字号下', () => {
  for (const [rootFontSize, density] of [['14px', undefined], ['16px', undefined], ['14px', 'compact']] as const) {
    it(`根字号 ${rootFontSize}${density ? `（${density}）` : ''}：时间列与日历网格底边对齐，带时刻的面板不出竖向滚动`, async () => {
      await mount(rootFontSize, density)
      const grid = part('calendar-picker', 'grid').getBoundingClientRect()
      const column = part('date-picker', 'time-column').getBoundingClientRect()
      // 时间列从网格头那一行起，与周名一行加六周同高
      expect(Math.abs(column.bottom - grid.bottom)).toBeLessThanOrEqual(1)

      const content = part('date-picker', 'content')
      expect(content.scrollHeight).toBeLessThanOrEqual(content.clientHeight)
      const confirm = part('date-picker', 'confirm-trigger').getBoundingClientRect()
      expect(confirm.bottom).toBeLessThanOrEqual(content.getBoundingClientRect().bottom)
    })
  }
})
