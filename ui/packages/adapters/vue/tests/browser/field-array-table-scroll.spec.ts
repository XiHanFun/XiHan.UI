// field-array 表格排布在窄容器里：列宽有下限，下限之和超过容器时表格区横向滚动，表头与各行一起滚；
// 行头与把手钉在两侧，紧挨滚动区的一侧只在确有内容被压住时画分隔线；放不下时表格本体进 Tab 序列，一行都没有也能用键盘滚动。
//
// 只有真实浏览器量得出来：靠的是网格轨道、粘性定位与滚动的实际排布。
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { page, userEvent } from 'vitest/browser'
import { createApp, h, nextTick } from 'vue'
import {
  XhFieldArrayColumnHeader,
  XhFieldArrayHeader,
  XhFieldArrayItem,
  XhFieldArrayItemAction,
  XhFieldArrayItemCell,
  XhFieldArrayItemDeleteTrigger,
  XhFieldArrayItemLabel,
  XhFieldArrayRoot,
  XhFieldArrayTable,
} from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let app: App | null = null
let host: HTMLElement | null = null

afterEach(() => {
  app?.unmount()
  host?.remove()
  app = null
  host = null
})

const COLUMNS = [
  { id: 'name', label: '变量名', minWidth: 120 },
  { id: 'type', label: '类型', minWidth: 120 },
  { id: 'value', label: '缺省值', minWidth: 120 },
  { id: 'required', label: '必填', width: 64 },
]

// 裸 input 有固有宽，铺满格子才与库内字段控件在格里的样子一致
const INPUT_STYLE = 'inline-size: 100%; min-inline-size: 0; box-sizing: border-box'

async function settle(): Promise<void> {
  for (let i = 0; i < 3; i++) {
    await nextTick()
    await new Promise<void>(resolve => requestAnimationFrame(() => resolve()))
  }
}

async function mount(width: number, count = 2): Promise<HTMLElement> {
  host = document.createElement('div')
  host.style.inlineSize = `${width}px`
  document.body.append(host)
  app = createApp({
    render: () => h(XhFieldArrayRoot, { 'layout': 'table', 'columns': COLUMNS, 'defaultValue': Array.from({ length: count }, () => ({})), 'aria-label': '启动变量' }, {
      default: ({ items }: { items: Array<{ key: string, index: number }> }) => [
        h(XhFieldArrayTable, null, () => [
          h(XhFieldArrayHeader, null, () => COLUMNS.map(column => h(XhFieldArrayColumnHeader, { key: column.id, value: column.id }))),
          ...items.map(item => h(XhFieldArrayItem, { key: item.key, index: item.index }, () => [
            h(XhFieldArrayItemLabel, () => String(item.index + 1)),
            ...COLUMNS.map(column => h(XhFieldArrayItemCell, { key: column.id, value: column.id }, () => h('input', { 'aria-label': `${column.label} ${item.index + 1}`, 'style': INPUT_STYLE }))),
            h(XhFieldArrayItemAction, () => h(XhFieldArrayItemDeleteTrigger)),
          ])),
        ]),
      ],
    }),
  })
  app.mount(host)
  await settle()
  return host
}

const table = (root: HTMLElement): HTMLElement => root.querySelector<HTMLElement>('[data-scope="field-array"][data-part="table"]')!
const rows = (root: HTMLElement): HTMLElement[] => [...root.querySelectorAll<HTMLElement>('[data-scope="field-array"][data-part="item"]')]
function inRow(row: HTMLElement, part: string, value?: string): HTMLElement {
  return row.querySelector<HTMLElement>(`[data-scope="field-array"][data-part="${part}"]${value === undefined ? '' : `[data-value="${value}"]`}`)!
}
function columnHeader(root: HTMLElement, value: string): HTMLElement {
  return root.querySelector<HTMLElement>(`[data-scope="field-array"][data-part="column-header"][data-value="${value}"]`)!
}
const transparent = (color: string): boolean => color === 'transparent' || /rgba\(.*,\s*0\)$/.test(color)

async function scrollTo(el: HTMLElement, left: number): Promise<void> {
  el.scrollLeft = left
  el.dispatchEvent(new Event('scroll'))
  await settle()
}

describe('field-array 表格排布的窄宽', () => {
  it('列宽不压到下限以下，下限之和超过容器时表格区横向滚动', async () => {
    const root = await mount(300)
    const area = table(root)
    expect(area.scrollWidth).toBeGreaterThan(area.clientWidth)
    for (const id of ['name', 'type', 'value'])
      expect(inRow(rows(root)[0]!, 'item-cell', id).getBoundingClientRect().width).toBeGreaterThanOrEqual(119.5)
    // 表格区自己滚，不把外层撑宽
    expect(host!.scrollWidth).toBeLessThanOrEqual(host!.clientWidth)
  })

  it('表头与各行一起滚：滚过之后同一列的左右边缘仍对齐', async () => {
    const root = await mount(300)
    const area = table(root)
    await scrollTo(area, 100)
    expect(area.scrollLeft).toBeGreaterThan(0)
    for (const id of ['type', 'value']) {
      const head = columnHeader(root, id).getBoundingClientRect()
      for (const row of rows(root)) {
        const cell = inRow(row, 'item-cell', id).getBoundingClientRect()
        expect(Math.abs(cell.left - head.left)).toBeLessThanOrEqual(1)
        expect(Math.abs(cell.right - head.right)).toBeLessThanOrEqual(1)
      }
    }
  })

  it('行头钉在起始侧、把手钉在末端侧，滚动时留在原处；表头里那一格压住滑过去的列头', async () => {
    const root = await mount(300)
    const area = table(root)
    const row = rows(root)[0]!
    const label = inRow(row, 'item-label').getBoundingClientRect()
    const action = inRow(row, 'item-action').getBoundingClientRect()
    const box = area.getBoundingClientRect()
    expect(action.right).toBeLessThanOrEqual(box.right + 0.5)
    await scrollTo(area, 100)
    expect(Math.abs(inRow(row, 'item-label').getBoundingClientRect().left - label.left)).toBeLessThanOrEqual(0.5)
    expect(Math.abs(inRow(row, 'item-action').getBoundingClientRect().right - action.right)).toBeLessThanOrEqual(0.5)
    // 表头里行头那条轨道上点到的是表头自己（它的伪元素），不是滑到下面的列头
    const header = root.querySelector<HTMLElement>('[data-scope="field-array"][data-part="header"]')!
    const headerBox = header.getBoundingClientRect()
    const hit = document.elementFromPoint(label.left + label.width / 2, headerBox.top + headerBox.height / 2)
    expect(hit).toBe(header)
  })

  it('分隔线只在确有内容被压住时出现', async () => {
    const root = await mount(300)
    const area = table(root)
    const row = rows(root)[0]!
    const labelEdge = (): string => getComputedStyle(inRow(row, 'item-label')).borderInlineEndColor
    const actionEdge = (): string => getComputedStyle(inRow(row, 'item-action')).borderInlineStartColor
    // 起始端：行头一侧没有被压住的内容，把手一侧压着后面的列
    expect(area.hasAttribute('data-at-min-horizontal')).toBe(true)
    expect(area.hasAttribute('data-at-max-horizontal')).toBe(false)
    await new Promise(resolve => setTimeout(resolve, 200))
    expect(transparent(labelEdge())).toBe(true)
    expect(transparent(actionEdge())).toBe(false)
    await scrollTo(area, area.scrollWidth)
    await new Promise(resolve => setTimeout(resolve, 200))
    expect(area.hasAttribute('data-at-min-horizontal')).toBe(false)
    expect(area.hasAttribute('data-at-max-horizontal')).toBe(true)
    expect(transparent(labelEdge())).toBe(false)
    expect(transparent(actionEdge())).toBe(true)
  })

  it('放不下时表格本体进 Tab 序列：一行都没有，Tab 也停得到它上面，名字是表格的名字，方向键横向滚动', async () => {
    const before = document.createElement('button')
    before.textContent = 'before'
    document.body.prepend(before)
    try {
      const root = await mount(241, 0)
      const area = table(root)
      expect(area.scrollWidth).toBeGreaterThan(area.clientWidth)
      expect(root.scrollWidth).toBeLessThanOrEqual(root.clientWidth)
      expect(area.getAttribute('tabindex')).toBe('0')
      before.focus()
      await userEvent.keyboard('{Tab}')
      expect(document.activeElement).toBe(area)
      expect(page.getByRole('table', { name: '启动变量' }).element()).toBe(area)
      await userEvent.keyboard('{ArrowRight}{ArrowRight}{ArrowRight}')
      await settle()
      expect(area.scrollLeft).toBeGreaterThan(0)
    }
    finally {
      before.remove()
    }
  })

  it('容器放得下时不滚动，两侧都不画分隔线，表格本体不进 Tab 序列', async () => {
    const root = await mount(900)
    const area = table(root)
    expect(area.hasAttribute('tabindex')).toBe(false)
    expect(area.scrollWidth).toBeLessThanOrEqual(area.clientWidth)
    expect(area.hasAttribute('data-at-min-horizontal')).toBe(true)
    expect(area.hasAttribute('data-at-max-horizontal')).toBe(true)
    await new Promise(resolve => setTimeout(resolve, 200))
    const row = rows(root)[0]!
    expect(transparent(getComputedStyle(inRow(row, 'item-label')).borderInlineEndColor)).toBe(true)
    expect(transparent(getComputedStyle(inRow(row, 'item-action')).borderInlineStartColor)).toBe(true)
  })
})
