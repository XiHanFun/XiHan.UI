// 表格自绘的状态字形——排序方向、勾、半选杠、展开方向——是指示符，不是控件内图标：
// 它们与所在的方盒 / 把手同属 --xh-control-indicator-* 一族（§6.5），--xh-table-icon-size / --xh-icon-size
// 只管作者放进单元格与把手里的图标。此前四种字形都按 --xh-icon-size（md 20px）取尺：comfortable 下
// 排序箭头 20×20 比 16px 的勾选框与列头文字大一圈，compact 下 20px 的勾与半选杠落在 14px 的盒里
// 比盒还大。两档密度一起量：指示符档 comfortable 16 / compact 14，作者图标两档都恒 20。
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import {
  XhIcon,
  XhTableBody,
  XhTableCell,
  XhTableColumnHeader,
  XhTableColumnLabel,
  XhTableExpandTrigger,
  XhTableHeader,
  XhTableRoot,
  XhTableRow,
  XhTableRowSelectTrigger,
  XhTableSelectAllTrigger,
  XhTableSortTrigger,
} from '../../src'
import { pseudoBox } from './pseudo-box'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

const columns = [
  { id: 'select', label: '', width: 56 },
  { id: 'name', label: '名称', width: 160, sortable: true },
  { id: 'size', label: '大小', width: 120 },
]
const rows = [{ id: 'a', expandable: true }, { id: 'b' }]

/** 勾选格里勾与半选杠按方盒边长的比例取尺：checkbox.css 的 --xh-_checkbox-glyph 与 tree.css 的勾选把手都是 0.75。 */
const CHECK_GLYPH_RATIO = 0.75

let app: App | null = null
let host: HTMLElement | null = null

afterEach(() => {
  app?.unmount()
  host?.remove()
  delete document.documentElement.dataset.density
  app = null
  host = null
})

function part(name: string, index = 0): HTMLElement {
  const element = host!.querySelectorAll<HTMLElement>(`[data-scope='table'][data-part='${name}']`)[index]
  if (!element)
    throw new Error(`缺少 table 部件：${name}[${index}]`)
  return element
}

function authorIcon(): ReturnType<typeof h> {
  return h(XhIcon, { label: '作者图标' }, { default: () => h('path', { d: 'M4 12h16' }) })
}

async function mount(density: 'comfortable' | 'compact'): Promise<void> {
  document.documentElement.dataset.density = density
  host = document.createElement('div')
  document.body.append(host)
  app = createApp({
    // 两行里只选一行：全选框落到半选，半选杠那条 ::after 才会出现
    render: () => h(XhTableRoot, { columns, rows, selectionMode: 'multiple', defaultSelection: ['b'], sort: [{ id: 'name', direction: 'asc' }] }, {
      default: () => [
        h(XhTableHeader, null, {
          default: () => [h(XhTableRow, null, {
            default: () => columns.map(column => h(XhTableColumnHeader, { key: column.id, value: column.id }, {
              default: () => column.id === 'select'
                ? h(XhTableSelectAllTrigger)
                // 列名装在 column-label 里，排序钮是它后面一颗不包文字的独立钮
                : column.sortable
                  ? [h(XhTableColumnLabel, null, { default: () => column.label }), h(XhTableSortTrigger)]
                  : [h(XhTableColumnLabel, null, { default: () => column.label }), authorIcon()],
            })),
          })],
        }),
        h(XhTableBody, null, {
          default: () => rows.map(row => h(XhTableRow, { key: row.id, value: row.id }, {
            default: () => [
              h(XhTableCell, { value: 'select' }, { default: () => [h(XhTableRowSelectTrigger), h(XhTableExpandTrigger)] }),
              h(XhTableCell, { value: 'name' }, { default: () => [row.id, authorIcon()] }),
              h(XhTableCell, { value: 'size' }, { default: () => '12 KB' }),
            ],
          })),
        }),
      ],
    }),
  })
  app.mount(host)
  await nextTick()
}

function indicatorSize(): number {
  const value = Number.parseFloat(getComputedStyle(part('root')).getPropertyValue('--xh-control-indicator-size'))
  expect([14, 16]).toContain(value)
  return value
}

/** 纯文字列头的内容盒高就是它的 line box 高：排序箭头不得高过同一行的文字 */
function headerLineBoxHeight(): number {
  const header = part('column-header', 2)
  const style = getComputedStyle(header)
  return header.getBoundingClientRect().height - Number.parseFloat(style.paddingTop) - Number.parseFloat(style.paddingBottom)
}

/** 方盒的内容边长：盒接的是家族 icon 档，border-box 计边长，描边内侧才是字形能落的范围 */
function innerSize(box: HTMLElement): number {
  const style = getComputedStyle(box)
  return box.getBoundingClientRect().width - Number.parseFloat(style.borderLeftWidth) - Number.parseFloat(style.borderRightWidth)
}

function describeGlyph(host: HTMLElement, pseudo: '::before' | '::after'): string {
  const style = getComputedStyle(host, pseudo)
  const rect = host.getBoundingClientRect()
  return `${host.dataset.part}${pseudo} ${style.width}×${style.height} position=${style.position} 盒 ${rect.width}×${rect.height}`
}

/** 方盒是两轴居中的 flex 容器（家族给的 inline-flex，作为单元格 flex 项被块化成 flex）：唯一的行内字形落在盒中心 */
function expectCenteredBox(box: HTMLElement): void {
  const style = getComputedStyle(box)
  expect(['flex', 'inline-flex']).toContain(style.display)
  expect(style.alignItems).toBe('center')
  expect(style.justifyContent).toBe('center')
}

describe.each(['comfortable', 'compact'] as const)('表格自绘状态字形按指示符档取尺（%s）', (density) => {
  it('排序箭头 :empty::before 的宽高等于 --xh-control-indicator-size、与钮的方盒同边长，且不高过列头文字的 line box', async () => {
    await mount(density)
    const indicator = indicatorSize()
    const sort = part('sort-trigger')
    expect(sort.getAttribute('data-sort')).toBe('asc')
    expect(sort.getBoundingClientRect().width).toBe(indicator)
    const arrow = pseudoBox(sort, '::before')
    const observed = describeGlyph(sort, '::before')
    expect(arrow.width, observed).toBe(indicator)
    expect(arrow.height, observed).toBe(indicator)
    expect(arrow.height, `${observed} 列头 line box ${headerLineBoxHeight()}`).toBeLessThanOrEqual(headerLineBoxHeight())
    expectCenteredBox(sort)
  })

  it('三颗勾选框的兜底勾按方盒边长 × 0.75 取尺，落在盒内并居中', async () => {
    await mount(density)
    const indicator = indicatorSize()
    for (const box of [part('select-all-trigger'), part('row-select-trigger', 0), part('row-select-trigger', 1)]) {
      expect(box.getBoundingClientRect().width).toBe(indicator)
      const check = pseudoBox(box, '::before')
      const observed = describeGlyph(box, '::before')
      expect(check.width, observed).toBe(indicator * CHECK_GLYPH_RATIO)
      expect(check.height, observed).toBe(indicator * CHECK_GLYPH_RATIO)
      expect(check.width, observed).toBeLessThanOrEqual(innerSize(box))
      expectCenteredBox(box)
    }
  })

  it('全选框的半选杠与勾同尺，绝对定位落在居中的盒里', async () => {
    await mount(density)
    const indicator = indicatorSize()
    const selectAll = part('select-all-trigger')
    expect(selectAll.getAttribute('data-state')).toBe('indeterminate')
    const bar = getComputedStyle(selectAll, '::after')
    const observed = describeGlyph(selectAll, '::after')
    expect(bar.content, observed).toBe('""')
    expect(bar.position, observed).toBe('absolute')
    expect(Number.parseFloat(bar.width), observed).toBe(indicator * CHECK_GLYPH_RATIO)
    expect(Number.parseFloat(bar.height), observed).toBe(indicator * CHECK_GLYPH_RATIO)
    expect(Number.parseFloat(bar.width), observed).toBeLessThanOrEqual(innerSize(selectAll))
    // 没给起点：静态位置就是居中 flex 容器给的盒中心，计算样式里 top / left 解析成落点，折算回视口后与盒心重合
    const rect = selectAll.getBoundingClientRect()
    const box = pseudoBox(selectAll, '::after')
    expect(box.centerX, observed).toBeCloseTo(rect.left + rect.width / 2, 2)
    expect(box.centerY, observed).toBeCloseTo(rect.top + rect.height / 2, 2)
    expectCenteredBox(selectAll)
  })

  it('展开箭头的兜底 chevron 与方盒同边长', async () => {
    await mount(density)
    const indicator = indicatorSize()
    const expand = part('expand-trigger', 0)
    expect(expand.getBoundingClientRect().width).toBe(indicator)
    const chevron = pseudoBox(expand, '::before')
    const observed = describeGlyph(expand, '::before')
    expect(chevron.width, observed).toBe(indicator)
    expect(chevron.height, observed).toBe(indicator)
  })

  it('作者塞进列头与单元格的图标仍按 --xh-icon-size（md 20px）取尺，不随指示符档变', async () => {
    await mount(density)
    const icon = Number.parseFloat(getComputedStyle(part('root')).getPropertyValue('--xh-icon-size'))
    expect(icon).toBe(20)
    const icons = [...host!.querySelectorAll<HTMLElement>('[data-scope=\'icon\'][data-part=\'root\']')]
    expect(icons.length).toBe(3)
    for (const svg of icons) {
      expect(svg.getBoundingClientRect().width).toBe(icon)
      expect(svg.getBoundingClientRect().height).toBe(icon)
    }
  })
})
