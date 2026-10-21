来源：https://ui.docs.xihanfun.com/runtime/xlsx

# 表格导出

`@xihan-ui/xlsx` 把表格写成 Excel 文件（.xlsx）。工作簿是普通对象：单元格带类型（文本、数字、日期、布尔），数字与日期带 Excel 格式代码，另有粗体、水平对齐、合并单元格、列宽与冻结窗格。按 OOXML 的最小部件拼出 XML，再自己打成 zip，不依赖任何第三方库。

```ts
import { writeXlsx, xlsxBlob } from "@xihan-ui/xlsx";

const bytes = await writeXlsx({
  sheets: [
    {
      name: "销售",
      rows: [
        [
          { type: "text", value: "区域", bold: true },
          { type: "text", value: "金额", bold: true, align: "right" },
        ],
        [
          { type: "text", value: "东区" },
          { type: "number", value: 1234.5, format: "#,##0.00" },
        ],
      ],
      frozen: { rows: 1, columns: 0 },
    },
  ],
});

const blob = xlsxBlob(bytes);
```

## 设计约束

- **只写不读。** 不解析已有文件，不做公式、图表、图片与条件格式；需要这些时把数据交给后端处理。
- **单元格带类型。** 数字与日期以数值写入并附格式代码，打开后可以照常排序、求和与按日期筛选，不会变成文本。
- **非法输入立即报错。** 非有限数、超出 1900–9999 年的日期、超长文本、非法表名与重叠的合并区一律抛 `XlsxError`，只带错误码与位置，不静默修正。
- **结果可复现。** zip 里的时间戳固定，不压缩时同一输入得到的字节完全相同。

## 是否安装

它不随适配器安装，需要时单独安装：

```bash
pnpm add @xihan-ui/xlsx
```

零运行时依赖，import 无副作用，浏览器与 Node 18+ 都能运行。

## 工作簿

| 成员 | 说明 |
| --- | --- |
| `sheets` | 至少一张工作表 |
| `sheet.name` | 1–31 个字符，不含 `[ ] : * ? / \`，不以 `'` 开头或结尾，工作簿内不区分大小写地唯一；`sheetName(text, fallback?)` 把任意文本整理成合法表名 |
| `sheet.rows` | 行数组，下标即行号；每行是单元格数组，下标即列号，`null` 与空位是空格子 |
| `sheet.merges` | 合并区 `{ row, column, rowSpan, columnSpan }`，行列从 0 起，至少两格，彼此不重叠 |
| `sheet.columnWidths` | 列宽（字符数），下标即列号，空位用缺省宽度 |
| `sheet.frozen` | 冻结窗格 `{ rows, columns }`：顶部冻结的行数与左侧冻结的列数 |

## 单元格

| 类型 | 值 | 格式 |
| --- | --- | --- |
| `text` | 字符串，最长 32767 个字符 | — |
| `number` | 有限数 | `format`：Excel 数字格式代码，如 `#,##0.00`、`0.0%`、`"¥"#,##0.00`；缺省 General |
| `date` | 不带时区的墙上时间 `{ year, month, day, hour?, minute?, second?, millisecond? }`，1900-01-01 至 9999-12-31 | `format`：Excel 日期格式代码；缺省带时刻时 `yyyy-mm-dd hh:mm:ss`，不带时 `yyyy-mm-dd` |
| `boolean` | `true` / `false` | — |

四种单元格都可以写 `bold` 与 `align`（`left` / `center` / `right`），表头、合计行用它们区分。日期按 Excel 的 1900 日期系统换成序列值，1900-03-01 之前的日期与 Excel 的计数一致。

## 格式说明换成格式代码

报表与设计器里的格式说明用 `@xihan-ui/expression` 的 `formatValue` 规格保存。`formatCode(spec)` 把同形的格式说明换成 Excel 格式代码，交给数字与日期单元格的 `format`；Excel 表达不了时返回 `null`，此时用 `formatValue` 的结果写成文本单元格。

| 格式说明 | 格式代码 |
| --- | --- |
| `{ kind: "number", decimals: 2, grouping: true }` | `#,##0.00` |
| `{ kind: "number", minDecimals: 1, maxDecimals: 3 }` | `0.0##`：必显位加可省位，末尾的 0 省去，整数也不会多出小数点 |
| `{ kind: "number", maxDecimals: 2 }` | `0.00`：`minDecimals` 为 0 或没给时按 `maxDecimals` 写成固定位数，因为 Excel 省掉全部可省位会留下小数点 |
| `{ kind: "number" }` | `General`；不舍入又要千分位时返回 `null` |
| `{ kind: "percent", decimals: 1 }` | `0.0%`；不舍入的百分比返回 `null` |
| `{ kind: "date", pattern: "yyyy年M月d日 HH:mm" }` | `yyyy"年"m"月"d"日" hh:mm` |
| `{ kind: "rmb-upper" }` | `null` |
| `{ kind: "numeral", style: "cn-upper" }` | `null`：罗马数字与中文数字都写成文本 |

- **舍入**：Excel 显示时一律四舍五入取整，不认 `rounding`。`rounding` 不是 `half-up` 时，先用十进制运算把值舍入到要显示的位数（例如用 `formatValue` 按同一份格式说明算出文本再换回数值），再写成数字单元格加格式代码，不要直接写原始值。
- **日期**：占位符 `MM → mm`、`HH → hh`、`SSS → 000`，其余文字写成字面文本。Excel 的 `mm` 只有紧挨 `h` / `hh` 之后或紧挨 `ss` 之前才是分钟，其余位置都当成月份；分钟或月份落在会被读错的位置（如 `yyyy-mm`、`HH:MM`），或毫秒不是紧跟在 `ss.` 之后时返回 `null`。
- 格式说明的类型 `XlsxFormatSpec` 与 `formatValue` 的 `FormatSpec` 同形，测试里做了双向赋值检查，两边改动必须同步。

## 多级表头

分组列头、交叉表的行列表头写成表头树，`headerRows(tree, { axis? })` 展开成单元格与合并区：

```ts
import { headerRows } from "@xihan-ui/xlsx";

const bold = (value: string) => ({ type: "text" as const, value, bold: true });
const header = headerRows([
  { cell: bold("华东"), children: [{ cell: bold("上海") }, { cell: bold("杭州") }] },
  { cell: bold("合计") },
]);
// header.rows：[[华东, null, 合计], [上海, 杭州, null]]
// header.merges：华东横跨两列，合计纵跨两行
```

- 叶子按深度优先的次序各占一列；有下级的节点横跨全部下级叶子、纵向占 `span` 层（缺省 1），没有下级的节点纵向占满到最内层，小计、合计这类标签因此向内合并。
- `axis: "row"` 时转成行表头：层从左到右、叶子自上而下。
- 结果的行列从 0 起，`depth` 是层数、`breadth` 是叶子数；放进工作表时由调用方给行与合并区加上偏移。`cell` 为空的节点只占位、不合并；`span` 不是正整数时抛 `invalid-header`。

## 写出

`writeXlsx(workbook, { compression? })` 返回 `Promise<Uint8Array>`，`xlsxBlob(bytes)` 包成带 MIME 类型的 `Blob`，交给 `<a download>` 或上传接口即可。`compression` 缺省 `deflate`，使用运行环境自带的 `CompressionStream('deflate-raw')`；运行环境不支持时抛 `compression-unavailable`，不静默改为不压缩，此时可显式传 `store`。

文件只含最小部件：内容类型、关系、工作簿、样式表与各工作表；文本用内联字符串，不写共享字符串表。文本里字面的 `_xHHHH_` 与 XML 不允许的字符（控制字符、孤立代理项）按 OOXML 的 `_xHHHH_` 转义。

`writeZip(entries, { compression? })` 同样公开，可单独打包任意条目，文件名按 UTF-8 记录；不写 ZIP64，单个条目与整个包都须小于 4 GiB。

## 错误码

| 错误码 | 原因 |
| --- | --- |
| `empty-workbook` | 没有工作表 |
| `invalid-sheet-name` / `duplicate-sheet-name` | 表名不合法或重复，`params` 带表的下标与名字 |
| `invalid-merge` | 合并区不足两格、越界或与前面的合并区重叠，`params` 带表名与合并区下标 |
| `invalid-cell` | 单元格的类型或值不合法，`params` 带表的下标与行列号 |
| `invalid-header` | 表头树节点的 `span` 不是正整数，`params` 带节点路径（各层下标）与 `span` |
| `compression-unavailable` | 运行环境没有 `CompressionStream` |
| `archive-too-large` | 条目数或总大小超出 zip 的 32 位上限 |

## 状态

实验级：报表设计器接入期间，单元格样式（边框、底色、换行等）可能按需补充，破坏性变更可以出现在 minor 中，并在更新日志中逐条列出。
