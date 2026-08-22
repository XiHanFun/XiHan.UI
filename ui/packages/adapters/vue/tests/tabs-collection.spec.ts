// @vitest-environment jsdom
import type { TabsNode, TabsNodeMeta } from '@xihan-ui/headless'
import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vitest'
import { defineComponent, h } from 'vue'
import { XhTabsContent, XhTabsList, XhTabsRoot, XhTabsTrigger } from '../src'

const COLLECTION: TabsNode[] = [
  { value: 'overview', label: '概览' },
  { value: 'usage', label: '用法' },
  { value: 'api', label: 'API', disabled: true },
]

/** 面板文本按条目算，两棵树用同一条规则 */
function panelText(label: string): string {
  return `${label} 的面板`
}

afterEach(() => {
  document.body.innerHTML = ''
})

/** 只交数据，结构由组件铺开，面板内容走 panel 插槽 */
function mountFromCollection(value: string) {
  return mount(defineComponent({
    setup: () => () => h(XhTabsRoot, { value, collection: COLLECTION }, {
      panel: (node: TabsNodeMeta) => [panelText(node.label)],
    }),
  }), { attachTo: document.body })
}

/** 手写全套部件，trigger 只报 value，文本与禁用交给 collection */
function mountFromParts(value: string) {
  return mount(defineComponent({
    setup: () => () => h(XhTabsRoot, { value, collection: COLLECTION }, () => [
      h(XhTabsList, () => COLLECTION.map(node =>
        h(XhTabsTrigger, { key: node.value, value: node.value }, () => node.label ?? node.value),
      )),
      ...COLLECTION.map(node =>
        h(XhTabsContent, { key: node.value, value: node.value }, () => [panelText(node.label ?? node.value)]),
      ),
    ]),
  }), { attachTo: document.body })
}

/** 部件树：只取身份与无障碍属性，忽略逐次挂载都不同的 id 与按 id 互指的那几个 */
function skeleton(root: Element): string[] {
  return [...root.querySelectorAll('[data-scope="tabs"][data-part]')].map((el) => {
    const attrs = ['data-part', 'role', 'aria-selected', 'aria-disabled', 'aria-orientation', 'data-state', 'data-disabled', 'data-value', 'tabindex', 'hidden']
      .map(name => (el.hasAttribute(name) ? `${name}=${el.getAttribute(name)}` : null))
      .filter(Boolean)
    return `${attrs.join(' ')}|${el.textContent}`
  })
}

describe('tabs 的 collection', () => {
  it('不写插槽时按数据铺开整套部件', () => {
    const w = mountFromCollection('overview')
    const parts = [...w.element.querySelectorAll('[data-scope="tabs"][data-part]')]
      .map(el => el.getAttribute('data-part'))
    expect(parts).toEqual([
      'list',
      'trigger',
      'trigger',
      'trigger',
      'content',
      'content',
      'content',
    ])
    w.unmount()
  })

  it('标签文本取自 label，缺省退回 value', () => {
    const w = mount(defineComponent({
      setup: () => () => h(XhTabsRoot, {
        collection: [{ value: 'overview', label: '概览' }, { value: 'plain' }],
      }),
    }), { attachTo: document.body })
    const texts = [...w.element.querySelectorAll('[data-part="trigger"]')].map(el => el.textContent)
    expect(texts).toEqual(['概览', 'plain'])
    w.unmount()
  })

  it('数据里的禁用落成标签的 aria-disabled 与 data-disabled', () => {
    const w = mountFromCollection('overview')
    const triggers = [...w.element.querySelectorAll('[data-part="trigger"]')]
    expect(triggers.map(el => el.getAttribute('aria-disabled'))).toEqual(['false', 'false', 'true'])
    expect(triggers.map(el => el.getAttribute('data-disabled'))).toEqual([null, null, ''])
    w.unmount()
  })

  it('panel 插槽拿到条目，面板逐条渲染；选中的那个面板不 hidden', () => {
    const w = mountFromCollection('usage')
    const contents = [...w.element.querySelectorAll('[data-part="content"]')]
    expect(contents.map(el => el.textContent)).toEqual(['概览 的面板', '用法 的面板', 'API 的面板'])
    expect(contents.map(el => el.hasAttribute('hidden'))).toEqual([true, false, true])
    w.unmount()
  })

  it('不写 panel 插槽时面板留空，结构照铺', () => {
    const w = mount(defineComponent({
      setup: () => () => h(XhTabsRoot, { collection: COLLECTION, defaultValue: 'overview' }),
    }), { attachTo: document.body })
    const contents = [...w.element.querySelectorAll('[data-part="content"]')]
    expect(contents).toHaveLength(3)
    expect(contents.map(el => el.textContent)).toEqual(['', '', ''])
    w.unmount()
  })

  it('铺开的结构与手写全套部件完全一致', () => {
    const auto = mountFromCollection('usage')
    const manual = mountFromParts('usage')
    expect(skeleton(auto.element)).toEqual(skeleton(manual.element))
    auto.unmount()
    manual.unmount()
  })

  it('标签上写的 disabled 压过数据里的', () => {
    const w = mount(defineComponent({
      setup: () => () => h(XhTabsRoot, { collection: COLLECTION }, () => [
        h(XhTabsList, () => [
          // 数据里 api 是禁用的，这里逐条改口
          h(XhTabsTrigger, { value: 'api', disabled: false }, () => 'API'),
          // 数据里 overview 不禁用，这里逐条禁掉
          h(XhTabsTrigger, { value: 'overview', disabled: true }, () => '概览'),
        ]),
      ]),
    }), { attachTo: document.body })
    const flags = [...w.element.querySelectorAll('[data-part="trigger"]')]
      .map(el => el.getAttribute('aria-disabled'))
    expect(flags).toEqual(['false', 'true'])
    w.unmount()
  })

  it('不给 collection 也不写插槽时一个部件都不铺', () => {
    const w = mount(defineComponent({
      setup: () => () => h(XhTabsRoot, { defaultValue: 'overview' }),
    }), { attachTo: document.body })
    expect(w.element.querySelectorAll('[data-scope="tabs"][data-part]')).toHaveLength(0)
    w.unmount()
  })
})
