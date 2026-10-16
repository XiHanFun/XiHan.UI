// @vitest-environment jsdom
// 没有排版的环境（jsdom）里渲染多行自动增高的文本框：挂载、输入、换配置都不抛错，也不改 textarea 的高度。
import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vitest'
import { defineComponent, h, nextTick, ref } from 'vue'
import { XhTextFieldControl, XhTextFieldInput, XhTextFieldRoot } from '../src'

afterEach(() => {
  document.body.innerHTML = ''
})

describe('多行自动增高在 jsdom 里安静跳过（Vue）', () => {
  it('挂载、输入与切换 autoSize 都不抛错，textarea 不写高度', async () => {
    const autoSize = ref<boolean | { minRows: number, maxRows: number }>(true)
    const wrapper = mount(defineComponent({
      setup: () => () => h(XhTextFieldRoot, { autoSize: autoSize.value }, () => [
        h(XhTextFieldControl, null, () => [h(XhTextFieldInput, { as: 'textarea' })]),
      ]),
    }), { attachTo: document.body })
    await nextTick()
    const el = wrapper.find('textarea').element as HTMLTextAreaElement
    el.value = '第一行\n第二行\n第三行'
    await wrapper.find('textarea').trigger('input')
    autoSize.value = { minRows: 2, maxRows: 4 }
    await nextTick()
    autoSize.value = false
    await nextTick()
    expect(el.style.blockSize).toBe('')
    expect(el.style.maxBlockSize).toBe('')
    expect(el.style.overflowY).toBe('')
    wrapper.unmount()
  })
})
