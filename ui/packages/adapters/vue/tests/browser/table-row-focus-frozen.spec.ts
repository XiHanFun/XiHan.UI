// 焦点行的环压过冻结列：冻结列是 position: sticky 带层号的格子，压在行上，行自己的 outline 在冻结列那一截
// 会被盖住（操作列一段缺环）。环改画在行的 ::after 上，层号高过冻结列，盖满整行；行自己的环让位，不画两圈。
// 伪元素的计算样式与层叠只有真实浏览器量得出来。
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { userEvent } from 'vitest/browser'
import { createApp, h, nextTick } from 'vue'
import {
  XhTableBody,
  XhTableCell,
  XhTableColumnHeader,
  XhTableColumnLabel,
  XhTableHeader,
  XhTableRoot,
  XhTableRow,
} from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

const columns = [
  { id: 'select', label: '', width: 56, sticky: 'start' as const },
  { id: 'name', label: '名称', width: 120 },
  { id: 'size', label: '大小', width: 160 },
  { id: 'action', label: '操作', width: 96, sticky: 'end' as const },
]
const rows = [{ id: 'a' }, { id: 'b' }]

let app: App | null = null
let host: HTMLElement | null = null

afterEach(() => {
  app?.unmount()
  host?.remove()
  app = null
  host = null
})

function resolved(property: string, value: string): string {
  const probe = document.createElement('span')
  probe.style.setProperty(property, value)
  host!.append(probe)
  const out = getComputedStyle(probe).getPropertyValue(property)
  probe.remove()
  return out
}

function row(id: string): HTMLElement {
  return host!.querySelector<HTMLElement>(`[data-scope='table'][data-part='row'][data-value='${id}']`)!
}

function cell(rowId: string, column: string): HTMLElement {
  return row(rowId).querySelector<HTMLElement>(`[data-part='cell'][data-value='${column}']`)!
}

async function mount(width: string): Promise<void> {
  host = document.createElement('div')
  host.style.inlineSize = width
  document.body.append(host)
  app = createApp({
    render: () => h('div', null, [
      h('button', { 'type': 'button', 'data-test-start': '' }, '起点'),
      h(XhTableRoot, { columns, rows }, () => [
        h(XhTableHeader, null, () => h(XhTableRow, null, () => columns.map(column => h(XhTableColumnHeader, { key: column.id, value: column.id }, () => h(XhTableColumnLabel, null, () => column.label))))),
        h(XhTableBody, null, () => rows.map(r => h(XhTableRow, { key: r.id, value: r.id }, () => columns.map(column => h(XhTableCell, { key: column.id, value: column.id }, () => `${r.id}-${column.id}`))))),
      ]),
    ]),
  })
  app.mount(host)
  await nextTick()
  host.querySelector<HTMLElement>('[data-test-start]')!.focus()
  await userEvent.tab()
  await nextTick()
}

describe('table 焦点行的环压过冻结列', () => {
  it.each([['放得下', '640px'], ['横向滚动', '320px']])('%s：环画在行的 ::after 上，层号高过冻结列，盖满整行；行自己不另画', async (_name, width) => {
    await mount(width)
    const focused = row('a')
    expect(document.activeElement).toBe(focused)
    expect(focused.matches(':focus-visible')).toBe(true)

    const ring = getComputedStyle(focused, '::after')
    expect(ring.content).not.toBe('none')
    expect(ring.position).toBe('absolute')
    expect(ring.outlineStyle).toBe('solid')
    expect(ring.outlineWidth).toBe(resolved('outline-width', 'var(--xh-ring-width)'))
    expect(ring.outlineOffset).toBe(resolved('outline-offset', 'var(--xh-ring-offset)'))
    expect(ring.outlineColor).toBe(resolved('color', 'var(--xh-ring-focus)'))
    expect(ring.pointerEvents).toBe('none')
    // 层号高过两侧的冻结格
    for (const frozen of [cell('a', 'select'), cell('a', 'action')]) {
      expect(getComputedStyle(frozen).position).toBe('sticky')
      expect(Number(ring.zIndex)).toBeGreaterThan(Number(getComputedStyle(frozen).zIndex))
    }
    // 盖满整行
    const box = focused.getBoundingClientRect()
    expect(Number.parseFloat(ring.width)).toBeCloseTo(box.width, 0)
    expect(Number.parseFloat(ring.height)).toBeCloseTo(box.height, 0)
    // 行自己的环让位：要么不画，要么是透明的
    const own = getComputedStyle(focused)
    expect(own.outlineStyle === 'none' || own.outlineColor === 'rgba(0, 0, 0, 0)', own.outlineColor).toBe(true)
  })

  it('焦点离开就撤：没落焦的行不画这层', async () => {
    await mount('640px')
    expect(getComputedStyle(row('b'), '::after').content).toBe('none')
    await userEvent.tab({ shift: true })
    await nextTick()
    expect(getComputedStyle(row('a'), '::after').content).toBe('none')
  })
})
