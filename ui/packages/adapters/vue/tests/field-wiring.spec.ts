// @vitest-environment jsdom
// 表单字段套薄封装时，说明与校验状态落在哪个节点上。
//
// XhFieldControl 把接线属性合到它唯一的子节点上；子节点是薄封装时合的是封装根，
// 而封装根往往只是个 div。名字不受影响（控件属性里带 aria-labelledby，div 上也生效），
// 但 aria-describedby 与 aria-invalid 落在 div 上就等于没落：焦点进的是里面那个
// input / button，读屏只念焦点所在节点的描述。
import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vitest'
import { defineComponent, h } from 'vue'
import {
  XhFieldControl,
  XhFieldErrorText,
  XhFieldLabel,
  XhFieldRoot,
  XhSelectRoot,
  XhSelectTrigger,
  XhSelectValueText,
  XhTextFieldInput,
  XhTextFieldRoot,
} from '../src'

afterEach(() => {
  document.body.innerHTML = ''
})

function mountField(invalid: boolean, control: () => unknown) {
  return mount(defineComponent({
    setup: () => () => h(XhFieldRoot, { label: '邮箱', invalid, errorText: '格式不对' }, () => [
      h(XhFieldLabel),
      h(XhFieldControl, null, () => [control()]),
      h(XhFieldErrorText),
    ]),
  }), { attachTo: document.body })
}

describe('表单字段的状态接线', () => {
  it('文本框：说明与校验状态落到 input 上，不是停在封装根', () => {
    const wrapper = mountField(true, () => h(XhTextFieldRoot, null, () => [h(XhTextFieldInput)]))
    const input = wrapper.find('input')
    expect(input.exists()).toBe(true)
    // 焦点进的是它，读屏念的也是它身上的描述
    expect(input.attributes('aria-describedby'), 'input 没接到错误文本').toBeTruthy()
    expect(input.attributes('aria-invalid')).toBe('true')
  })

  it('下拉：接线落到可聚焦的 trigger 上', () => {
    const wrapper = mountField(true, () =>
      h(XhSelectRoot, null, () => [h(XhSelectTrigger, null, () => [h(XhSelectValueText)])]))
    const trigger = wrapper.find('button')
    expect(trigger.exists()).toBe(true)
    expect(trigger.attributes('aria-describedby'), 'trigger 没接到错误文本').toBeTruthy()
    expect(trigger.attributes('aria-invalid')).toBe('true')
  })

  it('名字仍由 aria-labelledby 承担，封装根照旧带着它', () => {
    const wrapper = mountField(false, () => h(XhTextFieldRoot, null, () => [h(XhTextFieldInput)]))
    const root = wrapper.find('[data-scope="text-field"][data-part="root"]')
    expect(root.attributes('aria-labelledby'), '封装根丢了名字').toBeTruthy()
  })

  it('不在字段里时不凭空加属性', () => {
    const wrapper = mount(defineComponent({
      setup: () => () => h(XhTextFieldRoot, null, () => [h(XhTextFieldInput)]),
    }), { attachTo: document.body })
    expect(wrapper.find('input').attributes('aria-describedby')).toBeUndefined()
  })
})
