// @vitest-environment jsdom
import type { ToggleGroupNode } from '@xihan-ui/headless'
import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vitest'
import { defineComponent, h } from 'vue'
import { XhToggleGroupItem, XhToggleGroupRoot } from '../src'

const COLLECTION: ToggleGroupNode[] = [
  { value: 'left', label: '左对齐' },
  { value: 'center', label: '居中' },
  { value: 'right', label: '右对齐', disabled: true },
]

afterEach(() => {
  document.body.innerHTML = ''
})

/** 只交数据，结构由组件铺开 */
function mountFromCollection(value: string) {
  return mount(defineComponent({
    setup: () => () => h(XhToggleGroupRoot, { value, collection: COLLECTION }),
  }), { attachTo: document.body })
}

/** 手写全套部件，条目只报 value，文本与禁用交给 collection */
function mountFromParts(value: string) {
  return mount(defineComponent({
    setup: () => () => h(XhToggleGroupRoot, { value, collection: COLLECTION }, () => COLLECTION.map(node =>
      h(XhToggleGroupItem, { key: node.value, value: node.value }, () => node.label),
    )),
  }), { attachTo: document.body })
}

/** 部件序列：root 自己也算一件，querySelectorAll 不含挂载元素本身 */
function parts(root: Element): (string | null)[] {
  return [root, ...root.querySelectorAll('[data-scope="toggle-group"][data-part]')]
    .map(el => el.getAttribute('data-part'))
}

/** 部件树：只取身份与无障碍属性，外加条目文字 */
function skeleton(root: Element): string[] {
  const names = [
    'data-part',
    'role',
    'type',
    'aria-orientation',
    'data-orientation',
    'aria-checked',
    'aria-pressed',
    'aria-disabled',
    'data-state',
    'data-disabled',
    'data-value',
    'tabindex',
  ]
  return [root, ...root.querySelectorAll('[data-scope="toggle-group"][data-part]')].map((el) => {
    const attrs = names
      .map(name => (el.hasAttribute(name) ? `${name}=${el.getAttribute(name)}` : null))
      .filter(Boolean)
    return `${attrs.join(' ')}|${el.textContent}`
  })
}

describe('toggleGroup 的 collection', () => {
  it('不写插槽时按数据铺开条目', () => {
    const w = mountFromCollection('left')
    expect(parts(w.element)).toEqual(['root', 'item', 'item', 'item'])
    // 条目底下没有文本部件，文字是条目自己的内容
    const items = [...w.element.querySelectorAll('[data-part="item"]')]
    expect(items.map(el => el.children.length)).toEqual([0, 0, 0])
    expect(items.map(el => el.textContent)).toEqual(['左对齐', '居中', '右对齐'])
    w.unmount()
  })

  it('条目文本取自 label，缺省退回 value', () => {
    const w = mount(defineComponent({
      setup: () => () => h(XhToggleGroupRoot, {
        collection: [{ value: 'left', label: '左对齐' }, { value: 'plain' }],
      }),
    }), { attachTo: document.body })
    const texts = [...w.element.querySelectorAll('[data-part="item"]')].map(el => el.textContent)
    expect(texts).toEqual(['左对齐', 'plain'])
    w.unmount()
  })

  it('数据里的禁用落成条目的 aria-disabled', () => {
    const w = mountFromCollection('left')
    const items = [...w.element.querySelectorAll('[data-part="item"]')]
    expect(items.map(el => el.getAttribute('aria-disabled'))).toEqual(['false', 'false', 'true'])
    expect(items.map(el => el.hasAttribute('data-disabled'))).toEqual([false, false, true])
    w.unmount()
  })

  it('铺开的结构与手写全套部件完全一致', () => {
    const auto = mountFromCollection('center')
    const manual = mountFromParts('center')
    expect(skeleton(auto.element)).toEqual(skeleton(manual.element))
    auto.unmount()
    manual.unmount()
  })

  it('item 插槽接管条目内容，条目部件与数据顺序不变', () => {
    const w = mount(defineComponent({
      setup: () => () => h(XhToggleGroupRoot, { collection: COLLECTION }, {
        item: (node: { value: string, label: string }) => [h('span', { class: 'mark' }, node.label)],
      }),
    }), { attachTo: document.body })
    expect(parts(w.element)).toEqual(['root', 'item', 'item', 'item'])
    const texts = [...w.element.querySelectorAll('[data-part="item"] > .mark')].map(el => el.textContent)
    expect(texts).toEqual(['左对齐', '居中', '右对齐'])
    w.unmount()
  })

  it('条目上写的 disabled 压过数据里的', () => {
    const w = mount(defineComponent({
      setup: () => () => h(XhToggleGroupRoot, { collection: COLLECTION }, () => [
        // 数据里 right 是禁用的，这里逐条改口
        h(XhToggleGroupItem, { value: 'right', disabled: false }, () => '右对齐'),
        // 数据里 left 不禁用，这里逐条禁掉
        h(XhToggleGroupItem, { value: 'left', disabled: true }, () => '左对齐'),
      ]),
    }), { attachTo: document.body })
    const flags = [...w.element.querySelectorAll('[data-part="item"]')]
      .map(el => el.getAttribute('aria-disabled'))
    expect(flags).toEqual(['false', 'true'])
    w.unmount()
  })

  it('不给 collection 时条目照旧：禁用只看条目自己写的', () => {
    const w = mount(defineComponent({
      setup: () => () => h(XhToggleGroupRoot, { defaultValue: 'left' }, () => [
        h(XhToggleGroupItem, { value: 'left' }, () => '左对齐'),
        h(XhToggleGroupItem, { value: 'center', disabled: true }, () => '居中'),
      ]),
    }), { attachTo: document.body })
    const items = [...w.element.querySelectorAll('[data-part="item"]')]
    expect(items.map(el => el.getAttribute('aria-disabled'))).toEqual(['false', 'true'])
    expect(items.map(el => el.getAttribute('data-state'))).toEqual(['on', 'off'])
    w.unmount()
  })
})
