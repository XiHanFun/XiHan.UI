// @vitest-environment jsdom
// 流式正文的行内挂点：作者的引用角标与公式节点经 portal 渲进 html 里的占位节点。
import type { MarkdownBlock } from '@xihan-ui/headless'
import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { XhMarkdownStreamContent, XhMarkdownStreamRoot } from '../src/components/markdown-stream/markdown-stream'

function cited(key: string, text: string): MarkdownBlock {
  return {
    key,
    kind: 'markdown',
    html: `<p>${text}<span data-md-inline="0" data-md-citation="report">[report]</span><span data-md-inline="1" data-md-math="inline">x^2</span></p>`,
    complete: key !== 'live',
    inlines: [
      { kind: 'citation', sourceIds: ['report'] },
      { kind: 'math', source: 'x^2', display: false },
    ],
  }
}

function view(blocks: readonly MarkdownBlock[], withRender = true) {
  return (
    <XhMarkdownStreamRoot blocks={blocks}>
      <XhMarkdownStreamContent
        renderCitation={withRender ? ({ sourceIds }) => <b className="cite">{sourceIds.join(',')}</b> : undefined}
        renderMath={withRender ? ({ source }) => <i className="tex">{source}</i> : undefined}
      />
    </XhMarkdownStreamRoot>
  )
}

describe('xhMarkdownStreamContent 行内挂点', () => {
  it('渲染函数的产物进占位节点，降级内容清掉', () => {
    const { container } = render(view([cited('0:a', '结论')]))
    expect(container.querySelector('[data-md-citation]')!.innerHTML).toBe('<b class="cite">report</b>')
    expect(container.querySelector('[data-md-math]')!.innerHTML).toBe('<i class="tex">x^2</i>')
  })

  it('没传渲染函数时占位节点保留降级内容', () => {
    const { container } = render(view([cited('0:a', '结论')], false))
    expect(container.querySelector('[data-md-citation]')!.textContent).toBe('[report]')
  })

  it('生长块换了 html，角标跟到新的占位节点里', () => {
    const { container, rerender } = render(view([cited('live', '还在')]))
    rerender(view([cited('live', '还在写')]))
    const holders = container.querySelectorAll('[data-md-citation]')
    expect(holders).toHaveLength(1)
    expect(holders[0]!.innerHTML).toBe('<b class="cite">report</b>')
    expect(container.textContent).toContain('还在写')
  })
})
