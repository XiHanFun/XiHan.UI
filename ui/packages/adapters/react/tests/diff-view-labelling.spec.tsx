// @vitest-environment jsdom
// 表格的可访问名：渲了头部就指向头部；没渲头部（多文件放进折叠面板时常见）直接用路径，不指向不存在的 id。
import { cleanup, render } from '@testing-library/react'
import { computeTextDiff } from '@xihan-ui/headless'
import { afterEach, describe, expect, it } from 'vitest'
import { XhDiffViewBody, XhDiffViewHeader, XhDiffViewRoot, XhDiffViewViewport } from '../src'

afterEach(cleanup)

const model = { ...computeTextDiff('a', 'b'), newPath: 'src/a.ts' }

function view(withHeader: boolean): HTMLElement {
  const { container } = render(
    <XhDiffViewRoot model={model}>
      {withHeader ? <XhDiffViewHeader>src/a.ts</XhDiffViewHeader> : null}
      <XhDiffViewViewport>
        <XhDiffViewBody />
      </XhDiffViewViewport>
    </XhDiffViewRoot>,
  )
  return container
}

describe('diff-view 表格的可访问名', () => {
  it('渲了头部：aria-labelledby 指向头部', () => {
    const container = view(true)
    const body = container.querySelector('[data-part="body"]')!
    expect(body.getAttribute('aria-labelledby')).toBe(container.querySelector('[data-part="header"]')!.id)
    expect(body.hasAttribute('aria-label')).toBe(false)
  })

  it('没渲头部：直接用路径作名字，不留悬空的 aria-labelledby', () => {
    const body = view(false).querySelector('[data-part="body"]')!
    expect(body.hasAttribute('aria-labelledby')).toBe(false)
    expect(body.getAttribute('aria-label')).toBe('src/a.ts')
  })
})
