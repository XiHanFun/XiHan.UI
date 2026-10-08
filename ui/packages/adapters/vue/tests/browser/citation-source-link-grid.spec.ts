// Citation 来源列表的每一行接 Action Control row 档，排成「序号 | 标题 / 来源」两列：
// 序号列按内容取宽，文字列拿走余下的宽度。有层产物 index.css 与无层产物 index.unlayered.css 各量一次。
import type { CitationSource } from '@xihan-ui/headless'
import { afterEach, describe, expect, it } from 'vitest'
import { h } from 'vue'
import { XhCitationList, XhCitationRoot } from '../../src'
import { closeSheetFrame, contentBox, serialize, SHEET_NAMES, sheetParts, stageSheet } from './sheet-frame'

const sources: CitationSource[] = [
  { type: 'source-url', sourceId: 'report', title: '报告', url: 'https://example.com/report' },
  { type: 'source-url', sourceId: 'dataset', title: '数据集', url: 'https://example.com/dataset' },
]

afterEach(closeSheetFrame)

describe('citation 来源行', () => {
  it.each(SHEET_NAMES)('排成序号与文字两列，文字列铺到行尾（%s）', async (sheet) => {
    const markup = await serialize(() => h('div', { style: { inlineSize: '360px' } }, h(XhCitationRoot, { sources }, () => h(XhCitationList))))
    const doc = await stageSheet(markup, sheet)
    const view = doc.defaultView!
    const links = sheetParts(doc, 'citation', 'source-link')
    expect(links).toHaveLength(sources.length)
    expect(links.every(link => link.getAttribute('data-xh-action-profile') === 'row')).toBe(true)

    for (const link of links) {
      expect(view.getComputedStyle(link).display, `「${link.textContent}」没有排成两列`).toBe('grid')
      const index = link.querySelector<HTMLElement>('[data-part="source-index"]')!
      const text = link.lastElementChild!.getBoundingClientRect()
      expect(text.left, `「${link.textContent}」的文字列没有排在序号之后`).toBeGreaterThanOrEqual(index.getBoundingClientRect().right)
      expect(Math.abs(text.right - contentBox(link).end), `「${link.textContent}」的文字列没有铺到行尾`).toBeLessThanOrEqual(0.5)
    }
  })

  it.each(SHEET_NAMES)('带 hidden 的来源行不显示（%s）', async (sheet) => {
    const markup = await serialize(() => h(XhCitationRoot, { sources }, () => h(XhCitationList)))
    const doc = await stageSheet(markup, sheet)
    const link = sheetParts(doc, 'citation', 'source-link')[0]!
    link.hidden = true
    expect(doc.defaultView!.getComputedStyle(link).display).toBe('none')
  })
})
