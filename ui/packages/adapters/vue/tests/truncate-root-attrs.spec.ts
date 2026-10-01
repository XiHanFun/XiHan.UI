// @vitest-environment jsdom
// XhTruncate 关掉了 attrs 自动透传（可展开时渲的是 Fragment：文字盒子 + 展开按钮），
// 作者写在 <XhTruncate> 上的属性得自己合到文字盒子上。style 要与连接层写的行数逐条合并，
// 不能谁后写谁整个盖掉另一份。
import { describe, expect, it } from 'vitest'
import { createApp, h } from 'vue'
import { XhTruncate } from '../src'

function mount(extra: Record<string, unknown>) {
  const host = document.createElement('div')
  document.body.append(host)
  const app = createApp({
    render: () => h(XhTruncate, { lines: 2, ...extra }, () => '一段说明文字'),
  })
  app.mount(host)
  const root = host.querySelector<HTMLElement>('[data-part="root"]')
  if (!root)
    throw new Error('没渲出 root')
  const done = (): void => {
    app.unmount()
    host.remove()
  }
  return { root, done }
}

describe('xhTruncate 的 root 内联样式', () => {
  it.each([false, true])('作者写的 style 留着，行数照样写上（expandable=%s）', (expandable) => {
    const { root, done } = mount({ expandable, style: 'max-inline-size: 20rem' })
    expect(root.style.maxInlineSize).toBe('20rem')
    expect(root.style.getPropertyValue('--xh-_truncate-lines')).toBe('2')
    done()
  })
})
