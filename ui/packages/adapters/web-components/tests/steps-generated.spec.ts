// @vitest-environment jsdom
// xh-steps 不写部件时按标准结构生成：生成的节点与作者手写全套部件逐节点相同，换步后序号圆点跟着换字。
import type { DiagnosticRecord } from '@xihan-ui/core'
import { onDiagnostic } from '@xihan-ui/core'
import { describe, expect, it } from 'vitest'
import { defineXhElements } from '../src/define'
import { mountElement, settle, structureSnapshot } from './structure-snapshot'

defineXhElements()

const STEPS = [
  { title: '填写地址', description: '收货人与联系方式' },
  { title: '选择支付' },
  { title: '确认订单', description: '核对金额' },
]

/** 手写全套部件：走过的步圆点留空，点状形态一律留空，没有说明的步不写说明；只读下触发器写成 div。 */
function manual(current: number, options: { dot?: boolean, readOnly?: boolean } = {}): string {
  const trigger = options.readOnly ? 'div' : 'button'
  const items = STEPS.map((step, i) => {
    const indicator = options.dot || i < current ? '' : String(i + 1)
    const description = step.description ? `<span data-xh-part="description">${step.description}</span>` : ''
    return `<div data-xh-part="item" value="${i}"><${trigger} data-xh-part="trigger"><span data-xh-part="indicator">${indicator}</span><span data-xh-part="title">${step.title}</span>${description}</${trigger}><div data-xh-part="separator"></div></div>`
  })
  return `<div data-xh-part="root"><div data-xh-part="list">${items.join('')}</div></div>`
}

describe('xh-steps 生成结构', () => {
  it('只给 collection 生成的节点与手写全套部件逐节点相同，没有 wc.* 诊断', async () => {
    const records: DiagnosticRecord[] = []
    const stop = onDiagnostic(record => records.push(record))
    const auto = mountElement('xh-steps', { attrs: { 'default-value': '1' }, props: { collection: STEPS } })
    const hand = mountElement('xh-steps', { attrs: { 'default-value': '1' }, props: { collection: STEPS }, inner: manual(1) })
    await settle(auto.container)
    await settle(hand.container)
    stop()
    expect(structureSnapshot(auto.container)).toEqual(structureSnapshot(hand.container))
    expect(auto.container.querySelector('[data-part="list"]')?.getAttribute('role')).toBe('tablist')
    expect(records.filter(record => record.code.startsWith('wc.'))).toEqual([])
  })

  it('只写一个空 root 时同样生成；只读展示生成 div 触发器，点状形态圆点留空', async () => {
    const onlyRoot = mountElement('xh-steps', { attrs: { 'default-value': '1' }, props: { collection: STEPS }, inner: '<div data-xh-part="root"></div>' })
    const readOnly = mountElement('xh-steps', { attrs: { 'value': '2', 'read-only': '' }, props: { collection: STEPS } })
    const readOnlyHand = mountElement('xh-steps', { attrs: { 'value': '2', 'read-only': '' }, props: { collection: STEPS }, inner: manual(2, { readOnly: true }) })
    const dot = mountElement('xh-steps', { attrs: { 'default-value': '1', 'variant': 'dot' }, props: { collection: STEPS } })
    const dotHand = mountElement('xh-steps', { attrs: { 'default-value': '1', 'variant': 'dot' }, props: { collection: STEPS }, inner: manual(1, { dot: true }) })
    for (const { container } of [onlyRoot, readOnly, readOnlyHand, dot, dotHand])
      await settle(container)
    expect(onlyRoot.container.querySelectorAll('[data-part="trigger"]')).toHaveLength(3)
    expect(structureSnapshot(readOnly.container)).toEqual(structureSnapshot(readOnlyHand.container))
    expect(readOnly.container.querySelector('[data-part="list"]')?.getAttribute('role')).toBe('list')
    expect(structureSnapshot(dot.container)).toEqual(structureSnapshot(dotHand.container))
  })

  it('换步后走过的圆点留空、交给皮肤画对号；退回去序号又写回来', async () => {
    const { container, host } = mountElement('xh-steps', { props: { collection: STEPS } })
    await settle(container)
    const indicators = (): string[] => Array.from(container.querySelectorAll('[data-part="indicator"]'), el => el.textContent ?? '')
    expect(indicators()).toEqual(['1', '2', '3'])
    host.setAttribute('value', '2')
    await settle(container)
    expect(indicators()).toEqual(['', '', '3'])
    host.setAttribute('value', '1')
    await settle(container)
    expect(indicators()).toEqual(['', '2', '3'])
  })
})
