// @vitest-environment jsdom
// XhTableRoot 渲的是 Fragment（表格本体 + 播报区），而 Vue 只在**单个元素根**上
// 自动透传 attrs。作者写在 <XhTableRoot> 上的 class / aria-* / 监听器必须自己合到
// 表格那个 div 上，否则全部静默丢掉——示例里已经有人在用（分组表头传 aria-rowcount、
// 虚拟滚动示例传 @scroll）。
import { describe, expect, it, vi } from 'vitest'
import { createApp, h } from 'vue'
import { XhTableBody, XhTableCell, XhTableRoot, XhTableRow } from '../src'

const ROWS = [{ id: 'a' }]
const COLUMNS = [{ id: 'n', label: '名称' }]

function mount(extra: Record<string, unknown>) {
  const host = document.createElement('div')
  document.body.append(host)
  const app = createApp({
    render: () => h(XhTableRoot, { rows: ROWS, columns: COLUMNS, ...extra }, () => [
      h(XhTableBody, null, () => [
        h(XhTableRow, { value: 'a' }, () => [
          h(XhTableCell, { value: 'n', row: 'a' }, () => 'x'),
        ]),
      ]),
    ]),
  })
  app.mount(host)
  const root = host.querySelector<HTMLElement>('[data-part="root"]')
  if (!root)
    throw new Error('没渲出 root')
  const done = (): void => {
    app.unmount()
    host.remove()
  }
  return { root, host, done }
}

describe('xhTableRoot 的属性透传', () => {
  it('作者的 class 合上去，不是把库的盖掉也不是被丢掉', () => {
    const { root, done } = mount({ class: '作者的类' })
    expect(root.className).toContain('作者的类')
    done()
  })

  it('作者的 aria-* 压得过库算出来的那份', () => {
    // 分组表头那类用法：表里插了分组行，行数得由作者说了算
    const { root, done } = mount({ 'aria-rowcount': 99 })
    expect(root.getAttribute('aria-rowcount')).toBe('99')
    done()
  })

  it('作者的监听器真的挂上了', () => {
    const onClick = vi.fn()
    const { root, done } = mount({ onClick })
    root.click()
    expect(onClick).toHaveBeenCalledTimes(1)
    done()
  })

  it('库自己的角色与身份不受影响', () => {
    const { root, done } = mount({ class: '作者的类' })
    expect(root.getAttribute('role')).toBe('grid')
    expect(root.getAttribute('data-scope')).toBe('table')
    done()
  })
})
