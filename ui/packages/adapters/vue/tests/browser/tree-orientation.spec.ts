// 树的排布方向：竖排每行一个，横排同一层并排铺开。
//
// 只有真实浏览器量得出来：这条全在 flex 的实际排布上，jsdom 不排版。
// 横排还要验一件反直觉的事——叶子行在竖排下会自己补出「箭头那一格」，
// 横排下那一格必须不补：节点是并排的，补出来的是节点之间的空隙，不是层级。
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import {
  XhTreeBranch,
  XhTreeBranchContent,
  XhTreeBranchControl,
  XhTreeBranchText,
  XhTreeBranchTrigger,
  XhTreeItem,
  XhTreeItemCheckbox,
  XhTreeItemText,
  XhTreeRoot,
  XhTreeTree,
} from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

const collection = [
  {
    value: 'dir',
    label: '目录',
    children: [
      { value: 'a', label: '甲' },
      { value: 'b', label: '乙' },
    ],
  },
]

let app: App | null = null
let host: HTMLElement | null = null

afterEach(() => {
  app?.unmount()
  host?.remove()
  app = null
  host = null
})

async function mountTree(orientation?: 'horizontal' | 'vertical') {
  host = document.createElement('div')
  document.body.append(host)
  app = createApp({
    setup: () => () =>
      h(
        XhTreeRoot,
        { collection, orientation, selectionMode: 'multiple', defaultExpandedValue: ['dir'] },
        () => [
          h(XhTreeTree, null, () => [
            h(XhTreeBranch, { value: 'dir' }, () => [
              h(XhTreeBranchControl, null, () => [
                h(XhTreeBranchTrigger),
                h(XhTreeBranchText, null, () => '目录'),
              ]),
              h(XhTreeBranchContent, null, () =>
                collection[0]!.children!.map(node =>
                  h(XhTreeItem, { key: node.value, value: node.value }, () => [
                    h(XhTreeItemCheckbox),
                    h(XhTreeItemText, null, () => node.label),
                  ]),
                ),
              ),
            ]),
          ]),
        ],
      ),
  })
  app.mount(host)
  await nextTick()
  await nextTick()
}

function rowOf(value: string): HTMLElement {
  return host!.querySelector<HTMLElement>(`[data-scope="tree"][data-value="${value}"]`)!
}

function part(name: string): HTMLElement {
  return host!.querySelector<HTMLElement>(`[data-scope="tree"][data-part="${name}"]`)!
}

describe('树的排布方向', () => {
  it('不给就是竖排，两个叶子上下排', async () => {
    await mountTree()
    const a = rowOf('a').getBoundingClientRect()
    const b = rowOf('b').getBoundingClientRect()

    expect(part('tree').getAttribute('data-orientation')).toBe('vertical')
    expect(b.top).toBeGreaterThanOrEqual(a.bottom)
    expect(b.left).toBeCloseTo(a.left, 1)
  })

  it('横排：同一层的两个叶子并排', async () => {
    await mountTree('horizontal')
    const a = rowOf('a').getBoundingClientRect()
    const b = rowOf('b').getBoundingClientRect()

    expect(b.left).toBeGreaterThanOrEqual(a.right)
    expect(b.top).toBeCloseTo(a.top, 1)
  })

  it('横排时叶子不再补「箭头那一格」', async () => {
    await mountTree('horizontal')
    const lead = Number.parseFloat(getComputedStyle(rowOf('a')).paddingInlineStart)
    const rowPx = Number.parseFloat(getComputedStyle(part('branch-control')).paddingInlineStart)

    // 竖排下这里会多出「指示符宽 + 行内间隙」，横排下只剩行盒自己的左内衬
    expect(lead).toBeCloseTo(rowPx, 1)
  })

  it('横排的子层仍然相对父层缩进一格', async () => {
    await mountTree('horizontal')
    const content = part('branch-content')
    const indent = Number.parseFloat(getComputedStyle(content).paddingInlineStart)

    expect(indent).toBeGreaterThan(0)
    expect(content.getAttribute('data-orientation')).toBe('horizontal')
  })

  it('方向不影响键盘语义：tree 自报 aria-orientation 但方向键仍是层级操作', async () => {
    await mountTree('horizontal')
    const tree = part('tree')
    expect(tree.getAttribute('aria-orientation')).toBe('horizontal')

    // 分支是展开的；左键收起，这是 treeview 的规范语义，不随排布方向改写
    const branch = rowOf('dir')
    branch.focus()
    // 焦点要先进机器：keydown 的处理器从 focusedValue 找当前行，同一拍发键时它还是空
    await nextTick()
    await nextTick()

    branch.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }))
    await nextTick()
    await nextTick()
    expect(branch.getAttribute('aria-expanded')).toBe('false')
  })
})
