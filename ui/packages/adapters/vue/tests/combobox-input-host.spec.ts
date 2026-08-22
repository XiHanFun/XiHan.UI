// @vitest-environment jsdom
import type { ComboboxNode } from '@xihan-ui/headless'
import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vitest'
import { defineComponent, h, nextTick } from 'vue'
import {
  XhComboboxContent,
  XhComboboxControl,
  XhComboboxInput,
  XhComboboxItem,
  XhComboboxItemText,
  XhComboboxPositioner,
  XhComboboxRoot,
} from '../src'

// 属性表按宿主标签分档这件事归 connect，判据在 headless 的 combobox-input-host.spec.ts；
// 这里只管适配器自己那一半：渲染出请求的标签，并且换标签之后机器照样跑得通。

const COLLECTION: ComboboxNode[] = [
  { value: 'apple', label: '苹果' },
  { value: 'banana', label: '香蕉' },
]

afterEach(() => {
  document.body.innerHTML = ''
})

function mountWith(as?: 'input' | 'textarea') {
  return mount(defineComponent({
    setup: () => () => h(XhComboboxRoot, { collection: COLLECTION, placeholder: '输入水果名筛选' }, () => [
      h(XhComboboxControl, () => [h(XhComboboxInput, as ? { as } : {})]),
      h(XhComboboxPositioner, () => [
        h(XhComboboxContent, () => COLLECTION.map(node =>
          h(XhComboboxItem, { key: node.value, value: node.value }, () => [
            h(XhComboboxItemText, () => node.label),
          ]),
        )),
      ]),
    ]),
  }), { attachTo: document.body })
}

function hostEl(): HTMLElement {
  return document.querySelector<HTMLElement>('[data-scope="combobox"][data-part="input"]')!
}

/** 输入宿主上真正落到 DOM 的属性表，键已排序，便于逐字比对。 */
function hostAttrs(): Record<string, string> {
  const el = hostEl()
  const out: Record<string, string> = {}
  for (const name of [...el.getAttributeNames()].sort())
    out[name] = el.getAttribute(name)!
  return out
}

describe('combobox 的输入宿主可换', () => {
  it('不写 as 时渲染成 input', () => {
    const wrapper = mountWith()
    expect(hostEl().tagName).toBe('INPUT')
    wrapper.unmount()
  })

  it('显式写 as="input" 与不写 as 落到 DOM 上的属性逐字相同', () => {
    const implicit = mountWith()
    const before = hostAttrs()
    implicit.unmount()
    document.body.innerHTML = ''

    const explicit = mountWith('input')
    expect(hostAttrs()).toEqual(before)
    explicit.unmount()
  })

  it('as="textarea" 渲染成 textarea', () => {
    const wrapper = mountWith('textarea')
    expect(hostEl().tagName).toBe('TEXTAREA')
    wrapper.unmount()
  })

  it('as="textarea"：打字照样展开列表，方向键把高亮报进 aria-activedescendant', async () => {
    const wrapper = mountWith('textarea')
    const el = hostEl() as HTMLTextAreaElement
    el.focus()
    el.value = '苹'
    el.dispatchEvent(new Event('input', { bubbles: true }))
    await nextTick()
    await nextTick()

    expect(document.querySelector('[data-part="content"]')!.hasAttribute('hidden')).toBe(false)

    el.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }))
    await nextTick()
    const first = document.querySelector('[data-part="item"]')!
    expect(el.getAttribute('aria-activedescendant')).toBe(first.getAttribute('id'))
    wrapper.unmount()
  })

  it('as="textarea"：选中候选后文本回填到 textarea 里', async () => {
    const wrapper = mountWith('textarea')
    const el = hostEl() as HTMLTextAreaElement
    el.focus()
    el.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }))
    await nextTick()
    el.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }))
    await nextTick()
    await nextTick()
    expect(el.value).toBe('苹果')
    wrapper.unmount()
  })
})
