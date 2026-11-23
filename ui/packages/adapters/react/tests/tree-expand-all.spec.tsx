// @vitest-environment jsdom
// 默认全部展开与全部展开 / 收起：判据在 Headless，这里核 React 这一侧的接线——prop 透传、数据晚到、函数式 children 载荷里的两个动作。
import type { ReactNode } from 'react'
import type { Root } from 'react-dom/client'
import type { TreeRootSlotProps } from '../src'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { XhTreeRoot, XhTreeSelectRoot } from '../src'

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
  { value: 'src', label: '源码', children: [{ value: 'utils', label: '工具', children: [{ value: 'dom', label: 'dom' }] }] },
  { value: 'docs', label: '文档', children: [{ value: 'guide', label: '指南' }] },
  { value: 'license', label: '许可' },
]

async function render(node: ReactNode): Promise<void> {
  if (!root) {
    host = document.createElement('div')
    document.body.append(host)
    root = createRoot(host)
  }
  await act(async () => root!.render(node))
}

/** 各分支此刻的展开态，按文档次序。 */
function expanded(scope: string): Array<[string, string | null]> {
  return [...document.querySelectorAll<HTMLElement>(`[data-scope="${scope}"][data-part="branch"]`)]
    .map(el => [el.getAttribute('data-value')!, el.getAttribute('aria-expanded')])
}

describe('xhTree 的全部展开', () => {
  it('defaultExpandAll：挂上即逐层展开，不发变更回调', async () => {
    const onChange = vi.fn()
    await render(<XhTreeRoot collection={COLLECTION} defaultExpandAll onExpandedValueChange={onChange} />)

    expect(expanded('tree')).toEqual([['src', 'true'], ['utils', 'true'], ['docs', 'true']])
    expect(onChange).not.toHaveBeenCalled()
  })

  it('数据晚到：collection 先是空的，换上数据后才展开，并发一次变更回调', async () => {
    const onChange = vi.fn()
    const empty: typeof COLLECTION = []
    await render(<XhTreeRoot collection={empty} defaultExpandAll onExpandedValueChange={onChange} />)
    expect(expanded('tree')).toEqual([])

    await render(<XhTreeRoot collection={COLLECTION} defaultExpandAll onExpandedValueChange={onChange} />)
    expect(expanded('tree')).toEqual([['src', 'true'], ['utils', 'true'], ['docs', 'true']])
    expect(onChange).toHaveBeenCalledTimes(1)
    expect(onChange).toHaveBeenCalledWith({ value: ['src', 'utils', 'docs'] })
  })

  it('函数式 children 的载荷带 expandAll / collapseAll', async () => {
    let scope!: TreeRootSlotProps
    await render(
      <XhTreeRoot collection={COLLECTION}>
        {(payload) => {
          scope = payload
          return null
        }}
      </XhTreeRoot>,
    )
    expect(scope.expandedValue).toEqual([])

    await act(async () => scope.expandAll())
    expect(scope.expandedValue).toEqual(['src', 'utils', 'docs'])

    await act(async () => scope.collapseAll())
    expect(scope.expandedValue).toEqual([])
  })
})

describe('xhTreeSelect 的全部展开', () => {
  it('defaultExpandAll：浮层一开，树里的分支都是展开的', async () => {
    await render(<XhTreeSelectRoot collection={COLLECTION} defaultExpandAll defaultOpen />)

    expect(expanded('tree-select')).toEqual([['src', 'true'], ['utils', 'true'], ['docs', 'true']])
  })
})
