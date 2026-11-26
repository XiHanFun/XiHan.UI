// @vitest-environment jsdom
// 不写默认插槽时照 alertStructure 铺：文本列恒铺，标题与说明取文字或同名插槽，写了 closable 才铺关闭钮。
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { h, nextTick } from 'vue'
import { XhAlertCloseTrigger, XhAlertContent, XhAlertDescription, XhAlertRoot, XhAlertTitle } from '../src'

function skeleton(el: Element): string[] {
  // mount 的 element 就是 root 本身：连它一起算
  const nodes = [el, ...Array.from(el.querySelectorAll('[data-scope="alert"][data-part]'))].filter(node => node.matches('[data-scope="alert"][data-part]'))
  return nodes.map(node => `${node.localName}|${node.getAttribute('data-part')}|${node.textContent}`)
}

describe('alert 的标准结构', () => {
  it('title、description、closable 铺出的树与手写全套部件一致，标题与说明接上 root 的名字与描述', async () => {
    const auto = mount(() => h(XhAlertRoot, { title: '部署已排队', description: '构建完成后会自动发布。', closable: true }), { attachTo: document.body })
    const manual = mount(() => h(XhAlertRoot, { closable: true }, () => [
      h(XhAlertContent, () => [h(XhAlertTitle, () => '部署已排队'), h(XhAlertDescription, () => '构建完成后会自动发布。')]),
      h(XhAlertCloseTrigger),
    ]), { attachTo: document.body })
    await nextTick()
    expect(skeleton(auto.element)).toEqual(skeleton(manual.element))
    expect(skeleton(auto.element).map(row => row.split('|')[1])).toEqual(['root', 'content', 'title', 'description', 'close-trigger'])
    const root = auto.element as HTMLElement
    expect(root.getAttribute('aria-labelledby')).toBe(root.querySelector('[data-part="title"]')!.id)
    expect(root.getAttribute('aria-describedby')).toBe(root.querySelector('[data-part="description"]')!.id)
    auto.unmount()
    manual.unmount()
  })

  it('不写 closable 不替作者添关闭钮；同名插槽压过文字', () => {
    const wrapper = mount(() => h(XhAlertRoot, { title: '不用这段' }, { title: () => '连接已断开', action: () => h('button', { type: 'button' }, '重试') }))
    expect(skeleton(wrapper.element).map(row => row.split('|').slice(1).join('|'))).toEqual([
      'root|连接已断开重试',
      'content|连接已断开',
      'title|连接已断开',
      'action|重试',
    ])
    wrapper.unmount()
  })
})
