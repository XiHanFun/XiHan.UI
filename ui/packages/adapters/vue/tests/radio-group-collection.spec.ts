// @vitest-environment jsdom
import type { RadioGroupNode } from '@xihan-ui/headless'
import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vitest'
import { defineComponent, h } from 'vue'
import {
  XhRadioGroupItem,
  XhRadioGroupItemText,
  XhRadioGroupLabel,
  XhRadioGroupRoot,
} from '../src'

const COLLECTION: RadioGroupNode[] = [
  { value: 'free', label: '免费版' },
  { value: 'standard', label: '标准版' },
  { value: 'pro', label: '专业版', disabled: true },
]

afterEach(() => {
  document.body.innerHTML = ''
})

/** 只交数据，结构由组件铺开 */
function mountFromCollection(value: string | null) {
  return mount(defineComponent({
    setup: () => () => h(XhRadioGroupRoot, {
      value,
      collection: COLLECTION,
      label: '套餐',
      name: 'plan',
    }),
  }), { attachTo: document.body })
}

/** 手写全套部件，条目只报 value，文本与禁用交给 collection */
function mountFromParts(value: string | null) {
  return mount(defineComponent({
    setup: () => () => h(XhRadioGroupRoot, {
      value,
      collection: COLLECTION,
      name: 'plan',
    }, () => [
      h(XhRadioGroupLabel, () => '套餐'),
      ...COLLECTION.map(node => h(XhRadioGroupItem, { key: node.value, value: node.value }, () => [
        h(XhRadioGroupItemText, () => node.label),
      ])),
    ]),
  }), { attachTo: document.body })
}

function partNames(root: Element): (string | null)[] {
  return [...root.querySelectorAll('[data-scope="radio-group"][data-part]')]
    .map(el => el.getAttribute('data-part'))
}

/** 部件树：只取身份与无障碍属性 */
function skeleton(root: Element): string[] {
  return [...root.querySelectorAll('[data-scope="radio-group"][data-part]')].map((el) => {
    const attrs = ['data-part', 'role', 'aria-checked', 'aria-disabled', 'aria-hidden', 'data-state', 'data-disabled', 'data-value', 'tabindex', 'name', 'type']
      .map(name => (el.hasAttribute(name) ? `${name}=${el.getAttribute(name)}` : null))
      .filter(Boolean)
    return `${attrs.join(' ')}|${el.textContent}`
  })
}

describe('radio-group 的 collection', () => {
  it('不写插槽时按数据铺开整套部件', () => {
    const w = mountFromCollection(null)
    expect(partNames(w.element)).toEqual([
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

  it('条目文本取自 label，缺省退回 value', () => {
    const w = mount(defineComponent({
      setup: () => () => h(XhRadioGroupRoot, {
        collection: [{ value: 'free', label: '免费版' }, { value: 'plain' }],
      }),
    }), { attachTo: document.body })
    const texts = [...w.element.querySelectorAll('[data-part="item-text"]')].map(el => el.textContent)
    expect(texts).toEqual(['免费版', 'plain'])
    w.unmount()
  })

  it('数据里的禁用落成条目的 aria-disabled', () => {
    const w = mountFromCollection(null)
    const flags = [...w.element.querySelectorAll('[data-part="item"]')]
      .map(el => el.getAttribute('aria-disabled'))
    expect(flags).toEqual(['false', 'false', 'true'])
    w.unmount()
  })

  it('整组禁用盖过数据里的逐条声明', () => {
    const w = mount(defineComponent({
      setup: () => () => h(XhRadioGroupRoot, { collection: COLLECTION, disabled: true }),
    }), { attachTo: document.body })
    const flags = [...w.element.querySelectorAll('[data-part="item"]')]
      .map(el => el.getAttribute('aria-disabled'))
    expect(flags).toEqual(['true', 'true', 'true'])
    w.unmount()
  })

  it('铺开的结构与手写全套部件完全一致', () => {
    const auto = mountFromCollection('standard')
    const manual = mountFromParts('standard')
    expect(skeleton(auto.element)).toEqual(skeleton(manual.element))
    auto.unmount()
    manual.unmount()
  })

  it('条目上写的 disabled 压过数据里的', () => {
    const w = mount(defineComponent({
      setup: () => () => h(XhRadioGroupRoot, { collection: COLLECTION }, () => [
        // 数据里 pro 是禁用的，这里逐条改口
        h(XhRadioGroupItem, { value: 'pro', disabled: false }, () => [h(XhRadioGroupItemText, () => '专业版')]),
        // 数据里 free 不禁用，这里逐条禁掉
        h(XhRadioGroupItem, { value: 'free', disabled: true }, () => [h(XhRadioGroupItemText, () => '免费版')]),
      ]),
    }), { attachTo: document.body })
    const flags = [...w.element.querySelectorAll('[data-part="item"]')]
      .map(el => el.getAttribute('aria-disabled'))
    expect(flags).toEqual(['false', 'true'])
    w.unmount()
  })

  it('不给 collection 时仍按手写部件渲染，文本与禁用都写在部件上', () => {
    const w = mount(defineComponent({
      setup: () => () => h(XhRadioGroupRoot, { defaultValue: 'free' }, () => [
        h(XhRadioGroupItem, { value: 'free' }, () => [h(XhRadioGroupItemText, () => '免费版')]),
        h(XhRadioGroupItem, { value: 'pro', disabled: true }, () => [h(XhRadioGroupItemText, () => '专业版')]),
      ]),
    }), { attachTo: document.body })
    const items = [...w.element.querySelectorAll('[data-part="item"]')]
    expect(items.map(el => el.getAttribute('aria-disabled'))).toEqual(['false', 'true'])
    expect(items.map(el => el.getAttribute('aria-checked'))).toEqual(['true', 'false'])
    w.unmount()
  })
})
