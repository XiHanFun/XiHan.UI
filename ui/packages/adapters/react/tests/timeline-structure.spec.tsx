// @vitest-environment jsdom
// 不给 children 时照 timelineStructure 铺：铺出的 DOM 与手写全套部件逐节点相同，列表语义与机读时间都在。
import type { TimelineNode } from '@xihan-ui/headless'
import { describe, expect, it } from 'vitest'
import { XhTimelineConnector, XhTimelineContent, XhTimelineDescription, XhTimelineIndicator, XhTimelineItem, XhTimelineLabel, XhTimelineRoot, XhTimelineTime, XhTimelineTitle } from '../src'
import { renderInto, structureSnapshot } from './structure-snapshot'

const EVENTS: TimelineNode[] = [
  { value: 'created', label: '07-01', time: '09:12', datetime: '2026-07-01T09:12', title: '订单已创建', description: '下单来源：网页端' },
  { value: 'shipped', label: '07-01', time: '10:30', title: '已发货', tone: 'success' },
  { value: 'failed', title: '派送失败', description: '收件人电话无人接听', tone: 'danger' },
]

describe('timeline 的标准结构', () => {
  it('只给 collection 铺出的树与手写全套部件逐节点相同：根是 role=list 的 ol，条目是 listitem', async () => {
    const auto = await renderInto(<XhTimelineRoot collection={EVENTS} placement="alternate" />)
    const hand = await renderInto(
      <XhTimelineRoot collection={EVENTS} placement="alternate">
        {EVENTS.map(event => (
          <XhTimelineItem key={event.value} tone={event.tone}>
            {event.label != null ? <XhTimelineLabel>{event.label}</XhTimelineLabel> : null}
            <XhTimelineIndicator />
            <XhTimelineConnector />
            <XhTimelineContent>
              {event.time != null ? <XhTimelineTime dateTime={event.datetime}>{event.time}</XhTimelineTime> : null}
              <XhTimelineTitle>{event.title}</XhTimelineTitle>
              {event.description != null ? <XhTimelineDescription>{event.description}</XhTimelineDescription> : null}
            </XhTimelineContent>
          </XhTimelineItem>
        ))}
      </XhTimelineRoot>,
    )
    expect(structureSnapshot(auto.host)).toEqual(structureSnapshot(hand.host))
    expect(auto.host.querySelector('ol')?.getAttribute('role')).toBe('list')
    expect(auto.host.querySelectorAll('li[role="listitem"]')).toHaveLength(3)
    expect(auto.host.querySelector('time')?.getAttribute('datetime')).toBe('2026-07-01T09:12')
    expect(Array.from(auto.host.querySelectorAll('[data-part="indicator"]'), el => el.getAttribute('data-tone'))).toEqual([null, 'success', 'danger'])
  })
})
