// @vitest-environment jsdom
// 文件名部件留空：显示根上的 fileName。pre 的可访问名指向这个节点，它空着读屏就读空。
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { h } from 'vue'
import { XhCodeViewFileName, XhCodeViewHeader, XhCodeViewPre, XhCodeViewRoot } from '../src'

function render(fileName?: string, slot?: string) {
  return mount(XhCodeViewRoot, {
    props: { code: 'a', fileName: 'store.ts', highlighter: null },
    slots: {
      default: () => [
        h(XhCodeViewHeader, null, () => h(XhCodeViewFileName, fileName === undefined ? null : { fileName }, slot === undefined ? undefined : () => slot)),
        h(XhCodeViewPre),
      ],
    },
  })
}

describe('code-view 文件名', () => {
  it('部件留空时显示根上的 fileName，pre 的可访问名念得出来', async () => {
    const wrapper = render()
    await wrapper.vm.$nextTick()
    const node = wrapper.get('[data-part="file-name"]')
    expect(node.text()).toBe('store.ts')
    expect(wrapper.get('[data-part="pre"]').attributes('aria-labelledby')).toBe(node.attributes('id'))
  })

  it('部件自己的 fileName 与插槽内容优先', async () => {
    expect(render('other.ts').get('[data-part="file-name"]').text()).toBe('other.ts')
    expect(render(undefined, 'src/store.ts').get('[data-part="file-name"]').text()).toBe('src/store.ts')
  })
})
