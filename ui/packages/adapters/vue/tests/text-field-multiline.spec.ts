// @vitest-environment jsdom
// text-field 多行宿主：as="textarea" 渲染 textarea（无 type、带 data-multiline），
// autoSize 输入后按内容量高、行数下限撑底；单行路径不受影响。
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import { XhTextFieldInput, XhTextFieldRoot } from '../src'

async function tick(): Promise<void> {
  await nextTick()
  await nextTick()
  await new Promise(r => setTimeout(r, 0))
  await nextTick()
}

let cleanup: Array<() => void> = []

afterEach(() => {
  for (const fn of cleanup) fn()
  cleanup = []
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

  it('autoSize：输入后量高，行数下限撑底（jsdom 无布局，底=minRows×行高兜底值）', async () => {
    const el = await mountField({ autoSize: { minRows: 3 } }, 'textarea') as HTMLTextAreaElement
    el.value = '一行'
    el.dispatchEvent(new Event('input', { bubbles: true }))
    await tick()
    // jsdom 行高量不出来走 20px 兜底：3 行 = 60px
    expect(el.style.blockSize).toBe('60px')
    expect(el.style.overflowY).toBe('hidden')
  })

  it('单行路径不受影响：input 标签带 type=text、无 data-multiline', async () => {
    const el = await mountField({}, 'input')
    expect(el.tagName).toBe('INPUT')
    expect(el.getAttribute('type')).toBe('text')
    expect(el.hasAttribute('data-multiline')).toBe(false)
  })
})
