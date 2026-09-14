// @vitest-environment jsdom
// 单体复选框 / 开关的文字标签：给了默认插槽就用 <label> 包住控件与文字，
// 点文字即切换、可及名从文字来；没给文字仍只渲染控件本身，DOM 契约不变。
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createApp, createCommentVNode, h, nextTick } from 'vue'
import { XhCheckbox, XhSwitch } from '../src'

async function tick(): Promise<void> {
  await nextTick()
  await nextTick()
}

let cleanup: Array<() => void> = []

afterEach(() => {
  for (const fn of cleanup) fn()
  cleanup = []
  document.body.innerHTML = ''
})

function mount(render: () => unknown): void {
  const host = document.createElement('div')
  document.body.appendChild(host)
  const app = createApp({ setup: () => render })
  app.mount(host)
  cleanup.push(() => {
    app.unmount()
    host.remove()
  })
}

function el(selector: string): HTMLElement {
  const hit = document.querySelector<HTMLElement>(selector)
  if (!hit)
    throw new Error(`找不到 ${selector}`)
  return hit
}

describe.each([
  { name: '复选框', scope: 'checkbox', Comp: XhCheckbox },
  { name: '开关', scope: 'switch', Comp: XhSwitch },
])('$name 的文字标签', ({ scope, Comp }) => {
  it('没给文字：只有控件本身，没有 label 包裹', async () => {
    mount(() => h(Comp))
    await tick()
    expect(document.querySelector(`[data-scope="${scope}"][data-part="label"]`)).toBeNull()
    expect(el(`[data-scope="${scope}"][data-part="root"]`).tagName).toBe('BUTTON')
  })

  it('给了文字：label 包住 root 与 text，root 仍是 button', async () => {
    mount(() => h(Comp, null, () => '记住我'))
    await tick()
    const label = el(`[data-scope="${scope}"][data-part="label"]`)
    expect(label.tagName).toBe('LABEL')
    const root = el(`[data-scope="${scope}"][data-part="root"]`)
    expect(root.tagName).toBe('BUTTON')
    expect(label.contains(root)).toBe(true)
    expect(el(`[data-scope="${scope}"][data-part="text"]`).textContent).toBe('记住我')
  })

  it('点文字即切换：label 激活里面的 button', async () => {
    const onUpdate = vi.fn()
    mount(() => h(Comp, { 'onUpdate:checked': onUpdate }, () => '记住我'))
    await tick()
    el(`[data-scope="${scope}"][data-part="text"]`).click()
    await tick()
    expect(onUpdate).toHaveBeenCalledWith(true)
    expect(el(`[data-scope="${scope}"][data-part="root"]`).getAttribute('data-state')).toBe('checked')
  })

  it('禁用与状态落到 label 与 text 上，皮肤才能整行变灰', async () => {
    mount(() => h(Comp, { disabled: true, checked: true }, () => '记住我'))
    await tick()
    const label = el(`[data-scope="${scope}"][data-part="label"]`)
    expect(label.hasAttribute('data-disabled')).toBe(true)
    expect(label.getAttribute('data-state')).toBe('checked')
    expect(el(`[data-scope="${scope}"][data-part="text"]`).hasAttribute('data-disabled')).toBe(true)
  })

  it('插槽只有注释或空白不算文字：仍只渲染控件', async () => {
    mount(() => h(Comp, null, () => [createCommentVNode('v-if')]))
    await tick()
    // 注释节点占着插槽的位置，一个像素都不画，不该为它套 label
    expect(document.querySelector(`[data-scope="${scope}"][data-part="label"]`)).toBeNull()
  })
})
