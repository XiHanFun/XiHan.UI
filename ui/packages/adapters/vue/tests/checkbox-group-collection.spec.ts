// @vitest-environment jsdom
import type { CheckboxGroupNode } from '@xihan-ui/headless'
import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, h } from 'vue'
import {
  XhCheckboxGroupIndicator,
  XhCheckboxGroupItem,
  XhCheckboxGroupItemText,
  XhCheckboxGroupLabel,
  XhCheckboxGroupRoot,
} from '../src'

const COLLECTION: CheckboxGroupNode[] = [
  { value: 'cheese', label: '芝士' },
  { value: 'bacon', label: '培根' },
  { value: 'truffle', label: '松露', disabled: true },
]

beforeEach(() => {
  // jsdom 无 matchMedia，桩掉供 RuntimeConfig.reducedMotion 使用
  vi.stubGlobal('matchMedia', (q: string) => ({ matches: false, media: q, addEventListener: () => {}, removeEventListener: () => {} }))
})

afterEach(() => {
  document.body.innerHTML = ''
  vi.unstubAllGlobals()
})

/** 只交数据，结构由组件铺开 */
function mountFromCollection(value: string[]) {
  return mount(defineComponent({
    setup: () => () => h(XhCheckboxGroupRoot, {
      value,
      collection: COLLECTION,
      label: '配料',
      name: 'topping',
    }),
  }), { attachTo: document.body })
}

/** 手写全套部件，条目只报 value，文本与禁用交给 collection */
function mountFromParts(value: string[]) {
  return mount(defineComponent({
    setup: () => () => h(XhCheckboxGroupRoot, {
      value,
      collection: COLLECTION,
      name: 'topping',
    }, () => [
      h(XhCheckboxGroupLabel, () => '配料'),
      ...COLLECTION.map(node =>
        h(XhCheckboxGroupItem, { key: node.value, value: node.value }, () => [
          h(XhCheckboxGroupIndicator),
          h(XhCheckboxGroupItemText, () => node.label),
        ]),
      ),
    ]),
  }), { attachTo: document.body })
}

/** 部件树：只取身份、无障碍与表单属性，id 随实例递增故排除在外 */
function skeleton(root: Element): string[] {
  return [...root.querySelectorAll('[data-scope="checkbox-group"][data-part]')].map((el) => {
    const attrs = [
      'data-part',
      'role',
      'aria-checked',
      'aria-disabled',
      'aria-readonly',
      'aria-invalid',
      'aria-hidden',
      'data-state',
      'data-disabled',
      'data-value',
      'tabindex',
      'type',
      'name',
      'value',
    ]
      .map(name => (el.hasAttribute(name) ? `${name}=${el.getAttribute(name)}` : null))
      .filter(Boolean)
    // 隐藏输入的选中态只落在 DOM property 上，属性里读不到
    const checked = el instanceof HTMLInputElement ? ` checked=${el.checked}` : ''
    return `${attrs.join(' ')}${checked}|${el.textContent}`
  })
}

describe('checkbox-group 的 collection', () => {
  it('不写插槽时按数据铺开整套部件', () => {
    const w = mountFromCollection([])
    const parts = [...w.element.querySelectorAll('[data-scope="checkbox-group"][data-part]')]
      .map(el => el.getAttribute('data-part'))
    expect(parts).toEqual([
      'label',
      'item',
      'hidden-input',
      'indicator',
      'item-text',
      'item',
      'hidden-input',
      'indicator',
      'item-text',
      'item',
      'hidden-input',
      'indicator',
      'item-text',
    ])
    w.unmount()
  })

  it('全选把手不在默认结构里', () => {
    const w = mountFromCollection([])
    expect(w.element.querySelector('[data-part="trigger"]')).toBeNull()
    w.unmount()
  })

  it('条目文本取自 label，缺省退回 value', () => {
    const w = mount(defineComponent({
      setup: () => () => h(XhCheckboxGroupRoot, {
        collection: [{ value: 'cheese', label: '芝士' }, { value: 'plain' }],
      }),
    }), { attachTo: document.body })
    const texts = [...w.element.querySelectorAll('[data-part="item-text"]')].map(el => el.textContent)
    expect(texts).toEqual(['芝士', 'plain'])
    w.unmount()
  })

  it('数据里的禁用落成条目的 aria-disabled', () => {
    const w = mountFromCollection([])
    const flags = [...w.element.querySelectorAll('[data-part="item"]')]
      .map(el => el.getAttribute('aria-disabled'))
    expect(flags).toEqual(['false', 'false', 'true'])
    w.unmount()
  })

  it('数据里的禁用让该条目的隐藏输入退出提交', () => {
    const w = mountFromCollection([])
    const flags = [...w.element.querySelectorAll('[data-part="hidden-input"]')]
      .map(el => (el as HTMLInputElement).disabled)
    expect(flags).toEqual([false, false, true])
    w.unmount()
  })

  it('选中态按传入的值落到条目上', () => {
    const w = mountFromCollection(['bacon'])
    const states = [...w.element.querySelectorAll('[data-part="item"]')]
      .map(el => el.getAttribute('aria-checked'))
    expect(states).toEqual(['false', 'true', 'false'])
    w.unmount()
  })

  it('铺开的结构与手写全套部件完全一致', () => {
    const auto = mountFromCollection(['bacon'])
    const manual = mountFromParts(['bacon'])
    expect(skeleton(auto.element)).toEqual(skeleton(manual.element))
    auto.unmount()
    manual.unmount()
  })

  it('条目上写的 disabled 压过数据里的', () => {
    const w = mount(defineComponent({
      setup: () => () => h(XhCheckboxGroupRoot, { collection: COLLECTION }, () => [
        // 数据里 truffle 是禁用的，这里逐条改口
        h(XhCheckboxGroupItem, { value: 'truffle', disabled: false }, () => [h(XhCheckboxGroupItemText, () => '松露')]),
        // 数据里 cheese 不禁用，这里逐条禁掉
        h(XhCheckboxGroupItem, { value: 'cheese', disabled: true }, () => [h(XhCheckboxGroupItemText, () => '芝士')]),
      ]),
    }), { attachTo: document.body })
    const flags = [...w.element.querySelectorAll('[data-part="item"]')]
      .map(el => el.getAttribute('aria-disabled'))
    expect(flags).toEqual(['false', 'true'])
    w.unmount()
  })

  it('不给 collection 时条目仍只认自己写的禁用', () => {
    const w = mount(defineComponent({
      setup: () => () => h(XhCheckboxGroupRoot, null, () => [
        h(XhCheckboxGroupItem, { value: 'cheese' }, () => [h(XhCheckboxGroupItemText, () => '芝士')]),
        h(XhCheckboxGroupItem, { value: 'truffle', disabled: true }, () => [h(XhCheckboxGroupItemText, () => '松露')]),
      ]),
    }), { attachTo: document.body })
    const flags = [...w.element.querySelectorAll('[data-part="item"]')]
      .map(el => el.getAttribute('aria-disabled'))
    expect(flags).toEqual(['false', 'true'])
    w.unmount()
  })
})
