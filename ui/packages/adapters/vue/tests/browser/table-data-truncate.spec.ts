// 列的 truncate：放不下的字收成一行省略号，指针移进被裁掉的格子时把全文交给原生提示。
//
// 要真实浏览器：省略号落不落得到字上、格子量出来裁没裁掉，jsdom 不排版。
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { userEvent } from 'vitest/browser'
import { createApp, h } from 'vue'
import { XhTableRoot } from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

const LONG = '/shared/finance/quarterly-reports/2026/q1/board-meeting/final/report.pdf'

const COLUMNS = [
  { id: 'name', label: '文件', width: 120, minWidth: 120, maxWidth: 120 },
  { id: 'path', label: '路径', width: 160, minWidth: 160, maxWidth: 160, truncate: true },
]

const DATA = [
  { id: 'a1', name: 'report.pdf', path: LONG },
  { id: 'a2', name: 'notes.md', path: '/docs' },
]

let app: App | null = null
let host: HTMLElement | null = null

afterEach(() => {
  app?.unmount()
  host?.remove()
  app = null
  host = null
})

function mount(): void {
  host = document.createElement('div')
  host.style.inlineSize = '320px'
  document.body.prepend(host)
  app = createApp({ render: () => h(XhTableRoot, { 'columns': COLUMNS, 'data': DATA, 'aria-label': '文件' }) })
  app.mount(host)
}

function cell(row: string, column: string): HTMLElement {
  return document.querySelector<HTMLElement>(`[data-scope="table"][data-part="row"][data-value="${row}"] [data-scope="table"][data-part="cell"][data-value="${column}"]`)!
}

describe('列的 truncate', () => {
  it('截断列的格子是块容器、单行、出省略号，长字被裁掉；没开的列照旧是 flex 行', async () => {
    mount()
    const long = cell('a1', 'path')
    const style = getComputedStyle(long)
    expect(long.hasAttribute('data-truncate')).toBe(true)
    expect(style.display).toBe('block')
    expect(style.whiteSpace).toBe('nowrap')
    expect(style.textOverflow).toBe('ellipsis')
    expect(style.overflowX).toBe('hidden')
    expect(long.scrollWidth).toBeGreaterThan(long.clientWidth + 1)
    // 同一行里一般的格子不受影响
    expect(getComputedStyle(cell('a1', 'name')).display).toBe('flex')
    // 字仍在格子的中线上：与同一行的普通格子同高，字也在同一条基线附近
    const range = document.createRange()
    range.selectNodeContents(long)
    const text = range.getBoundingClientRect()
    const box = long.getBoundingClientRect()
    expect(Math.abs((text.top + text.bottom) / 2 - (box.top + box.bottom) / 2)).toBeLessThan(2)
  })

  it('指针移进被裁掉的格子才有 title（全文），移出即撤；放得下的格子不出提示', async () => {
    mount()
    const long = cell('a1', 'path')
    const short = cell('a2', 'path')
    expect(long.hasAttribute('title')).toBe(false)
    await userEvent.hover(long)
    await expect.poll(() => long.getAttribute('title')).toBe(LONG)
    await userEvent.hover(short)
    await expect.poll(() => long.hasAttribute('title')).toBe(false)
    expect(short.hasAttribute('title')).toBe(false)
  })
})
