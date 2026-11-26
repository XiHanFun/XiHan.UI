// @vitest-environment jsdom
// 不写默认插槽时照 descriptionsStructure 铺：dl / dt / dd 成对，铺出的 DOM 与手写全套部件逐节点相同；
// 取值可由 value 插槽接管，头部照旧经 header 插槽。
import type { DescriptionsNode } from '@xihan-ui/headless'
import { describe, expect, it } from 'vitest'
import { h } from 'vue'
import { XhDescriptionsHeader, XhDescriptionsItem, XhDescriptionsLabel, XhDescriptionsRoot, XhDescriptionsTitle, XhDescriptionsValue } from '../src'
import { mountRender, structureSnapshot } from './structure-snapshot'

const ORDER: DescriptionsNode[] = [
  { label: '订单号', content: 'XH-20260810-0042' },
  { label: '金额', content: 1280 },
  { value: 'remark', label: '备注', content: '工作日送达', span: 2 },
]

describe('descriptions 的标准结构', () => {
  it('只给 collection 铺出的树与手写全套部件逐节点相同：跨列数落成格子上的私有槽', () => {
    const props = { collection: ORDER, columns: 2 as const }
    const auto = mountRender(() => h(XhDescriptionsRoot, props))
    const manual = mountRender(() => h(XhDescriptionsRoot, props, () => ORDER.map((row, i) => h(XhDescriptionsItem, { key: i, span: row.span }, () => [
      h(XhDescriptionsLabel, () => row.label),
      h(XhDescriptionsValue, () => String(row.content)),
    ]))))
    expect(structureSnapshot(auto)).toEqual(structureSnapshot(manual))
    expect(Array.from(auto.querySelectorAll('dl > div > *'), el => el.localName)).toEqual(['dt', 'dd', 'dt', 'dd', 'dt', 'dd'])
    expect((auto.querySelectorAll('[data-part="item"]')[2] as HTMLElement).style.getPropertyValue('--xh-_descriptions-item-span')).toBe('2')
  })

  it('value 插槽接管取值，载荷是这一组的元信息；header 插槽照旧排在 dl 之前', () => {
    const host = mountRender(() => h(XhDescriptionsRoot, { collection: ORDER }, {
      header: () => h(XhDescriptionsHeader, () => h(XhDescriptionsTitle, () => '订单信息')),
      value: (item: { value: string, content: string }) => h('strong', `${item.value}:${item.content}`),
    }))
    expect(host.firstElementChild?.getAttribute('data-part')).toBe('header')
    expect(Array.from(host.querySelectorAll('dd'), el => el.innerHTML)).toEqual(['<strong>0:XH-20260810-0042</strong>', '<strong>1:1280</strong>', '<strong>remark:工作日送达</strong>'])
  })
})
