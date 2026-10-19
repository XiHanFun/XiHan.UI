// xh-field-array 表格排布在窄容器里：列宽有下限，下限之和超过容器时表格区横向滚动，表头与各行一起滚；
// 行头与把手钉在两侧，紧挨滚动区的一侧只在确有内容被压住时画分隔线；放不下时表格本体进 Tab 序列，一行都没有也能用键盘滚动。
import type { XhFieldArrayElement } from '../../src/elements/field-array'
import { afterEach, describe, expect, it } from 'vitest'
import { page, userEvent } from 'vitest/browser'
import { defineXhElements } from '../../src/define'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

defineXhElements()

afterEach(() => {
  document.body.innerHTML = ''
})

const COLUMNS = [
  { id: 'name', label: '变量名', minWidth: 120 },
  { id: 'type', label: '类型', minWidth: 120 },
  { id: 'value', label: '缺省值', minWidth: 120 },
  { id: 'required', label: '必填', width: 64 },
]

async function settle(): Promise<void> {
  for (let i = 0; i < 3; i++) {
    await Promise.resolve()
    await new Promise<void>(resolve => requestAnimationFrame(() => resolve()))
  }
}

// 裸 input 有固有宽，铺满格子才与库内字段控件在格里的样子一致
function row(index: number): string {
  const cells = COLUMNS.map(column => `<div data-xh-part="item-cell" value="${column.id}"><input aria-label="${column.label} ${index + 1}" style="inline-size: 100%; min-inline-size: 0; box-sizing: border-box"></div>`).join('')
  return `<div data-xh-part="item"><span data-xh-part="item-label">${index + 1}</span>${cells}<div data-xh-part="item-action"><button data-xh-part="item-delete-trigger"></button></div></div>`
}

async function mount(width: number, count = 2): Promise<HTMLElement> {
  document.body.innerHTML = `
    <div style="inline-size: ${width}px">
      <button type="button">before</button>
      <xh-field-array layout="table" aria-label="启动变量">
        <div data-xh-part="root">
          <div data-xh-part="table">
            <div data-xh-part="header">${COLUMNS.map(column => `<div data-xh-part="column-header" value="${column.id}"></div>`).join('')}</div>
            ${Array.from({ length: count }, (_, index) => row(index)).join('')}
          </div>
        </div>
      </xh-field-array>
    </div>`
  const el = document.querySelector<XhFieldArrayElement>('xh-field-array')!
  el.columns = COLUMNS
  el.defaultValue = Array.from({ length: count }, () => ({}))
  await settle()
  return document.body.firstElementChild as HTMLElement
}

const table = (): HTMLElement => document.querySelector<HTMLElement>('[data-scope="field-array"][data-part="table"]')!
const rows = (): HTMLElement[] => [...document.querySelectorAll<HTMLElement>('[data-scope="field-array"][data-part="item"]')]
function inRow(item: HTMLElement, part: string, value?: string): HTMLElement {
  return item.querySelector<HTMLElement>(`[data-scope="field-array"][data-part="${part}"]${value === undefined ? '' : `[data-value="${value}"]`}`)!
}
function columnHeader(value: string): HTMLElement {
  return document.querySelector<HTMLElement>(`[data-scope="field-array"][data-part="column-header"][data-value="${value}"]`)!
}
const transparent = (color: string): boolean => color === 'transparent' || /rgba\(.*,\s*0\)$/.test(color)

async function scrollTo(el: HTMLElement, left: number): Promise<void> {
  el.scrollLeft = left
  el.dispatchEvent(new Event('scroll'))
  await settle()
}

describe('xh-field-array 表格排布的窄宽', () => {
  it('列宽不压到下限以下，下限之和超过容器时表格区横向滚动', async () => {
    const host = await mount(300)
    expect(table().scrollWidth).toBeGreaterThan(table().clientWidth)
    for (const id of ['name', 'type', 'value'])
      expect(inRow(rows()[0]!, 'item-cell', id).getBoundingClientRect().width).toBeGreaterThanOrEqual(119.5)
    expect(host.scrollWidth).toBeLessThanOrEqual(host.clientWidth)
  })

  it('表头与各行一起滚，行头与把手留在原处', async () => {
    await mount(300)
    const area = table()
    const first = rows()[0]!
    const label = inRow(first, 'item-label').getBoundingClientRect()
    const action = inRow(first, 'item-action').getBoundingClientRect()
    await scrollTo(area, 100)
    expect(area.scrollLeft).toBeGreaterThan(0)
    for (const id of ['type', 'value']) {
      const head = columnHeader(id).getBoundingClientRect()
      for (const item of rows())
        expect(Math.abs(inRow(item, 'item-cell', id).getBoundingClientRect().left - head.left)).toBeLessThanOrEqual(1)
    }
    expect(Math.abs(inRow(first, 'item-label').getBoundingClientRect().left - label.left)).toBeLessThanOrEqual(0.5)
    expect(Math.abs(inRow(first, 'item-action').getBoundingClientRect().right - action.right)).toBeLessThanOrEqual(0.5)
  })

  it('分隔线只在确有内容被压住时出现', async () => {
    await mount(300)
    const area = table()
    const first = rows()[0]!
    expect(area.hasAttribute('data-at-min-horizontal')).toBe(true)
    expect(area.hasAttribute('data-at-max-horizontal')).toBe(false)
    await new Promise(resolve => setTimeout(resolve, 200))
    expect(transparent(getComputedStyle(inRow(first, 'item-label')).borderInlineEndColor)).toBe(true)
    expect(transparent(getComputedStyle(inRow(first, 'item-action')).borderInlineStartColor)).toBe(false)
    await scrollTo(area, area.scrollWidth)
    await new Promise(resolve => setTimeout(resolve, 200))
    expect(area.hasAttribute('data-at-min-horizontal')).toBe(false)
    expect(area.hasAttribute('data-at-max-horizontal')).toBe(true)
    expect(transparent(getComputedStyle(inRow(first, 'item-label')).borderInlineEndColor)).toBe(false)
    expect(transparent(getComputedStyle(inRow(first, 'item-action')).borderInlineStartColor)).toBe(true)
  })

  it('容器放得下时不滚动，两端都贴着；表格本体不进 Tab 序列', async () => {
    await mount(900)
    expect(table().scrollWidth).toBeLessThanOrEqual(table().clientWidth)
    expect(table().hasAttribute('data-at-min-horizontal')).toBe(true)
    expect(table().hasAttribute('data-at-max-horizontal')).toBe(true)
    expect(table().hasAttribute('tabindex')).toBe(false)
  })

  it('放不下时表格本体进 Tab 序列：一行都没有，Tab 也停得到它上面，名字是表格的名字，方向键横向滚动', async () => {
    const host = await mount(241, 0)
    const area = table()
    expect(area.scrollWidth).toBeGreaterThan(area.clientWidth)
    expect(host.scrollWidth).toBeLessThanOrEqual(host.clientWidth)
    expect(area.getAttribute('tabindex')).toBe('0')
    page.getByRole('button', { name: 'before' }).element().focus()
    await userEvent.keyboard('{Tab}')
    expect(document.activeElement).toBe(area)
    expect(page.getByRole('table', { name: '启动变量' }).element()).toBe(area)
    await userEvent.keyboard('{ArrowRight}{ArrowRight}{ArrowRight}')
    await settle()
    expect(area.scrollLeft).toBeGreaterThan(0)
    expect(area.getAttribute('tabindex')).toBe('0')
  })

  it('有行时放不下同样进 Tab 序列，滚到头也还在', async () => {
    await mount(300)
    const area = table()
    expect(area.getAttribute('tabindex')).toBe('0')
    await scrollTo(area, area.scrollWidth)
    expect(area.getAttribute('tabindex')).toBe('0')
  })
})
