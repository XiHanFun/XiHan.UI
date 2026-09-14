import type { TimelineProps } from '../src/timeline'
import { normalizeProps } from '@xihan-ui/core'
import { describe, expect, it } from 'vitest'
import { connectTimeline, timelineAnatomy } from '../src/timeline'

const parts = timelineAnatomy.build()

function api(props: TimelineProps = {}) {
  return connectTimeline(props, normalizeProps)
}

describe('connectTimeline 语义', () => {
  it('根报 list、条目报 listitem：皮肤抹掉列表标记后语义也不丢；方向恒有值、缺省竖排', () => {
    const root = api().getRootProps() as Record<string, unknown>
    expect(root).toMatchObject({ ...parts.root.attrs, 'role': 'list', 'data-orientation': 'vertical' })
    expect(root['data-placement']).toBeUndefined()
    expect(root['data-size']).toBeUndefined()
    expect(api().getItemProps()).toMatchObject({ 'role': 'listitem', 'data-orientation': 'vertical' })
  })

  it('不是步骤条：条目上没有 data-state，没有当前项与完成态', () => {
    const item = api().getItemProps() as Record<string, unknown>
    expect(item['data-state']).toBeUndefined()
    expect(item['aria-current']).toBeUndefined()
  })
})

describe('connectTimeline 排版属性', () => {
  it('方向与侧别在根、条目、坐标上各写一份，连线只带方向', () => {
    const a = api({ orientation: 'horizontal', placement: 'alternate', size: 'sm' })
    expect(a.getRootProps()).toMatchObject({ 'data-orientation': 'horizontal', 'data-placement': 'alternate', 'data-size': 'sm' })
    expect(a.getItemProps()).toMatchObject({ 'data-orientation': 'horizontal', 'data-placement': 'alternate' })
    expect(a.getLabelProps()).toMatchObject({ 'data-orientation': 'horizontal', 'data-placement': 'alternate' })
    expect(a.getConnectorProps()).toMatchObject({ 'aria-hidden': true, 'data-orientation': 'horizontal' })
    expect((a.getConnectorProps() as Record<string, unknown>)['data-placement']).toBeUndefined()
  })

  it('圆点纯视觉，语气色落在它身上；内容各段只拿身份，时刻不代填 datetime', () => {
    const a = api()
    expect(a.getIndicatorProps({ tone: 'danger' })).toMatchObject({ 'aria-hidden': true, 'data-tone': 'danger' })
    expect((a.getIndicatorProps({}) as Record<string, unknown>)['data-tone']).toBeUndefined()
    expect(a.getContentProps()).toEqual(parts.content.attrs)
    expect(a.getTitleProps()).toEqual(parts.title.attrs)
    expect(a.getDescriptionProps()).toEqual(parts.description.attrs)
    expect(a.getTimeProps()).toEqual(parts.time.attrs)
  })
})
