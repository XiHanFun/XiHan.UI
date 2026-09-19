// 表格里的四颗把手（全选框、行勾选框、展开箭头、列设置勾选框）接入 Action Control icon 档，
// 排序把手接入 row 档：盒仍是 16px 指示符档、面按字段静息形态取值、按下由家族给 0.97 缩放并换底；
// 排序把手撑满列头、按表头 host 槽下发的淡底阶梯换面且不缩放。jsdom 不排版，只有真实浏览器量得出来。
import type { App } from 'vue'
import { userEvent } from '@vitest/browser/context'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import {
  XhTableBody,
  XhTableCell,
  XhTableColumnHeader,
  XhTableExpandTrigger,
  XhTableHeader,
  XhTableRoot,
  XhTableRow,
  XhTableRowSelectTrigger,
  XhTableSelectAllTrigger,
  XhTableSortTrigger,
} from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

const columns = [
  { id: 'select', label: '', width: 56 },
  { id: 'name', label: '名称', width: 160, sortable: true },
  { id: 'size', label: '大小', width: 120 },
]
const rows = [{ id: 'a', expandable: true }, { id: 'b' }]

let app: App | null = null
let host: HTMLElement | null = null

afterEach(() => {
  app?.unmount()
  host?.remove()
  app = null
  host = null
})

function resolve(token: string): string {
  const probe = document.createElement('span')
  probe.style.setProperty('background-color', `var(${token})`)
  host!.append(probe)
  const value = getComputedStyle(probe).backgroundColor
  probe.remove()
  return value
}

function part(name: string, index = 0): HTMLElement {
  const element = host!.querySelectorAll<HTMLElement>(`[data-scope='table'][data-part='${name}']`)[index]
  if (!element)
    throw new Error(`缺少 table 部件：${name}[${index}]`)
  return element
}

async function mount(): Promise<void> {
  host = document.createElement('div')
  // 断言读的是终值：按压与释放的过渡时长归零
  host.style.setProperty('--xh-motion-duration-micro', '0ms')
  host.style.setProperty('--xh-motion-duration-press', '0ms')
  host.style.setProperty('--xh-motion-duration-release', '0ms')
  document.body.append(host)
  app = createApp({
    render: () => h(XhTableRoot, { columns, rows, selectionMode: 'multiple', defaultSelection: ['b'] }, {
      default: () => [
        h(XhTableHeader, null, {
          default: () => [h(XhTableRow, null, {
            default: () => columns.map(column => h(XhTableColumnHeader, { key: column.id, value: column.id }, {
              default: () => column.id === 'select'
                ? h(XhTableSelectAllTrigger)
                : column.sortable ? h(XhTableSortTrigger, null, { default: () => column.label }) : column.label,
            })),
          })],
        }),
        h(XhTableBody, null, {
          default: () => rows.map(row => h(XhTableRow, { key: row.id, value: row.id }, {
            default: () => [
              h(XhTableCell, { value: 'select' }, { default: () => [h(XhTableRowSelectTrigger), h(XhTableExpandTrigger)] }),
              h(XhTableCell, { value: 'name' }, { default: () => row.id }),
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

describe('table 把手接入 Action Control', () => {
  it('三颗勾选框是 16px 的 outline 方框：canvas 底 + border-control 描边，勾中实心品牌面', async () => {
    await mount()
    const selectAll = part('select-all-trigger')
    const unchecked = part('row-select-trigger', 0)
    const checked = part('row-select-trigger', 1)
    expect(selectAll.getAttribute('data-xh-action-control')).toBe('')
    expect(selectAll.getAttribute('data-xh-action-profile')).toBe('icon')
    expect(selectAll.getAttribute('data-xh-action-variant')).toBe('outline')
    expect(unchecked.getBoundingClientRect().width).toBe(16)
    expect(unchecked.getBoundingClientRect().height).toBe(16)
    expect(getComputedStyle(unchecked).backgroundColor).toBe(resolve('--xh-bg-canvas'))
    expect(getComputedStyle(unchecked).borderTopColor).toBe(resolve('--xh-border-control'))
    expect(getComputedStyle(unchecked).boxShadow).toBe('none')
    expect(getComputedStyle(checked).backgroundColor).toBe(resolve('--xh-bg-brand'))
    expect(getComputedStyle(checked).borderTopColor).toBe(resolve('--xh-bg-brand'))
    expect(getComputedStyle(checked).color).toBe(resolve('--xh-fg-on-brand'))
  })

  it('按下 0.97 缩放并换底：空框落 200 档，勾中的落 brand-active', async () => {
    await mount()
    const unchecked = part('row-select-trigger', 0)
    const checked = part('row-select-trigger', 1)
    unchecked.setAttribute('data-pressed', '')
    expect(getComputedStyle(unchecked).scale).toBe('0.97')
    expect(getComputedStyle(unchecked).backgroundColor).toBe(resolve('--xh-bg-subtle-hover'))
    unchecked.removeAttribute('data-pressed')
    checked.setAttribute('data-pressed', '')
    expect(getComputedStyle(checked).backgroundColor).toBe(resolve('--xh-bg-brand-active'))
    checked.removeAttribute('data-pressed')
    expect(getComputedStyle(checked).scale).toBe('none')
  })

  it('展开箭头是 ghost 图标钮：静息透明、按下落 200 档并缩放', async () => {
    await mount()
    const expand = part('expand-trigger', 0)
    expect(expand.getAttribute('data-xh-action-variant')).toBe('ghost')
    expect(expand.getBoundingClientRect().width).toBe(16)
    expect(getComputedStyle(expand).backgroundColor).toBe('rgba(0, 0, 0, 0)')
    expect(getComputedStyle(expand).borderTopColor).toBe('rgba(0, 0, 0, 0)')
    expect(getComputedStyle(expand).color).toBe(resolve('--xh-fg-subtle'))
    expand.setAttribute('data-pressed', '')
    expect(getComputedStyle(expand).scale).toBe('0.97')
    expect(getComputedStyle(expand).backgroundColor).toBe(resolve('--xh-bg-subtle-hover'))
  })

  it('排序把手撑满列头，悬停 200 / 按下 300 只换面不缩放，不叠 row 档的内距与最小高度', async () => {
    await mount()
    const sort = part('sort-trigger')
    expect(sort.getAttribute('data-xh-action-profile')).toBe('row')
    const header = sort.closest<HTMLElement>('[data-part="column-header"]')!
    const style = getComputedStyle(sort)
    expect(style.paddingInlineStart).toBe('0px')
    expect(style.paddingBlockStart).toBe('0px')
    expect(style.minHeight).toBe('0px')
    expect(style.fontSize).toBe(getComputedStyle(header).fontSize)
    expect(style.fontWeight).toBe(getComputedStyle(header).fontWeight)
    expect(sort.getBoundingClientRect().height).toBeLessThanOrEqual(header.getBoundingClientRect().height)
    await userEvent.hover(sort)
    await expect.poll(() => getComputedStyle(sort).backgroundColor).toBe(resolve('--xh-bg-subtle-hover'))
    await userEvent.unhover(sort)
    sort.setAttribute('data-pressed', '')
    expect(getComputedStyle(sort).backgroundColor).toBe(resolve('--xh-bg-subtle-active'))
    expect(getComputedStyle(sort).scale).toBe('none')
    // 排序箭头字形仍在行内位置
    expect(getComputedStyle(sort, '::after').position).toBe('static')
  })
})
