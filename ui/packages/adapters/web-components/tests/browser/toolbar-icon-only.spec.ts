// 工具条只放图标的条目（Web Components）：条目上写 data-icon-only 时按方钮画，宽等于高，三种尺寸都一样；
// 图标加文字、只有文字的条目照旧按文字档排。宽高只有真实排版量得出来。
import { afterEach, describe, expect, it } from 'vitest'
import { defineXhElements } from '../../src/define'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

defineXhElements()

interface Updatable extends HTMLElement {
  updateComplete: Promise<unknown>
}

const ICON = '<span aria-hidden="true" style="display: inline-block; inline-size: 16px; block-size: 16px; background: currentColor"></span>'

async function settle(): Promise<void> {
  for (let round = 0; round < 5; round++) {
    await Promise.resolve()
    for (const element of document.querySelectorAll<Updatable>('xh-toolbar'))
      await element.updateComplete
  }
  await new Promise<void>(resolve => requestAnimationFrame(() => resolve()))
}

afterEach(() => {
  for (const el of document.querySelectorAll('xh-toolbar'))
    el.remove()
  for (const el of document.querySelectorAll('[data-test-rail]'))
    el.remove()
})

async function mount(size: string): Promise<HTMLElement> {
  const toolbar = document.createElement('xh-toolbar')
  toolbar.setAttribute('size', size)
  toolbar.innerHTML = `<div data-xh-part="root" aria-label="编辑">
    <button data-xh-part="item" type="button" value="bold" aria-label="加粗" data-icon-only>${ICON}</button>
    <button data-xh-part="item" type="button" value="copy">${ICON}复制</button>
    <button data-xh-part="item" type="button" value="paste">粘贴</button>
    <div data-xh-part="group">
      <button data-xh-part="item" type="button" value="left" aria-label="左对齐" data-icon-only>${ICON}</button>
      <button data-xh-part="item" type="button" value="right" aria-label="右对齐" data-icon-only>${ICON}</button>
    </div>
  </div>`
  document.body.append(toolbar)
  await settle()
  return toolbar
}

function item(toolbar: HTMLElement, value: string): HTMLElement {
  return toolbar.querySelector<HTMLElement>(`[data-scope="toolbar"][data-part="item"][value="${value}"]`)!
}

function box(el: HTMLElement): { width: number, height: number } {
  const rect = el.getBoundingClientRect()
  return { width: rect.width, height: rect.height }
}

describe('wc toolbar 只放图标的条目', () => {
  for (const size of ['sm', 'md', 'lg']) {
    it(`${size} 档：写了 data-icon-only 的条目宽等于高、与文字条目同高，组内的也一样；图标加文字、只有文字的条目不受影响`, async () => {
      const toolbar = await mount(size)
      const text = box(item(toolbar, 'paste'))
      for (const value of ['bold', 'left', 'right']) {
        const el = item(toolbar, value)
        const { width, height } = box(el)
        expect(el.getAttribute('data-xh-action-profile')).toBe('icon')
        expect(el.hasAttribute('data-icon-only')).toBe(true)
        expect(Math.abs(width - height)).toBeLessThan(0.5)
        expect(Math.abs(height - text.height)).toBeLessThan(0.5)
      }
      for (const value of ['copy', 'paste']) {
        const el = item(toolbar, value)
        const { width, height } = box(el)
        expect(el.getAttribute('data-xh-action-profile')).toBe('text')
        expect(el.hasAttribute('data-icon-only')).toBe(false)
        expect(Number.parseFloat(getComputedStyle(el).paddingInlineStart)).toBeGreaterThan(0)
        expect(width).toBeGreaterThan(height)
      }
    })
  }

  it('运行期增删 data-icon-only：条目随之换成方钮或换回文字档', async () => {
    const toolbar = await mount('md')
    const el = item(toolbar, 'copy')
    el.setAttribute('data-icon-only', '')
    el.lastChild!.remove()
    await settle()
    expect(el.getAttribute('data-xh-action-profile')).toBe('icon')
    expect(Math.abs(box(el).width - box(el).height)).toBeLessThan(0.5)
    el.removeAttribute('data-icon-only')
    el.append('复制')
    await settle()
    expect(el.getAttribute('data-xh-action-profile')).toBe('text')
    expect(box(el).width).toBeGreaterThan(box(el).height)
  })

  it('竖排：只放图标的条目随列宽拉伸，与列里较宽的文字条目一样宽、同高；整列只放图标时是方钮', async () => {
    const toolbar = document.createElement('xh-toolbar')
    toolbar.setAttribute('orientation', 'vertical')
    toolbar.innerHTML = `<div data-xh-part="root" aria-label="翻页">
      <button data-xh-part="item" type="button" value="previous" aria-label="上一页" data-icon-only>${ICON}</button>
      <button data-xh-part="item" type="button" value="page">第 1 页，共 3 页</button>
    </div>`
    const icons = document.createElement('xh-toolbar')
    icons.setAttribute('orientation', 'vertical')
    icons.innerHTML = `<div data-xh-part="root" aria-label="缩放">
      <button data-xh-part="item" type="button" value="zoom-in" aria-label="放大" data-icon-only>${ICON}</button>
      <button data-xh-part="item" type="button" value="zoom-out" aria-label="缩小" data-icon-only>${ICON}</button>
    </div>`
    for (const bar of [toolbar, icons]) {
      const rail = document.createElement('div')
      rail.style.inlineSize = 'max-content'
      rail.dataset.testRail = ''
      rail.append(bar)
      document.body.append(rail)
    }
    await settle()
    const icon = box(item(toolbar, 'previous'))
    const text = box(item(toolbar, 'page'))
    expect(Math.abs(icon.width - text.width)).toBeLessThan(0.5)
    expect(Math.abs(icon.height - text.height)).toBeLessThan(0.5)
    expect(icon.width).toBeGreaterThan(icon.height)
    for (const value of ['zoom-in', 'zoom-out']) {
      const { width, height } = box(item(icons, value))
      expect(Math.abs(width - height)).toBeLessThan(0.5)
    }
  })
})
