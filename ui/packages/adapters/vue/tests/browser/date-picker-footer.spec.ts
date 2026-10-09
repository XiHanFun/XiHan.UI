import type { App } from 'vue'
import type { DatePickerRootSlotProps } from '../../src/components/date-picker/date-picker'
import { afterEach, describe, expect, it } from 'vitest'
import { cdp } from 'vitest/browser'
import { createApp, h, nextTick } from 'vue'
import {
  XhDatePickerCalendar,
  XhDatePickerCell,
  XhDatePickerCellTrigger,
  XhDatePickerConfirmTrigger,
  XhDatePickerContent,
  XhDatePickerControl,
  XhDatePickerFooter,
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

function part(name: string): HTMLElement {
  const element = document.querySelector<HTMLElement>(`[data-scope='date-picker'][data-part='${name}']`)
  if (!element)
    throw new Error(`缺少日期选择部件：${name}`)
  return element
}

/** 在面板里按令牌解一次值，拿来与部件的计算样式比对。 */
function resolved(property: 'color' | 'font-size', value: string): string {
  const probe = document.createElement('span')
  probe.style.setProperty(property, value)
  part('content').append(probe)
  const out = getComputedStyle(probe).getPropertyValue(property)
  probe.remove()
  return out
}

async function mount(options: { theme?: 'light' | 'dark', dir?: 'ltr' | 'rtl', showTime?: boolean, note?: boolean } = {}): Promise<void> {
  const { theme = 'light', dir = 'ltr', showTime = true, note = true } = options
  host = document.createElement('div')
  host.dataset.theme = theme
  host.dir = dir
  document.body.append(host)
  app = createApp({ render: () => h(XhDatePickerRoot, {
    defaultOpen: true,
    defaultValue: '2026-09-12T09:30',
    locale: 'zh-CN',
    showTime,
  }, {
    default: ({ panels, weekDays }: DatePickerRootSlotProps) => [
      h(XhDatePickerControl, null, () => h(XhDatePickerTrigger, null, () => '选择日期')),
      h(XhDatePickerPositioner, null, () => h(XhDatePickerContent, null, () => [
        ...panels.map(panel => h(XhDatePickerCalendar, { index: panel.index }, () => [
          h(XhDatePickerHeader, null, () => h(XhDatePickerHeading)),
          h(XhDatePickerGrid, null, () => [
            h(XhDatePickerGridHead, null, () => h(XhDatePickerWeekRow, null, () => weekDays.map(day =>
              h(XhDatePickerWeekDay, { value: day.value }),
            ))),
            h(XhDatePickerGridBody, null, () => panel.weeks.map(week =>
              h(XhDatePickerWeekRow, null, () => week.map(day =>
                h(XhDatePickerCell, { value: day.start }, () => h(XhDatePickerCellTrigger, null, () => String(day.day))),
              )),
            )),
          ]),
        ])),
        h(XhDatePickerTimePanel),
        h(XhDatePickerFooter, null, () => [
          ...(note ? [h('span', { 'data-testid': 'note' }, '北京时间')] : []),
          h(XhDatePickerConfirmTrigger, null, () => '确定'),
        ]),
      ])),
    ],
  }) })
  app.mount(host)
  await nextTick()
  await nextTick()
  await expect.poll(() => part('content').getBoundingClientRect().width).toBeGreaterThan(0)
}

afterEach(async () => {
  await cdp().send('Emulation.setEmulatedMedia', { media: '', features: [] })
  app?.unmount()
  host?.remove()
  app = null
  host = null
})

describe('日期选择浮层底栏', () => {
  it.each(['light', 'dark'] as const)('%s：底栏独占面板底部一整行，上沿一道实体面描边，四周 8 的内衬', async (theme) => {
    await mount({ theme })
    const content = part('content')
    const contentRect = content.getBoundingClientRect()
    const edge = Number.parseFloat(getComputedStyle(content).borderLeftWidth)
    const footer = part('footer')
    const rect = footer.getBoundingClientRect()
    // 通栏：贴着面板左右内沿，落在日历与时间列下面
    expect(rect.left).toBeCloseTo(contentRect.left + edge, 1)
    expect(rect.right).toBeCloseTo(contentRect.right - edge, 1)
    expect(rect.top).toBeGreaterThanOrEqual(part('calendar').getBoundingClientRect().bottom - 0.5)
    expect(rect.top).toBeGreaterThanOrEqual(part('time-column').getBoundingClientRect().bottom - 0.5)
    expect(rect.bottom).toBeCloseTo(contentRect.bottom - edge, 1)

    const style = getComputedStyle(footer)
    expect(style.borderTopStyle).toBe('solid')
    expect(style.borderTopWidth).toBe('1px')
    expect(style.borderTopColor).toBe(resolved('color', 'var(--xh-material-solid-border)'))
    for (const side of ['Top', 'Right', 'Bottom', 'Left'] as const)
      expect(style[`padding${side}`]).toBe('8px')
    // 作者的附注是次要信息：弱化的正文色、说明档字号
    expect(style.color).toBe(resolved('color', 'var(--xh-fg-muted)'))
    expect(style.fontSize).toBe(resolved('font-size', 'var(--xh-text-caption-size)'))
    // 底栏不是集合，不报角色、不占 Tab 位
    expect(footer.getAttribute('role')).toBeNull()
    expect(footer.hasAttribute('tabindex')).toBe(false)
  })

  it.each(['ltr', 'rtl'] as const)('%s：附注排在行首，确认钮总落在行尾，两者在底栏里垂直居中', async (dir) => {
    await mount({ dir })
    const footer = part('footer').getBoundingClientRect()
    const confirm = part('confirm-trigger').getBoundingClientRect()
    const note = document.querySelector<HTMLElement>(`[data-testid='note']`)!.getBoundingClientRect()
    if (dir === 'ltr') {
      expect(note.left).toBeCloseTo(footer.left + 8, 1)
      expect(confirm.right).toBeCloseTo(footer.right - 8, 1)
    }
    else {
      expect(note.right).toBeCloseTo(footer.right - 8, 1)
      expect(confirm.left).toBeCloseTo(footer.left + 8, 1)
    }
    expect(confirm.top + confirm.height / 2).toBeCloseTo(footer.top + 1 + (footer.height - 1) / 2, 0)
    expect(note.top + note.height / 2).toBeCloseTo(footer.top + 1 + (footer.height - 1) / 2, 0)
  })

  it('没开 showTime 时，只放了确认钮的底栏随确认钮一并收起，不留空栏', async () => {
    await mount({ showTime: false, note: false })
    expect(part('confirm-trigger').hidden).toBe(true)
    expect(getComputedStyle(part('footer')).display).toBe('none')
    expect(part('footer').getBoundingClientRect().height).toBe(0)
  })

  it('底栏里还有作者的别的内容时，确认钮收起后底栏仍在', async () => {
    await mount({ showTime: false })
    expect(part('confirm-trigger').hidden).toBe(true)
    expect(getComputedStyle(part('footer')).display).toBe('grid')
    expect(part('footer').getBoundingClientRect().height).toBeGreaterThan(0)
  })

  it('forced-colors：上沿分隔线照样画出、取系统前景色，确认钮仍在行尾', async () => {
    await cdp().send('Emulation.setEmulatedMedia', { media: '', features: [{ name: 'forced-colors', value: 'active' }] })
    expect(matchMedia('(forced-colors: active)').matches).toBe(true)
    await mount({ note: false })
    const footer = part('footer')
    const style = getComputedStyle(footer)
    expect(style.borderTopStyle).toBe('solid')
    expect(Number.parseFloat(style.borderTopWidth)).toBeGreaterThan(0)
    expect(style.borderTopColor).not.toBe(getComputedStyle(part('content')).backgroundColor)
    expect(part('confirm-trigger').getBoundingClientRect().right).toBeCloseTo(footer.getBoundingClientRect().right - 8, 1)
  })

  it('print：底栏随浮层一起不上纸', async () => {
    await mount({ note: false })
    await cdp().send('Emulation.setEmulatedMedia', { media: 'print' })
    expect(part('footer').getBoundingClientRect().height).toBe(0)
  })
})
