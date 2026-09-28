// 冻结列的边界提示：横向滚过之后，冻结列与滚动区之间只在确有内容被压住时出现一道描边——
// 行首冻结列在滚离起始端之后画在它的行尾侧，行尾冻结列在还没滚到末端时画在它的行首侧；
// 只画在紧挨滚动区的那一列上，同侧的其它冻结列之间不画。滚动位置与伪元素的计算样式只有真实浏览器量得出来。
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
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
  { id: 'name', label: '名称', width: 120, sticky: 'start' as const },
  { id: 'size', label: '大小', width: 240 },
  { id: 'owner', label: '负责人', width: 240 },
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

function color(value: string): string {
  const probe = document.createElement('span')
  probe.style.color = value
  host!.append(probe)
  const resolved = getComputedStyle(probe).color
  probe.remove()
  return resolved
}

function cell(row: string, column: string): HTMLElement {
  const el = host!.querySelector<HTMLElement>(`[data-scope='table'][data-part='row'][data-value='${row}'] [data-part='cell'][data-value='${column}']`)
  if (!el)
    throw new Error(`缺少单元格 ${row}/${column}`)
  return el
}

async function mount(dir: 'ltr' | 'rtl' = 'ltr'): Promise<HTMLElement> {
  host = document.createElement('div')
  host.style.inlineSize = '420px'
  host.dir = dir
  document.body.append(host)
  app = createApp({
    render: () => h(XhTableRoot, { columns, rows }, () => [
      h(XhTableHeader, null, () => h(XhTableRow, null, () => columns.map(column => h(XhTableColumnHeader, { key: column.id, value: column.id }, () => h(XhTableColumnLabel, null, () => column.label))))),
      h(XhTableBody, null, () => rows.map(row => h(XhTableRow, { key: row.id, value: row.id }, () => columns.map(column => h(XhTableCell, { key: column.id, value: column.id }, () => `${row.id}-${column.id}`))))),
    ]),
  })
  app.mount(host)
  await nextTick()
  return host.querySelector<HTMLElement>(`[data-scope='table'][data-part='root']`)!
}

const line = (el: HTMLElement): CSSStyleDeclaration => getComputedStyle(el, '::after')

describe('table 冻结列边界提示', () => {
  it('没滚时行首一侧没有东西被压住：不画；行尾一侧后面还有内容：画在行尾冻结列的行首侧', async () => {
    const root = await mount()
    expect(root.scrollLeft).toBe(0)
    await expect.poll(() => line(cell('a', 'action')).opacity).toBe('1')
    expect(line(cell('a', 'name')).opacity).toBe('0')
    const edge = cell('a', 'action').getBoundingClientRect()
    const drawn = line(cell('a', 'action'))
    expect(drawn.backgroundColor).toBe(color('var(--xh-border-default)'))
    expect(drawn.width).toBe('1px')
    expect(Number.parseFloat(drawn.left)).toBe(0)
    expect(edge.width).toBeGreaterThan(1)
  })

  it('滚离起始端：行首冻结列的边界那一列画在行尾侧，同侧其它冻结列不画；滚到末端：行尾那一道撤下', async () => {
    const root = await mount()
    root.scrollLeft = 60
    await expect.poll(() => line(cell('a', 'name')).opacity).toBe('1')
    expect(line(cell('a', 'select')).content).toBe('none')
    const name = cell('a', 'name')
    expect(Number.parseFloat(line(name).left)).toBe(name.getBoundingClientRect().width - 1)
    // 表头那一格同样画
    const header = host!.querySelector<HTMLElement>(`[data-part='column-header'][data-value='name']`)!
    expect(line(header).opacity).toBe('1')

    root.scrollLeft = root.scrollWidth
    await expect.poll(() => line(cell('a', 'action')).opacity).toBe('0')
  })

  it('rtl：滚离起始端后行首冻结列的描边同样落在行尾侧（物理左侧）', async () => {
    const root = await mount('rtl')
    root.scrollLeft = -60
    await expect.poll(() => line(cell('a', 'name')).opacity).toBe('1')
    expect(Number.parseFloat(line(cell('a', 'name')).left)).toBe(0)
  })
})
