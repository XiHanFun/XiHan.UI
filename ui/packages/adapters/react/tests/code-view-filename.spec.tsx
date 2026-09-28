// @vitest-environment jsdom
// 文件名部件留空：显示根上的 filename。pre 的可访问名指向这个节点，它空着读屏就读空。
import { cleanup, render } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { XhCodeViewFilename, XhCodeViewHeader, XhCodeViewPre, XhCodeViewRoot } from '../src'

afterEach(cleanup)

function view(filename?: string, children?: string): HTMLElement {
  const { container } = render(
    <XhCodeViewRoot code="a" filename="store.ts" highlighter={null}>
      <XhCodeViewHeader>
        <XhCodeViewFilename filename={filename}>{children}</XhCodeViewFilename>
      </XhCodeViewHeader>
      <XhCodeViewPre />
    </XhCodeViewRoot>,
  )
  return container
}

describe('code-view 文件名', () => {
  it('部件留空时显示根上的 filename，pre 的可访问名念得出来', () => {
    const container = view()
    const node = container.querySelector<HTMLElement>('[data-part="filename"]')!
    expect(node.textContent).toBe('store.ts')
    expect(container.querySelector('[data-part="pre"]')!.getAttribute('aria-labelledby')).toBe(node.id)
  })

  it('部件自己的 filename 与 children 优先', () => {
    expect(view('other.ts').querySelector('[data-part="filename"]')!.textContent).toBe('other.ts')
    expect(view(undefined, 'src/store.ts').querySelector('[data-part="filename"]')!.textContent).toBe('src/store.ts')
  })
})
