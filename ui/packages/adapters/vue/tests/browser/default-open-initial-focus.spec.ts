// 挂载即展开（defaultOpen）时焦点的首个落点。
//
// 刻意不引皮肤：皮肤会把没落位的浮层先 visibility 藏起来，focus() 在那一拍是空操作，
// 焦点域下一拍重试就把首次落错的痕迹抹掉了。作者自带样式或直接用无皮肤组件时没有这道闸，
// Vue 先渲出带 tabindex 的部件再在 mounted 里跑机器效应，焦点域建起那一刻同步落焦——
// 锚点此时必须已经挑好，否则焦点会定死在整列 / 整个列表容器上，方向键与 Enter 没有起点。
import type { TimePickerColumnUnit } from '@xihan-ui/headless'
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import {
  XhSelectRoot,
  XhTimePickerColumn,
  XhTimePickerContent,
  XhTimePickerControl,
  XhTimePickerItem,
  XhTimePickerPositioner,
  XhTimePickerRoot,
  XhTimePickerSegment,
  XhTimePickerSegmentGroup,
  XhTimePickerTrigger,
  XhTimeRangePickerColumn,
  XhTimeRangePickerColumnGroup,
  XhTimeRangePickerContent,
  XhTimeRangePickerControl,
  XhTimeRangePickerItem,
  XhTimeRangePickerPositioner,
  XhTimeRangePickerRangeSeparator,
  XhTimeRangePickerRoot,
  XhTimeRangePickerSegment,
  XhTimeRangePickerSegmentGroup,
  XhTimeRangePickerTrigger,
} from '../../src'

let app: App | null = null
let host: HTMLElement | null = null

function column(unit: TimePickerColumnUnit) {
  return h(XhTimePickerColumn, { unit }, {
    default: ({ options }: { options: string[] }) => options.map(value => h(XhTimePickerItem, { key: value, value })),
  })
}

function rangeColumnGroup(index: 0 | 1) {
  return h(XhTimeRangePickerColumnGroup, { index }, () => (['hour', 'minute'] as const).map(unit =>
    h(XhTimeRangePickerColumn, { unit }, {
      default: ({ options }: { options: string[] }) => options.map(value => h(XhTimeRangePickerItem, { key: value, value })),
    }),
  ))
}

function mount(render: () => ReturnType<typeof h>): void {
  host = document.createElement('div')
  document.body.append(host)
  app = createApp({ render })
  app.mount(host)
}

function part(scope: string, name: string, extra = ''): HTMLElement {
  const element = document.querySelector<HTMLElement>(`[data-scope='${scope}'][data-part='${name}']${extra}`)
  if (!element)
    throw new Error(`找不到部件 ${scope}/${name}${extra}`)
  return element
}

afterEach(() => {
  app?.unmount()
  host?.remove()
  document.getElementById('xh-portal-root')?.remove()
  app = null
  host = null
})

describe('vue 挂载即展开：焦点的首个落点', () => {
  it('time-range-picker 无值：挂载那一拍焦点就在起点时列的首格，不是列容器；之后也不再挪', async () => {
    mount(() => h(XhTimeRangePickerRoot, { defaultOpen: true, min: '08:00', max: '11:00', step: 30 }, () => [
      h(XhTimeRangePickerControl, null, () => [
        h(XhTimeRangePickerSegmentGroup, { index: 0 }, () => [h(XhTimeRangePickerSegment, { segment: 'hour' }), h(XhTimeRangePickerSegment, { segment: 'minute' })]),
        h(XhTimeRangePickerRangeSeparator),
        h(XhTimeRangePickerSegmentGroup, { index: 1 }, () => [h(XhTimeRangePickerSegment, { segment: 'hour' }), h(XhTimeRangePickerSegment, { segment: 'minute' })]),
        h(XhTimeRangePickerTrigger, null, () => '选择'),
      ]),
      h(XhTimeRangePickerPositioner, null, () => h(XhTimeRangePickerContent, null, () => [rangeColumnGroup(0), rangeColumnGroup(1)])),
    ]))
    const hourColumn = part('time-range-picker', 'column-group', '[data-index=\'0\'] [data-part=\'column\'][data-value=\'hour\']')
    const first = [...hourColumn.querySelectorAll<HTMLElement>('[data-part=\'item\']')].find(el => el.getAttribute('aria-disabled') !== 'true')!
    // 机器在 mounted 里同步挂载：焦点域建起那一刻就该落在首格
    expect(document.activeElement).toBe(first)
    await nextTick()
    await nextTick()
    expect(document.activeElement).toBe(first)
    expect(first.getAttribute('tabindex')).toBe('0')
    expect(hourColumn.getAttribute('tabindex')).toBe('-1')
  })

  it('time-picker 无值：挂载那一拍焦点就在时列的首格，不是列容器', async () => {
    mount(() => h(XhTimePickerRoot, { defaultOpen: true }, () => [
      h(XhTimePickerControl, null, () => [
        h(XhTimePickerSegmentGroup, null, () => [h(XhTimePickerSegment, { segment: 'hour' }), h(XhTimePickerSegment, { segment: 'minute' })]),
        h(XhTimePickerTrigger, null, () => '选择'),
      ]),
      h(XhTimePickerPositioner, null, () => h(XhTimePickerContent, null, () => [column('hour'), column('minute')])),
    ]))
    const hourColumn = part('time-picker', 'column', '[data-value=\'hour\']')
    const first = [...hourColumn.querySelectorAll<HTMLElement>('[data-part=\'item\']')].find(el => el.getAttribute('aria-disabled') !== 'true')!
    expect(document.activeElement).toBe(first)
    await nextTick()
    await nextTick()
    expect(document.activeElement).toBe(first)
    expect(hourColumn.getAttribute('tabindex')).toBe('-1')
  })

  it('select 有选中值：挂载那一拍焦点就在选中的条目上，不是列表容器', async () => {
    mount(() => h(XhSelectRoot, {
      defaultOpen: true,
      defaultValue: 'banana',
      collection: [
        { value: 'apple', label: 'Apple' },
        { value: 'banana', label: 'Banana' },
        { value: 'cherry', label: 'Cherry' },
      ],
    }))
    const banana = part('select', 'item', '[data-value=\'banana\']')
    expect(document.activeElement).toBe(banana)
    await nextTick()
    await nextTick()
    expect(document.activeElement).toBe(banana)
    expect(banana.getAttribute('tabindex')).toBe('0')
    expect(part('select', 'list').getAttribute('tabindex')).toBe('-1')
  })
})
