// @vitest-environment jsdom
// text-field 多行宿主：as="textarea" 渲染 textarea（无 type、带 data-multiline），
// autoSize 输入后按内容量高、行数下限撑底；单行路径不受影响。
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import { XhTextFieldInput, XhTextFieldRoot } from '../src'

async function tick(): Promise<void> {
  await nextTick()
  await nextTick()
  await new Promise(r => setTimeout(r, 0))
  await nextTick()
}

let cleanup: Array<() => void> = []

beforeEach(() => {
  vi.spyOn(window, 'getComputedStyle').mockReturnValue({
    getPropertyValue: (property: string) => ({
      'border-bottom-width': '0px',
      'border-top-width': '0px',
      'box-sizing': 'border-box',
      'font-size': '10px',
      'line-height': 'normal',
      'padding-bottom': '0px',
      'padding-top': '0px',
      'width': '180px',
      'writing-mode': 'horizontal-tb',
    })[property] ?? '',
  } as CSSStyleDeclaration)
  vi.spyOn(HTMLTextAreaElement.prototype, 'scrollHeight', 'get').mockImplementation(function (this: HTMLTextAreaElement) {
    return Math.max(this.value.length, 1) * 10
  })
})

afterEach(() => {
  for (const fn of cleanup) fn()
  cleanup = []
  vi.restoreAllMocks()
  document.body.innerHTML = ''
})

async function mountField(rootProps: Record<string, unknown>, as: 'input' | 'textarea'): Promise<HTMLElement> {
  const host = document.createElement('div')
  document.body.appendChild(host)
  const app = createApp({
    setup: () => () => h(XhTextFieldRoot, rootProps, () => [h(XhTextFieldInput, { as })]),
  })
  app.mount(host)
  cleanup.push(() => {
    app.unmount()
    host.remove()
  })
  await tick()
  const el = document.querySelector<HTMLElement>('[data-scope="text-field"][data-part="input"]')
  if (!el)
    throw new Error('找不到输入部件')
  return el
}

describe('text-field 多行宿主', () => {
  it('as=textarea：渲染 textarea、无 type、带 data-multiline 与 rows', async () => {
    const el = await mountField({ autoSize: { minRows: 3, maxRows: 6 } }, 'textarea')
    expect(el.tagName).toBe('TEXTAREA')
    expect(el.hasAttribute('type')).toBe(false)
    expect(el.hasAttribute('data-multiline')).toBe(true)
    expect(el.hasAttribute('data-auto-resize')).toBe(true)
    expect(el.getAttribute('rows')).toBe('3')
  })

  it('autoSize：输入后按镜像实测单行高度撑到 minRows', async () => {
    const el = await mountField({ autoSize: { minRows: 3 } }, 'textarea') as HTMLTextAreaElement
    el.value = '一行'
    el.dispatchEvent(new Event('input', { bubbles: true }))
    await tick()
    // 镜像单行实测 10px：3 行 = 30px。
    expect(el.style.blockSize).toBe('30px')
    expect(el.style.overflowY).toBe('hidden')
  })

  it('单行路径不受影响：input 标签带 type=text、无 data-multiline', async () => {
    const el = await mountField({}, 'input')
    expect(el.tagName).toBe('INPUT')
    expect(el.getAttribute('type')).toBe('text')
    expect(el.hasAttribute('data-multiline')).toBe(false)
  })
})
