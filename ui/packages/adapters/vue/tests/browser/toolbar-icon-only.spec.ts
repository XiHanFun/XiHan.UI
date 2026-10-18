import type { Size } from '@xihan-ui/core'
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick, ref } from 'vue'
import { XhToolbarGroup, XhToolbarItem, XhToolbarRoot } from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

// 工具条只放图标的条目：声明 iconOnly 时按方钮画，宽等于高，三种尺寸都一样；
// 图标加文字、只有文字的条目照旧按文字档排。宽高只有真实排版量得出来。

let app: App | null = null
let host: HTMLElement | null = null

afterEach(() => {
  app?.unmount()
  app = null
  host?.remove()
  host = null
})

const icon = () => h('span', { 'aria-hidden': 'true', 'style': { display: 'inline-block', inlineSize: '16px', blockSize: '16px', background: 'currentColor' } })

async function mount(size: Size, copyIconOnly = ref(false)): Promise<HTMLElement> {
  host = document.createElement('div')
  document.body.append(host)
  app = createApp({
    setup: () => () => h(XhToolbarRoot, { 'aria-label': '编辑', size }, () => [
      h(XhToolbarItem, { 'value': 'bold', 'type': 'button', 'aria-label': '加粗', 'iconOnly': true }, () => icon()),
      h(XhToolbarItem, { 'value': 'copy', 'type': 'button', 'aria-label': copyIconOnly.value ? '复制' : undefined, 'iconOnly': copyIconOnly.value }, () => copyIconOnly.value ? icon() : [icon(), '复制']),
      h(XhToolbarItem, { value: 'paste', type: 'button' }, () => '粘贴'),
      h(XhToolbarGroup, null, () => [
        h(XhToolbarItem, { 'value': 'left', 'type': 'button', 'aria-label': '左对齐', 'iconOnly': true }, () => icon()),
        h(XhToolbarItem, { 'value': 'right', 'type': 'button', 'aria-label': '右对齐', 'iconOnly': true }, () => icon()),
      ]),
    ]),
  })
  app.mount(host)
  await nextTick()
  await new Promise<void>(resolve => requestAnimationFrame(() => resolve()))
  return host
}

function item(root: HTMLElement, value: string): HTMLElement {
  return root.querySelector<HTMLElement>(`[data-scope="toolbar"][data-part="item"][data-value="${value}"]`)!
}

function box(el: HTMLElement): { width: number, height: number } {
  const rect = el.getBoundingClientRect()
  return { width: rect.width, height: rect.height }
}

describe('vue toolbar 只放图标的条目', () => {
  for (const size of ['sm', 'md', 'lg'] as const) {
    it(`${size} 档：声明 iconOnly 的条目宽等于高、与文字条目同高，组内的也一样；图标加文字、只有文字的条目不受影响`, async () => {
      const root = await mount(size)
      const text = box(item(root, 'paste'))
      for (const value of ['bold', 'left', 'right']) {
        const el = item(root, value)
        const { width, height } = box(el)
        expect(el.getAttribute('data-xh-action-profile')).toBe('icon')
        expect(el.hasAttribute('data-icon-only')).toBe(true)
        expect(Math.abs(width - height)).toBeLessThan(0.5)
        expect(Math.abs(height - text.height)).toBeLessThan(0.5)
      }
      for (const value of ['copy', 'paste']) {
        const el = item(root, value)
        const { width, height } = box(el)
        expect(el.getAttribute('data-xh-action-profile')).toBe('text')
        expect(el.hasAttribute('data-icon-only')).toBe(false)
        expect(Number.parseFloat(getComputedStyle(el).paddingInlineStart)).toBeGreaterThan(0)
        expect(width).toBeGreaterThan(height)
      }
    })
  }

  it('iconOnly 换了：条目随之换成方钮或换回文字档', async () => {
    const copyIconOnly = ref(false)
    const root = await mount('md', copyIconOnly)
    copyIconOnly.value = true
    await nextTick()
    const el = item(root, 'copy')
    expect(el.getAttribute('data-xh-action-profile')).toBe('icon')
    expect(Math.abs(box(el).width - box(el).height)).toBeLessThan(0.5)
    copyIconOnly.value = false
    await nextTick()
    expect(el.getAttribute('data-xh-action-profile')).toBe('text')
    expect(box(el).width).toBeGreaterThan(box(el).height)
  })

  it('竖排：只放图标的条目随列宽拉伸，与列里较宽的文字条目一样宽、同高；整列只放图标时是方钮', async () => {
    host = document.createElement('div')
    document.body.append(host)
    app = createApp({
      setup: () => () => h('div', [
        h('div', { style: { inlineSize: 'max-content' } }, h(XhToolbarRoot, { 'aria-label': '翻页', 'orientation': 'vertical' }, () => [
          h(XhToolbarItem, { 'value': 'previous', 'type': 'button', 'aria-label': '上一页', 'iconOnly': true }, () => icon()),
          h(XhToolbarItem, { value: 'page', type: 'button' }, () => '第 1 页，共 3 页'),
        ])),
        h('div', { style: { inlineSize: 'max-content' } }, h(XhToolbarRoot, { 'aria-label': '缩放', 'orientation': 'vertical' }, () => [
          h(XhToolbarItem, { 'value': 'zoom-in', 'type': 'button', 'aria-label': '放大', 'iconOnly': true }, () => icon()),
          h(XhToolbarItem, { 'value': 'zoom-out', 'type': 'button', 'aria-label': '缩小', 'iconOnly': true }, () => icon()),
        ])),
      ]),
    })
    app.mount(host)
    await nextTick()
    await new Promise<void>(resolve => requestAnimationFrame(() => resolve()))
    const iconBox = box(item(host, 'previous'))
    const text = box(item(host, 'page'))
    expect(Math.abs(iconBox.width - text.width)).toBeLessThan(0.5)
    expect(Math.abs(iconBox.height - text.height)).toBeLessThan(0.5)
    expect(iconBox.width).toBeGreaterThan(iconBox.height)
    for (const value of ['zoom-in', 'zoom-out']) {
      const { width, height } = box(item(host, value))
      expect(Math.abs(width - height)).toBeLessThan(0.5)
    }
  })
})
