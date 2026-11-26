// @vitest-environment jsdom
// 不写默认插槽时照 emptyStateStructure 铺：标题与说明取文字或同名插槽，插画、图标与操作区取同名插槽。
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { h } from 'vue'
import { XhEmptyStateAction, XhEmptyStateDescription, XhEmptyStateIndicator, XhEmptyStateRoot, XhEmptyStateTitle } from '../src'

function skeleton(el: Element): string[] {
  // mount 的 element 就是 root 本身：连它一起算
  const nodes = [el, ...Array.from(el.querySelectorAll('[data-scope="empty-state"][data-part]'))].filter(node => node.matches('[data-scope="empty-state"][data-part]'))
  return nodes.map(node => `${node.localName}|${node.getAttribute('data-part')}|${node.textContent}`)
}

describe('empty-state 的标准结构', () => {
  it('title、description 与 indicator、action 插槽铺出的树与手写全套部件一致', () => {
    const auto = mount(() => h(XhEmptyStateRoot, { title: '还没有任何工单', description: '新建一条工单，或者换个筛选条件再看看。' }, {
      indicator: () => '∅',
      action: () => h('button', { type: 'button' }, '新建工单'),
    }))
    const manual = mount(() => h(XhEmptyStateRoot, null, () => [
      h(XhEmptyStateIndicator, () => '∅'),
      h(XhEmptyStateTitle, () => '还没有任何工单'),
      h(XhEmptyStateDescription, () => '新建一条工单，或者换个筛选条件再看看。'),
      h(XhEmptyStateAction, () => h('button', { type: 'button' }, '新建工单')),
    ]))
    expect(skeleton(auto.element)).toEqual(skeleton(manual.element))
    expect(skeleton(auto.element).map(row => row.split('|')[1])).toEqual(['root', 'indicator', 'title', 'description', 'action'])
    auto.unmount()
    manual.unmount()
  })

  it('同名插槽压过文字；没给的段不铺', () => {
    const wrapper = mount(() => h(XhEmptyStateRoot, { title: '不用这段' }, { title: () => '没有匹配的结果' }))
    expect(skeleton(wrapper.element).slice(1)).toEqual(['p|title|没有匹配的结果'])
    wrapper.unmount()
  })
})
