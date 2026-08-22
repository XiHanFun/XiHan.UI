// @vitest-environment jsdom
import type { ContextMenuNode } from '@xihan-ui/headless'
import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vitest'
import { defineComponent, h } from 'vue'
import {
  XhContextMenuContent,
  XhContextMenuGroup,
  XhContextMenuGroupLabel,
  XhContextMenuItem,
  XhContextMenuItemIndicator,
  XhContextMenuItemText,
  XhContextMenuPositioner,
  XhContextMenuRoot,
  XhContextMenuSeparator,
  XhContextMenuTrigger,
} from '../src'

const COLLECTION: ContextMenuNode[] = [
  { value: 'copy', label: '复制' },
  { value: 'paste', label: '粘贴', disabled: true },
  { value: 'name', label: '按名称', group: 'sort', groupLabel: '排序方式', indicator: '✓', separatorBefore: true },
  { value: 'time', label: '按时间', group: 'sort' },
  { value: 'delete', label: '删除', separatorBefore: true },
]

afterEach(() => {
  document.body.innerHTML = ''
})

/** 只交数据，结构由组件铺开；触发区的内容走 trigger 插槽 */
function mountFromCollection() {
  return mount(defineComponent({
    setup: () => () => h(XhContextMenuRoot, { collection: COLLECTION }, {
      trigger: () => [h('span', '右键这块区域')],
    }),
  }), { attachTo: document.body })
}

/** 手写全套部件，条目只报 value，文本与禁用交给 collection */
function mountFromParts() {
  return mount(defineComponent({
    setup: () => () => h(XhContextMenuRoot, { collection: COLLECTION }, () => [
      h(XhContextMenuTrigger, () => [h('span', '右键这块区域')]),
      h(XhContextMenuPositioner, () => [
        h(XhContextMenuContent, () => [
          h(XhContextMenuItem, { value: 'copy' }, () => [h(XhContextMenuItemText, () => '复制')]),
          h(XhContextMenuItem, { value: 'paste' }, () => [h(XhContextMenuItemText, () => '粘贴')]),
          h(XhContextMenuSeparator),
          h(XhContextMenuGroup, { value: 'sort' }, () => [
            h(XhContextMenuGroupLabel, () => '排序方式'),
            h(XhContextMenuItem, { value: 'name' }, () => [
              h(XhContextMenuItemIndicator, () => '✓'),
              h(XhContextMenuItemText, () => '按名称'),
            ]),
            h(XhContextMenuItem, { value: 'time' }, () => [h(XhContextMenuItemText, () => '按时间')]),
          ]),
          h(XhContextMenuSeparator),
          h(XhContextMenuItem, { value: 'delete' }, () => [h(XhContextMenuItemText, () => '删除')]),
        ]),
      ]),
    ]),
  }), { attachTo: document.body })
}

/** 全文档里 root 以下的本组件部件，按文档序；positioner 搬去了 portal 落点，不在挂载树里。 */
function partsIn(): HTMLElement[] {
  return [...document.querySelectorAll<HTMLElement>('[data-scope="context-menu"][data-part]')]
    .filter(el => el.dataset.part !== 'root')
}

/** 部件树：只取身份与无障碍属性，id 与定位引擎写入的坐标一概不看 */
function skeleton(): string[] {
  return partsIn().map((el) => {
    const attrs = ['data-part', 'role', 'aria-disabled', 'aria-orientation', 'data-state', 'data-disabled', 'data-highlighted', 'tabindex']
      .map(name => (el.hasAttribute(name) ? `${name}=${el.getAttribute(name)}` : null))
      .filter(Boolean)
    return `${attrs.join(' ')}|${el.textContent}`
  })
}

function partsOf(): (string | null)[] {
  return partsIn().map(el => el.getAttribute('data-part'))
}

function itemFlags(): (string | null)[] {
  return partsIn().filter(el => el.dataset.part === 'item').map(el => el.getAttribute('aria-disabled'))
}

describe('context-menu 的 collection', () => {
  it('不写插槽时按数据铺开整套部件', () => {
    const w = mountFromCollection()
    expect(partsOf()).toEqual([
      'trigger',
      'positioner',
      'content',
      'item',
      'item-text',
      'item',
      'item-text',
      'separator',
      'group',
      'group-label',
      'item',
      'item-indicator',
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
      setup: () => () => h(XhContextMenuRoot, {
        collection: [{ value: 'copy', label: '复制' }, { value: 'plain' }],
      }),
    }), { attachTo: document.body })
    const texts = partsIn().filter(el => el.dataset.part === 'item-text').map(el => el.textContent)
    expect(texts).toEqual(['复制', 'plain'])
    w.unmount()
  })

  it('数据里的禁用落成条目的 aria-disabled', () => {
    const w = mountFromCollection()
    expect(itemFlags()).toEqual(['false', 'true', 'false', 'false', 'false'])
    w.unmount()
  })

  it('触发区里放什么归作者，trigger 插槽原样落进触发区', () => {
    const w = mountFromCollection()
    expect(w.element.querySelector('[data-part="trigger"]')?.textContent).toBe('右键这块区域')
    w.unmount()
  })

  it('铺开的结构与手写全套部件完全一致', () => {
    // 两棵树都往同一个 portal 落点搬，逐棵挂逐棵取，快照才不会掺在一起
    const auto = mountFromCollection()
    const fromCollection = skeleton()
    auto.unmount()
    // 落点是 body 末尾的共用节点：不清掉，第二棵的 host 会排到它后面，文档序与第一棵相反
    document.body.innerHTML = ''

    const manual = mountFromParts()
    const fromParts = skeleton()
    manual.unmount()
    expect(fromCollection).toEqual(fromParts)
  })

  it('条目上写的 disabled 压过数据里的', () => {
    const w = mount(defineComponent({
      setup: () => () => h(XhContextMenuRoot, { collection: COLLECTION }, () => [
        h(XhContextMenuContent, () => [
          // 数据里 paste 是禁用的，这里逐条改口
          h(XhContextMenuItem, { value: 'paste', disabled: false }, () => [h(XhContextMenuItemText, () => '粘贴')]),
          // 数据里 copy 不禁用，这里逐条禁掉
          h(XhContextMenuItem, { value: 'copy', disabled: true }, () => [h(XhContextMenuItemText, () => '复制')]),
        ]),
      ]),
    }), { attachTo: document.body })
    expect(itemFlags()).toEqual(['false', 'true'])
    w.unmount()
  })

  it('不给 collection 时条目仍按部件上写的禁用走', () => {
    const w = mount(defineComponent({
      setup: () => () => h(XhContextMenuRoot, null, () => [
        h(XhContextMenuTrigger, () => [h('span', '右键这块区域')]),
        h(XhContextMenuPositioner, () => [
          h(XhContextMenuContent, () => [
            h(XhContextMenuItem, { value: 'copy' }, () => [h(XhContextMenuItemText, () => '复制')]),
            h(XhContextMenuItem, { value: 'paste', disabled: true }, () => [h(XhContextMenuItemText, () => '粘贴')]),
          ]),
        ]),
      ]),
    }), { attachTo: document.body })
    expect(itemFlags()).toEqual(['false', 'true'])
    expect(partsOf()).toEqual(['trigger', 'positioner', 'content', 'item', 'item-text', 'item', 'item-text'])
    w.unmount()
  })
})
