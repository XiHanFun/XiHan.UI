// 表格里的五颗把手（全选框、行勾选框、展开箭头、列设置勾选框、排序钮）都接入 Action Control icon 档：
// 盒是 16px 指示符档、面按字段静息形态取值、按下由家族给 0.97 缩放并换底。
// 排序钮是列名之后一颗独立的 ghost 图标钮，贴列头行尾与列宽把手并排，按表头 host 槽下发的淡底阶梯换面；
// 列头文字不再是排序的命中区。jsdom 不排版，只有真实浏览器量得出来。
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { userEvent } from 'vitest/browser'
import { createApp, h, nextTick, ref } from 'vue'
import {
  XhTableBody,
  XhTableCell,
  XhTableColumnHeader,
  XhTableColumnLabel,
  XhTableColumnResizeTrigger,
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
  { id: 'name', label: '名称', width: 160, sortable: true, resizable: true },
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

/** 排序链，受控：点了什么这里就能看见 */
const sort = ref<{ id: string, direction: 'asc' | 'desc' }[]>([])

async function mount(): Promise<void> {
  sort.value = []
  host = document.createElement('div')
  // 断言读的是终值：按压与释放的过渡时长归零
  host.style.setProperty('--xh-motion-duration-micro', '0ms')
  host.style.setProperty('--xh-motion-duration-press', '0ms')
  host.style.setProperty('--xh-motion-duration-release', '0ms')
  document.body.append(host)
  app = createApp({
    render: () => h(XhTableRoot, {
      columns,
      rows,
      selectionMode: 'multiple',
      defaultSelection: ['b'],
      sort: sort.value,
      onSortChange: ({ value }: { value: { id: string, direction: 'asc' | 'desc' }[] }) => { sort.value = value },
    }, {
      default: () => [
        h(XhTableHeader, null, {
          default: () => [h(XhTableRow, null, {
            // 列名装在 column-label 里，排序钮与列宽把手排在它之后
            default: () => columns.map(column => h(XhTableColumnHeader, { key: column.id, value: column.id }, {
              default: () => column.id === 'select'
                ? h(XhTableSelectAllTrigger)
                : [h(XhTableColumnLabel, null, { default: () => column.label }), column.sortable ? h(XhTableSortTrigger) : null, column.resizable ? h(XhTableColumnResizeTrigger) : null],
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

  it('排序钮是指示符档的 ghost 图标钮，贴列头行尾与列宽把手并排，不包列名', async () => {
    await mount()
    const trigger = part('sort-trigger')
    expect(trigger.getAttribute('data-xh-action-profile')).toBe('icon')
    expect(trigger.getAttribute('data-xh-action-variant')).toBe('ghost')
    expect(trigger.getAttribute('aria-label')).toBe('Sort by 名称')
    expect(trigger.textContent).toBe('')
    const header = trigger.closest<HTMLElement>('[data-part="column-header"]')!
    expect(header.textContent).toContain('名称')
    // 定尺方盒：与展开箭头同一支 16px 指示符档
    const box = trigger.getBoundingClientRect()
    expect(box.width).toBe(16)
    expect(box.height).toBe(16)
    // 静息透明，箭头取 subtle 前景
    expect(getComputedStyle(trigger).backgroundColor).toBe('rgba(0, 0, 0, 0)')
    expect(getComputedStyle(trigger).color).toBe(resolve('--xh-fg-subtle'))
    // 贴行尾：钮右边紧接列宽把手，列宽把手贴着列头内容盒的右沿；两颗之间只剩列头的 gap，余量没有被两条 auto 边距平分
    const resize = part('column-resize-trigger')
    const headerBox = header.getBoundingClientRect()
    const resizeBox = resize.getBoundingClientRect()
    expect(resizeBox.right).toBeCloseTo(headerBox.right - Number.parseFloat(getComputedStyle(header).paddingRight), 1)
    const gap = Number.parseFloat(getComputedStyle(header).columnGap)
    expect(resizeBox.left - box.right).toBeCloseTo(gap, 1)
    // 列名装在 column-label 里、留在钮左边、不与钮重叠
    const label = header.querySelector<HTMLElement>('[data-part="column-label"]')!
    expect(label.textContent).toBe('名称')
    expect(label.getBoundingClientRect().right).toBeLessThanOrEqual(box.left)
  })

  it('点列头文字不排序，点钮才排序；钮的悬停 200 / 按下 300 与 0.97 缩放与展开箭头同款', async () => {
    await mount()
    const trigger = part('sort-trigger')
    const header = trigger.closest<HTMLElement>('[data-part="column-header"]')!
    const headerBox = header.getBoundingClientRect()
    // 点在列名文字上：离钮远远的那一头
    await userEvent.click(header, { position: { x: 12, y: headerBox.height / 2 } })
    await nextTick()
    expect(sort.value).toEqual([])
    expect(header.getAttribute('aria-sort')).toBe('none')
    await userEvent.click(trigger)
    await nextTick()
    expect(sort.value).toEqual([{ id: 'name', direction: 'asc' }])
    await expect.poll(() => header.getAttribute('aria-sort')).toBe('ascending')
    expect(trigger.getAttribute('data-sort')).toBe('asc')
    expect(getComputedStyle(trigger).color).toBe(resolve('--xh-fg-default'))
    // 悬停 / 按下按表头淡底阶梯：200 → 300，按下同时 0.97 缩放（与展开箭头同一份家族配方）
    await userEvent.hover(trigger)
    await expect.poll(() => getComputedStyle(trigger).backgroundColor).toBe(resolve('--xh-bg-subtle-hover'))
    await userEvent.unhover(trigger)
    trigger.setAttribute('data-pressed', '')
    expect(getComputedStyle(trigger).backgroundColor).toBe(resolve('--xh-bg-subtle-active'))
    expect(getComputedStyle(trigger).scale).toBe('0.97')
    trigger.removeAttribute('data-pressed')
    expect(getComputedStyle(trigger).scale).toBe('none')
  })
})
