// @vitest-environment jsdom
import type { ListboxNode } from '@xihan-ui/headless'
import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vitest'
import { defineComponent, h } from 'vue'
import {
  XhListboxContent,
  XhListboxItem,
  XhListboxItemIndicator,
  XhListboxItemText,
  XhListboxLabel,
  XhListboxRoot,
} from '../src'

const COLLECTION: ListboxNode[] = [
  { value: 'beijing', label: '北京' },
  { value: 'berlin', label: '柏林' },
  { value: 'busan', label: '釜山', disabled: true },
]

afterEach(() => {
  document.body.innerHTML = ''
})

/** 只交数据，结构由组件铺开 */
function mountFromCollection(value: string[]) {
  return mount(defineComponent({
    setup: () => () => h(XhListboxRoot, {
      value,
      collection: COLLECTION,
      label: '城市',
    }),
  }), { attachTo: document.body })
}

/** 手写全套部件，条目只报 value，文本与禁用交给 collection */
function mountFromParts(value: string[]) {
  return mount(defineComponent({
    setup: () => () => h(XhListboxRoot, {
      value,
      collection: COLLECTION,
    }, () => [
      h(XhListboxLabel, () => '城市'),
      h(XhListboxContent, () => COLLECTION.map(node =>
        h(XhListboxItem, { key: node.value, value: node.value }, () => [
          h(XhListboxItemText, () => node.label),
          h(XhListboxItemIndicator),
        ]),
      )),
    ]),
  }), { attachTo: document.body })
}

/** 部件树：只取身份、状态与无障碍属性，忽略逐实例生成的 id */
function skeleton(root: Element): string[] {
  return [...root.querySelectorAll('[data-scope="listbox"][data-part]')].map((el) => {
    const attrs = [
      'data-part',
      'role',
      'tabindex',
      'aria-selected',
      'aria-disabled',
      'aria-multiselectable',
      'aria-orientation',
      'data-state',
      'data-disabled',
      'data-highlighted',
      'data-orientation',
    ]
      .map(name => (el.hasAttribute(name) ? `${name}=${el.getAttribute(name)}` : null))
      .filter(Boolean)
    return `${attrs.join(' ')}|${el.textContent}`
  })
}

function partNames(root: Element): (string | null)[] {
  return [...root.querySelectorAll('[data-scope="listbox"][data-part]')].map(el => el.getAttribute('data-part'))
}

describe('listbox 的 collection', () => {
  it('不写插槽时按数据铺开整套部件', () => {
    const w = mountFromCollection([])
    expect(partNames(w.element)).toEqual([
      'label',
      'content',
      'item',
      'item-text',
      'item-indicator',
      'item',
      'item-text',
      'item-indicator',
      'item',
      'item-text',
      'item-indicator',
    ])
    w.unmount()
  })

  it('条目文本取自 label，缺省退回 value', () => {
    const w = mount(defineComponent({
      setup: () => () => h(XhListboxRoot, {
        collection: [{ value: 'beijing', label: '北京' }, { value: 'plain' }],
      }),
    }), { attachTo: document.body })
    const texts = [...w.element.querySelectorAll('[data-part="item-text"]')].map(el => el.textContent)
    expect(texts).toEqual(['北京', 'plain'])
    w.unmount()
  })

  it('数据里的禁用落成条目的 aria-disabled', () => {
    const w = mountFromCollection([])
    const flags = [...w.element.querySelectorAll('[data-part="item"]')].map(el => el.getAttribute('aria-disabled'))
    expect(flags).toEqual(['false', 'false', 'true'])
    w.unmount()
  })

  it('铺开的结构与手写全套部件完全一致', () => {
    const auto = mountFromCollection(['berlin'])
    const manual = mountFromParts(['berlin'])
    expect(skeleton(auto.element)).toEqual(skeleton(manual.element))
    auto.unmount()
    manual.unmount()
  })

  it('条目上写的 disabled 压过数据里的', () => {
    const w = mount(defineComponent({
      setup: () => () => h(XhListboxRoot, { collection: COLLECTION }, () => [
        h(XhListboxContent, () => [
          // 数据里 busan 是禁用的，这里逐条改口
          h(XhListboxItem, { value: 'busan', disabled: false }, () => [h(XhListboxItemText, () => '釜山')]),
          // 数据里 beijing 不禁用，这里逐条禁掉
          h(XhListboxItem, { value: 'beijing', disabled: true }, () => [h(XhListboxItemText, () => '北京')]),
        ]),
      ]),
    }), { attachTo: document.body })
    const flags = [...w.element.querySelectorAll('[data-part="item"]')].map(el => el.getAttribute('aria-disabled'))
    expect(flags).toEqual(['false', 'true'])
    w.unmount()
  })

  it('不给 collection 时不铺开任何部件，禁用仍由条目自报', () => {
    const bare = mount(defineComponent({
      setup: () => () => h(XhListboxRoot),
    }), { attachTo: document.body })
    expect(partNames(bare.element)).toEqual([])
    bare.unmount()

    const w = mount(defineComponent({
      setup: () => () => h(XhListboxRoot, null, () => [
        h(XhListboxContent, () => [
          h(XhListboxItem, { value: 'beijing' }, () => [h(XhListboxItemText, () => '北京')]),
          h(XhListboxItem, { value: 'busan', disabled: true }, () => [h(XhListboxItemText, () => '釜山')]),
        ]),
      ]),
    }), { attachTo: document.body })
    const flags = [...w.element.querySelectorAll('[data-part="item"]')].map(el => el.getAttribute('aria-disabled'))
    expect(flags).toEqual(['false', 'true'])
    w.unmount()
  })
})
