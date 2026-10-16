// @vitest-environment jsdom

import type { DiagnosticRecord } from '@xihan-ui/core'
import { DIAGNOSTIC_CODES, onDiagnostic } from '@xihan-ui/core'
import { buildHeatmapGrid, buildHeatmapMatrixGrid, heatmapMatrixKey } from '@xihan-ui/headless'
import { afterEach, describe, expect, it } from 'vitest'
import { defineXhElements } from '../src/define'

defineXhElements()

interface HeatmapHost extends HTMLElement {
  updateComplete: Promise<unknown>
  value?: unknown[]
  rows?: string[]
  columns?: string[]
  pending?: boolean
}

const RANGE = { startDate: '2024-01-01', endDate: '2024-01-31' }

const stops: Array<() => void> = []
afterEach(() => {
  while (stops.length) stops.pop()!()
  document.body.replaceChildren()
})

// 生成节点引起的变更经观察器再排一轮更新，等三拍才稳定
async function settle(el: HeatmapHost): Promise<void> {
  for (let i = 0; i < 3; i++) {
    await el.updateComplete
    await Promise.resolve()
  }
}

function mount(attrs: Record<string, string>, inner = '<div data-xh-part="root"></div>'): HeatmapHost {
  const el = document.createElement('xh-heatmap') as HeatmapHost
  for (const [name, value] of Object.entries(attrs))
    el.setAttribute(name, value)
  el.innerHTML = inner
  document.body.append(el)
  return el
}

function partsOf(parent: Element): string[] {
  return Array.from(parent.children).map(node => node.getAttribute('data-part') ?? '')
}

function root(el: HeatmapHost): HTMLElement {
  return el.querySelector('[data-xh-part="root"]')!
}

describe('xh-heatmap 生成结构', () => {
  it('只写 root：按日历网格生成月份行、网格、空态与图例，不报缺少 grid', async () => {
    const records: DiagnosticRecord[] = []
    stops.push(onDiagnostic(record => records.push(record)))
    const el = mount({ 'start-date': RANGE.startDate, 'end-date': RANGE.endDate })
    el.value = [{ date: '2024-01-02', count: 4 }]
    await settle(el)

    const grid = buildHeatmapGrid(RANGE)
    expect(partsOf(root(el))).toEqual(['row', 'grid', 'empty', 'legend'])
    const gridEl = root(el).querySelector<HTMLElement>('[data-part="grid"]')!
    expect(gridEl.getAttribute('role')).toBe('grid')
    expect(gridEl.querySelectorAll('[data-part="row"][role="row"]')).toHaveLength(grid.rows.length)
    const cells = gridEl.querySelectorAll<HTMLElement>('[data-part="cell"]')
    expect(cells).toHaveLength(grid.cells.size)
    expect(root(el).querySelectorAll('[data-part="month-label"]')).toHaveLength(grid.months.length)
    expect(Array.from(root(el).querySelectorAll('*')).every(node => node.hasAttribute('data-xh-gen'))).toBe(true)
    const busy = gridEl.querySelector<HTMLElement>('[data-part="cell"][data-value="2024-01-02"]')!
    expect(busy.getAttribute('aria-label')).toBe('4 on 2024-01-02')
    expect(root(el).querySelector('[data-part="empty"]')!.hasAttribute('hidden')).toBe(true)
    expect(records.some(record => record.code === DIAGNOSTIC_CODES.wcMissingPart)).toBe(false)
  })

  it('什么都不写：连 root 一起生成，不报缺少部件', async () => {
    const records: DiagnosticRecord[] = []
    stops.push(onDiagnostic(record => records.push(record)))
    const el = mount({ 'start-date': RANGE.startDate, 'end-date': RANGE.endDate }, '')
    await settle(el)
    expect(partsOf(root(el))).toEqual(['row', 'grid', 'empty', 'legend'])
    expect(root(el).getAttribute('data-xh-gen')).toBe('structure')
    expect(records.filter(record => record.code === DIAGNOSTIC_CODES.wcMissingPart)).toEqual([])
  })

  it('数据变化时按身份复用格子，只改档位', async () => {
    const el = mount({ 'start-date': RANGE.startDate, 'end-date': RANGE.endDate })
    el.value = [{ date: '2024-01-02', count: 1 }]
    await settle(el)
    const before = root(el).querySelector('[data-part="cell"][data-value="2024-01-02"]')
    el.value = [{ date: '2024-01-02', count: 1 }, { date: '2024-01-03', count: 9 }]
    await settle(el)
    const after = root(el).querySelector('[data-part="cell"][data-value="2024-01-02"]')
    expect(after).toBe(before)
    expect(root(el).querySelector('[data-part="cell"][data-value="2024-01-03"]')!.getAttribute('data-level')).not.toBe('0')
  })

  it('矩阵形态：表头行接列名，数据行接行名与格子，行列号把表头计入', async () => {
    const el = mount({ variant: 'matrix' })
    el.rows = ['甲', '乙']
    el.columns = ['上午', '下午']
    el.value = [{ row: '乙', column: '下午', value: 3 }]
    await settle(el)

    const matrix = buildHeatmapMatrixGrid({ variant: 'matrix', rows: el.rows, columns: el.columns, value: el.value as never })
    expect(partsOf(root(el))).toEqual(['grid', 'empty', 'legend'])
    const rows = root(el).querySelectorAll('[data-part="grid"] > [data-part="row"]')
    expect(rows).toHaveLength(matrix.rows.length + 1)
    expect(Array.from(rows[0]!.querySelectorAll('[role="columnheader"]')).map(node => node.textContent)).toEqual(['上午', '下午'])
    const cell = rows[2]!.querySelectorAll<HTMLElement>('[data-part="cell"]')[1]!
    expect(cell.getAttribute('data-row')).toBe('乙')
    expect(cell.getAttribute('aria-colindex')).toBe('3')
  })

  it('空态留空：写入空态文案，取数中改写加载文案', async () => {
    const el = mount({ 'start-date': RANGE.startDate, 'end-date': RANGE.endDate })
    await settle(el)
    const empty = root(el).querySelector<HTMLElement>('[data-part="empty"]')!
    expect(empty.hasAttribute('hidden')).toBe(false)
    expect(empty.textContent).toBe('No data')
    el.pending = true
    await settle(el)
    expect(empty.textContent).toBe('Loading…')
    expect(root(el).getAttribute('aria-busy')).toBe('true')
  })

  it('作者写了 grid：撤掉生成过的节点，由作者全部手写', async () => {
    const el = mount({ 'start-date': RANGE.startDate, 'end-date': RANGE.endDate })
    await settle(el)
    expect(root(el).querySelector('[data-xh-gen]')).not.toBeNull()

    const authored = document.createElement('div')
    authored.dataset.xhPart = 'grid'
    root(el).append(authored)
    await settle(el)
    expect(root(el).querySelector('[data-xh-gen]')).toBeNull()
    expect(authored.getAttribute('role')).toBe('grid')
  })

  it('作者写的 tooltip 与 legend 保留，元素只补其余部分，末尾几段按缺省结构的先后排', async () => {
    const el = mount(
      { 'start-date': RANGE.startDate, 'end-date': RANGE.endDate },
      '<div data-xh-part="root"><div data-xh-part="tooltip"></div><div data-xh-part="legend"></div></div>',
    )
    await settle(el)
    expect(partsOf(root(el))).toEqual(['row', 'grid', 'tooltip', 'empty', 'legend'])
    expect(root(el).querySelector('[data-part="legend"]')!.hasAttribute('data-xh-gen')).toBe(false)
  })

  it('点按生成的格子派发 datum-press，载荷带联动键', async () => {
    const el = mount({ variant: 'matrix' })
    el.rows = ['甲']
    el.columns = ['上午']
    el.value = [{ row: '甲', column: '上午', value: 2 }]
    await settle(el)
    const presses: Array<{ key: string }> = []
    el.addEventListener('datum-press', event => presses.push((event as CustomEvent<{ key: string }>).detail))
    root(el).querySelector<HTMLElement>('[data-part="cell"]')!.click()
    expect(presses.map(detail => detail.key)).toEqual([heatmapMatrixKey('甲', '上午')])
  })
})
