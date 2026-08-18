// @vitest-environment jsdom
import { onDiagnostic, resetDiagnostics } from '@xihan-ui/kernel'
import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vitest'
import { defineComponent, h } from 'vue'
import { XhSeparator } from '../src'

afterEach(() => {
  document.body.innerHTML = ''
  resetDiagnostics()
})

/** 收集本次挂载期间投递的诊断码。 */
function collect(render: () => unknown): { codes: string[], root: HTMLElement } {
  const codes: string[] = []
  const off = onDiagnostic(d => void codes.push(d.code))
  const w = mount(defineComponent({ setup: () => render }), { attachTo: document.body })
  off()
  const root = w.element as HTMLElement
  return { codes, root }
}

describe('分隔线的插槽', () => {
  it('给了默认插槽就投一条诊断', () => {
    const { codes } = collect(() => h('div', [h(XhSeparator, null, () => '或')]))
    expect(codes).toContain('core.ignored-slot')
  })

  it('插槽内容不进 DOM', () => {
    const { root } = collect(() => h('div', [h(XhSeparator, null, () => '或')]))
    expect(root.textContent).toBe('')
  })

  it('不给插槽时不投诊断', () => {
    const { codes } = collect(() => h('div', [h(XhSeparator)]))
    expect(codes).not.toContain('core.ignored-slot')
  })
})
