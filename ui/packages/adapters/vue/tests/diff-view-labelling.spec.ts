// @vitest-environment jsdom
// 表格的可访问名：渲了头部就指向头部；没渲头部（多文件放进折叠面板时常见）直接用路径，不指向不存在的 id。
import { mount } from '@vue/test-utils'
import { computeTextDiff } from '@xihan-ui/headless'
import { describe, expect, it } from 'vitest'
import { h } from 'vue'
import { XhDiffViewBody, XhDiffViewHeader, XhDiffViewRoot, XhDiffViewViewport } from '../src'

const model = { ...computeTextDiff('a', 'b'), newPath: 'src/a.ts' }

function render(withHeader: boolean) {
  return mount(XhDiffViewRoot, {
    props: { model },
    slots: {
      default: () => [
        withHeader ? h(XhDiffViewHeader, null, () => 'src/a.ts') : null,
        h(XhDiffViewViewport, null, () => h(XhDiffViewBody)),
      ],
    },
  })
}

describe('diff-view 表格的可访问名', () => {
  it('渲了头部：aria-labelledby 指向头部', async () => {
    const wrapper = render(true)
    await wrapper.vm.$nextTick()
    const body = wrapper.get('[data-part="body"]')
    expect(body.attributes('aria-labelledby')).toBe(wrapper.get('[data-part="header"]').attributes('id'))
    expect(body.attributes('aria-label')).toBeUndefined()
  })

  it('没渲头部：直接用路径作名字，不留悬空的 aria-labelledby', async () => {
    const wrapper = render(false)
    await wrapper.vm.$nextTick()
    const body = wrapper.get('[data-part="body"]')
    expect(body.attributes('aria-labelledby')).toBeUndefined()
    expect(body.attributes('aria-label')).toBe('src/a.ts')
  })
})
