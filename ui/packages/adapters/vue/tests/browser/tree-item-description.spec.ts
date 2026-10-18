// 叶子行与分支行的说明落在名称下面那一行：窄容器里不和名称挤在一行，也不把树撑出横向滚动。
//
// 只有真实浏览器量得出来：靠的是行盒的实际排布，jsdom 不排版。
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import {
  XhTreeBranch,
  XhTreeBranchContent,
  XhTreeBranchControl,
  XhTreeBranchDescription,
  XhTreeBranchText,
  XhTreeBranchTrigger,
  XhTreeItem,
  XhTreeItemDescription,
  XhTreeItemIndicator,
  XhTreeItemText,
  XhTreeRoot,
  XhTreeTree,
} from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

const collection = [
  {
    value: 'order',
    label: '订单',
    children: [
      { value: 'no', label: '订单号', description: '系统生成的唯一编号，打印在单据抬头与条码里' },
      { value: 'date', label: '下单日期' },
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

async function mountTree(branchDescription = false): Promise<HTMLElement> {
  host = document.createElement('div')
  host.style.inlineSize = '200px'
  document.body.append(host)
  app = createApp({
    render: () => h(XhTreeRoot, { 'collection': collection, 'defaultExpandedValue': ['order'], 'aria-label': '字段' }, () =>
      h(XhTreeTree, null, () => h(XhTreeBranch, { value: 'order' }, () => [
        h(XhTreeBranchControl, null, () => [
          h(XhTreeBranchTrigger),
          h(XhTreeBranchText, null, () => '订单'),
          ...(branchDescription ? [h(XhTreeBranchDescription, null, () => '一笔订单抬头上的字段，打印时排在单据最上方')] : []),
        ]),
        h(XhTreeBranchContent, null, () => collection[0]!.children.map(field =>
          h(XhTreeItem, { key: field.value, value: field.value }, () => [
            h(XhTreeItemText, null, () => field.label),
            ...(field.description ? [h(XhTreeItemDescription, null, () => field.description)] : []),
            h(XhTreeItemIndicator),
          ]),
        )),
      ]))),
  })
  app.mount(host)
  await nextTick()
  await new Promise(resolve => requestAnimationFrame(resolve))
  return host
}

function part(root: HTMLElement, name: string, value?: string): HTMLElement {
  const scope = value === undefined ? root : root.querySelector<HTMLElement>(`[data-scope="tree"][data-part="item"][data-value="${value}"]`)!
  return scope.querySelector<HTMLElement>(`[data-scope="tree"][data-part="${name}"]`)!
}

describe('tree 叶子行的说明', () => {
  it('说明落在名称下面一行，与名称同一起点', async () => {
    const root = await mountTree()
    const text = part(root, 'item-text', 'no').getBoundingClientRect()
    const description = part(root, 'item-description', 'no').getBoundingClientRect()
    expect(description.top).toBeGreaterThanOrEqual(text.bottom - 1)
    expect(Math.abs(description.left - text.left)).toBeLessThanOrEqual(1)
  })

  it('窄容器里说明截断，不把行与树撑出横向滚动', async () => {
    const root = await mountTree()
    const tree = root.querySelector<HTMLElement>('[data-scope="tree"][data-part="tree"]')!
    const row = root.querySelector<HTMLElement>('[data-scope="tree"][data-part="item"][data-value="no"]')!
    const description = part(root, 'item-description', 'no')
    expect(tree.scrollWidth).toBeLessThanOrEqual(tree.clientWidth)
    expect(row.scrollWidth).toBeLessThanOrEqual(row.clientWidth)
    expect(description.getBoundingClientRect().right).toBeLessThanOrEqual(row.getBoundingClientRect().right + 0.5)
    expect(getComputedStyle(description).textOverflow).toBe('ellipsis')
  })

  it('没写说明的行仍是一行高', async () => {
    const root = await mountTree()
    const plain = root.querySelector<HTMLElement>('[data-scope="tree"][data-part="item"][data-value="date"]')!
    const described = root.querySelector<HTMLElement>('[data-scope="tree"][data-part="item"][data-value="no"]')!
    const branch = root.querySelector<HTMLElement>('[data-scope="tree"][data-part="branch-control"]')!
    expect(Math.abs(plain.getBoundingClientRect().height - branch.getBoundingClientRect().height)).toBeLessThanOrEqual(1)
    expect(described.getBoundingClientRect().height).toBeGreaterThan(plain.getBoundingClientRect().height)
  })
})

describe('tree 分支行的说明', () => {
  it('说明落在分支名下面一行，让出行首的展开箭头，文字与分支名同一起点', async () => {
    const root = await mountTree(true)
    const text = root.querySelector<HTMLElement>('[data-scope="tree"][data-part="branch-text"]')!.getBoundingClientRect()
    const description = root.querySelector<HTMLElement>('[data-scope="tree"][data-part="branch-description"]')!
    const box = description.getBoundingClientRect()
    expect(box.top).toBeGreaterThanOrEqual(text.bottom - 1)
    // 说明元素自己从行首起，让位写在行首内距里：比的是它文字的起点
    expect(Math.abs(box.left + Number.parseFloat(getComputedStyle(description).paddingInlineStart) - text.left)).toBeLessThanOrEqual(1)
  })

  it('窄容器里分支说明截断，不把分支行与树撑出横向滚动', async () => {
    const root = await mountTree(true)
    const tree = root.querySelector<HTMLElement>('[data-scope="tree"][data-part="tree"]')!
    const control = root.querySelector<HTMLElement>('[data-scope="tree"][data-part="branch-control"]')!
    const description = root.querySelector<HTMLElement>('[data-scope="tree"][data-part="branch-description"]')!
    expect(tree.scrollWidth).toBeLessThanOrEqual(tree.clientWidth)
    expect(control.scrollWidth).toBeLessThanOrEqual(control.clientWidth)
    expect(description.getBoundingClientRect().right).toBeLessThanOrEqual(control.getBoundingClientRect().right + 0.5)
    expect(getComputedStyle(description).textOverflow).toBe('ellipsis')
  })
})
