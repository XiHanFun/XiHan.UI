// @vitest-environment jsdom
// 默认插槽决定要不要在码面正中挖一块。挖空是拿底色盖住一片模块，对读码器等同人为污损，
// 所以这里盯的是「什么才算真放了 logo」：插槽里只剩注释或空白时一格都不许挖。
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { createCommentVNode, h } from 'vue'
// 直接指到组件目录：XhQrCodeLogo 的包级导出由接线一并补，测试不等它
import { XhQrCode, XhQrCodeLogo } from '../src/components/qr-code/qr-code'

function render(slot?: () => unknown) {
  return mount(XhQrCode, {
    props: { value: 'https://ui.xihanfun.com', level: 'H' },
    slots: slot ? { default: slot as never } : {},
  })
}

describe('xhQrCode 的 logo 插槽', () => {
  it('v-if 为假留下的注释节点不算放了 logo', () => {
    // 编译器给 v-if 的假分支留一个注释节点，插槽因此永远不是空数组
    const wrapper = render(() => [createCommentVNode('v-if', true)])
    expect(wrapper.find('[data-xh-geom="logo-clear"]').exists()).toBe(false)
    expect(wrapper.attributes('data-logo')).toBeUndefined()
  })

  it('纯空白文本不算放了 logo', () => {
    const wrapper = render(() => ['\n  '])
    expect(wrapper.find('[data-xh-geom="logo-clear"]').exists()).toBe(false)
    expect(wrapper.attributes('data-logo')).toBeUndefined()
  })

  it('插槽空着不挖空', () => {
    const wrapper = render()
    expect(wrapper.find('[data-xh-geom="logo-clear"]').exists()).toBe(false)
    expect(wrapper.attributes('data-logo')).toBeUndefined()
  })

  it('真放了 XhQrCodeLogo 才挖空，且挖空排在两条 path 之后、logo 之前', () => {
    const wrapper = render(() => [h(XhQrCodeLogo, null, () => [h('rect')])])
    expect(wrapper.attributes('data-logo')).toBe('')
    const geoms = [...wrapper.element.children].map(node => node.getAttribute('data-xh-geom') ?? node.getAttribute('data-part'))
    expect(geoms).toEqual(['modules', 'logo-clear', 'logo'])
  })
})
