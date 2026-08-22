// @vitest-environment jsdom
import type { MenubarNode } from '@xihan-ui/headless'
import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vitest'
import { defineComponent, h } from 'vue'
import {
  XhMenubarContent,
  XhMenubarItem,
  XhMenubarItemText,
  XhMenubarPositioner,
  XhMenubarRoot,
  XhMenubarTrigger,
} from '../src'

const COLLECTION: MenubarNode[] = [
  {
    value: 'file',
    label: '文件',
    items: [
      { value: 'new', label: '新建' },
      { value: 'open', label: '打开' },
      { value: 'close', label: '关闭', disabled: true },
    ],
  },
  {
    value: 'edit',
    label: '编辑',
    disabled: true,
    items: [
      { value: 'undo', label: '撤销' },
      { value: 'redo', label: '重做' },
    ],
  },
]

afterEach(() => {
  document.body.innerHTML = ''
})

/** 只交数据，结构由组件铺开 */
function mountFromCollection() {
  return mount(defineComponent({
    setup: () => () => h(XhMenubarRoot, { collection: COLLECTION }),
  }), { attachTo: document.body })
}

/** 手写全套部件，入口与条目只报 value，文本与禁用交给 collection */
function mountFromParts() {
  return mount(defineComponent({
    setup: () => () => h(XhMenubarRoot, { collection: COLLECTION }, () => [
      ...COLLECTION.map(menu =>
        h(XhMenubarTrigger, { key: `trigger:${menu.value}`, value: menu.value }, () => menu.label),
      ),
      ...COLLECTION.map(menu =>
        h(XhMenubarPositioner, { key: `positioner:${menu.value}`, value: menu.value }, () => [
          h(XhMenubarContent, null, () => (menu.items ?? []).map(item =>
            h(XhMenubarItem, { key: item.value, value: item.value }, () => [
              h(XhMenubarItemText, null, () => item.label),
            ]),
          )),
        ]),
      ),
    ]),
  }), { attachTo: document.body })
}

// 各菜单的 positioner 搬到了 portal 落点、不再落在挂载根里，因此下面一律从整篇文档取件

function partNames(root: Element): (string | null)[] {
  return [...root.querySelectorAll('[data-scope="menubar"][data-part]')].map(el => el.getAttribute('data-part'))
}

/**
 * 部件树：只取身份与无障碍属性。
 * 忽略定位引擎写入的坐标，也忽略按 scope 派生的 id 与指向它的那几个 aria 引用。
 */
function skeleton(root: Element): string[] {
  return [...root.querySelectorAll('[data-scope="menubar"][data-part]')].map((el) => {
    const attrs = ['data-part', 'data-value', 'role', 'aria-disabled', 'aria-expanded', 'data-state', 'data-disabled', 'data-highlighted', 'tabindex', 'hidden']
      .map(name => (el.hasAttribute(name) ? `${name}=${el.getAttribute(name)}` : null))
      .filter(Boolean)
    return `${attrs.join(' ')}|${el.textContent}`
  })
}

describe('menubar 的 collection', () => {
  it('不写插槽时按数据铺开整套部件', () => {
    const w = mountFromCollection()
    expect(partNames(document.body)).toEqual([
      'root',
      'trigger',
      'trigger',
      'positioner',
      'content',
      'item',
      'item-text',
      'item',
      'item-text',
      'item',
      'item-text',
      'positioner',
      'content',
      'item',
      'item-text',
      'item',
      'item-text',
    ])
    w.unmount()
  })

  it('入口与条目的文本取自 label，缺省退回 value', () => {
    const w = mount(defineComponent({
      setup: () => () => h(XhMenubarRoot, {
        collection: [
          { value: 'file', label: '文件', items: [{ value: 'new', label: '新建' }, { value: 'plain' }] },
          { value: 'bare' },
        ],
      }),
    }), { attachTo: document.body })
    const triggers = [...document.body.querySelectorAll('[data-part="trigger"]')].map(el => el.textContent)
    const texts = [...document.body.querySelectorAll('[data-part="item-text"]')].map(el => el.textContent)
    expect(triggers).toEqual(['文件', 'bare'])
    expect(texts).toEqual(['新建', 'plain'])
    w.unmount()
  })

  it('数据里的禁用落成条目的 aria-disabled', () => {
    const w = mountFromCollection()
    const flags = [...document.body.querySelectorAll('[data-part="item"]')]
      .map(el => el.getAttribute('aria-disabled'))
    expect(flags).toEqual(['false', 'false', 'true', 'false', 'false'])
    w.unmount()
  })

  it('数据里的禁用落成入口的 aria-disabled', () => {
    const w = mountFromCollection()
    const flags = [...w.element.querySelectorAll('[data-part="trigger"]')]
      .map(el => el.getAttribute('aria-disabled'))
    expect(flags).toEqual(['false', 'true'])
    w.unmount()
  })

  it('铺开的结构与手写全套部件完全一致', () => {
    // 两棵树共用一个 portal 落点，同时挂着就分不出谁是谁，改成一前一后各取一次
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
      setup: () => () => h(XhMenubarRoot, { collection: COLLECTION }, () => [
        h(XhMenubarPositioner, { value: 'file' }, () => [
          h(XhMenubarContent, null, () => [
            // 数据里 close 是禁用的，这里逐条改口
            h(XhMenubarItem, { value: 'close', disabled: false }, () => [h(XhMenubarItemText, null, () => '关闭')]),
            // 数据里 new 不禁用，这里逐条禁掉
            h(XhMenubarItem, { value: 'new', disabled: true }, () => [h(XhMenubarItemText, null, () => '新建')]),
          ]),
        ]),
      ]),
    }), { attachTo: document.body })
    const flags = [...document.body.querySelectorAll('[data-part="item"]')]
      .map(el => el.getAttribute('aria-disabled'))
    expect(flags).toEqual(['false', 'true'])
    w.unmount()
  })

  it('入口上写的 disabled 压过数据里的', () => {
    const w = mount(defineComponent({
      setup: () => () => h(XhMenubarRoot, { collection: COLLECTION }, () => [
        // 数据里 edit 是禁用的，这里逐条改口
        h(XhMenubarTrigger, { value: 'edit', disabled: false }, () => '编辑'),
        // 数据里 file 不禁用，这里逐条禁掉
        h(XhMenubarTrigger, { value: 'file', disabled: true }, () => '文件'),
      ]),
    }), { attachTo: document.body })
    const flags = [...w.element.querySelectorAll('[data-part="trigger"]')]
      .map(el => el.getAttribute('aria-disabled'))
    expect(flags).toEqual(['false', 'true'])
    w.unmount()
  })

  it('不给 collection 时部件上的声明照旧生效', () => {
    const w = mount(defineComponent({
      setup: () => () => h(XhMenubarRoot, null, () => [
        h(XhMenubarTrigger, { value: 'file' }, () => '文件'),
        h(XhMenubarPositioner, { value: 'file' }, () => [
          h(XhMenubarContent, null, () => [
            h(XhMenubarItem, { value: 'new' }, () => [h(XhMenubarItemText, null, () => '新建')]),
            h(XhMenubarItem, { value: 'close', disabled: true }, () => [h(XhMenubarItemText, null, () => '关闭')]),
          ]),
        ]),
      ]),
    }), { attachTo: document.body })
    expect([...document.body.querySelectorAll('[data-part="item"]')].map(el => el.getAttribute('aria-disabled')))
      .toEqual(['false', 'true'])
    expect(document.body.querySelector('[data-part="trigger"]')?.getAttribute('aria-disabled')).toBe('false')
    w.unmount()
  })
})
