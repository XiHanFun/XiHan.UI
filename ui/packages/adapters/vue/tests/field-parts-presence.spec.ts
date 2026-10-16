// @vitest-environment jsdom
// 字段只把在场的部件接进控件的名字链与描述链：没写的、没有文字的说明不留 id，引用的每个 id 都查得回节点。
import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vitest'
import { defineComponent, h, nextTick, ref } from 'vue'
import {
  XhFieldControl,
  XhFieldDescription,
  XhFieldErrorText,
  XhFieldLabel,
  XhFieldRoot,
  XhSelectRoot,
  XhSelectTrigger,
  XhSelectValueText,
} from '../src'

afterEach(() => {
  document.body.innerHTML = ''
})

function refs(el: Element, attr: string): string[] {
  return (el.getAttribute(attr) ?? '').split(/\s+/).filter(Boolean)
}

function select() {
  return h(XhFieldControl, null, () => [h(XhSelectRoot, null, () => [h(XhSelectTrigger, null, () => [h(XhSelectValueText)])])])
}

describe('字段只引用在场的部件', () => {
  it('没写说明时触发钮的描述链不带说明的 id；invalid 时只剩错误文案', async () => {
    const wrapper = mount(defineComponent({
      setup: () => () => h(XhFieldRoot, { invalid: true }, () => [h(XhFieldLabel, null, () => '部门'), select(), h(XhFieldErrorText, null, () => '必填')]),
    }), { attachTo: document.body })
    await nextTick()
    const trigger = wrapper.find('button').element
    const errorId = wrapper.find('[data-scope="field"][data-part="error-text"]').element.id
    expect(refs(trigger, 'aria-describedby')).toEqual([errorId])
    for (const id of [...refs(trigger, 'aria-describedby'), refs(trigger, 'aria-labelledby')[0]!])
      expect(document.getElementById(id), id).not.toBeNull()
  })

  it('说明没有文字时按没写处理，补上文字后进描述链', async () => {
    const hint = ref('')
    const wrapper = mount(defineComponent({
      setup: () => () => h(XhFieldRoot, null, () => [h(XhFieldLabel, null, () => '部门'), select(), h(XhFieldDescription, null, () => hint.value)]),
    }), { attachTo: document.body })
    await nextTick()
    const trigger = wrapper.find('button').element
    expect(trigger.hasAttribute('aria-describedby')).toBe(false)
    hint.value = '选所属部门'
    await nextTick()
    await nextTick()
    const descriptionId = wrapper.find('[data-scope="field"][data-part="description"]').element.id
    expect(refs(trigger, 'aria-describedby')).toEqual([descriptionId])
  })

  it('说明里只有对读屏隐藏的内容时按没写处理，换成带 alt 的图片后进描述链', async () => {
    const hidden = ref(true)
    const wrapper = mount(defineComponent({
      setup: () => () => h(XhFieldRoot, null, () => [
        h(XhFieldLabel, null, () => '部门'),
        select(),
        h(XhFieldDescription, null, () => hidden.value ? h('span', { 'aria-hidden': 'true' }, '选所属部门') : h('img', { alt: '选所属部门' })),
      ]),
    }), { attachTo: document.body })
    await nextTick()
    const trigger = wrapper.find('button').element
    expect(trigger.hasAttribute('aria-describedby')).toBe(false)
    hidden.value = false
    await nextTick()
    await nextTick()
    const descriptionId = wrapper.find('[data-scope="field"][data-part="description"]').element.id
    expect(refs(trigger, 'aria-describedby')).toEqual([descriptionId])
  })

  it('没写字段标签时名字链里没有字段标签的 id', async () => {
    const wrapper = mount(defineComponent({
      setup: () => () => h(XhFieldRoot, null, () => [select(), h(XhFieldDescription, null, () => '选所属部门')]),
    }), { attachTo: document.body })
    await nextTick()
    expect(refs(wrapper.find('button').element, 'aria-labelledby').filter(id => id.startsWith('field:'))).toEqual([])
  })
})
