// @vitest-environment jsdom
//
// 两处「看 children 决定渲什么」的分支，共享一致性套件都咬不到：
// 套件的 fixture 总是把部件一个不落地写全，`XhSeparator` 的三段拼装与 `XhTagRoot`
// 替纯文字补 label 这两条路一次都走不到。写错了套件照样全绿——
// 分隔线会连成一条没有断口的线，标签的文字会直接摊在 root 上、把关闭钮挤出去。
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { XhSeparator, XhTagCloseTrigger, XhTagLabel, XhTagRoot } from '../src'

let host: HTMLElement | null = null
let root: ReturnType<typeof createRoot> | null = null

beforeEach(() => {
  ;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true
})

afterEach(() => {
  act(() => root?.unmount())
  host?.remove()
  host = null
  root = null
})

function mount(node: React.ReactNode): void {
  host = document.createElement('div')
  document.body.append(host)
  root = createRoot(host)
  act(() => root!.render(node))
}

/** 某个 scope 下某个部件的节点，按文档序。 */
function parts(scope: string, part: string): HTMLElement[] {
  return [...host!.querySelectorAll<HTMLElement>(`[data-scope="${scope}"][data-part="${part}"]`)]
}

describe('xhSeparator 的一步到位写法', () => {
  it('不给 children：只有一条线，不拼三段', () => {
    mount(<XhSeparator />)
    expect(parts('separator', 'root')).toHaveLength(1)
    expect(parts('separator', 'line')).toHaveLength(0)
    expect(parts('separator', 'content')).toHaveLength(0)
  })

  it('空白 children 不算给了文案：仍是一条线', () => {
    mount(<XhSeparator>{' '}</XhSeparator>)
    expect(parts('separator', 'content')).toHaveLength(0)
  })

  it('假分支留下的 children 不算给了文案：仍是一条线', () => {
    mount(<XhSeparator>{false && <span>或</span>}</XhSeparator>)
    expect(parts('separator', 'content')).toHaveLength(0)
  })

  it('给了文案：排成「线 · 文字 · 线」三段', () => {
    mount(<XhSeparator>或</XhSeparator>)
    expect(parts('separator', 'line')).toHaveLength(2)
    const content = parts('separator', 'content')
    expect(content).toHaveLength(1)
    expect(content[0]!.textContent).toBe('或')
    // 文字夹在两条线中间，不是排在末尾
    const order = [...host!.querySelectorAll<HTMLElement>('[data-scope="separator"][data-part]')]
      .map(el => el.dataset.part)
    expect(order).toEqual(['root', 'line', 'content', 'line'])
  })
})

describe('xhTagRoot 的默认内容', () => {
  it('只有文字：替作者补一层 label 承载它', () => {
    mount(<XhTagRoot>前端</XhTagRoot>)
    const label = parts('tag', 'label')
    expect(label).toHaveLength(1)
    expect(label[0]!.textContent).toBe('前端')
  })

  it('作者自己写了节点：一个都不动，不再补 label', () => {
    mount(
      <XhTagRoot closable>
        <XhTagLabel>前端</XhTagLabel>
        <XhTagCloseTrigger>×</XhTagCloseTrigger>
      </XhTagRoot>,
    )
    expect(parts('tag', 'label')).toHaveLength(1)
    expect(parts('tag', 'close-trigger')).toHaveLength(1)
  })

  it('文字里夹着节点：整份原样放行，不补 label', () => {
    mount(
      <XhTagRoot>
        前端
        <span data-testid="dot">·</span>
      </XhTagRoot>,
    )
    expect(parts('tag', 'label')).toHaveLength(0)
    expect(host!.querySelector('[data-testid="dot"]')).not.toBeNull()
  })
})
