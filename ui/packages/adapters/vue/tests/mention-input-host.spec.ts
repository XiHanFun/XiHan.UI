// @vitest-environment jsdom
import type { MentionNode } from '@xihan-ui/headless'
import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vitest'
import { defineComponent, h, nextTick, ref } from 'vue'
import {
  XhMentionContent,
  XhMentionInput,
  XhMentionItem,
  XhMentionItemText,
  XhMentionPositioner,
  XhMentionRoot,
} from '../src'

// 属性表按宿主标签分档、提及整条删除的判据归 connect 与机器，在 headless 的 mention.spec.ts；
// 这里只管适配器自己那一半：渲染出请求的标签，换成 textarea 之后插入与整条删除照样跑得通。

const PEOPLE: MentionNode[] = [
  { value: 'lilei', label: '李雷' },
  { value: 'hanmeimei', label: '韩梅梅' },
]

afterEach(() => {
  document.body.innerHTML = ''
})

function mountWith(as?: 'input' | 'textarea') {
  const text = ref('')
  const wrapper = mount(defineComponent({
    setup: () => () => h(XhMentionRoot, {
      'collection': PEOPLE,
      'value': text.value,
      'onUpdate:value': (next: string) => {
        text.value = next
      },
    }, () => [
      h(XhMentionInput, as ? { as, 'aria-label': '正文' } : { 'aria-label': '正文' }),
      h(XhMentionPositioner, () => [
        h(XhMentionContent, () => PEOPLE.map(node =>
          h(XhMentionItem, { key: node.value, value: node.value }, () => [h(XhMentionItemText, () => node.label)]),
        )),
      ]),
    ]),
  }), { attachTo: document.body })
  return { wrapper, text }
}

function hostEl(): HTMLInputElement | HTMLTextAreaElement {
  return document.querySelector<HTMLInputElement | HTMLTextAreaElement>('[data-scope="mention"][data-part="input"]')!
}

async function typeInto(el: HTMLInputElement | HTMLTextAreaElement, value: string, caret = value.length): Promise<void> {
  el.focus()
  el.value = value
  el.setSelectionRange(caret, caret)
  el.dispatchEvent(new Event('input', { bubbles: true }))
  await nextTick()
  await nextTick()
  await new Promise(resolve => setTimeout(resolve, 0))
}

function key(el: HTMLElement, name: string): KeyboardEvent {
  const event = new KeyboardEvent('keydown', { key: name, bubbles: true, cancelable: true })
  el.dispatchEvent(event)
  return event
}

describe('mention 的输入宿主可换', () => {
  it('不写 as 时渲染成 input，照旧是组合框', () => {
    const { wrapper } = mountWith()
    expect(hostEl().tagName).toBe('INPUT')
    expect(hostEl().getAttribute('role')).toBe('combobox')
    wrapper.unmount()
  })

  it('as="textarea" 渲染成 textarea：撤掉 type、组合框角色与 aria-expanded，换多行布局', () => {
    const { wrapper } = mountWith('textarea')
    const el = hostEl()
    expect(el.tagName).toBe('TEXTAREA')
    expect(el.hasAttribute('type')).toBe(false)
    expect(el.hasAttribute('role')).toBe(false)
    expect(el.hasAttribute('aria-expanded')).toBe(false)
    expect(el.getAttribute('aria-haspopup')).toBe('listbox')
    expect(el.getAttribute('data-xh-field-layout')).toBe('textarea')
    wrapper.unmount()
  })

  it('as="textarea"：换行之后照样触发、插入；光标紧贴提及按 Backspace 整条删掉', async () => {
    const { wrapper, text } = mountWith('textarea')
    const el = hostEl()
    await typeInto(el, '第一行\n@li')
    expect(document.querySelector('[data-scope="mention"][data-part="content"]')!.hasAttribute('hidden')).toBe(false)
    expect(key(el, 'Enter').defaultPrevented).toBe(true)
    await nextTick()
    await nextTick()
    expect(text.value).toBe('第一行\n@李雷 ')

    el.setSelectionRange(7, 7)
    expect(key(el, 'Backspace').defaultPrevented).toBe(true)
    await nextTick()
    await nextTick()
    expect(text.value).toBe('第一行\n ')
    wrapper.unmount()
  })

  it('候选收起时 Enter 不被接管：多行正文照常换行', async () => {
    const { wrapper } = mountWith('textarea')
    const el = hostEl()
    await typeInto(el, '你好')
    expect(key(el, 'Enter').defaultPrevented).toBe(false)
    wrapper.unmount()
  })
})
