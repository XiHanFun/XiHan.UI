// @vitest-environment jsdom
// xh-descriptions 不写部件时按标准结构生成：dl / dt / dd 成对，生成的节点与作者手写全套部件逐节点相同；
// 某一格的取值可用宿主直接子节点 slot="value:<身份>" 接管。
import { describe, expect, it } from 'vitest'
import { defineXhElements } from '../src/define'
import { mountElement, settle, structureSnapshot } from './structure-snapshot'

defineXhElements()

const ORDER = [
  { label: '订单号', content: 'XH-20260810-0042' },
  { label: '金额', content: 1280 },
  { value: 'remark', label: '备注', content: '工作日送达', span: 2 },
]

const MANUAL = `<dl data-xh-part="root">${[
  '<div data-xh-part="item"><dt data-xh-part="label">订单号</dt><dd data-xh-part="value">XH-20260810-0042</dd></div>',
  '<div data-xh-part="item"><dt data-xh-part="label">金额</dt><dd data-xh-part="value">1280</dd></div>',
  '<div data-xh-part="item" span="2"><dt data-xh-part="label">备注</dt><dd data-xh-part="value">工作日送达</dd></div>',
].join('')}</dl>`

describe('xh-descriptions 生成结构', () => {
  it('只给 collection 生成的节点与手写全套部件逐节点相同：跨列数写成格子上的 span', async () => {
    const auto = mountElement('xh-descriptions', { attrs: { columns: '2' }, props: { collection: ORDER } })
    const hand = mountElement('xh-descriptions', { attrs: { columns: '2' }, props: { collection: ORDER }, inner: MANUAL })
    await settle(auto.container)
    await settle(hand.container)
    expect(structureSnapshot(auto.container)).toEqual(structureSnapshot(hand.container))
    expect(Array.from(auto.container.querySelectorAll('dl > div > *'), el => el.localName)).toEqual(['dt', 'dd', 'dt', 'dd', 'dt', 'dd'])
    expect(auto.container.querySelectorAll<HTMLElement>('[data-part="item"]')[2]!.style.getPropertyValue('--xh-_descriptions-item-span')).toBe('2')
  })

  it('slot="value:<身份>" 的子节点挪进那一格的 dd，没写身份的组按下标', async () => {
    const { container } = mountElement('xh-descriptions', {
      props: { collection: ORDER },
      inner: '<strong slot="value:remark">加急</strong><em slot="value:0">复制</em>',
    })
    await settle(container)
    expect(Array.from(container.querySelectorAll('dd'), el => el.innerHTML)).toEqual(['<em slot="value:0">复制</em>', '1280', '<strong slot="value:remark">加急</strong>'])
  })
})
