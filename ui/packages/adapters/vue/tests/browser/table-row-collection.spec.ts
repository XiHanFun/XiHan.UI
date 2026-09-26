// 表体行接入 Collection Item 的 page 语境后，行盒几何一寸不动：行仍是 flex 容器、零内衬、零圆角，
// 吸附列的内联偏移与 inherit 到的底照旧；选中行铺品牌淡底 + 淡底前景，悬停 100 / 按下 200 只换面。
// 家族给行的是 display: grid + 内衬 + 圆角 + pointer 光标，这些都得被皮肤逐项盖掉——
// jsdom 不排版，只有真实浏览器量得出来。
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
  XhTableRowSelectTrigger,
} from '../../src'
import { pressPointer, releasePointer } from './pointer-press'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

const columns = [
  { id: 'select', label: '', width: 56, sticky: 'start' as const },
  { id: 'name', label: '名称', width: 160, sticky: 'start' as const },
  { id: 'size', label: '大小', width: 240 },
  { id: 'owner', label: '负责人', width: 240 },
]
const rows = [{ id: 'a' }, { id: 'b' }, { id: 'c' }]

let app: App | null = null
let host: HTMLElement | null = null

afterEach(() => {
  app?.unmount()
  host?.remove()
  app = null
  host = null
})

/** 在宿主的主题下把令牌解析成最终颜色，断言不写死任何色值。 */
function resolve(token: string, property: 'background-color' | 'color' = 'background-color'): string {
  const probe = document.createElement('span')
  probe.style.setProperty(property, `var(${token})`)
  host!.append(probe)
  const value = getComputedStyle(probe).getPropertyValue(property)
  probe.remove()
  return value
}

async function mountTable(): Promise<[HTMLElement, HTMLElement, HTMLElement]> {
  host = document.createElement('div')
  // 表比容器宽：横向要滚，吸附列才有意义
  host.style.inlineSize = '360px'
  document.body.append(host)
  app = createApp({
    render: () => h(XhTableRoot, { columns, rows, selectionMode: 'multiple', defaultSelection: ['a'] }, {
      default: () => [
        h(XhTableHeader, null, {
          default: () => [h(XhTableRow, null, {
            default: () => columns.map(column => h(XhTableColumnHeader, { key: column.id, value: column.id }, { default: () => h(XhTableColumnLabel, null, { default: () => column.label }) })),
          })],
        }),
        h(XhTableBody, null, {
          default: () => rows.map(row => h(
            XhTableRow,
            { key: row.id, value: row.id },
            {
              default: () => [
                h(XhTableCell, { value: 'select' }, { default: () => h(XhTableRowSelectTrigger) }),
                h(XhTableCell, { value: 'name' }, { default: () => row.id }),
                h(XhTableCell, { value: 'size' }, { default: () => '12 KB' }),
                h(XhTableCell, { value: 'owner' }, { default: () => 'xihan' }),
              ],
            },
          )),
        }),
      ],
    }),
  })
  app.mount(host)
  await nextTick()
  const found = [...host.querySelectorAll<HTMLElement>('[data-scope="table"][data-part="body"] > [data-scope="table"][data-part="row"]')]
  for (const row of found)
    row.style.transition = 'none'
  const [a, b, c] = found
  if (!a || !b || !c || found.length !== rows.length)
    throw new Error(`表体应渲染 ${rows.length} 行，实际 ${found.length} 行`)
  return [a, b, c]
}

describe('表体行的 Collection Item 语境', () => {
  it('行盒几何不动：flex、零内衬、零圆角、默认光标；单元格首尾相接且吸附列贴在行首', async () => {
    const [a] = await mountTable()
    const style = getComputedStyle(a)
    expect(style.display).toBe('flex')
    expect(style.paddingInlineStart).toBe('0px')
    expect(style.paddingBlockStart).toBe('0px')
    expect(style.borderTopLeftRadius).toBe('0px')
    expect(style.cursor).toBe('default')
    const cells = [...a.querySelectorAll<HTMLElement>('[data-part="cell"]')]
    expect(cells.map(cell => cell.getBoundingClientRect().width)).toEqual([56, 160, 240, 240])
    // 相邻单元格首尾相接：家族网格的列轨与槽外边距没有插进来
    for (let i = 1; i < cells.length; i++)
      expect(cells[i]!.getBoundingClientRect().left).toBe(cells[i - 1]!.getBoundingClientRect().right)
    // 行高由单元格撑出，行自己不加高
    expect(a.getBoundingClientRect().height).toBe(cells[1]!.getBoundingClientRect().height)
    expect(getComputedStyle(cells[1]!).position).toBe('sticky')
  })

  it('横向滚动后吸附列钉在行首，且底色 inherit 到行的选中面', async () => {
    const [a, b] = await mountTable()
    const root = host!.querySelector<HTMLElement>('[data-scope="table"][data-part="root"]')!
    root.scrollLeft = 150
    await nextTick()
    // 吸附列钉在滚动容器的内边缘（描边之内）
    const edge = root.getBoundingClientRect().left + root.clientLeft
    const cellsA = [...a.querySelectorAll<HTMLElement>('[data-part="cell"]')]
    expect(cellsA[0]!.getBoundingClientRect().left).toBe(edge)
    expect(cellsA[1]!.getBoundingClientRect().left).toBe(edge + 56)
    // a 是选中行：行与吸附格同色（品牌淡底）；b 未选中：吸附格是实色 surface，不透明
    expect(getComputedStyle(a).backgroundColor).toBe(resolve('--xh-bg-brand-subtle'))
    expect(getComputedStyle(cellsA[1]!).backgroundColor).toBe(resolve('--xh-bg-brand-subtle'))
    const cellsB = [...b.querySelectorAll<HTMLElement>('[data-part="cell"]')]
    expect(getComputedStyle(b).backgroundColor).toBe(resolve('--xh-bg-surface'))
    expect(getComputedStyle(cellsB[1]!).backgroundColor).toBe(resolve('--xh-bg-surface'))
  })

  it('选中行品牌淡底 + 淡底前景，未选中行悬停 100、按住 200 只换面，选中行悬停 20%', async () => {
    const [a, b] = await mountTable()
    expect(a.getAttribute('aria-selected')).toBe('true')
    expect(getComputedStyle(a).color).toBe(resolve('--xh-fg-on-brand-subtle', 'color'))
    const before = b.getBoundingClientRect()
    await userEvent.hover(b)
    expect(getComputedStyle(b).backgroundColor).toBe(resolve('--xh-bg-subtle-opaque'))
    await pressPointer(b)
    expect(b.matches(':active')).toBe(true)
    expect(getComputedStyle(b).backgroundColor).toBe(resolve('--xh-bg-subtle-hover-opaque'))
    expect(getComputedStyle(b).scale).toBe('none')
    expect(b.getBoundingClientRect().height).toBe(before.height)
    await releasePointer(b)
    await userEvent.hover(a)
    expect(getComputedStyle(a).backgroundColor).toBe(resolve('--xh-bg-brand-subtle-hover'))
  })
})
