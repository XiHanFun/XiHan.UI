// @vitest-environment jsdom
//
// 集合条目被移出 DOM 时，浏览器不派 focusout——焦点就这么无声地掉到 body 上。
// 机器那一侧仍记着「焦点在某某条目上」：容器不再兜底进 Tab 序列，而那个锚点已经不存在，
// 于是整组再没有一个 Tab 停靠点，键盘进不来。适配器要在卸载时如实上报这件事。
//
// 一致性套件核不到这一路：它的 fixture 是一棵固定的树，不会在中途摘掉持有焦点的那个节点。
import type { ReactNode } from 'react'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, describe, expect, it } from 'vitest'
import {
  XhMessageFeedItem,
  XhMessageFeedList,
  XhMessageFeedRoot,
  XhMessageFeedViewport,
  XhTableBody,
  XhTableCell,
  XhTableRoot,
  XhTableRow,
  XhTransferItem,
  XhTransferItemText,
  XhTransferList,
  XhTransferRoot,
  XhTransferSourcePanel,
  XhTreeItem,
  XhTreeItemText,
  XhTreeRoot,
  XhTreeTree,
} from '../src'

let host: HTMLElement | null = null
let root: ReturnType<typeof createRoot> | null = null

afterEach(async () => {
  await act(async () => {
    root?.unmount()
  })
  host?.remove()
  root = null
  host = null
})

/** 机器的效应排在提交之后，多催几拍让 DOM 落定。 */
async function settle(): Promise<void> {
  for (let i = 0; i < 5; i++) {
    await act(async () => {
      await Promise.resolve()
    })
  }
}

async function mount(tree: ReactNode): Promise<void> {
  host = document.createElement('div')
  document.body.append(host)
  root = createRoot(host)
  ;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true
  await act(async () => {
    root!.render(tree)
  })
  await settle()
}

async function rerender(tree: ReactNode): Promise<void> {
  await act(async () => {
    root!.render(tree)
  })
  await settle()
}

function parts(scope: string, part: string): HTMLElement[] {
  return [...document.querySelectorAll<HTMLElement>(`[data-scope="${scope}"][data-part="${part}"]`)]
}

/** 真实聚焦：focusin 会冒泡，与用户点上去那一路一致。 */
async function focus(el: HTMLElement): Promise<void> {
  await act(async () => {
    el.focus()
  })
  await settle()
}

const TREE_COLLECTION = [
  { value: 'index', label: 'Index' },
  { value: 'license', label: 'License' },
  { value: 'dom', label: 'Dom' },
]

// key 取位次而不是 value：value 换掉时 React 复用同一个 DOM 节点，
// 「节点还在、身份变了」这一路才演得出来
function treeTree(values: readonly string[]): ReactNode {
  return (
    <XhTreeRoot collection={TREE_COLLECTION}>
      <XhTreeTree>
        {values.map((value, i) => (
          <XhTreeItem key={i} value={value}><XhTreeItemText>{value}</XhTreeItemText></XhTreeItem>
        ))}
      </XhTreeTree>
    </XhTreeRoot>
  )
}

describe('tree 的焦点落点如实上报', () => {
  it('持有焦点的节点被摘掉：焦点锚点当场清空，容器重新兜底进 Tab 序列', async () => {
    await mount(treeTree(['index', 'license']))
    const [, second] = parts('tree', 'item')
    await focus(second!)
    expect(parts('tree', 'tree')[0]!.getAttribute('tabindex')).toBe('-1')

    await rerender(treeTree(['index']))

    expect(parts('tree', 'item')).toHaveLength(1)
    expect(parts('tree', 'tree')[0]!.getAttribute('tabindex')).toBe('0')
  })

  it('持有焦点的节点换了身份：锚点跟着改记新值', async () => {
    await mount(treeTree(['index', 'license']))
    const [, second] = parts('tree', 'item')
    await focus(second!)
    expect(second!.getAttribute('tabindex')).toBe('0')

    // 同一个 DOM 节点复用，只是 value 换了：机器不重报就还记着已经不在场的旧值，
    // 那个锚点没有节点认领，整棵树于是一个 Tab 停靠点都没有
    await rerender(treeTree(['index', 'dom']))

    const nodes = parts('tree', 'item')
    expect(nodes[1]!.getAttribute('data-value')).toBe('dom')
    expect(nodes[1]!.getAttribute('tabindex')).toBe('0')
  })
})

const TRANSFER_COLLECTION = [
  { value: 'apple', label: 'Apple' },
  { value: 'berry', label: 'Berry' },
]

function transferTree(values: readonly string[]): ReactNode {
  return (
    <XhTransferRoot collection={TRANSFER_COLLECTION}>
      <XhTransferSourcePanel>
        <XhTransferList>
          {values.map(value => (
            <XhTransferItem key={value} value={value}><XhTransferItemText>{value}</XhTransferItemText></XhTransferItem>
          ))}
        </XhTransferList>
      </XhTransferSourcePanel>
    </XhTransferRoot>
  )
}

describe('transfer 的焦点落点如实上报', () => {
  it('持有焦点的条目被摘掉：本侧锚点当场清空，列表重新兜底进 Tab 序列', async () => {
    await mount(transferTree(['apple', 'berry']))
    const [, second] = parts('transfer', 'item')
    await focus(second!)
    expect(parts('transfer', 'list')[0]!.getAttribute('tabindex')).toBe('-1')

    await rerender(transferTree(['apple']))

    expect(parts('transfer', 'item')).toHaveLength(1)
    expect(parts('transfer', 'list')[0]!.getAttribute('tabindex')).toBe('0')
  })
})

// key 取位次而不是 itemId：id 换掉时 React 复用同一个 DOM 节点，
// 「节点还在、身份变了」这一路才演得出来
function feedTree(ids: readonly string[]): ReactNode {
  return (
    <XhMessageFeedRoot count={ids.length}>
      <XhMessageFeedViewport>
        <XhMessageFeedList>
          {ids.map((id, i) => (
            <XhMessageFeedItem key={i} itemId={id} itemIndex={i}>{id}</XhMessageFeedItem>
          ))}
        </XhMessageFeedList>
      </XhMessageFeedViewport>
    </XhMessageFeedRoot>
  )
}

describe('message-feed 的焦点落点如实上报', () => {
  it('持有焦点的条目被摘掉：焦点锚点当场清空，消息流重新兜底进 Tab 序列', async () => {
    await mount(feedTree(['m1', 'm2']))
    const [, second] = parts('message-feed', 'item')
    await focus(second!)
    expect(parts('message-feed', 'root')[0]!.getAttribute('tabindex')).toBe('-1')

    await rerender(feedTree(['m1']))

    expect(parts('message-feed', 'item')).toHaveLength(1)
    expect(parts('message-feed', 'root')[0]!.getAttribute('tabindex')).toBe('0')
  })

  it('持有焦点的条目换了身份：锚点跟着改记新值', async () => {
    await mount(feedTree(['m1', 'm2']))
    const [, second] = parts('message-feed', 'item')
    await focus(second!)
    expect(second!.getAttribute('tabindex')).toBe('0')

    // 同一个 DOM 节点复用，只是 itemId 换了：机器不重报就还记着已经不在场的旧值，
    // 那个锚点没有条目认领，整份消息流于是一个 Tab 停靠点都没有
    await rerender(feedTree(['m1', 'm3']))

    const items = parts('message-feed', 'item')
    expect(items[1]!.getAttribute('data-value')).toBe('m3')
    expect(items[1]!.getAttribute('tabindex')).toBe('0')
  })
})

const TABLE_COLUMNS = [{ id: 'name', label: 'Name' }]
const TABLE_ROWS = [{ id: 'a' }, { id: 'b' }]

function tableTree(values: readonly string[]): ReactNode {
  return (
    <XhTableRoot columns={TABLE_COLUMNS} rows={TABLE_ROWS}>
      <XhTableBody>
        {values.map(value => (
          <XhTableRow key={value} value={value}><XhTableCell value="name">{value}</XhTableCell></XhTableRow>
        ))}
      </XhTableBody>
    </XhTableRoot>
  )
}

describe('table 的焦点落点如实上报', () => {
  it('持有焦点的数据行被摘掉：焦点锚点当场清空，表体重新兜底进 Tab 序列', async () => {
    await mount(tableTree(['a', 'b']))
    const [, second] = parts('table', 'row')
    await focus(second!)
    expect(parts('table', 'body')[0]!.getAttribute('tabindex')).toBe('-1')

    await rerender(tableTree(['a']))

    expect(parts('table', 'row')).toHaveLength(1)
    expect(parts('table', 'body')[0]!.getAttribute('tabindex')).toBe('0')
  })
})
