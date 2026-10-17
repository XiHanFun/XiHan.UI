// @vitest-environment jsdom
// 不写默认插槽时照 fieldsetStructure 铺：组标题恒在，其余给了哪个具名插槽才铺哪一段，与手写全套部件同一棵树。
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { h } from 'vue'
import { XhFieldsetActions, XhFieldsetDescription, XhFieldsetErrorText, XhFieldsetFieldGroup, XhFieldsetLegend, XhFieldsetRoot } from '../src'

function skeleton(el: Element): string[] {
  return Array.from(el.querySelectorAll('[data-scope="fieldset"][data-part]'), node => `${node.localName}|${node.getAttribute('data-part')}|${node.textContent}`)
}

describe('fieldset 的标准结构', () => {
  it('legend 与五个具名插槽铺出组标题、说明、字段区、错误文案、按钮行，与手写全套部件一致', () => {
    const auto = mount(() => h(XhFieldsetRoot, { legend: '联系方式' }, {
      description: () => '至少填写一种',
      fieldGroup: () => '字段',
      errorText: () => '请至少填写一种联系方式',
      actions: () => '保存',
    }))
    const manual = mount(() => h(XhFieldsetRoot, null, () => [
      h(XhFieldsetLegend, null, () => '联系方式'),
      h(XhFieldsetDescription, null, () => '至少填写一种'),
      h(XhFieldsetFieldGroup, null, () => '字段'),
      h(XhFieldsetErrorText, null, () => '请至少填写一种联系方式'),
      h(XhFieldsetActions, null, () => '保存'),
    ]))
    expect(skeleton(auto.element as HTMLElement)).toEqual(skeleton(manual.element as HTMLElement))
    expect(skeleton(auto.element as HTMLElement).map(row => row.split('|')[1])).toEqual(['legend', 'description', 'field-group', 'error-text', 'actions'])
  })

  it('什么都不给也铺组标题；legend 插槽接管文字', () => {
    expect(skeleton(mount(() => h(XhFieldsetRoot)).element as HTMLElement).map(row => row.split('|')[1])).toEqual(['legend'])
    const slotted = mount(() => h(XhFieldsetRoot, { legend: '不用这段' }, { legend: () => '收货信息' }))
    expect(skeleton(slotted.element as HTMLElement)).toEqual(['legend|legend|收货信息'])
  })
})
