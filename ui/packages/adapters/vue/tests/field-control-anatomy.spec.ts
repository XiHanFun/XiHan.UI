// @vitest-environment jsdom
// XhFieldControl 合并属性时的角色标记归属：子节点是裸控件就把 field/control 标上去，
// 子节点自带角色标记（组件根、或写了 data-scope 的元素）则只落 id 与 aria-*。
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h } from 'vue'
import { XhFieldControl, XhFieldLabel, XhFieldRoot, XhSwitch } from '../src'

let cleanup: Array<() => void> = []

afterEach(() => {
  for (const fn of cleanup) fn()
  cleanup = []
  document.body.innerHTML = ''
})

function mountField(child: () => unknown): HTMLElement {
  const host = document.createElement('div')
  document.body.appendChild(host)
  const app = createApp({
    setup: () => () =>
      h(XhFieldRoot, null, () => [
        h(XhFieldLabel, () => '开关'),
        h(XhFieldControl, () => [child()]),
      ]),
  })
  app.mount(host)
  cleanup.push(() => {
    app.unmount()
    host.remove()
  })
  return host
}

describe('field control 的角色标记', () => {
  it('裸控件收下 field/control 标记与接线属性', () => {
    const host = mountField(() => h('input'))
    const input = host.querySelector('input')!

    expect(input.getAttribute('data-scope')).toBe('field')
    expect(input.getAttribute('data-part')).toBe('control')
    expect(input.id).not.toBe('')
    expect(input.getAttribute('aria-labelledby')).toBe(host.querySelector('label')!.id)
  })

  it('组件节点保住自己的角色标记，只收接线属性', () => {
    const host = mountField(() => h(XhSwitch))
    const root = host.querySelector('[data-scope=\'switch\']')!

    expect(root.getAttribute('data-part')).toBe('root')
    expect(root.id).not.toBe('')
    expect(root.getAttribute('aria-labelledby')).toBe(host.querySelector('label')!.id)
    expect(host.querySelector('[data-scope=\'field\'][data-part=\'control\']')).toBeNull()
  })

  it('元素节点写了 data-scope 时同样不被覆盖', () => {
    const host = mountField(() => h('div', { 'data-scope': 'diagram', 'data-part': 'canvas' }))
    const node = host.querySelector('[data-scope=\'diagram\']')!

    expect(node.getAttribute('data-part')).toBe('canvas')
    expect(node.id).not.toBe('')
  })
})
