// @vitest-environment jsdom
import type { MenuNode } from '@xihan-ui/headless'
import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vitest'
import { defineComponent, h } from 'vue'
import {
  XhMenuContent,
  XhMenuItem,
  XhMenuItemText,
  XhMenuPositioner,
  XhMenuRoot,
  XhMenuSeparator,
  XhMenuTrigger,
} from '../src'

const COLLECTION: MenuNode[] = [
  { value: 'copy', label: '复制' },
  { value: 'paste', label: '粘贴' },
  { value: 'delete', label: '删除', disabled: true, separatorBefore: true },
]

afterEach(() => {
  document.body.innerHTML = ''
})

/** 只交数据，结构由组件铺开 */
function mountFromCollection() {
  return mount(defineComponent({
    setup: () => () => h('div', [
      h(XhMenuRoot, { collection: COLLECTION }, { trigger: () => '操作' }),
    ]),
  }), { attachTo: document.body })
}

/** 手写全套部件，条目只报 value，文本与禁用交给 collection */
function mountFromParts() {
  return mount(defineComponent({
    setup: () => () => h('div', [
      h(XhMenuRoot, { collection: COLLECTION }, () => [
        h(XhMenuTrigger, () => '操作'),
        h(XhMenuPositioner, () => [
          h(XhMenuContent, () => [
            h(XhMenuItem, { value: 'copy' }, () => [h(XhMenuItemText, () => '复制')]),
            h(XhMenuItem, { value: 'paste' }, () => [h(XhMenuItemText, () => '粘贴')]),
            h(XhMenuSeparator),
            h(XhMenuItem, { value: 'delete' }, () => [h(XhMenuItemText, () => '删除')]),
          ]),
        ]),
      ]),
    ]),
  }), { attachTo: document.body })
}

// 浮层的 positioner 搬到了 portal 落点，不再落在挂载根里，因此下面一律从整篇文档取件

/** 部件树：只取身份与无障碍属性，忽略由定位引擎写入的坐标与逐实例生成的 id */
function skeleton(root: Element): string[] {
  return [...root.querySelectorAll('[data-scope="menu"][data-part]')].map((el) => {
    const attrs = ['data-part', 'role', 'aria-disabled', 'aria-orientation', 'data-state', 'data-disabled', 'tabindex']
      .map(name => (el.hasAttribute(name) ? `${name}=${el.getAttribute(name)}` : null))
      .filter(Boolean)
    return `${attrs.join(' ')}|${el.textContent}`
  })
}

/** 部件名序列，按文档顺序 */
function partNames(root: Element): (string | null)[] {
  return [...root.querySelectorAll('[data-scope="menu"][data-part]')].map(el => el.getAttribute('data-part'))
}

describe('menu 的 collection', () => {
  it('不写插槽时按数据铺开整套部件', () => {
    const w = mountFromCollection()
    expect(partNames(document.body)).toEqual([
      'trigger',
      'positioner',
      'content',
      'item',
      'item-text',
      'item',
      'item-text',
      'separator',
      'item',
      'item-text',
    ])
    w.unmount()
  })

  it('条目文本取自 label，缺省退回 value', () => {
    const w = mount(defineComponent({
      setup: () => () => h('div', [
        h(XhMenuRoot, { collection: [{ value: 'copy', label: '复制' }, { value: 'plain' }] }),
      ]),
    }), { attachTo: document.body })
    const texts = [...document.body.querySelectorAll('[data-part="item"]')].map(el => el.textContent)
    expect(texts).toEqual(['复制', 'plain'])
    w.unmount()
  })

  it('数据里的禁用落成条目的 aria-disabled', () => {
    const w = mountFromCollection()
    const flags = [...document.body.querySelectorAll('[data-part="item"]')]
      .map(el => el.getAttribute('aria-disabled'))
    expect(flags).toEqual(['false', 'false', 'true'])
    w.unmount()
  })

  it('触发器内容取自 trigger 插槽', () => {
    const w = mountFromCollection()
    expect(w.element.querySelector('[data-part="trigger"]')?.textContent).toBe('操作')
    w.unmount()
  })

  it('首条上的分隔标记不产出分隔线', () => {
    const w = mount(defineComponent({
      setup: () => () => h('div', [
        h(XhMenuRoot, { collection: [{ value: 'copy', label: '复制', separatorBefore: true }] }),
      ]),
    }), { attachTo: document.body })
    expect(partNames(document.body)).toEqual(['trigger', 'positioner', 'content', 'item', 'item-text'])
    w.unmount()
  })

  it('铺开的结构与手写全套部件完全一致', () => {
    // 两处浮层共用一个 portal 落点，同时挂着就分不出谁是谁，改成一前一后各取一次
    const auto = mountFromCollection()
    const fromCollection = skeleton(document.body)
    auto.unmount()
    document.body.innerHTML = ''

    const manual = mountFromParts()
    const fromParts = skeleton(document.body)
    manual.unmount()
    expect(fromCollection).toEqual(fromParts)
  })

  it('条目上写的 disabled 压过数据里的', () => {
    const w = mount(defineComponent({
      setup: () => () => h('div', [
        h(XhMenuRoot, { collection: COLLECTION }, () => [
          h(XhMenuPositioner, () => [
            h(XhMenuContent, () => [
              // 数据里 delete 是禁用的，这里逐条改口
              h(XhMenuItem, { value: 'delete', disabled: false }, () => '删除'),
              // 数据里 copy 不禁用，这里逐条禁掉
              h(XhMenuItem, { value: 'copy', disabled: true }, () => '复制'),
            ]),
          ]),
        ]),
      ]),
    }), { attachTo: document.body })
    const flags = [...document.body.querySelectorAll('[data-part="item"]')]
      .map(el => el.getAttribute('aria-disabled'))
    expect(flags).toEqual(['false', 'true'])
    w.unmount()
  })

  it('标记位、文字、说明与快捷键按数据铺，未提供的那几个不铺对应部件', () => {
    const w = mount(defineComponent({
      setup: () => () => h('div', [
        h(XhMenuRoot, {
          collection: [
            { value: 'copy', label: '复制', indicator: '✓', description: '连同格式', shortcut: '⌘ C' },
            { value: 'paste', label: '粘贴' },
          ] satisfies MenuNode[],
        }),
      ]),
    }), { attachTo: document.body })
    expect(partNames(document.body)).toEqual([
      'trigger',
      'positioner',
      'content',
      'item',
      'item-indicator',
      'item-text',
      'item-description',
      'item-shortcut',
      // 什么都没写的那条只剩文字
      'item',
      'item-text',
    ])
    const shortcut = document.body.querySelector('[data-part="item-shortcut"]')!
    expect(shortcut.textContent).toBe('⌘ C')
    // 快捷键是纯装饰：可及名由条目文字承担
    expect(shortcut.getAttribute('aria-hidden')).toBe('true')
    expect(shortcut.getAttribute('data-xh-collection-slot')).toBe('shortcut')
    w.unmount()
  })

  it('写了 item 插槽就整条交给作者：代铺的说明与快捷键都不再出现', () => {
    const w = mount(defineComponent({
      setup: () => () => h('div', [
        h(XhMenuRoot, {
          collection: [{ value: 'copy', label: '复制', description: '连同格式', shortcut: '⌘ C' }] satisfies MenuNode[],
        }, {
          item: (node: { label: string }) => [h('b', node.label)],
        }),
      ]),
    }), { attachTo: document.body })
    expect(partNames(document.body)).toEqual(['trigger', 'positioner', 'content', 'item'])
    expect(document.body.querySelector('[data-part="item"]')?.innerHTML).toBe('<b>复制</b>')
    w.unmount()
  })

  it('相邻同 group 的条目收进同一个 group，标题取本组首个写了 groupLabel 的那条', () => {
    const w = mount(defineComponent({
      setup: () => () => h('div', [
        h(XhMenuRoot, {
          collection: [
            { value: 'compact', label: '紧凑', group: 'density', groupLabel: '行高' },
            { value: 'comfortable', label: '宽松', group: 'density' },
            { value: 'sidebar', label: '侧栏', group: 'panels', groupLabel: '面板', separatorBefore: true },
            { value: 'inspector', label: '属性面板', group: 'panels' },
          ] satisfies MenuNode[],
        }),
      ]),
    }), { attachTo: document.body })
    expect(partNames(document.body)).toEqual([
      'trigger',
      'positioner',
      'content',
      'group',
      'group-label',
      'item',
      'item-text',
      'item',
      'item-text',
      // 领头一个分组的那条，分隔线画在 group 外面
      'separator',
      'group',
      'group-label',
      'item',
      'item-text',
      'item',
      'item-text',
    ])
    const labelEls = [...document.body.querySelectorAll('[data-part="group-label"]')]
    expect(labelEls.map(el => el.textContent)).toEqual(['行高', '面板'])
    // 分组标题不是条目，只能靠 aria-labelledby 挂上来；两个组各认各的那一条
    const groups = [...document.body.querySelectorAll('[data-part="group"]')]
    expect(groups.map(el => el.getAttribute('role'))).toEqual(['group', 'group'])
    expect(groups.map(el => el.getAttribute('aria-labelledby'))).toEqual(labelEls.map(el => el.id))
    w.unmount()
  })

  it('没写 group 的条目直接落在 content 上，与分组段互不影响', () => {
    const w = mount(defineComponent({
      setup: () => () => h('div', [
        h(XhMenuRoot, {
          collection: [
            { value: 'undo', label: '撤销' },
            { value: 'compact', label: '紧凑', group: 'density', groupLabel: '行高' },
            { value: 'reset', label: '重置' },
          ] satisfies MenuNode[],
        }),
      ]),
    }), { attachTo: document.body })
    expect(partNames(document.body)).toEqual([
      'trigger',
      'positioner',
      'content',
      'item',
      'item-text',
      'group',
      'group-label',
      'item',
      'item-text',
      'item',
      'item-text',
    ])
    w.unmount()
  })

  it('同组内部写的分隔标记留在组里，不跑到 group 外面', () => {
    const w = mount(defineComponent({
      setup: () => () => h('div', [
        h(XhMenuRoot, {
          collection: [
            { value: 'compact', label: '紧凑', group: 'density', groupLabel: '行高' },
            { value: 'comfortable', label: '宽松', group: 'density', separatorBefore: true },
          ] satisfies MenuNode[],
        }),
      ]),
    }), { attachTo: document.body })
    const group = document.body.querySelector('[data-part="group"]')!
    expect(partNames(group)).toEqual(['group-label', 'item', 'item-text', 'separator', 'item', 'item-text'])
    w.unmount()
  })

  it('triggerAsChild 让代铺那条路借用作者的节点当触发器', () => {
    const w = mount(defineComponent({
      setup: () => () => h('div', [
        h(XhMenuRoot, { collection: COLLECTION, triggerAsChild: true }, {
          trigger: () => [h('span', { class: 'mine' }, '操作')],
        }),
      ]),
    }), { attachTo: document.body })
    const trigger = w.element.querySelector('[data-part="trigger"]')!
    expect(trigger.tagName).toBe('SPAN')
    expect(trigger.className).toBe('mine')
    expect(w.element.querySelectorAll('button').length).toBe(0)
    w.unmount()
  })

  it('不给 triggerAsChild 时代铺那条路仍外包一颗 button', () => {
    const w = mountFromCollection()
    expect(w.element.querySelector('[data-part="trigger"]')?.tagName).toBe('BUTTON')
    w.unmount()
  })
})
