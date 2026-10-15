import type { XlsxCell, XlsxSheet } from '../src'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { sheetName, writeXlsx, writeZip, XLSX_MIME, xlsxBlob, XlsxError } from '../src'
import { unzip } from './unzip'

const PARTS = [
  '[Content_Types].xml',
  '_rels/.rels',
  'xl/workbook.xml',
  'xl/_rels/workbook.xml.rels',
  'xl/styles.xml',
  'xl/worksheets/sheet1.xml',
]

const sheet: XlsxSheet = {
  name: '销售',
  rows: [
    [{ type: 'text', value: '区域', bold: true }, { type: 'text', value: '金额', bold: true, align: 'center' }, { type: 'text', value: '日期', bold: true }, { type: 'text', value: '有效', bold: true }],
    [{ type: 'text', value: '东区' }, { type: 'number', value: 1234.5, format: '#,##0.00' }, { type: 'date', value: { year: 2026, month: 10, day: 16 } }, { type: 'boolean', value: true }],
    [{ type: 'text', value: '西区' }, null, { type: 'date', value: { year: 2026, month: 10, day: 16, hour: 12 }, format: 'yyyy-mm-dd hh:mm' }, { type: 'boolean', value: false }],
    [],
    [undefined, { type: 'number', value: -0.5 }],
  ],
  merges: [{ row: 3, column: 0, rowSpan: 1, columnSpan: 3 }],
  columnWidths: [12, undefined, 8],
  frozen: { rows: 1, columns: 1 },
}

async function read(sheets: readonly XlsxSheet[], compression: 'store' | 'deflate' = 'store'): Promise<Map<string, string>> {
  const entries = unzip(await writeXlsx({ sheets }, { compression }))
  return new Map([...entries].map(([name, entry]) => [name, entry.text]))
}

async function rejection(promise: Promise<unknown>): Promise<unknown> {
  try {
    await promise
  }
  catch (error) {
    return error instanceof XlsxError ? [error.code, error.params] : error
  }
  return null
}

function one(cell: XlsxCell): XlsxSheet {
  return { name: 'a', rows: [[cell]] }
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('writeXlsx：包结构', () => {
  it('store 与 deflate 都只写最小部件，大小与 CRC 校验通过', async () => {
    for (const compression of ['store', 'deflate'] as const) {
      const entries = unzip(await writeXlsx({ sheets: [sheet] }, { compression }))
      expect([...entries.keys()]).toEqual(PARTS)
      for (const entry of entries.values())
        expect(entry.method).toBe(compression === 'store' ? 0 : entry.compressedSize < entry.data.length ? 8 : 0)
    }
  })

  it('缺省 deflate，重复内容明显变小且解压后内容相同', async () => {
    const big: XlsxSheet = { name: 'big', rows: Array.from({ length: 500 }, (_, r) => [{ type: 'text', value: `row ${r % 7}` }, { type: 'number', value: r }]) }
    const stored = await writeXlsx({ sheets: [big] }, { compression: 'store' })
    const deflated = await writeXlsx({ sheets: [big] })
    expect(deflated.length).toBeLessThan(stored.length / 3)
    expect(unzip(deflated).get('xl/worksheets/sheet1.xml')!.text).toBe(unzip(stored).get('xl/worksheets/sheet1.xml')!.text)
  })

  it('store 方式同一输入的字节完全相同', async () => {
    expect(await writeXlsx({ sheets: [sheet] }, { compression: 'store' })).toEqual(await writeXlsx({ sheets: [sheet] }, { compression: 'store' }))
  })

  it('内容类型、关系与工作簿彼此对应', async () => {
    const files = await read([sheet, { name: 'Two & <More>', rows: [] }])
    expect(files.get('[Content_Types].xml')).toContain('<Override PartName="/xl/worksheets/sheet2.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>')
    expect(files.get('[Content_Types].xml')).toContain('PartName="/xl/styles.xml"')
    expect(files.get('_rels/.rels')).toContain('Target="xl/workbook.xml"')
    expect(files.get('xl/workbook.xml')).toContain('<sheet name="销售" sheetId="1" r:id="rId1"/><sheet name="Two &amp; &lt;More&gt;" sheetId="2" r:id="rId2"/>')
    expect(files.get('xl/_rels/workbook.xml.rels')).toContain('<Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>')
  })

  it('运行环境没有 CompressionStream 时 deflate 抛出，store 照常', async () => {
    vi.stubGlobal('CompressionStream', undefined)
    expect(await rejection(writeXlsx({ sheets: [sheet] }))).toEqual(['compression-unavailable', {}])
    expect((await writeXlsx({ sheets: [sheet] }, { compression: 'store' })).length).toBeGreaterThan(0)
  })

  it('xlsxBlob 带 MIME 类型', async () => {
    const bytes = await writeXlsx({ sheets: [sheet] }, { compression: 'store' })
    const blob = xlsxBlob(bytes)
    expect(blob.type).toBe(XLSX_MIME)
    expect(blob.size).toBe(bytes.length)
  })

  it('writeZip 可单独打包任意条目，文件名按 UTF-8 记', async () => {
    const encoder = new TextEncoder()
    const entries = unzip(await writeZip([{ name: '目录/说明.txt', data: encoder.encode('你好') }, { name: 'empty', data: new Uint8Array(0) }]))
    expect(entries.get('目录/说明.txt')!.text).toBe('你好')
    expect(entries.get('empty')!.data.length).toBe(0)
  })
})

describe('writeXlsx：单元格', () => {
  it('四种类型各自写出，空位不写', async () => {
    const xml = (await read([sheet])).get('xl/worksheets/sheet1.xml')!
    expect(xml).toContain('<c r="A2" t="inlineStr"><is><t xml:space="preserve">东区</t></is></c>')
    expect(xml).toMatch(/<c r="B2" s="\d+"><v>1234.5<\/v><\/c>/)
    expect(xml).toMatch(/<c r="C2" s="\d+"><v>46311<\/v><\/c>/)
    expect(xml).toContain('<c r="D2" t="b"><v>1</v></c>')
    expect(xml).toContain('<c r="D3" t="b"><v>0</v></c>')
    expect(xml).toMatch(/<c r="C3" s="\d+"><v>46311.5<\/v><\/c>/)
    expect(xml).not.toContain('r="B3"')
    expect(xml).not.toContain('<row r="4"')
    expect(xml).toContain('<row r="5"><c r="B5"><v>-0.5</v></c></row>')
  })

  it('日期按 1900 日期系统换算，1900-03-01 之前减一', async () => {
    const serial = async (value: { year: number, month: number, day: number }): Promise<string | undefined> =>
      (await read([one({ type: 'date', value })])).get('xl/worksheets/sheet1.xml')!.match(/<v>([^<]+)<\/v>/)?.[1]
    expect(await serial({ year: 1900, month: 1, day: 1 })).toBe('1')
    expect(await serial({ year: 1900, month: 2, day: 28 })).toBe('59')
    expect(await serial({ year: 1900, month: 3, day: 1 })).toBe('61')
    expect(await serial({ year: 2026, month: 1, day: 1 })).toBe('46023')
  })

  it('不合法的单元格抛出 invalid-cell 并给出位置', async () => {
    const bad: XlsxCell[] = [
      { type: 'number', value: Number.NaN },
      { type: 'number', value: Number.POSITIVE_INFINITY },
      { type: 'date', value: { year: 1899, month: 12, day: 31 } },
      { type: 'date', value: { year: 2026, month: 2, day: 30 } },
      { type: 'date', value: { year: 2026, month: 1, day: 1, hour: 24 } },
      { type: 'text', value: 'x'.repeat(32_768) },
      { type: 'percent', value: 1 } as unknown as XlsxCell,
    ]
    for (const cell of bad)
      expect(await rejection(writeXlsx({ sheets: [{ name: 'a', rows: [[null, null], [null, cell]] }] }))).toEqual(['invalid-cell', { sheet: 0, row: 1, column: 1 }])
  })

  it('转义 XML 特殊字符、字面的 _xHHHH_ 与非法字符', async () => {
    const row: XlsxCell[] = ['<a & "b">', '_x0041_', 'a\u0001b\uD800c', '😀\t\n'].map(value => ({ type: 'text', value }))
    const xml = (await read([{ name: 'a', rows: [row] }])).get('xl/worksheets/sheet1.xml')!
    expect(xml).toContain('<t xml:space="preserve">&lt;a &amp; &quot;b&quot;&gt;</t>')
    expect(xml).toContain('<t xml:space="preserve">_x005F_x0041_</t>')
    expect(xml).toContain('<t xml:space="preserve">a_x0001_b_xD800_c</t>')
    expect(xml).toContain('<t xml:space="preserve">😀\t\n</t>')
  })

  it('列字母越过 Z 后进位', async () => {
    const row: XlsxCell[] = Array.from({ length: 54 }, (_, i) => ({ type: 'number', value: i }))
    const xml = (await read([{ name: 'a', rows: [row] }])).get('xl/worksheets/sheet1.xml')!
    expect(xml).toContain('<c r="Z1"><v>25</v></c><c r="AA1"><v>26</v></c>')
    expect(xml).toContain('<c r="AZ1"><v>51</v></c><c r="BA1"><v>52</v></c><c r="BB1"><v>53</v></c>')
  })
})

describe('writeXlsx：样式与版式', () => {
  it('样式表登记数字与日期格式、粗体与对齐，同样的样式只登记一次', async () => {
    const styles = (await read([sheet])).get('xl/styles.xml')!
    expect(styles).toContain('<numFmts count="3"><numFmt numFmtId="164" formatCode="#,##0.00"/><numFmt numFmtId="165" formatCode="yyyy-mm-dd"/><numFmt numFmtId="166" formatCode="yyyy-mm-dd hh:mm"/></numFmts>')
    expect(styles).toContain('<xf numFmtId="0" fontId="1" fillId="0" borderId="0" xfId="0" applyFont="1"/>')
    expect(styles).toContain('<xf numFmtId="0" fontId="1" fillId="0" borderId="0" xfId="0" applyFont="1" applyAlignment="1"><alignment horizontal="center" vertical="center"/></xf>')
    expect(styles).toContain('<cellXfs count="6">')
  })

  it('冻结窗格、列宽与合并单元格', async () => {
    const xml = (await read([sheet])).get('xl/worksheets/sheet1.xml')!
    expect(xml).toContain('<pane xSplit="1" ySplit="1" topLeftCell="B2" activePane="bottomRight" state="frozen"/>')
    expect(xml).toContain('<cols><col min="1" max="1" width="12" customWidth="1"/><col min="3" max="3" width="8" customWidth="1"/></cols>')
    expect(xml).toContain('<mergeCells count="1"><mergeCell ref="A4:C4"/></mergeCells>')
    const rowsOnly = (await read([{ name: 'a', rows: [], frozen: { rows: 2, columns: 0 } }])).get('xl/worksheets/sheet1.xml')!
    expect(rowsOnly).toContain('<pane ySplit="2" topLeftCell="A3" activePane="bottomLeft" state="frozen"/>')
    const plain = (await read([{ name: 'a', rows: [] }])).get('xl/worksheets/sheet1.xml')!
    expect(plain).toContain('<sheetViews><sheetView workbookViewId="0"/></sheetViews>')
    expect(plain).not.toContain('<cols>')
  })
})

describe('writeXlsx：检查', () => {
  it('空工作簿、非法与重复的表名、不合法与重叠的合并区都抛出', async () => {
    expect(await rejection(writeXlsx({ sheets: [] }))).toEqual(['empty-workbook', {}])
    expect(await rejection(writeXlsx({ sheets: [{ name: 'a/b', rows: [] }] }))).toEqual(['invalid-sheet-name', { sheet: 0, name: 'a/b' }])
    expect(await rejection(writeXlsx({ sheets: [{ name: 'x'.repeat(32), rows: [] }] }))).toEqual(['invalid-sheet-name', { sheet: 0, name: 'x'.repeat(32) }])
    expect(await rejection(writeXlsx({ sheets: [{ name: '\'a', rows: [] }] }))).toEqual(['invalid-sheet-name', { sheet: 0, name: '\'a' }])
    expect(await rejection(writeXlsx({ sheets: [{ name: 'Data', rows: [] }, { name: 'data', rows: [] }] }))).toEqual(['duplicate-sheet-name', { sheet: 1, name: 'data' }])
    expect(await rejection(writeXlsx({ sheets: [{ name: 'a', rows: [], merges: [{ row: 0, column: 0, rowSpan: 1, columnSpan: 1 }] }] }))).toEqual(['invalid-merge', { sheet: 'a', merge: 0 }])
    expect(await rejection(writeXlsx({
      sheets: [{ name: 'a', rows: [], merges: [{ row: 0, column: 0, rowSpan: 2, columnSpan: 2 }, { row: 1, column: 1, rowSpan: 1, columnSpan: 2 }] }],
    }))).toEqual(['invalid-merge', { sheet: 'a', merge: 1 }])
  })

  it('sheetName 把任意文本整理成合法表名', () => {
    expect(sheetName('2026/10 销售[汇总]')).toBe('2026 10 销售 汇总')
    expect(sheetName('  ')).toBe('Sheet1')
    expect(sheetName('  ', '数据')).toBe('数据')
    expect(sheetName('\'quoted\'')).toBe('quoted')
    expect(sheetName('x'.repeat(40))).toHaveLength(31)
  })
})
