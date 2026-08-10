// @vitest-environment jsdom
// autoFill 决定轨道里铺几份内容。接缝对不对得上，看的是「走完的距离恰好等于一份的长度」，
// 所以每份都要各自成壳、各自等长；这里盯的就是壳的份数、副本的可及性，以及什么才算真有内容可铺。
// WC 侧的份数由作者自己写在 Light DOM 里，故这条只在 Vue 适配器上成立，不进跨适配器判据。
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { createCommentVNode, h } from 'vue'
// 直接指到组件目录：包级导出由接线一并补，测试不等它
import { XhMarqueeContent, XhMarqueeRoot } from '../src/components/marquee/marquee'

function render(props: Record<string, unknown>, slot: () => unknown = () => '曦寒前端组件库') {
  return mount(XhMarqueeRoot, {
    props,
    slots: { default: () => h(XhMarqueeContent, null, slot as never) },
  })
}

describe('xhMarquee 的 autoFill', () => {
  it('缺省铺一份，那一份不标 aria-hidden', () => {
    const wrapper = render({})
    const copies = wrapper.findAll('[data-xh-copy]')
    expect(copies).toHaveLength(1)
    expect(copies[0]!.attributes('aria-hidden')).toBeUndefined()
  })

  it('开了 autoFill 铺两份，第二份是副本、既不朗读也不可聚焦', () => {
    const wrapper = render({ autoFill: true })
    const copies = wrapper.findAll('[data-xh-copy]')
    expect(copies).toHaveLength(2)
    expect(copies[0]!.attributes('aria-hidden')).toBeUndefined()
    expect(copies[0]!.attributes('inert')).toBeUndefined()
    expect(copies[1]!.attributes('aria-hidden')).toBe('true')
    // 只标 aria-hidden 而留着可聚焦的副本，焦点会落进一个读屏看不见的地方。
    // inert 是布尔属性，在场即生效，不比对它的值
    expect(copies[1]!.attributes('inert')).toBeDefined()
    // 两份内容逐字相同，走完一份才接得上
    expect(copies[1]!.text()).toBe(copies[0]!.text())
  })

  it('v-if 为假留下的注释节点不算有内容，一份都不铺', () => {
    // 编译器给 v-if 的假分支留一个注释节点，插槽因此永远不是空数组
    const wrapper = render({ autoFill: true }, () => [createCommentVNode('v-if', true)])
    expect(wrapper.findAll('[data-xh-copy]')).toHaveLength(0)
  })

  it('纯空白文本不算有内容，一份都不铺', () => {
    const wrapper = render({ autoFill: true }, () => ['\n  '])
    expect(wrapper.findAll('[data-xh-copy]')).toHaveLength(0)
  })
})
