// @vitest-environment jsdom
import type { MenuNode } from '@xihan-ui/headless'
import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, h } from 'vue'
import {
  XhMenuContent,
  XhMenuItem,
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

beforeEach(() => {
  // jsdom 无 matchMedia，桩掉供 RuntimeConfig.reducedMotion 使用
  vi.stubGlobal('matchMedia', (q: string) => ({ matches: false, media: q, addEventListener: () => {}, removeEventListener: () => {} }))
})

afterEach(() => {
  document.body.innerHTML = ''
  vi.unstubAllGlobals()
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
            h(XhMenuItem, { value: 'copy' }, () => '复制'),
            h(XhMenuItem, { value: 'paste' }, () => '粘贴'),
            h(XhMenuSeparator),
            h(XhMenuItem, { value: 'delete' }, () => '删除'),
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
      'item',
      'separator',
      'item',
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
    expect(partNames(document.body)).toEqual(['trigger', 'positioner', 'content', 'item'])
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
