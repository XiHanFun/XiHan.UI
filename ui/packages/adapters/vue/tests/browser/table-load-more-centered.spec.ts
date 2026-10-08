// Table 的取下一页按钮接 Action Control row 档，文案居中：单行时整段居中，折行时逐行居中。
// 按钮摆在工具条里（root 的兄弟）。有层产物 index.css 与无层产物 index.unlayered.css 各量一次。
import { afterEach, describe, expect, it } from 'vitest'
import { h } from 'vue'
import {
  XhTableBody,
  XhTableCell,
  XhTableColumnHeader,
  XhTableColumnLabel,
  XhTableHeader,
  XhTableLoadMoreTrigger,
  XhTableRoot,
  XhTableRow,
  XhTableToolbar,
} from '../../src'
import { closeSheetFrame, expectTextCentered, serialize, SHEET_NAMES, sheetParts, stageSheet, textLines } from './sheet-frame'

const LABELS = ['加载更多', '加载更多（还有 128 条没有显示，滚到底或点这里继续往下取）']

const columns = [{ id: 'name', label: '任务' }]

afterEach(closeSheetFrame)

describe('table 取下一页按钮', () => {
  it.each(SHEET_NAMES)('文案单行与折行都居中（%s）', async (sheet) => {
    const markup = await serialize(() => h('div', { style: { inlineSize: '240px' } }, LABELS.map(label =>
      h(XhTableRoot, { key: label, columns, rows: [{ id: 'a' }] }, {
        toolbar: () => h(XhTableToolbar, null, { default: () => h(XhTableLoadMoreTrigger, null, { default: () => label }) }),
        default: () => [
          h(XhTableHeader, null, {
            default: () => h(XhTableRow, null, {
              default: () => h(XhTableColumnHeader, { value: 'name' }, { default: () => h(XhTableColumnLabel, null, { default: () => '任务' }) }),
            }),
          }),
          h(XhTableBody, null, {
            default: () => h(XhTableRow, { value: 'a' }, { default: () => h(XhTableCell, { value: 'name' }, { default: () => '整理周报' }) }),
          }),
        ],
      }))))
    const doc = await stageSheet(markup, sheet)
    const triggers = sheetParts(doc, 'table', 'load-more-trigger')
    expect(triggers).toHaveLength(LABELS.length)
    expect(triggers.every(trigger => trigger.getAttribute('data-xh-action-profile') === 'row')).toBe(true)
    expect(textLines(triggers[0]!)).toHaveLength(1)
    expect(textLines(triggers[1]!).length).toBeGreaterThan(1)

    for (const trigger of triggers)
      expectTextCentered(trigger)
  })
})
