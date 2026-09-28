// 树的拖放落下：库只报搬家意图，宿主写回 collection 后行换到新位置——不是瞬移，而是从旧位置滑过去
// （换位的 translate 过渡，时长 move）；换了父、被宿主重建的节点同样按节点值认回来。
// 落点线与 Table、Sortable 同一种颜色令牌。translate 的中间帧只有真实浏览器量得出来。
import type { App } from 'vue'
import type { TreeNode } from '../../src'
import { afterEach, describe, expect, it } from 'vitest'
import { userEvent } from 'vitest/browser'
import { createApp, defineComponent, h, nextTick, ref } from 'vue'
import {
  XhTableBody,
  XhTableCell,
  XhTableRoot,
  XhTableRow,
  XhTreeBranch,
  XhTreeBranchContent,
  XhTreeBranchControl,
  XhTreeBranchText,
  XhTreeItem,
  XhTreeItemText,
  XhTreeRoot,
  XhTreeTree,
} from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let app: App | null = null
let host: HTMLElement | null = null

afterEach(() => {
  app?.unmount()
  host?.remove()
  app = null
  host = null
})

function row(value: string): HTMLElement {
  const el = host?.querySelector<HTMLElement>(`[data-scope='tree'][data-part='item'][data-value='${value}']`)
  if (!el)
    throw new Error(`缺少 tree 行：${value}`)
  return el
}

function color(value: string): string {
  const probe = document.createElement('span')
  probe.style.color = value
  host!.append(probe)
  const resolved = getComputedStyle(probe).color
  probe.remove()
  return resolved
}

/** 按 onNodeMove 把节点搬到新位置：先从原处摘掉，再插进目标层的目标下标。 */
function applyMove(nodes: TreeNode[], move: { value: string, parent: string | null, index: number }): TreeNode[] {
  let moved: TreeNode | null = null
  const without = (list: TreeNode[]): TreeNode[] => list.flatMap((node) => {
    if (node.value === move.value) {
      moved = node
      return []
    }
    return [node.children ? { ...node, children: without(node.children) } : node]
  })
  const rest = without(nodes)
  const insert = (list: TreeNode[], parent: string | null): TreeNode[] => {
    if (parent === move.parent) {
      const next = [...list]
      next.splice(move.index, 0, moved!)
      return next
    }
    return list.map(node => (node.children ? { ...node, children: insert(node.children, node.value) } : node))
  }
  return insert(rest, null)
}

async function mountTree(): Promise<void> {
  host = document.createElement('div')
  host.style.inlineSize = '320px'
  document.body.append(host)
  const Demo = defineComponent(() => {
    const collection = ref<TreeNode[]>([
      { value: 'a', label: 'a' },
      { value: 'b', label: 'b' },
      { value: 'c', label: 'c' },
      { value: 'dir', label: 'dir', children: [{ value: 'd', label: 'd' }] },
    ])
    const renderNode = (node: TreeNode): ReturnType<typeof h> => node.children
      ? h(XhTreeBranch, { key: node.value, value: node.value }, () => [
          h(XhTreeBranchControl, null, () => h(XhTreeBranchText, null, () => node.label)),
          h(XhTreeBranchContent, null, () => node.children!.map(renderNode)),
        ])
      : h(XhTreeItem, { key: node.value, value: node.value }, () => h(XhTreeItemText, null, () => node.label))
    return () => h(XhTreeRoot, {
      collection: collection.value,
      nodeDraggable: true,
      defaultExpandedValue: ['dir'],
      onNodeMove: (move: { value: string, parent: string | null, index: number }) => {
        collection.value = applyMove(collection.value, move)
      },
    }, () => h(XhTreeTree, null, () => collection.value.map(renderNode)))
  })
  app = createApp(Demo)
  app.mount(host)
  await nextTick()
}

describe('tree 拖放落下', () => {
  it('键盘换位（Alt + 下键）：宿主写回后行从旧位置滑到新位置，过渡走 move 时长，落定后不留位移', async () => {
    await mountTree()
    const a = row('a')
    expect(getComputedStyle(a).transitionProperty).toContain('translate')
    a.focus()
    await userEvent.keyboard('{Alt>}{ArrowDown}{/Alt}')
    await nextTick()
    const moved = row('a')
    // a 落到 b 之后：它的新位置在下面，刚落下那一帧仍从上面往下走
    const y = Number.parseFloat(getComputedStyle(moved).translate.split(' ')[1] ?? '0')
    expect(y).toBeLessThan(0)
    const b = Number.parseFloat(getComputedStyle(row('b')).translate.split(' ')[1] ?? '0')
    expect(b).toBeGreaterThan(0)
    await expect.poll(() => getComputedStyle(row('a')).translate).toBe('none')
  })

  it('换了父的节点被宿主重建，也按节点值认回、从旧位置滑过去', async () => {
    await mountTree()
    const d = row('d')
    d.focus()
    // 左键：提出一层，落到 dir 之后的根层
    await userEvent.keyboard('{Alt>}{ArrowLeft}{/Alt}')
    await nextTick()
    const moved = row('d')
    const [x] = getComputedStyle(moved).translate.split(' ')
    expect(Number.parseFloat(x ?? '0')).toBeGreaterThan(0)
    await expect.poll(() => getComputedStyle(row('d')).translate).toBe('none')
  })

  it('落点线与 Table 同一种颜色令牌（暗色下焦点色与品牌实心分成两档，两种令牌在这里才分得开）', async () => {
    await mountTree()
    host!.dataset.theme = 'dark'
    const line = row('b')
    line.setAttribute('data-drop', 'before')
    const tableHost = document.createElement('div')
    host!.append(tableHost)
    const table = createApp({
      render: () => h(XhTableRoot, { columns: [{ id: 'n', label: 'n' }], rows: [{ id: 'r' }] }, () => h(XhTableBody, null, () => h(XhTableRow, { value: 'r' }, () => h(XhTableCell, { value: 'n' }, () => 'r')))),
    })
    table.mount(tableHost)
    await nextTick()
    const tableRow = tableHost.querySelector<HTMLElement>(`[data-scope='table'][data-part='row'][data-value='r']`)!
    tableRow.setAttribute('data-drop', 'after')
    const treeLine = getComputedStyle(line, '::after').backgroundColor
    expect(treeLine).toBe(getComputedStyle(tableRow, '::after').backgroundColor)
    expect(treeLine).toBe(color('var(--xh-bg-brand)'))
    table.unmount()
  })
})
