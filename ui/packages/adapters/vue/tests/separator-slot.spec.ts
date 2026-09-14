import { mount } from '@vue/test-utils'
// @vitest-environment jsdom
import { onDiagnostic, resetDiagnostics } from '@xihan-ui/core'
import { afterEach, describe, expect, it } from 'vitest'
import { Comment, defineComponent, h } from 'vue'
import { XhSeparator, XhSeparatorContent, XhSeparatorLine, XhSeparatorRoot } from '../src'

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

function partOf(root: HTMLElement, part: string): HTMLElement | null {
  return root.querySelector<HTMLElement>(`[data-scope='separator'][data-part='${part}']`)
}

describe('分隔线的插槽', () => {
  it('给了默认插槽就排成「线 · 文字 · 线」三段', () => {
    const { root } = collect(() => h('div', [h(XhSeparator, null, () => '或')]))
    expect(root.querySelectorAll('[data-part=\'line\']').length).toBe(2)
    expect(partOf(root, 'content')?.textContent).toBe('或')
  })

  it('给了默认插槽不再投诊断', () => {
    const { codes } = collect(() => h('div', [h(XhSeparator, null, () => '或')]))
    expect(codes).not.toContain('core.ignored-slot')
  })

  it('不给插槽时仍是单节点的一条线', () => {
    const { root } = collect(() => h('div', [h(XhSeparator)]))
    expect(partOf(root, 'line')).toBeNull()
    expect(partOf(root, 'content')).toBeNull()
    expect(partOf(root, 'root')?.getAttribute('role')).toBe('separator')
  })

  it('插槽里只有注释时按没给算', () => {
    const { root } = collect(() => h('div', [h(XhSeparator, null, () => [h(Comment)])]))
    expect(partOf(root, 'content')).toBeNull()
  })

  it('两条线是纯装饰，语义只留在 root 上', () => {
    const { root } = collect(() => h('div', [h(XhSeparator, null, () => '或')]))
    expect(partOf(root, 'root')?.getAttribute('role')).toBe('separator')
    expect(partOf(root, 'line')?.getAttribute('role')).toBe('none')
  })

  it('拆开写的三个部件与一体式写法产出同一副结构', () => {
    const { root } = collect(() => h('div', [
      h(XhSeparatorRoot, null, () => [
        h(XhSeparatorLine),
        h(XhSeparatorContent, null, () => '或'),
        h(XhSeparatorLine),
      ]),
    ]))
    expect(root.querySelectorAll('[data-part=\'line\']').length).toBe(2)
    expect(partOf(root, 'content')?.textContent).toBe('或')
  })

  it('形态与虚线落在 root 上，缺省档不写属性', () => {
    const { root } = collect(() => h('div', [
      h(XhSeparator, { variant: 'strong', dashed: true, align: 'start' }, () => '或'),
    ]))
    const el = partOf(root, 'root')
    expect(el?.getAttribute('data-variant')).toBe('strong')
    expect(el?.getAttribute('data-dashed')).toBe('')
    expect(el?.getAttribute('data-align')).toBe('start')

    const { root: bare } = collect(() => h('div', [h(XhSeparator)]))
    const plain = partOf(bare, 'root')
    expect(plain?.hasAttribute('data-variant')).toBe(false)
    expect(plain?.hasAttribute('data-dashed')).toBe(false)
    expect(plain?.hasAttribute('data-align')).toBe(false)
  })
})
