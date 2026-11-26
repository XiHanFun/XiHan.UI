// @vitest-environment jsdom
// xh-timeline 不写部件时按标准结构生成：生成的节点与作者手写全套部件逐节点相同，列表语义与机读时间都在。
import { describe, expect, it } from 'vitest'
import { defineXhElements } from '../src/define'
import { mountElement, settle, structureSnapshot } from './structure-snapshot'

defineXhElements()

const EVENTS = [
  { value: 'created', label: '07-01', time: '09:12', datetime: '2026-07-01T09:12', title: '订单已创建', description: '下单来源：网页端' },
  { value: 'shipped', label: '07-01', time: '10:30', title: '已发货', tone: 'success' },
  { value: 'failed', title: '派送失败', description: '收件人电话无人接听', tone: 'danger' },
]

const MANUAL = `<ol data-xh-part="root">${[
  '<li data-xh-part="item"><div data-xh-part="label">07-01</div><span data-xh-part="indicator"></span><span data-xh-part="connector"></span><div data-xh-part="content"><time data-xh-part="time" datetime="2026-07-01T09:12">09:12</time><div data-xh-part="title">订单已创建</div><div data-xh-part="description">下单来源：网页端</div></div></li>',
  '<li data-xh-part="item" tone="success"><div data-xh-part="label">07-01</div><span data-xh-part="indicator"></span><span data-xh-part="connector"></span><div data-xh-part="content"><time data-xh-part="time">10:30</time><div data-xh-part="title">已发货</div></div></li>',
  '<li data-xh-part="item" tone="danger"><span data-xh-part="indicator"></span><span data-xh-part="connector"></span><div data-xh-part="content"><div data-xh-part="title">派送失败</div><div data-xh-part="description">收件人电话无人接听</div></div></li>',
].join('')}</ol>`

describe('xh-timeline 生成结构', () => {
  it('只给 collection 生成的节点与手写全套部件逐节点相同：根是 role=list 的 ol，圆点的语气取自条目', async () => {
    const auto = mountElement('xh-timeline', { attrs: { placement: 'alternate' }, props: { collection: EVENTS } })
    const hand = mountElement('xh-timeline', { attrs: { placement: 'alternate' }, props: { collection: EVENTS }, inner: MANUAL })
    await settle(auto.container)
    await settle(hand.container)
    expect(structureSnapshot(auto.container)).toEqual(structureSnapshot(hand.container))
    expect(auto.container.querySelector('ol')?.getAttribute('role')).toBe('list')
    expect(auto.container.querySelector('time')?.getAttribute('datetime')).toBe('2026-07-01T09:12')
    expect(Array.from(auto.container.querySelectorAll('[data-part="indicator"]'), el => el.getAttribute('data-tone'))).toEqual([null, 'success', 'danger'])
  })

  it('collection 改了生成的条目跟着换', async () => {
    const { container, host } = mountElement('xh-timeline', { props: { collection: EVENTS } })
    await settle(container)
    ;(host as unknown as { collection: unknown }).collection = [{ title: '只剩一条' }]
    await settle(container)
    expect(Array.from(container.querySelectorAll('[data-part="title"]'), el => el.textContent)).toEqual(['只剩一条'])
  })
})
