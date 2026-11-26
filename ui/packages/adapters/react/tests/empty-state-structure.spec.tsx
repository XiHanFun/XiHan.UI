// @vitest-environment jsdom
// 不给 children 时照 emptyStateStructure 铺：标题与说明是字符串时作文字，插画、图标与操作区由同名部件装着。
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { XhEmptyStateAction, XhEmptyStateDescription, XhEmptyStateIndicator, XhEmptyStateRoot, XhEmptyStateTitle } from '../src'

let root: ReturnType<typeof createRoot> | null = null

beforeEach(() => {
  ;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true
})

afterEach(() => {
  act(() => root?.unmount())
  root = null
  document.body.innerHTML = ''
})

async function render(node: React.ReactNode): Promise<HTMLElement> {
  act(() => root?.unmount())
  document.body.innerHTML = ''
  const host = document.createElement('div')
  document.body.appendChild(host)
  root = createRoot(host)
  await act(async () => {
    root!.render(node)
  })
  return host
}

function skeleton(host: Element): string[] {
  return Array.from(host.querySelectorAll('[data-scope="empty-state"][data-part]'), el => `${el.localName}|${el.getAttribute('data-part')}|${el.textContent}`)
}

describe('empty-state 的标准结构', () => {
  it('title、description、indicator、action 铺出的树与手写全套部件一致', async () => {
    const auto = skeleton(await render(
      <XhEmptyStateRoot
        indicator="∅"
        title="还没有任何工单"
        description="新建一条工单，或者换个筛选条件再看看。"
        action={<button type="button">新建工单</button>}
      />,
    ))
    const manual = skeleton(await render(
      <XhEmptyStateRoot>
        <XhEmptyStateIndicator>∅</XhEmptyStateIndicator>
        <XhEmptyStateTitle>还没有任何工单</XhEmptyStateTitle>
        <XhEmptyStateDescription>新建一条工单，或者换个筛选条件再看看。</XhEmptyStateDescription>
        <XhEmptyStateAction><button type="button">新建工单</button></XhEmptyStateAction>
      </XhEmptyStateRoot>,
    ))
    expect(auto).toEqual(manual)
    expect(auto.map(row => row.split('|')[1])).toEqual(['root', 'indicator', 'title', 'description', 'action'])
  })

  it('只给说明就只铺说明；root 上的 title 不再落成原生提示', async () => {
    const host = await render(<XhEmptyStateRoot description="换个关键词试试" />)
    expect(skeleton(host).map(row => row.split('|')[1])).toEqual(['root', 'description'])
    const titled = await render(<XhEmptyStateRoot title="没有匹配的结果" />)
    expect(titled.querySelector('[data-part="root"]')!.hasAttribute('title')).toBe(false)
  })
})
