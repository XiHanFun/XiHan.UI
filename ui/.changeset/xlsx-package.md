---
'@xihan-ui/xlsx': minor
---

新增 `@xihan-ui/xlsx`：零依赖的 xlsx 写出，供报表等需要导出 Excel 的场景使用。import 无副作用，不碰 DOM，浏览器与 Node 18+ 都能运行。

- `writeXlsx(workbook, { compression? })`：工作簿是普通对象，单元格分文本、数字、日期、布尔四类，数字与日期带 Excel 格式代码，另有粗体、水平对齐、合并单元格、列宽与冻结窗格；按 OOXML 最小部件写出，文本用内联字符串。压缩缺省使用运行环境的 `CompressionStream('deflate-raw')`，不支持时抛错，可显式传 `store`；不压缩时同一输入得到的字节完全相同。
- `xlsxBlob(bytes)` 包成带 `XLSX_MIME` 的 `Blob`，`sheetName(text)` 把任意文本整理成合法表名。
- `formatCode(spec)`：把与 `formatValue` 同形的格式说明换成 Excel 格式代码，表达不了时返回 `null`（改用 `formatValue` 的文本，人民币大写与数字字形 `numeral` 一律如此）；Excel 一律四舍五入，`rounding` 不是 `half-up` 时由调用方先舍入。
- `writeZip(entries)`：单独打包任意条目，文件名按 UTF-8 记录。
- 非有限数、超出 1900–9999 年的日期、超长文本、非法表名与重叠的合并区一律抛 `XlsxError`，只带错误码与位置。
