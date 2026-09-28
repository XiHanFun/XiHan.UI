// @vitest-environment jsdom
// 流式正文的行内挂点：作者的引用角标与公式节点传送进 html 里的占位节点。
import type { MarkdownBlock } from '@xihan-ui/headless'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { h, nextTick } from 'vue'
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

function render(blocks: readonly MarkdownBlock[], withSlots = true) {
  return mount(XhMarkdownStreamRoot, {
    props: { blocks },
    slots: {
      default: () => h(XhMarkdownStreamContent, null, withSlots
        ? {
            citation: ({ sourceIds }: { sourceIds: readonly string[] }) => [h('b', { class: 'cite' }, sourceIds.join(','))],
            math: ({ source }: { source: string }) => [h('i', { class: 'tex' }, source)],
          }
        : {}),
    },
    attachTo: document.body,
  })
}

describe('xhMarkdownStreamContent 行内挂点', () => {
  it('插槽内容渲进占位节点，降级内容清掉', async () => {
    const wrapper = render([cited('0:a', '结论')])
    await nextTick()
    await nextTick()
    const citation = wrapper.element.querySelector('[data-md-citation]')!
    expect(citation.innerHTML).toBe('<b class="cite">report</b>')
    expect(wrapper.element.querySelector('[data-md-math]')!.innerHTML).toBe('<i class="tex">x^2</i>')
    wrapper.unmount()
  })

  it('没写插槽时占位节点保留降级内容', async () => {
    const wrapper = render([cited('0:a', '结论')], false)
    await nextTick()
    expect(wrapper.element.querySelector('[data-md-citation]')!.textContent).toBe('[report]')
    wrapper.unmount()
  })

  it('生长块换了 html，角标跟到新的占位节点里', async () => {
    const wrapper = render([cited('live', '还在')])
    await nextTick()
    await nextTick()
    await wrapper.setProps({ blocks: [cited('live', '还在写')] })
    await nextTick()
    await nextTick()
    const holders = wrapper.element.querySelectorAll('[data-md-citation]')
    expect(holders).toHaveLength(1)
    expect(holders[0]!.innerHTML).toBe('<b class="cite">report</b>')
    expect(wrapper.element.textContent).toContain('还在写')
    wrapper.unmount()
  })
})
