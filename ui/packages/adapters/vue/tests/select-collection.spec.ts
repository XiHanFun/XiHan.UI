// @vitest-environment jsdom
import type { SelectNode } from '@xihan-ui/headless'
import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, h } from 'vue'
import {
  XhSelectContent,
  XhSelectIndicator,
  XhSelectItem,
  XhSelectItemIndicator,
  XhSelectItemText,
  XhSelectLabel,
  XhSelectPositioner,
  XhSelectRoot,
  XhSelectTrigger,
  XhSelectValueText,
} from '../src'

const COLLECTION: SelectNode[] = [
  { value: 'apple', label: '苹果' },
  { value: 'banana', label: '香蕉' },
  { value: 'cherry', label: '樱桃', disabled: true },
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
    setup: () => () => h(XhSelectRoot, {
      value,
      collection: COLLECTION,
      label: '水果',
      placeholder: '请选择',
    }),
  }), { attachTo: document.body })
}

/** 手写全套部件，条目只报 value，文本与禁用交给 collection */
function mountFromParts(value: string[]) {
  return mount(defineComponent({
    setup: () => () => h(XhSelectRoot, {
      value,
      collection: COLLECTION,
      placeholder: '请选择',
    }, () => [
      h(XhSelectLabel, () => '水果'),
      h(XhSelectTrigger, () => [h(XhSelectValueText), h(XhSelectIndicator)]),
      h(XhSelectPositioner, () => [
        h(XhSelectContent, () => COLLECTION.map(node =>
          h(XhSelectItem, { key: node.value, value: node.value }, () => [
            h(XhSelectItemText, () => node.label),
            h(XhSelectItemIndicator),
          ]),
        )),
      ]),
    ]),
  }), { attachTo: document.body })
}

/** 部件树：只取身份与无障碍属性，忽略由定位引擎写入的坐标 */
function skeleton(root: Element): string[] {
  return [...root.querySelectorAll('[data-scope="select"][data-part]')].map((el) => {
    const attrs = ['data-part', 'role', 'aria-disabled', 'aria-selected', 'data-state', 'data-disabled']
      .map(name => (el.hasAttribute(name) ? `${name}=${el.getAttribute(name)}` : null))
      .filter(Boolean)
    return `${attrs.join(' ')}|${el.textContent}`
  })
}

describe('select 的 collection', () => {
  it('不写插槽时按数据铺开整套部件', () => {
    const w = mountFromCollection([])
    const parts = [...w.element.querySelectorAll('[data-scope="select"][data-part]')]
      .map(el => el.getAttribute('data-part'))
    expect(parts).toEqual([
      'hidden-select',
      'label',
      'trigger',
      'value-text',
      'indicator',
      'positioner',
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
      setup: () => () => h(XhSelectRoot, {
        collection: [{ value: 'apple', label: '苹果' }, { value: 'plain' }],
      }),
    }), { attachTo: document.body })
    const texts = [...w.element.querySelectorAll('[data-part="item-text"]')].map(el => el.textContent)
    expect(texts).toEqual(['苹果', 'plain'])
    w.unmount()
  })

  it('数据里的禁用落成条目的 aria-disabled', () => {
    const w = mountFromCollection([])
    const flags = [...w.element.querySelectorAll('[data-part="item"]')]
      .map(el => el.getAttribute('aria-disabled'))
    expect(flags).toEqual(['false', 'false', 'true'])
    w.unmount()
  })

  it('显示文本直接取自数据，不必等条目挂上 DOM', () => {
    const w = mountFromCollection(['banana'])
    expect(w.element.querySelector('[data-part="value-text"]')?.textContent).toBe('香蕉')
    w.unmount()
  })

  it('数据里没有的值退回值本身，与选中集合逐项对齐', () => {
    const w = mountFromCollection(['durian'])
    expect(w.element.querySelector('[data-part="value-text"]')?.textContent).toBe('durian')
    w.unmount()
  })

  it('铺开的结构与手写全套部件完全一致', () => {
    const auto = mountFromCollection(['banana'])
    const manual = mountFromParts(['banana'])
    expect(skeleton(auto.element)).toEqual(skeleton(manual.element))
    auto.unmount()
    manual.unmount()
  })

  it('条目上写的 disabled 压过数据里的', () => {
    const w = mount(defineComponent({
      setup: () => () => h(XhSelectRoot, { collection: COLLECTION }, () => [
        h(XhSelectContent, () => [
          // 数据里 cherry 是禁用的，这里逐条改口
          h(XhSelectItem, { value: 'cherry', disabled: false }, () => [h(XhSelectItemText, () => '樱桃')]),
          // 数据里 apple 不禁用，这里逐条禁掉
          h(XhSelectItem, { value: 'apple', disabled: true }, () => [h(XhSelectItemText, () => '苹果')]),
        ]),
      ]),
    }), { attachTo: document.body })
    const flags = [...w.element.querySelectorAll('[data-part="item"]')]
      .map(el => el.getAttribute('aria-disabled'))
    expect(flags).toEqual(['false', 'true'])
    w.unmount()
  })
})
