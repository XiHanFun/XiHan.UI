import { mount } from '@vue/test-utils'
// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest'
import { defineComponent, h } from 'vue'
import { XhTagCloseTrigger, XhTagLabel, XhTagRoot } from '../src'

afterEach(() => {
  document.body.innerHTML = ''
})

function render(inner: () => unknown): HTMLElement {
  const w = mount(defineComponent({
    setup: () => () => h('div', [h(XhTagRoot, null, inner)]),
  }), { attachTo: document.body })
  return w.element as HTMLElement
}

function labels(root: HTMLElement): HTMLElement[] {
  return [...root.querySelectorAll<HTMLElement>('[data-scope=\'tag\'][data-part=\'label\']')]
}

describe('标签的文字承载', () => {
  it('纯文字写在 root 上时自动包一层 label', () => {
    const root = render(() => '前端')
    expect(labels(root).length).toBe(1)
    expect(labels(root)[0]?.textContent).toBe('前端')
  })

  it('作者自己写了 label 就不再包', () => {
    const root = render(() => [h(XhTagLabel, null, () => '前端')])
    expect(labels(root).length).toBe(1)
  })

  it('插槽里有元素节点时一个都不动', () => {
    const root = render(() => [h(XhTagLabel, null, () => '前端'), h(XhTagCloseTrigger)])
    expect(labels(root).length).toBe(1)
    expect(root.querySelectorAll('[data-part=\'close-trigger\']').length).toBe(1)
  })

  it('插槽为空时不凭空造一个 label', () => {
    const root = render(() => [])
    expect(labels(root).length).toBe(0)
  })
})
