// @vitest-environment jsdom
// 不写默认插槽时照 timelineStructure 铺：铺出的 DOM 与手写全套部件逐节点相同，列表语义与机读时间都在。
import type { TimelineNode } from '@xihan-ui/headless'
import { describe, expect, it } from 'vitest'
import { h } from 'vue'
import { XhTimelineConnector, XhTimelineContent, XhTimelineDescription, XhTimelineIndicator, XhTimelineItem, XhTimelineLabel, XhTimelineRoot, XhTimelineTime, XhTimelineTitle } from '../src'
import { mountRender, structureSnapshot } from './structure-snapshot'

const EVENTS: TimelineNode[] = [
  { value: 'created', label: '07-01', time: '09:12', datetime: '2026-07-01T09:12', title: '订单已创建', description: '下单来源：网页端' },
  { value: 'shipped', label: '07-01', time: '10:30', title: '已发货', tone: 'success' },
  { value: 'failed', title: '派送失败', description: '收件人电话无人接听', tone: 'danger' },
]

describe('timeline 的标准结构', () => {
  it('只给 collection 铺出的树与手写全套部件逐节点相同：根是 role=list 的 ol，条目是 listitem', () => {
    const props = { collection: EVENTS, placement: 'alternate' as const }
    const auto = mountRender(() => h(XhTimelineRoot, props))
    const manual = mountRender(() => h(XhTimelineRoot, props, () => EVENTS.map(event => h(XhTimelineItem, { key: event.value, tone: event.tone }, () => [
      event.label != null ? h(XhTimelineLabel, () => event.label) : null,
      h(XhTimelineIndicator),
      h(XhTimelineConnector),
      h(XhTimelineContent, () => [
        event.time != null ? h(XhTimelineTime, { datetime: event.datetime }, () => event.time) : null,
        h(XhTimelineTitle, () => event.title),
        event.description != null ? h(XhTimelineDescription, () => event.description) : null,
      ]),
    ]))))
    expect(structureSnapshot(auto)).toEqual(structureSnapshot(manual))
    expect(auto.querySelector('ol')?.getAttribute('role')).toBe('list')
    expect(auto.querySelectorAll('li[role="listitem"]')).toHaveLength(3)
    expect(auto.querySelector('time')?.getAttribute('datetime')).toBe('2026-07-01T09:12')
    expect(Array.from(auto.querySelectorAll('[data-part="indicator"]'), el => el.getAttribute('data-tone'))).toEqual([null, 'success', 'danger'])
  })

  it('没有 collection 时 ol 是空的', () => {
    const host = mountRender(() => h(XhTimelineRoot))
    expect(host.querySelector('ol')?.children).toHaveLength(0)
  })
})
