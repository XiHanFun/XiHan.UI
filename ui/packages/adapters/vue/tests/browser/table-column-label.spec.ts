// 列名装在 column-label 里，它是列头里唯一可收窄的一格：flex: 1 + min-inline-size: 0 + 省略号，
// 排序钮、列宽把手、列拖拽把手都是它的兄弟。此前列名裸写成列头里的文本节点：列头是 flex 行，裸文本是匿名
// flex item，min-inline-size 取 auto（nowrap 文本的 min-content）缩不下去——96px 的列配一串长列名，
// 实测列头 x=1..108 而排序钮被挤到 x=213..229，被列头的 overflow: hidden 裁掉，elementFromPoint 命中的是
// 下一列的排序钮，排序只剩 Tab 可达。列宽把手与列拖拽把手早有同一失败模式。皮肤给不了匿名项
// min-inline-size: 0 / text-overflow，只有真实节点接得住；jsdom 不排版，只有真实浏览器量得出来。
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import {
  XhTableBody,
  XhTableCell,
  XhTableColumnDragTrigger,
  XhTableColumnHeader,
  XhTableColumnLabel,
  XhTableColumnResizeTrigger,
  XhTableHeader,
  XhTableRoot,
  XhTableRow,
  XhTableSortTrigger,
} from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

const LONG = '非常长的一个列名称文字会溢出'

const columns = [
  { id: 'name', label: LONG, width: 96, sortable: true, resizable: true, reorderable: true },
  { id: 'size', label: '大小', width: 120, sortable: true, reorderable: true },
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

function part(name: string, column: string): HTMLElement {
  const element = host!.querySelector<HTMLElement>(
    `[data-scope='table'][data-part='column-header'][data-value='${column}'] [data-scope='table'][data-part='${name}']`,
  )
  if (!element)
    throw new Error(`缺少 ${column} 列的 table 部件：${name}`)
  return element
}

function header(column: string): HTMLElement {
  const element = host!.querySelector<HTMLElement>(`[data-scope='table'][data-part='column-header'][data-value='${column}']`)
  if (!element)
    throw new Error(`缺少列头：${column}`)
  return element
}

async function mount(): Promise<void> {
  host = document.createElement('div')
  // 宿主只有 240px：两列的 width 加起来就把余量吃光，name 列拿不到一个像素的富余
  host.style.width = '240px'
  document.body.append(host)
  app = createApp({
    render: () => h(XhTableRoot, { columns, rows }, {
      default: () => [
        h(XhTableHeader, null, {
          default: () => [h(XhTableRow, null, {
            // 拖拽把手在行首、列名装在 column-label、排序钮与列宽把手在行尾：四件都是列头的直接孩子
            default: () => columns.map(column => h(XhTableColumnHeader, { key: column.id, value: column.id }, {
              default: () => [
                h(XhTableColumnDragTrigger),
                h(XhTableColumnLabel, null, { default: () => column.label }),
                h(XhTableSortTrigger),
                column.resizable ? h(XhTableColumnResizeTrigger) : null,
              ],
            })),
          })],
        }),
        h(XhTableBody, null, {
          default: () => rows.map(row => h(XhTableRow, { key: row.id, value: row.id }, {
            default: () => columns.map(column => h(XhTableCell, { key: column.id, value: column.id }, { default: () => row.id })),
          })),
        }),
      ],
    }),
  })
  app.mount(host)
  await nextTick()
}

/** 子盒整个落在父盒的行内范围里（允许亚像素误差）。 */
function expectInside(child: DOMRect, parent: DOMRect, what: string): void {
  const observed = `${what} x=${child.left}..${child.right} 列头 x=${parent.left}..${parent.right}`
  expect(child.width, observed).toBeGreaterThan(0)
  expect(child.left, observed).toBeGreaterThanOrEqual(parent.left - 0.5)
  expect(child.right, observed).toBeLessThanOrEqual(parent.right + 0.5)
}

describe('table 列名部件 column-label', () => {
  it('窄列 + 长列名：排序钮、列宽把手与拖拽把手都留在列头盒内，列名出省略号', async () => {
    await mount()
    const head = header('name')
    const label = part('column-label', 'name')
    const sort = part('sort-trigger', 'name')
    const resize = part('column-resize-trigger', 'name')
    const drag = part('column-drag-trigger', 'name')
    expect(label.getAttribute('data-scope')).toBe('table')
    expect(label.textContent).toBe(LONG)

    const headBox = head.getBoundingClientRect()
    const labelBox = label.getBoundingClientRect()
    const sortBox = sort.getBoundingClientRect()
    const resizeBox = resize.getBoundingClientRect()
    const dragBox = drag.getBoundingClientRect()
    // 列头比整串列名窄：宿主 240px 里两列的 width 之和已把余量吃得只剩个位数，长列名装不下
    expect(headBox.width, `列头宽 ${headBox.width}，列名全文宽 ${label.scrollWidth}`).toBeLessThan(label.scrollWidth)
    expectInside(sortBox, headBox, '排序钮')
    expectInside(resizeBox, headBox, '列宽把手')
    expectInside(dragBox, headBox, '拖拽把手')
    expectInside(labelBox, headBox, '列名')
    // 四件从行首到行尾按源序排、互不重叠：拖拽把手 → 列名 → 排序钮 → 列宽把手
    expect(dragBox.right).toBeLessThanOrEqual(labelBox.left + 0.5)
    expect(labelBox.right).toBeLessThanOrEqual(sortBox.left + 0.5)
    expect(sortBox.right).toBeLessThanOrEqual(resizeBox.left + 0.5)
    // 排序钮仍是 16px 的定尺方盒，没被压扁
    expect(sortBox.width).toBe(16)
    expect(sortBox.height).toBe(16)

    // 列名收窄出省略号：文字比盒长、盒按 ellipsis 截
    const labelStyle = getComputedStyle(label)
    expect(labelStyle.textOverflow).toBe('ellipsis')
    expect(labelStyle.whiteSpace).toBe('nowrap')
    expect(labelStyle.overflowX).toBe('hidden')
    expect(labelStyle.minInlineSize).toBe('0px')
    expect(label.scrollWidth, `列名 scrollWidth=${label.scrollWidth} clientWidth=${label.clientWidth}`).toBeGreaterThan(label.clientWidth)

    // 钮中心点上命中的就是这一列的排序钮：没被列头裁掉、也没跑到下一列去
    const hit = document.elementFromPoint(sortBox.left + sortBox.width / 2, sortBox.top + sortBox.height / 2) as HTMLElement | null
    const hitPart = hit?.closest<HTMLElement>('[data-scope=\'table\'][data-part=\'sort-trigger\']')
    expect(hitPart, `命中 ${hit?.getAttribute('data-part')} / 列 ${hit?.closest('[data-part="column-header"]')?.getAttribute('data-value')}`).toBe(sort)
    const resizeHit = document.elementFromPoint(resizeBox.left + resizeBox.width / 2, resizeBox.top + resizeBox.height / 2) as HTMLElement | null
    expect(resizeHit?.closest('[data-part=\'column-resize-trigger\']')).toBe(resize)
  })

  it('短列名：列名吃掉余量，排序钮仍被推到行尾与列宽把手并排', async () => {
    await mount()
    const head = header('size')
    const label = part('column-label', 'size')
    const sort = part('sort-trigger', 'size')
    const headBox = head.getBoundingClientRect()
    const labelBox = label.getBoundingClientRect()
    const sortBox = sort.getBoundingClientRect()
    const padding = Number.parseFloat(getComputedStyle(head).paddingRight)
    // 余量都归列名（flex: 1）：钮贴着列头内容盒的行尾
    expect(sortBox.right).toBeCloseTo(headBox.right - padding, 1)
    expect(labelBox.right).toBeLessThanOrEqual(sortBox.left + 0.5)
    // 列名没被截：文字装得下
    expect(label.scrollWidth).toBeLessThanOrEqual(label.clientWidth)
    // 列名部件只投部件属性，不带列身份、角色与排序状态
    for (const name of ['role', 'data-value', 'data-sort', 'data-sortable', 'aria-sort', 'tabindex'])
      expect(label.hasAttribute(name), name).toBe(false)
  })
})
