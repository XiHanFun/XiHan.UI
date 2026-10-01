// 整条占位：一段都没填、焦点也不在段上时，输入行显示一句占位文字（「请选择生效时间」），段位与分隔符让位；
// 焦点一进到段上就换回段位。文字由皮肤以生成内容画出，段位只是淡出，仍可聚焦、仍在读屏树里。
import type { App } from 'vue'
import type { DatePickerRootSlotProps } from '../../src/components/date-picker/date-picker'
import type { DateRangePickerRootSlotProps } from '../../src/components/date-range-picker/date-range-picker'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import {
  XhDatePickerControl,
  XhDatePickerRoot,
  XhDatePickerSegment,
  XhDatePickerSegmentGroup,
  XhDateRangePickerControl,
  XhDateRangePickerRangeSeparator,
  XhDateRangePickerRoot,
  XhDateRangePickerSegment,
  XhDateRangePickerSegmentGroup,
} from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let app: App | null = null
let host: HTMLElement | null = null

afterEach(() => {
  app?.unmount()
  host?.remove()
  app = null
  host = null
})

async function settle(): Promise<void> {
  for (let i = 0; i < 2; i++) {
    await nextTick()
    await new Promise<void>(resolve => requestAnimationFrame(() => resolve()))
  }
}

async function mount(render: () => unknown): Promise<void> {
  host = document.createElement('div')
  host.style.width = '320px'
  document.body.append(host)
  app = createApp({ render })
  app.mount(host)
  await settle()
}

function groups(scope: string): HTMLElement[] {
  return [...host!.querySelectorAll<HTMLElement>(`[data-scope='${scope}'][data-part='segment-group']`)]
}

function segments(group: HTMLElement): HTMLElement[] {
  return [...group.querySelectorAll<HTMLElement>(`[data-part='segment']:not([hidden])`)]
}

/** 占位文字真画出来了，段位与分隔符都淡出。 */
function expectPlaceholder(group: HTMLElement, text: string): void {
  expect(getComputedStyle(group, '::before').content).toBe(`"${text}"`)
  for (const child of group.children)
    expect(getComputedStyle(child).opacity).toBe('0')
}

function expectSegments(group: HTMLElement): void {
  expect(getComputedStyle(group, '::before').content).toBe('none')
  for (const segment of segments(group))
    expect(getComputedStyle(segment).opacity).toBe('1')
}

describe('日期选择器的整条占位', () => {
  it('全空时显示占位文字，焦点进到段上换回段位，离开又回到占位', async () => {
    await mount(() => h(XhDatePickerRoot, { locale: 'zh-CN', placeholder: '请选择生效时间' }, {
      default: ({ segments: list }: DatePickerRootSlotProps) => [
        h(XhDatePickerControl, null, () => h(XhDatePickerSegmentGroup, null, () => list.flatMap((segment, index) => [
          ...(index > 0 ? [h('span', { key: `literal-${index}` }, '/')] : []),
          h(XhDatePickerSegment, { key: segment.type, index }),
        ]))),
      ],
    }))
    const [group] = groups('date-picker')
    expectPlaceholder(group!, '请选择生效时间')
    // 占位文字压在同一行上、不吃指针：点下去落到底下的段位
    expect(getComputedStyle(group!, '::before').pointerEvents).toBe('none')

    segments(group!)[0]!.focus()
    await settle()
    expectSegments(group!)

    segments(group!)[0]!.blur()
    await settle()
    expectPlaceholder(group!, '请选择生效时间')
  })

  it('区间两组各出各的占位：起点填了值，终点仍显示自己的占位', async () => {
    await mount(() => h(XhDateRangePickerRoot, {
      locale: 'zh-CN',
      defaultValue: ['2026-07-01'],
      startPlaceholder: '开始日期',
      endPlaceholder: '结束日期',
    }, {
      default: ({ segments: start, endSegments: end }: DateRangePickerRootSlotProps) => [
        h(XhDateRangePickerControl, null, () => [
          h(XhDateRangePickerSegmentGroup, { index: 0 }, () => start.map((segment, index) => h(XhDateRangePickerSegment, { key: segment.type, index }))),
          h(XhDateRangePickerRangeSeparator),
          h(XhDateRangePickerSegmentGroup, { index: 1 }, () => end.map((segment, index) => h(XhDateRangePickerSegment, { key: segment.type, index }))),
        ]),
      ],
    }))
    const [startGroup, endGroup] = groups('date-range-picker')
    expectSegments(startGroup!)
    expectPlaceholder(endGroup!, '结束日期')
  })
})
