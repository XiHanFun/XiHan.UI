import type { App, VNode } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { userEvent } from 'vitest/browser'
import { createApp, h, nextTick } from 'vue'
import {
  XhInputGroupItem,
  XhInputGroupRoot,
  XhTextFieldControl,
  XhTextFieldInput,
  XhTextFieldRoot,
} from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let app: App | null = null
let host: HTMLElement | null = null

function isTransparentColor(value: string): boolean {
  return value === 'transparent' || /(?:,\s*0|\/\s*0)\)$/.test(value)
}

function field(label: string): VNode {
  return h(XhTextFieldRoot, { placeholder: label }, () => [
    h(XhTextFieldControl, null, () => [
      h(XhTextFieldInput, { 'aria-label': label }),
    ]),
  ])
}

function group(id: string): HTMLElement {
  return host!.querySelector<HTMLElement>(`[data-testid='${id}'][data-scope='input-group'][data-part='root']`)!
}

function control(id: string): HTMLElement {
  return group(id).querySelector<HTMLElement>('[data-xh-field-chrome]')!
}

async function mount(): Promise<void> {
  host = document.createElement('div')
  document.body.append(host)
  app = createApp({
    render: () => h('div', { style: 'display:flex;gap:16px' }, [
      h(XhInputGroupRoot, { 'data-testid': 'outline' }, () => [
        h(XhInputGroupItem, null, () => '@'),
        field('主要表面'),
      ]),
      h(XhInputGroupRoot, { 'data-testid': 'subtle', 'variant': 'subtle' }, () => [
        h(XhInputGroupItem, null, () => '@'),
        field('次级表面'),
      ]),
    ]),
  })
  app.mount(host)
  await nextTick()
}

afterEach(() => {
  app?.unmount()
  host?.remove()
  app = null
  host = null
})

describe('input-group 单一输入表面', () => {
  it('outline 组壳画字段描边且无影，subtle 淡底透明边且子控件不重复绘制表面', async () => {
    await mount()

    const outline = getComputedStyle(group('outline'))
    const subtle = getComputedStyle(group('subtle'))
    const outlineControl = getComputedStyle(control('outline'))
    const item = getComputedStyle(group('outline').querySelector('[data-part="item"]')!)

    // 边界只由描边承担：组壳静息无影（§8.3），外轮廓取字段描边色 --xh-border-control
    expect(outline.boxShadow).toBe('none')
    expect(subtle.boxShadow).toBe('none')
    expect(subtle.backgroundColor).not.toBe(outline.backgroundColor)
    expect(group('subtle').getAttribute('data-variant')).toBe('subtle')
    const outlineEdge = getComputedStyle(group('outline'), '::before')
    expect(outlineEdge.borderTopWidth).not.toBe('0px')
    const probe = document.createElement('span')
    probe.style.color = 'var(--xh-border-control)'
    group('outline').append(probe)
    expect(outlineEdge.borderTopColor).toBe(getComputedStyle(probe).color)
    probe.remove()
    expect(isTransparentColor(getComputedStyle(group('subtle'), '::before').borderTopColor)).toBe(true)
    expect(outlineControl.backgroundColor).toBe('rgba(0, 0, 0, 0)')
    expect(outlineControl.boxShadow).toBe('none')
    expect(item.backgroundColor).toBe('rgba(0, 0, 0, 0)')
  })

  it('hover 与键盘焦点只更新组的外表面，不改变控件几何', async () => {
    await mount()
    const root = group('outline')
    const input = root.querySelector<HTMLInputElement>('input')!
    const before = root.getBoundingClientRect()
    const restBackground = getComputedStyle(root).backgroundColor

    await userEvent.hover(root)
    expect(getComputedStyle(root).backgroundColor).not.toBe(restBackground)

    await userEvent.keyboard('{Tab}')
    input.focus()
    expect(root.matches(':focus-within')).toBe(true)
    expect(getComputedStyle(root).outlineStyle).toBe('solid')
    const nestedControl = getComputedStyle(control('outline'))
    expect(nestedControl.outlineStyle).toBe('none')
    expect(isTransparentColor(nestedControl.borderTopColor)).toBe(true)
    expect(isTransparentColor(nestedControl.backgroundColor)).toBe(true)
    expect(getComputedStyle(input).outlineStyle).toBe('none')
    expect(nestedControl.transitionDuration.split(', ').every(value => value === '0s')).toBe(true)

    input.blur()
    expect(isTransparentColor(getComputedStyle(control('outline')).borderTopColor)).toBe(true)
    await new Promise(resolve => setTimeout(resolve, 150))
    expect(isTransparentColor(getComputedStyle(control('outline')).borderTopColor)).toBe(true)

    const after = root.getBoundingClientRect()
    expect(after.width).toBe(before.width)
    expect(after.height).toBe(before.height)
  })
})
