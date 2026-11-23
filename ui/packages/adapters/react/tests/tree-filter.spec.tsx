// @vitest-environment jsdom
// 树的关键词过滤：裁剪与搜索视图在 Headless，这里核 React 这一侧的接线——filterText 透传、标准结构跟着裁、载荷里的 searching。
import type { ReactNode } from 'react'
import type { Root } from 'react-dom/client'
import type { TreeRootSlotProps } from '../src'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, describe, expect, it } from 'vitest'
import { XhTreeRoot } from '../src'

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true })

let host: HTMLElement | null = null
let root: Root | null = null

afterEach(async () => {
  if (root)
    await act(async () => root!.unmount())
  host?.remove()
  document.body.innerHTML = ''
  root = null
  host = null
})

const COLLECTION = [
  { value: 'src', label: 'Source', children: [{ value: 'index', label: 'Index' }, { value: 'utils', label: 'Utils' }] },
  { value: 'docs', label: 'Docs', children: [{ value: 'guide', label: 'Guide' }] },
  { value: 'license', label: 'License' },
]

const NODES = '[data-scope="tree"]:is([data-part="branch"], [data-part="item"])'
const DOCS = '[data-scope="tree"][data-part="branch"][data-value="docs"]'

async function render(node: ReactNode): Promise<void> {
  if (!root) {
    host = document.createElement('div')
    document.body.append(host)
    root = createRoot(host)
  }
  await act(async () => root!.render(node))
}

/** 此刻铺出来的节点值，按文档次序。 */
function nodes(): string[] {
  return [...document.querySelectorAll<HTMLElement>(NODES)].map(el => el.getAttribute('data-value')!)
}

describe('xhTree 的 filterText', () => {
  it('标准结构跟着检索词裁：只铺命中的那几枝，祖先展开；清空即铺回整棵', async () => {
    await render(<XhTreeRoot collection={COLLECTION} filterText="" />)
    expect(nodes()).toEqual(['src', 'index', 'utils', 'docs', 'guide', 'license'])

    await render(<XhTreeRoot collection={COLLECTION} filterText="guide" />)
    expect(nodes()).toEqual(['docs', 'guide'])
    expect(document.querySelector(DOCS)!.getAttribute('aria-expanded')).toBe('true')

    await render(<XhTreeRoot collection={COLLECTION} filterText="" />)
    expect(nodes()).toEqual(['src', 'index', 'utils', 'docs', 'guide', 'license'])
    expect(document.querySelector(DOCS)!.getAttribute('aria-expanded')).toBe('false')
  })

  it('函数式 children 的载荷带 searching', async () => {
    let scope!: TreeRootSlotProps
    await render(
      <XhTreeRoot collection={COLLECTION} filterText="utils">
        {(payload) => {
          scope = payload
          return null
        }}
      </XhTreeRoot>,
    )
    expect(scope.searching).toBe(true)
    expect(scope.visibleNodes.map(node => node.value)).toEqual(['src', 'utils'])
  })
})
