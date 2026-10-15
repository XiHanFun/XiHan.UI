import { describe, expect, it } from 'vitest'
import { writeXlsx, xlsxBlob } from '../src'
import { unzip } from './unzip'

// 与 README「用法」一节同一段代码：照抄即可运行
describe('包说明里的用法', () => {
  it('写出一张带表头、日期、数字格式、合并与冻结的工作表', async () => {
    const bytes = await writeXlsx({
      sheets: [{
        name: '销售',
        rows: [
          [{ type: 'text', value: '区域', bold: true }, { type: 'text', value: '日期', bold: true }, { type: 'text', value: '金额', bold: true, align: 'right' }],
          [{ type: 'text', value: '东区' }, { type: 'date', value: { year: 2026, month: 10, day: 16 } }, { type: 'number', value: 1234.5, format: '#,##0.00' }],
          [{ type: 'text', value: '合计', bold: true }, null, { type: 'number', value: 1234.5, format: '#,##0.00', bold: true }],
        ],
        merges: [{ row: 2, column: 0, rowSpan: 1, columnSpan: 2 }],
        columnWidths: [12, 14, 16],
        frozen: { rows: 1, columns: 0 },
      }],
    })

    const blob = xlsxBlob(bytes)

    expect(blob.size).toBe(bytes.length)
    const sheet = unzip(bytes).get('xl/worksheets/sheet1.xml')!.text
    expect(sheet).toContain('<mergeCell ref="A3:B3"/>')
    expect(sheet).toMatch(/<c r="B2" s="\d+"><v>46311<\/v><\/c>/)
  })
})
