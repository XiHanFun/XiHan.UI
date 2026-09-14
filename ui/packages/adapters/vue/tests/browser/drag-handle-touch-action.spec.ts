// 三个拖动把手让不让出触屏手势，只有真实浏览器答得出来。
//
// 整块起手（整行 / 整个节点 / 整个标签）在触屏上做不到：纵向手势在按下那一刻就归了
// 浏览器滚动，touch-action 事后改不回来；而把整块设成 touch-action: none 又会让长列表
// 在上面完全滚不动。把手是那一小块专门让出去的地方——它必须真的解析成 none，
// 否则整条触屏路径就是个摆设。
//
// jsdom 不算样式，那边只看得到连接层写进内联 style 的字符串；这里量的是计算值。
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import {
  XhTableBody,
  XhTableCell,
  XhTableRoot,
  XhTableRow,
  XhTableRowDragTrigger,
  XhTabsList,
  XhTabsRoot,
  XhTabsTabDragTrigger,
  XhTabsTrigger,
  XhTreeItem,
  XhTreeItemText,
  XhTreeNodeDragTrigger,
  XhTreeRoot,
  XhTreeTree,
} from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let app: App | null = null
let host: HTMLElement | null = null

function mount(render: () => unknown): HTMLElement {
  host = document.createElement('div')
  document.body.append(host)
  app = createApp({ render })
  app.mount(host)
  return host
}

afterEach(() => {
  app?.unmount()
  host?.remove()
  app = null
  host = null
})

/** 把手节点上计算出来的 touch-action。 */
function touchActionOf(root: HTMLElement, part: string): string {
  const el = root.querySelector<HTMLElement>(`[data-part="${part}"]`)
  if (!el)
    throw new Error(`找不到把手：${part}`)
  return getComputedStyle(el).touchAction
}

describe('拖动把手真的让出了触屏手势', () => {
  it('表格行的把手解析成 none；关掉行拖拽时不再让出去', async () => {
    const rows = [{ id: 'a' }, { id: 'b' }]
    const columns = [{ id: 'name', label: '名称' }]
    const root = mount(() => h('div', [
      h(XhTableRoot, { rows, columns, rowReorderable: true }, () => [
        h(XhTableBody, null, () => rows.map(r =>
          h(XhTableRow, { key: r.id, value: r.id }, () => [
            h(XhTableRowDragTrigger),
            h(XhTableCell, { value: 'name', row: r.id }, () => r.id),
          ]))),
      ]),
    ]))
    await nextTick()
    expect(touchActionOf(root, 'row-drag-trigger')).toBe('none')
  })

  it('关掉行拖拽后把手不再占住手势，那一小块跟着表格照常滚', async () => {
    const rows = [{ id: 'a' }]
    const columns = [{ id: 'name', label: '名称' }]
    const root = mount(() => h('div', [
      h(XhTableRoot, { rows, columns }, () => [
        h(XhTableBody, null, () => [
          h(XhTableRow, { value: 'a' }, () => [
            h(XhTableRowDragTrigger),
            h(XhTableCell, { value: 'name', row: 'a' }, () => 'a'),
          ]),
        ]),
      ]),
    ]))
    await nextTick()
    expect(touchActionOf(root, 'row-drag-trigger')).not.toBe('none')
  })

  it('树节点的把手解析成 none', async () => {
    const collection = [{ value: 'a', label: '甲' }]
    const root = mount(() => h('div', [
      h(XhTreeRoot, { collection, nodeDraggable: true }, () => [
        h(XhTreeTree, null, () => [
          h(XhTreeItem, { value: 'a' }, () => [
            h(XhTreeNodeDragTrigger),
            h(XhTreeItemText, null, () => '甲'),
          ]),
        ]),
      ]),
    ]))
    await nextTick()
    expect(touchActionOf(root, 'node-drag-trigger')).toBe('none')
  })

  it('标签带的把手解析成 none', async () => {
    const collection = [{ value: 'one', label: '概览' }]
    const root = mount(() => h('div', [
      h(XhTabsRoot, { collection, defaultValue: 'one', reorderable: true }, () => [
        h(XhTabsList, null, () => [
          h(XhTabsTrigger, { value: 'one' }, () => [
            h(XhTabsTabDragTrigger, { value: 'one' }),
            h('span', '概览'),
          ]),
        ]),
      ]),
    ]))
    await nextTick()
    expect(touchActionOf(root, 'tab-drag-trigger')).toBe('none')
  })

  it('整块起手那一路照旧不占手势：整行不写 touch-action，长表才滚得动', async () => {
    const rows = [{ id: 'a' }]
    const columns = [{ id: 'name', label: '名称' }]
    const root = mount(() => h('div', [
      h(XhTableRoot, { rows, columns, rowReorderable: true }, () => [
        h(XhTableBody, null, () => [
          h(XhTableRow, { value: 'a' }, () => [
            h(XhTableCell, { value: 'name', row: 'a' }, () => 'a'),
          ]),
        ]),
      ]),
    ]))
    await nextTick()
    expect(touchActionOf(root, 'row')).not.toBe('none')
  })
})
