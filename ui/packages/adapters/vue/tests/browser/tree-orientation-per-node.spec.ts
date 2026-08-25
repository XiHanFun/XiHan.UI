// 逐层排布：同一棵树里目录与菜单竖排、按钮横排。
//
// 这是菜单授权那类树的真实形态——按钮一层动辄十几个，竖着排要翻很久，
// 横排一行铺开就选完了。orientation 收函数时，收到的是**分支节点**，
// 答的是它那层子节点怎么排；根层收到 null。
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

// 目录（1 层）→ 菜单（2 层）→ 按钮（3 层）
const collection = [
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

/** 菜单那一层（level 2）的子节点横排，其余竖排。 */
function buttonsHorizontal(node: { level: number } | null): 'horizontal' | 'vertical' {
  return node?.level === 2 ? 'horizontal' : 'vertical'
}

async function mountTree(orientation: unknown) {
  host = document.createElement('div')
  document.body.append(host)
  app = createApp({
    setup: () => () =>
      h(
        XhTreeRoot,
        { collection, orientation, selectionMode: 'multiple', defaultExpandedValue: ['system', 'user'] },
        () => [
          h(XhTreeTree, null, () => [
            h(XhTreeBranch, { value: 'system' }, () => [
              h(XhTreeBranchControl, null, () => [
                h(XhTreeBranchTrigger),
                h(XhTreeBranchText, null, () => '系统管理'),
              ]),
              h(XhTreeBranchContent, null, () => [
                h(XhTreeBranch, { value: 'user' }, () => [
                  h(XhTreeBranchControl, null, () => [
                    h(XhTreeBranchTrigger),
                    h(XhTreeBranchText, null, () => '用户管理'),
                  ]),
                  h(XhTreeBranchContent, null, () =>
                    collection[0]!.children![0]!.children!.map(btn =>
                      h(XhTreeItem, { key: btn.value, value: btn.value }, () => [
                        h(XhTreeItemCheckbox),
                        h(XhTreeItemText, null, () => btn.label),
                      ]),
                    ),
                  ),
                ]),
              ]),
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

/** 某个分支下装子节点的那层容器。 */
function contentOf(branchValue: string): HTMLElement {
  return rowOf(branchValue).querySelector<HTMLElement>(
    '[data-scope="tree"][data-part="branch-content"]',
  )!
}

describe('逐层排布', () => {
  it('函数按分支答：菜单那层横排，目录那层竖排', async () => {
    await mountTree(buttonsHorizontal)

    expect(contentOf('system').getAttribute('data-orientation')).toBe('vertical')
    expect(contentOf('user').getAttribute('data-orientation')).toBe('horizontal')
    expect(
      host!.querySelector('[data-scope="tree"][data-part="tree"]')!.getAttribute('data-orientation'),
    ).toBe('vertical')
  })

  it('三个按钮真的并排，不是三行', async () => {
    await mountTree(buttonsHorizontal)
    const add = rowOf('user:add').getBoundingClientRect()
    const edit = rowOf('user:edit').getBoundingClientRect()
    const del = rowOf('user:del').getBoundingClientRect()

    expect(edit.left).toBeGreaterThanOrEqual(add.right)
    expect(del.left).toBeGreaterThanOrEqual(edit.right)
    expect(edit.top).toBeCloseTo(add.top, 1)
    expect(del.top).toBeCloseTo(add.top, 1)
  })

  it('横排层里的叶子不被外层的竖排规则波及，不补「箭头那一格」', async () => {
    await mountTree(buttonsHorizontal)
    // 外层 tree 与 system 的子层都是 vertical，按钮却在 horizontal 的容器里：
    // 用后代选择器的话这里会被外层的 vertical 命中，多补一格
    const lead = Number.parseFloat(getComputedStyle(rowOf('user:add')).paddingInlineStart)
    const rowPx = Number.parseFloat(
      getComputedStyle(
        rowOf('user').querySelector<HTMLElement>('[data-part="branch-control"]')!,
      ).paddingInlineStart,
    )

    expect(lead).toBeCloseTo(rowPx, 1)
  })

  it('答 undefined 的层退回竖排', async () => {
    await mountTree((node: { level: number } | null) =>
      (node?.level === 2 ? 'horizontal' : undefined),
    )

    expect(contentOf('system').getAttribute('data-orientation')).toBe('vertical')
    expect(contentOf('user').getAttribute('data-orientation')).toBe('horizontal')
  })

  it('给字面值仍是整棵树一个样', async () => {
    await mountTree('horizontal')

    expect(contentOf('system').getAttribute('data-orientation')).toBe('horizontal')
    expect(contentOf('user').getAttribute('data-orientation')).toBe('horizontal')
  })

  it('根层收到的是 null，不是某个节点', async () => {
    const seen: Array<string | null> = []
    await mountTree((node: { level: number, value?: string } | null) => {
      seen.push(node ? (node.value ?? '?') : null)
      return 'vertical'
    })

    expect(seen).toContain(null)
    expect(seen).toContain('user')
  })
})
