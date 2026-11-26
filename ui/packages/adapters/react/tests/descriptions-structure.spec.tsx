// @vitest-environment jsdom
// 不给 children 时照 descriptionsStructure 铺：dl / dt / dd 成对，铺出的 DOM 与手写全套部件逐节点相同；
// 取值可由 renderValue 接管，头部照旧经 header。
import type { DescriptionsNode } from '@xihan-ui/headless'
import { describe, expect, it } from 'vitest'
import { XhDescriptionsHeader, XhDescriptionsItem, XhDescriptionsLabel, XhDescriptionsRoot, XhDescriptionsTitle, XhDescriptionsValue } from '../src'
import { renderInto, structureSnapshot } from './structure-snapshot'

const ORDER: DescriptionsNode[] = [
  { label: '订单号', content: 'XH-20260810-0042' },
  { label: '金额', content: 1280 },
  { value: 'remark', label: '备注', content: '工作日送达', span: 2 },
]

describe('descriptions 的标准结构', () => {
  it('只给 collection 铺出的树与手写全套部件逐节点相同：跨列数落成格子上的私有槽', async () => {
    const auto = await renderInto(<XhDescriptionsRoot collection={ORDER} columns={2} />)
    const hand = await renderInto(
      <XhDescriptionsRoot collection={ORDER} columns={2}>
        {ORDER.map(row => (
          <XhDescriptionsItem key={row.label} span={row.span}>
            <XhDescriptionsLabel>{row.label}</XhDescriptionsLabel>
            <XhDescriptionsValue>{String(row.content)}</XhDescriptionsValue>
          </XhDescriptionsItem>
        ))}
      </XhDescriptionsRoot>,
    )
    expect(structureSnapshot(auto.host)).toEqual(structureSnapshot(hand.host))
    expect(Array.from(auto.host.querySelectorAll('dl > div > *'), el => el.localName)).toEqual(['dt', 'dd', 'dt', 'dd', 'dt', 'dd'])
    expect((auto.host.querySelectorAll('[data-part="item"]')[2] as HTMLElement).style.getPropertyValue('--xh-_descriptions-item-span')).toBe('2')
  })

  it('renderValue 接管取值，参数是这一组的元信息；header 照旧排在 dl 之前', async () => {
    const view = await renderInto(
      <XhDescriptionsRoot
        collection={ORDER}
        header={<XhDescriptionsHeader><XhDescriptionsTitle>订单信息</XhDescriptionsTitle></XhDescriptionsHeader>}
        renderValue={item => <strong>{`${item.value}:${item.content}`}</strong>}
      />,
    )
    expect(view.host.firstElementChild?.getAttribute('data-part')).toBe('header')
    expect(Array.from(view.host.querySelectorAll('dd'), el => el.innerHTML)).toEqual(['<strong>0:XH-20260810-0042</strong>', '<strong>1:1280</strong>', '<strong>remark:工作日送达</strong>'])
  })
})
