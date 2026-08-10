// @vitest-environment jsdom
import type { ComboboxNode } from '@xihan-ui/headless'
import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, h, nextTick } from 'vue'
import {
  XhComboboxClearTrigger,
  XhComboboxContent,
  XhComboboxControl,
  XhComboboxEmpty,
  XhComboboxInput,
  XhComboboxItem,
  XhComboboxItemIndicator,
  XhComboboxItemText,
  XhComboboxLabel,
  XhComboboxPositioner,
  XhComboboxRoot,
  XhComboboxTrigger,
} from '../src'

const COLLECTION: ComboboxNode[] = [
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
    setup: () => () => h(XhComboboxRoot, {
      value,
      collection: COLLECTION,
      label: '水果',
      empty: '无匹配水果',
      placeholder: '输入水果名筛选',
    }),
  }), { attachTo: document.body })
}

/** 手写全套部件，条目只报 value，文本与禁用交给 collection */
function mountFromParts(value: string[]) {
  return mount(defineComponent({
    setup: () => () => h(XhComboboxRoot, {
      value,
      collection: COLLECTION,
      placeholder: '输入水果名筛选',
    }, () => [
      h(XhComboboxLabel, () => '水果'),
      h(XhComboboxControl, () => [
        h(XhComboboxInput),
        h(XhComboboxTrigger),
        h(XhComboboxClearTrigger),
      ]),
      h(XhComboboxPositioner, () => [
        h(XhComboboxContent, () => COLLECTION.map(node =>
          h(XhComboboxItem, { key: node.value, value: node.value }, () => [
            h(XhComboboxItemText, () => node.label),
            h(XhComboboxItemIndicator),
          ]),
        )),
        h(XhComboboxEmpty, () => '无匹配水果'),
      ]),
    ]),
  }), { attachTo: document.body })
}

/** 部件树：只取身份与无障碍属性，忽略由定位引擎写入的坐标 */
function skeleton(root: Element): string[] {
  return [...root.querySelectorAll('[data-scope="combobox"][data-part]')].map((el) => {
    const attrs = ['data-part', 'role', 'aria-disabled', 'aria-selected', 'data-state', 'data-disabled', 'data-highlighted']
      .map(name => (el.hasAttribute(name) ? `${name}=${el.getAttribute(name)}` : null))
      .filter(Boolean)
    return `${attrs.join(' ')}|${el.textContent}`
  })
}

function inputValue(root: Element): string {
  return (root.querySelector('[data-part="input"]') as HTMLInputElement).value
}

describe('combobox 的 collection', () => {
  it('不写插槽时按数据铺开整套部件', () => {
    const w = mountFromCollection([])
    const parts = [...w.element.querySelectorAll('[data-scope="combobox"][data-part]')]
      .map(el => el.getAttribute('data-part'))
    expect(parts).toEqual([
      'label',
      'control',
      'input',
      'trigger',
      'clear-trigger',
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
      'empty',
    ])
    w.unmount()
  })

  it('候选文本取自 label，缺省退回 value', () => {
    const w = mount(defineComponent({
      setup: () => () => h(XhComboboxRoot, {
        collection: [{ value: 'apple', label: '苹果' }, { value: 'plain' }],
      }),
    }), { attachTo: document.body })
    const texts = [...w.element.querySelectorAll('[data-part="item-text"]')].map(el => el.textContent)
    expect(texts).toEqual(['苹果', 'plain'])
    w.unmount()
  })

  it('数据里的禁用落成候选的 aria-disabled', () => {
    const w = mountFromCollection([])
    const flags = [...w.element.querySelectorAll('[data-part="item"]')]
      .map(el => el.getAttribute('aria-disabled'))
    expect(flags).toEqual(['false', 'false', 'true'])
    w.unmount()
  })

  it('输入框按数据填成选中项的文本，不必等候选挂上 DOM', async () => {
    const w = mountFromCollection(['banana'])
    await nextTick()
    expect(inputValue(w.element)).toBe('香蕉')
    w.unmount()
  })

  it('选中项不在候选里时不替它造文本', async () => {
    // 过滤归宿主：collection 只是此刻该显示的那几条，选中项可能不在其中
    const w = mount(defineComponent({
      setup: () => () => h(XhComboboxRoot, { value: ['banana'], collection: [COLLECTION[0]] }),
    }), { attachTo: document.body })
    await nextTick()
    expect(inputValue(w.element)).toBe('')
    w.unmount()
  })

  it('铺开的结构与手写全套部件完全一致', async () => {
    const auto = mountFromCollection(['banana'])
    const manual = mountFromParts(['banana'])
    await nextTick()
    expect(skeleton(auto.element)).toEqual(skeleton(manual.element))
    auto.unmount()
    manual.unmount()
  })

  it('候选上写的 disabled 压过数据里的', () => {
    const w = mount(defineComponent({
      setup: () => () => h(XhComboboxRoot, { collection: COLLECTION }, () => [
        h(XhComboboxContent, () => [
          // 数据里 cherry 是禁用的，这里逐条改口
          h(XhComboboxItem, { value: 'cherry', disabled: false }, () => [h(XhComboboxItemText, () => '樱桃')]),
          // 数据里 apple 不禁用，这里逐条禁掉
          h(XhComboboxItem, { value: 'apple', disabled: true }, () => [h(XhComboboxItemText, () => '苹果')]),
        ]),
      ]),
    }), { attachTo: document.body })
    const flags = [...w.element.querySelectorAll('[data-part="item"]')]
      .map(el => el.getAttribute('aria-disabled'))
    expect(flags).toEqual(['false', 'true'])
    w.unmount()
  })
})
