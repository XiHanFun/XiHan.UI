// @vitest-environment jsdom
// 文件名部件留空：显示根上的 filename。pre 的可访问名指向这个节点，它空着读屏就读空。
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { h } from 'vue'
import { XhCodeViewFilename, XhCodeViewHeader, XhCodeViewPre, XhCodeViewRoot } from '../src'

function render(filename?: string, slot?: string) {
  return mount(XhCodeViewRoot, {
    props: { code: 'a', filename: 'store.ts', highlighter: null },
    slots: {
      default: () => [
        h(XhCodeViewHeader, null, () => h(XhCodeViewFilename, filename === undefined ? null : { filename }, slot === undefined ? undefined : () => slot)),
        h(XhCodeViewPre),
      ],
    },
  })
}

describe('code-view 文件名', () => {
  it('部件留空时显示根上的 filename，pre 的可访问名念得出来', async () => {
    const wrapper = render()
    await wrapper.vm.$nextTick()
    const node = wrapper.get('[data-part="filename"]')
    expect(node.text()).toBe('store.ts')
    expect(wrapper.get('[data-part="pre"]').attributes('aria-labelledby')).toBe(node.attributes('id'))
  })

  it('部件自己的 filename 与插槽内容优先', async () => {
    expect(render('other.ts').get('[data-part="filename"]').text()).toBe('other.ts')
    expect(render(undefined, 'src/store.ts').get('[data-part="filename"]').text()).toBe('src/store.ts')
  })
})
