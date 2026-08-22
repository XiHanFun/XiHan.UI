// @vitest-environment jsdom
import type { TreeNode } from '@xihan-ui/headless'
import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, h, nextTick } from 'vue'
import {
  provideXhConfig,
  XhTreeSelectBranch,
  XhTreeSelectBranchContent,
  XhTreeSelectBranchControl,
  XhTreeSelectBranchText,
  XhTreeSelectBranchTrigger,
  XhTreeSelectClearTrigger,
  XhTreeSelectContent,
  XhTreeSelectControl,
  XhTreeSelectIndicator,
  XhTreeSelectItem,
  XhTreeSelectItemIndicator,
  XhTreeSelectItemText,
  XhTreeSelectLabel,
  XhTreeSelectPositioner,
  XhTreeSelectRoot,
  XhTreeSelectTree,
  XhTreeSelectTrigger,
  XhTreeSelectValueText,
} from '../src'

const COLLECTION: TreeNode[] = [
  {
    value: 'docs',
    label: 'docs',
    children: [
      { value: 'guide', label: 'guide.md' },
      { value: 'api', label: 'api.md', disabled: true },
    ],
  },
  { value: 'empty', label: 'empty', children: [] },
  { value: 'readme', label: 'README.md' },
]

afterEach(() => {
  document.body.innerHTML = ''
})

/** 一个实例一个 portal 落点：两棵树同时在场时，搬出去的浮层不会混在一起。 */
function newPortal(): HTMLElement {
  const portal = document.createElement('div')
  document.body.appendChild(portal)
  return portal
}

/** 只交数据，结构由组件铺开 */
function mountFromCollection(value: string[], portal: HTMLElement = newPortal(), clearable = false) {
  return mount(defineComponent({
    setup() {
      provideXhConfig({ portalContainer: () => portal })
      return () => h(XhTreeSelectRoot, {
        value,
        collection: COLLECTION,
        defaultExpandedValue: ['docs'],
        label: '文档',
        placeholder: '选一个文件',
        clearable,
      })
    },
  }), { attachTo: document.body })
}

/** 手写全套部件，节点只报 value，文本与禁用交给 collection */
function mountFromParts(value: string[], portal: HTMLElement = newPortal(), clearable = false) {
  return mount(defineComponent({
    setup() {
      provideXhConfig({ portalContainer: () => portal })
      return () => h(XhTreeSelectRoot, {
        value,
        collection: COLLECTION,
        defaultExpandedValue: ['docs'],
        placeholder: '选一个文件',
      }, () => [
        h(XhTreeSelectLabel, () => '文档'),
        h(XhTreeSelectControl, () => [
          h(XhTreeSelectTrigger, () => [h(XhTreeSelectValueText), h(XhTreeSelectIndicator)]),
          ...(clearable ? [h(XhTreeSelectClearTrigger)] : []),
        ]),
        h(XhTreeSelectPositioner, () => [
          h(XhTreeSelectContent, () => h(XhTreeSelectTree, null, () => [
            h(XhTreeSelectBranch, { value: 'docs' }, () => [
              h(XhTreeSelectBranchControl, () => [
                h(XhTreeSelectBranchTrigger),
                h(XhTreeSelectBranchText, () => 'docs'),
              ]),
              h(XhTreeSelectBranchContent, () => [
                h(XhTreeSelectItem, { value: 'guide' }, () => [
                  h(XhTreeSelectItemIndicator),
                  h(XhTreeSelectItemText, () => 'guide.md'),
                ]),
                h(XhTreeSelectItem, { value: 'api' }, () => [
                  h(XhTreeSelectItemIndicator),
                  h(XhTreeSelectItemText, () => 'api.md'),
                ]),
              ]),
            ]),
            h(XhTreeSelectBranch, { value: 'empty' }, () => [
              h(XhTreeSelectBranchControl, () => [
                h(XhTreeSelectBranchTrigger),
                h(XhTreeSelectBranchText, () => 'empty'),
              ]),
              h(XhTreeSelectBranchContent, () => []),
            ]),
            h(XhTreeSelectItem, { value: 'readme' }, () => [
              h(XhTreeSelectItemIndicator),
              h(XhTreeSelectItemText, () => 'README.md'),
            ]),
          ])),
        ]),
      ])
    },
  }), { attachTo: document.body })
}

/** 部件树：只取身份与无障碍属性，忽略由定位引擎写入的坐标。浮层已搬到落点，两处合起来才是整棵。 */
function skeleton(...roots: Element[]): string[] {
  return roots.flatMap(root => [...root.querySelectorAll('[data-scope="tree-select"][data-part]')]).map((el) => {
    const attrs = ['data-part', 'role', 'aria-disabled', 'aria-selected', 'aria-expanded', 'aria-level', 'data-state', 'data-disabled', 'data-value', 'hidden']
      .map(name => (el.hasAttribute(name) ? `${name}=${el.getAttribute(name)}` : null))
      .filter(Boolean)
    return `${attrs.join(' ')}|${el.textContent}`
  })
}

function partsOf(...roots: Element[]): (string | null)[] {
  return roots
    .flatMap(root => [...root.querySelectorAll('[data-scope="tree-select"][data-part]')])
    .map(el => el.getAttribute('data-part'))
}

describe('tree-select 的 collection', () => {
  it('不写插槽时按数据铺开整套部件，带 children 的落成 branch', () => {
    const portal = newPortal()
    const w = mountFromCollection([], portal)
    expect(partsOf(w.element, portal)).toEqual([
      'label',
      'control',
      'trigger',
      'value-text',
      'indicator',
      'positioner',
      'content',
      'tree',
      'branch',
      'branch-control',
      'branch-trigger',
      'branch-text',
      'branch-content',
      'item',
      'item-indicator',
      'item-text',
      'item',
      'item-indicator',
      'item-text',
      'branch',
      'branch-control',
      'branch-trigger',
      'branch-text',
      'branch-content',
      'item',
      'item-indicator',
      'item-text',
    ])
    w.unmount()
  })

  it('没给 collection 也没写插槽时根里为空', () => {
    const w = mount(XhTreeSelectRoot, { attachTo: document.body })
    expect(w.element.querySelectorAll('[data-part]').length).toBe(0)
    w.unmount()
  })

  it('节点文本取自 label，缺省退回 value', () => {
    const portal = newPortal()
    const w = mount(defineComponent({
      setup() {
        provideXhConfig({ portalContainer: () => portal })
        return () => h(XhTreeSelectRoot, {
          collection: [{ value: 'dir', children: [{ value: 'leaf', label: '叶子' }] }, { value: 'plain' }],
        })
      },
    }), { attachTo: document.body })
    expect([...portal.querySelectorAll('[data-part="branch-text"]')].map(el => el.textContent)).toEqual(['dir'])
    expect([...portal.querySelectorAll('[data-part="item-text"]')].map(el => el.textContent)).toEqual(['叶子', 'plain'])
    w.unmount()
  })

  it('数据里的禁用落成节点的 aria-disabled', () => {
    const portal = newPortal()
    const w = mountFromCollection([], portal)
    const flags = [...portal.querySelectorAll('[data-part="item"]')].map(el => el.getAttribute('aria-disabled'))
    expect(flags).toEqual(['false', 'true', 'false'])
    w.unmount()
  })

  it('显示文本直接取自数据', () => {
    const w = mountFromCollection(['guide'])
    expect(w.element.querySelector('[data-part="value-text"]')?.textContent).toBe('guide.md')
    w.unmount()
  })

  it('铺开的结构与手写全套部件完全一致', () => {
    const autoPortal = newPortal()
    const manualPortal = newPortal()
    const auto = mountFromCollection(['guide'], autoPortal)
    const manual = mountFromParts(['guide'], manualPortal)
    expect(skeleton(auto.element, autoPortal)).toEqual(skeleton(manual.element, manualPortal))
    auto.unmount()
    manual.unmount()
  })

  it('clearable 带上清空钮，结构仍与手写一致', () => {
    const autoPortal = newPortal()
    const manualPortal = newPortal()
    const auto = mountFromCollection(['guide'], autoPortal, true)
    const manual = mountFromParts(['guide'], manualPortal, true)
    expect(partsOf(auto.element).slice(0, 6)).toEqual(['label', 'control', 'trigger', 'value-text', 'indicator', 'clear-trigger'])
    expect(skeleton(auto.element, autoPortal)).toEqual(skeleton(manual.element, manualPortal))
    auto.unmount()
    manual.unmount()
  })

  it('缺省不渲染清空钮', () => {
    const w = mountFromCollection(['guide'])
    expect(w.element.querySelector('[data-part="clear-trigger"]')).toBeNull()
    w.unmount()
  })

  it('写了默认插槽就不看 clearable', () => {
    const w = mount(defineComponent({
      setup: () => () => h(XhTreeSelectRoot, { collection: COLLECTION, clearable: true }, () => [
        h(XhTreeSelectTrigger, () => [h(XhTreeSelectValueText)]),
      ]),
    }), { attachTo: document.body })
    expect(w.element.querySelector('[data-part="clear-trigger"]')).toBeNull()
    w.unmount()
  })

  it('有选中时点清空钮把值清空', async () => {
    const onChange = vi.fn()
    const w = mount(defineComponent({
      setup: () => () => h(XhTreeSelectRoot, {
        collection: COLLECTION,
        defaultValue: ['guide'],
        clearable: true,
        onValueChange: onChange,
      }),
    }), { attachTo: document.body })
    const clear = w.element.querySelector('[data-part="clear-trigger"]') as HTMLButtonElement
    expect(clear.hidden).toBe(false)
    expect(w.element.querySelector('[data-part="value-text"]')?.textContent).toBe('guide.md')
    clear.click()
    await nextTick()
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ value: [] }))
    expect(w.element.querySelector('[data-part="value-text"]')?.textContent).toBe('')
    expect((w.element.querySelector('[data-part="clear-trigger"]') as HTMLButtonElement).hidden).toBe(true)
    w.unmount()
  })
})
