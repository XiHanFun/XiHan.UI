// @vitest-environment jsdom
// 不写默认插槽时照 cardStructure 铺：给了哪个具名插槽才铺哪一段，与手写全套部件同一棵树。
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { h } from 'vue'
import { XhCardContent, XhCardDescription, XhCardFooter, XhCardHeader, XhCardRoot, XhCardTitle } from '../src'

function skeleton(el: Element): string[] {
  return Array.from(el.querySelectorAll('[data-scope="card"][data-part]'), node => `${node.localName}|${node.getAttribute('data-part')}|${node.textContent}`)
}

describe('card 的标准结构', () => {
  it('四个具名插槽铺出页头（标题、说明）、正文与页脚，与手写全套部件一致', () => {
    const auto = mount(() => h(XhCardRoot, null, {
      title: () => '订单',
      description: () => '最近 30 天',
      content: () => '共 12 笔',
      footer: () => '查看全部',
    }))
    const manual = mount(() => h(XhCardRoot, null, () => [
      h(XhCardHeader, null, () => [h(XhCardTitle, null, () => '订单'), h(XhCardDescription, null, () => '最近 30 天')]),
      h(XhCardContent, null, () => '共 12 笔'),
      h(XhCardFooter, null, () => '查看全部'),
    ]))
    expect(skeleton(auto.element as HTMLElement)).toEqual(skeleton(manual.element as HTMLElement))
    expect(skeleton(auto.element as HTMLElement).map(row => row.split('|')[1])).toEqual(['header', 'title', 'description', 'content', 'footer'])
  })

  it('只给了正文就只铺正文，不铺空页头', () => {
    const card = mount(() => h(XhCardRoot, null, { content: () => '只有正文' }))
    expect(skeleton(card.element as HTMLElement).map(row => row.split('|')[1])).toEqual(['content'])
  })
})
