# @xihan-ui/xlsx

零依赖的 xlsx 写出：工作簿是普通对象，单元格带类型（文本、数字、日期、布尔），数字与日期带 Excel 格式代码，另有粗体、水平对齐、合并单元格、列宽与冻结窗格。按 OOXML 的最小部件拼出 XML，再自己打成 zip；压缩用运行环境自带的 `CompressionStream('deflate-raw')`，也可以不压缩。自研实现，零运行时依赖，import 无副作用，浏览器与 Node 18+ 都能运行。

**谁会装它**：要把表格、报表导出成 Excel 文件的人。只写不读，不做公式、图表、图片与条件格式。

## 用法

```ts
import { writeXlsx, xlsxBlob } from '@xihan-ui/xlsx'

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

const blob = xlsxBlob(bytes) // 交给 <a download> 或上传
```

## 约定

- 单元格：`text`（最长 32767 个字符）、`number`（有限数，`format` 缺省 General）、`date`（不带时区的墙上时间 `{ year, month, day, hour?, minute?, second?, millisecond? }`，1900-01-01 至 9999-12-31，`format` 缺省按有无时刻取 `yyyy-mm-dd` 或 `yyyy-mm-dd hh:mm:ss`）、`boolean`。`null` 与数组空位是空格子。
- 日期按 Excel 的 1900 日期系统换成序列值，1900-03-01 之前的日期与 Excel 的计数一致（减一）。
- 文本用内联字符串，不写共享字符串表；字面的 `_xHHHH_` 与 XML 不允许的字符（控制字符、孤立代理项）按 OOXML 的 `_xHHHH_` 转义。
- `compression` 缺省 `deflate`；运行环境没有 `CompressionStream` 时抛错，不静默改成不压缩。zip 里的时间戳固定为 1980-01-01，`store` 方式下同一输入得到的字节完全相同。
- 表名、合并区或单元格不合法时抛 `XlsxError`，只带错误码与位置，不带文案；`sheetName()` 把任意文本整理成合法表名。
- `formatCode(spec)` 把与 `@xihan-ui/expression` 的 `formatValue` 同形的格式说明换成 Excel 格式代码；Excel 表达不了时返回 `null`，此时用 `formatValue` 的结果写成文本单元格。Excel 显示时一律四舍五入，`rounding` 不是 `half-up` 时先用十进制运算把值舍入好再写成数字单元格。
- `writeZip` 同样公开，可单独打包任意条目。

## 装

```bash
pnpm add @xihan-ui/xlsx
```

完整文档见 [https://ui.docs.xihanfun.com](https://ui.docs.xihanfun.com)。这个包属于 `features/` 组，组的含义见仓库里的 `ui/packages/README.md`。

许可：MIT
