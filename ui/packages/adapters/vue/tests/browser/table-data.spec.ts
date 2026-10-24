// 表格的数据驱动模式：只给 columns 与 data，排序、筛选、分页与虚拟化都由表格自己算。
//
// 要真实浏览器：筛选菜单要定位、虚拟化要量视口与行高，jsdom 不排版。
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { userEvent } from 'vitest/browser'
import { createApp, h } from 'vue'
import { XhTableRoot } from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

const DEPTS = ['平台', '前端', '测试']

const COLUMNS = [
  { id: 'name', label: '姓名', sortable: true },
  { id: 'dept', label: '部门', filterOptions: DEPTS.map(value => ({ value })) },
]

const PEOPLE = Array.from({ length: 25 }, (_, i) => ({ id: `u${i + 1}`, name: `员工 ${String(i + 1).padStart(2, '0')}`, dept: DEPTS[i % 3] }))

const MANY = Array.from({ length: 10_000 }, (_, i) => ({ id: `u${i + 1}`, no: i + 1, name: `员工 ${i + 1}` }))

/** 窗口里能铺的上限：根节点一屏十来行，加上前后的预渲染，远小于一万。 */
const WINDOW_LIMIT = 60

let app: App | null = null
let host: HTMLElement | null = null

afterEach(() => {
  app?.unmount()
  host?.remove()
  app = null
  host = null
})

function mount(props: Record<string, unknown>): void {
  host = document.createElement('div')
  document.body.append(host)
  app = createApp({ render: () => h(XhTableRoot, props) })
  app.mount(host)
}

function root(): HTMLElement {
  return document.querySelector<HTMLElement>('[data-scope="table"][data-part="root"]')!
}

function bodyRows(): string[] {
  return [...document.querySelectorAll('[data-scope="table"][data-part="body"] [data-scope="table"][data-part="row"]')].map(row => row.getAttribute('data-value') ?? '')
}

const ids = (...numbers: number[]): string[] => numbers.map(n => `u${n}`)
const range = (from: number, to: number): number[] => Array.from({ length: Math.abs(to - from) + 1 }, (_, i) => from < to ? from + i : from - i)

describe('表格的数据驱动模式', () => {
  it('排序钮按字段重排；列头的筛选钮打开勾选菜单，勾一项只留下命中的行并回到第 1 页；分页排在 root 之后', async () => {
    mount({ 'columns': COLUMNS, 'data': PEOPLE, 'pagination': true, 'pageSize': 10, 'aria-label': '员工' })
    expect(bodyRows()).toEqual(ids(...range(1, 10)))
    await expect.poll(() => root().nextElementSibling?.matches('[data-scope="pagination"][data-part="root"]') ?? false).toBe(true)

    await userEvent.click(root().nextElementSibling!.querySelector<HTMLElement>('[data-scope="pagination"][data-part="item"][data-value="2"]')!)
    await expect.poll(bodyRows).toEqual(ids(...range(11, 20)))

    const sort = document.querySelector<HTMLElement>('[data-scope="table"][data-part="sort-trigger"]')!
    await userEvent.click(sort)
    await userEvent.click(sort)
    await expect.poll(bodyRows).toEqual(ids(...range(15, 6)))

    const header = document.querySelector<HTMLElement>('[data-scope="table"][data-part="column-header"][data-value="dept"]')!
    const filter = header.querySelector<HTMLElement>('[data-scope="menu"][data-part="trigger"]')!
    await expect.poll(() => filter.getAttribute('aria-label')).toBe('Filter 部门')
    await userEvent.click(filter)
    const item = await expect.poll(() => document.querySelector<HTMLElement>('[data-scope="menu"][data-part="item"][data-value="前端"]')).not.toBeNull()
    void item
    await userEvent.click(document.querySelector<HTMLElement>('[data-scope="menu"][data-part="item"][data-value="前端"]')!)
    // 前端是 u2、u5 … u23 共 8 人，仍按姓名倒序；筛选值一变回到第 1 页，8 条只有 1 页
    await expect.poll(bodyRows).toEqual(ids(23, 20, 17, 14, 11, 8, 5, 2))
    expect(header.hasAttribute('data-filtered')).toBe(true)
    await expect.poll(() => root().nextElementSibling!.querySelector('[data-scope="pagination"][data-part="item"][data-value="2"]')).toBeNull()
  })

  it('virtual：一万行只铺一屏，滚的是表格根节点；End 落到第一万行', async () => {
    mount({ 'columns': [{ id: 'no', label: '编号' }, { id: 'name', label: '姓名' }], 'data': MANY, 'virtual': true, 'aria-label': '员工' })
    await expect.poll(() => bodyRows().length).toBeGreaterThan(0)
    expect(bodyRows().length).toBeLessThanOrEqual(WINDOW_LIMIT)
    expect(root().scrollHeight).toBeGreaterThan(MANY.length * 20)
    expect(root().getAttribute('aria-rowcount')).toBe('10001')

    document.querySelector<HTMLElement>('[data-scope="table"][data-part="body"] [data-scope="table"][data-part="row"]')!.focus()
    await userEvent.keyboard('{End}')
    await expect.poll(() => document.activeElement?.getAttribute('data-value')).toBe('u10000')
    expect(bodyRows().length).toBeLessThanOrEqual(WINDOW_LIMIT)
    expect(document.activeElement?.getAttribute('aria-rowindex')).toBe('10001')
  })
})
