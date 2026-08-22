// @vitest-environment jsdom
import type { ComboboxNode } from '@xihan-ui/headless'
import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vitest'
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

afterEach(() => {
  document.body.innerHTML = ''
})

/** 只交数据，结构由组件铺开 */
function mountFromCollection(value: string[], clearable = true) {
  return mount(defineComponent({
    setup: () => () => h(XhComboboxRoot, {
      value,
      collection: COLLECTION,
      label: '水果',
      empty: '无匹配水果',
      placeholder: '输入水果名筛选',
      clearable,
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
        h(XhComboboxClearTrigger),
        h(XhComboboxTrigger),
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

/** 全文档里 root 以下的本组件部件，按文档序；positioner 搬去了 portal 落点，不在挂载树里。 */
function partsIn(): HTMLElement[] {
  return [...document.querySelectorAll<HTMLElement>('[data-scope="combobox"][data-part]')]
    .filter(el => el.dataset.part !== 'root')
}

/** 部件树：只取身份与无障碍属性，忽略由定位引擎写入的坐标 */
function skeleton(): string[] {
  return partsIn().map((el) => {
    const attrs = ['data-part', 'role', 'aria-disabled', 'aria-selected', 'data-state', 'data-disabled', 'data-highlighted']
      .map(name => (el.hasAttribute(name) ? `${name}=${el.getAttribute(name)}` : null))
      .filter(Boolean)
    return `${attrs.join(' ')}|${el.textContent}`
  })
}

function itemFlags(): (string | null)[] {
  return partsIn().filter(el => el.dataset.part === 'item').map(el => el.getAttribute('aria-disabled'))
}

function inputValue(root: Element): string {
  return (root.querySelector('[data-part="input"]') as HTMLInputElement).value
}

describe('combobox 的 collection', () => {
  it('不写插槽时按数据铺开整套部件', () => {
    const w = mountFromCollection([])
    const parts = partsIn().map(el => el.getAttribute('data-part'))
    expect(parts).toEqual([
      'label',
      'control',
      'input',
      'clear-trigger',
      'trigger',
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

  it('不传 clearable 时自动树里没有清空钮', () => {
    const w = mountFromCollection(['banana'], false)
    const parts = partsIn().map(el => el.getAttribute('data-part'))
    expect(parts).not.toContain('clear-trigger')
    w.unmount()
  })

  it('候选文本取自 label，缺省退回 value', () => {
    const w = mount(defineComponent({
      setup: () => () => h(XhComboboxRoot, {
        collection: [{ value: 'apple', label: '苹果' }, { value: 'plain' }],
      }),
    }), { attachTo: document.body })
    const texts = partsIn().filter(el => el.dataset.part === 'item-text').map(el => el.textContent)
    expect(texts).toEqual(['苹果', 'plain'])
    w.unmount()
  })

  it('数据里的禁用落成候选的 aria-disabled', () => {
    const w = mountFromCollection([])
    expect(itemFlags()).toEqual(['false', 'false', 'true'])
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
    // 两棵树都往同一个 portal 落点搬，逐棵挂逐棵取，快照才不会掺在一起
    const auto = mountFromCollection(['banana'])
    await nextTick()
    const fromCollection = skeleton()
    auto.unmount()
    // 落点是 body 末尾的共用节点：不清掉，第二棵的 host 会排到它后面，文档序与第一棵相反
    document.body.innerHTML = ''

    const manual = mountFromParts(['banana'])
    await nextTick()
    const fromParts = skeleton()
    manual.unmount()
    expect(fromCollection).toEqual(fromParts)
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
    expect(itemFlags()).toEqual(['false', 'true'])
    w.unmount()
  })
})
