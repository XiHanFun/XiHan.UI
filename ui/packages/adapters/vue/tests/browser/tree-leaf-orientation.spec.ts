// 末端那一层的排布：只有「子节点全是叶子」的那层能横排，其余恒竖排。
//
// 菜单授权是这条的用例：一个菜单下十几个按钮，横排一行铺完，省掉纵向翻找；
// 而目录、菜单那些中间层承载的是层级本身，横过来层级就读没了，所以不给横。
//
// 只有真实浏览器量得出来：这条全在 flex 的实际排布上，jsdom 不排版。
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

interface Node { value: string, label: string, children?: Node[] }

// 目录(1) → 菜单(2) → 按钮(3)；另有一个直接挂在目录下的叶子，用来验「混着就不算末端」
const collection: Node[] = [
  {
    value: 'system',
    label: '系统管理',
    children: [
      {
        value: 'user',
        label: '用户管理',
        children: [
          { value: 'user:add', label: '新增' },
          { value: 'user:edit', label: '编辑' },
          { value: 'user:del', label: '删除' },
        ],
      },
      { value: 'about', label: '关于' },
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

function renderNodes(nodes: Node[]): unknown[] {
  return nodes.map(node =>
    node.children
      ? h(XhTreeBranch, { key: node.value, value: node.value }, () => [
          h(XhTreeBranchControl, null, () => [
            h(XhTreeBranchTrigger),
            h(XhTreeBranchText, null, () => node.label),
          ]),
          h(XhTreeBranchContent, null, () => renderNodes(node.children!)),
        ])
      : h(XhTreeItem, { key: node.value, value: node.value }, () => [
          h(XhTreeItemCheckbox),
          h(XhTreeItemText, null, () => node.label),
        ]),
  )
}

async function mountTree(leafOrientation?: 'horizontal' | 'vertical') {
  host = document.createElement('div')
  document.body.append(host)
  app = createApp({
    setup: () => () =>
      h(
        XhTreeRoot,
        {
          collection,
          leafOrientation,
          multiple: true,
          defaultExpandedValue: ['system', 'user'],
        },
        () => [h(XhTreeTree, null, () => renderNodes(collection))],
      ),
  })
  app.mount(host)
  await nextTick()
  await nextTick()
}

function rowOf(value: string): HTMLElement {
  return host!.querySelector<HTMLElement>(`[data-scope="tree"][data-value="${value}"]`)!
}

function contentOf(branchValue: string): HTMLElement {
  return rowOf(branchValue).querySelector<HTMLElement>(
    '[data-scope="tree"][data-part="branch-content"]',
  )!
}

function part(name: string): HTMLElement {
  return host!.querySelector<HTMLElement>(`[data-scope="tree"][data-part="${name}"]`)!
}

describe('末端那一层的排布', () => {
  it('不给就整棵树竖排', async () => {
    await mountTree()
    expect(contentOf('user').getAttribute('data-orientation')).toBe('vertical')

    const add = rowOf('user:add').getBoundingClientRect()
    const edit = rowOf('user:edit').getBoundingClientRect()
    expect(edit.top).toBeGreaterThanOrEqual(add.bottom)
  })

  it('横排只落在按钮那层：三个按钮并排', async () => {
    await mountTree('horizontal')
    expect(contentOf('user').getAttribute('data-orientation')).toBe('horizontal')

    const add = rowOf('user:add').getBoundingClientRect()
    const edit = rowOf('user:edit').getBoundingClientRect()
    const del = rowOf('user:del').getBoundingClientRect()
    expect(edit.left).toBeGreaterThanOrEqual(add.right)
    expect(del.left).toBeGreaterThanOrEqual(edit.right)
    expect(edit.top).toBeCloseTo(add.top, 1)
  })

  it('中间层不给横：目录那层混着分支与叶子，恒竖排', async () => {
    await mountTree('horizontal')
    // system 的子节点是 [user(分支), about(叶子)]，不算末端
    expect(contentOf('system').getAttribute('data-orientation')).toBe('vertical')

    const user = rowOf('user').getBoundingClientRect()
    const about = rowOf('about').getBoundingClientRect()
    expect(about.top).toBeGreaterThanOrEqual(user.bottom)
  })

  it('整棵树不给横：根层恒竖排', async () => {
    await mountTree('horizontal')
    expect(part('tree').getAttribute('data-orientation')).toBe('vertical')
    expect(part('root').getAttribute('data-orientation')).toBe('vertical')
    expect(part('tree').getAttribute('aria-orientation')).toBe('vertical')
  })

  it('横排层里的叶子不补「箭头那一格」，竖排层里补', async () => {
    await mountTree('horizontal')
    const rowPx = Number.parseFloat(
      getComputedStyle(
        rowOf('user').querySelector<HTMLElement>('[data-part="branch-control"]')!,
      ).paddingInlineStart,
    )

    // 按钮在横排层：只剩行盒自己的左内衬
    expect(Number.parseFloat(getComputedStyle(rowOf('user:add')).paddingInlineStart))
      .toBeCloseTo(rowPx, 1)
    // 「关于」在竖排层：要补出箭头那一格，与同级分支对齐
    expect(Number.parseFloat(getComputedStyle(rowOf('about')).paddingInlineStart))
      .toBeGreaterThan(rowPx)
  })

  it('方向键不受影响：左键仍是收起', async () => {
    await mountTree('horizontal')
    const branch = rowOf('user')
    branch.focus()
    await nextTick()
    await nextTick()

    branch.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }))
    await nextTick()
    await nextTick()
    expect(branch.getAttribute('aria-expanded')).toBe('false')
  })
})
