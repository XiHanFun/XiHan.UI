---
'@xihan-ui/headless': major
'@xihan-ui/vue': major
'@xihan-ui/react': major
'@xihan-ui/web-components': major
'@xihan-ui/styles': major
---

**破坏性** Grid 的列数从 `cols` 改叫 `columns`，与 Descriptions、Masonry、Form、Table、Heatmap、MatrixCode、FieldArray 同一个词；投影的 `data-cols` 与逐档的 `data-cols-sm / -md / -lg / -xl` 随之改成 `data-columns` 一族（与 Form 的网格排布一致）。取值不变：1 至 12 的整数，或按断点写的对象。

| 旧名 | 新名 |
| --- | --- |
| `cols`（WC attribute `cols`） | `columns`（WC attribute `columns`） |
| 类型 `GridCols`、`GridColsByBreakpoint` | `GridColumns`、`GridColumnsByBreakpoint` |
| 自写样式里的 `[data-scope='grid'][data-cols='3']`、`[data-cols-md]` | `[data-scope='grid'][data-columns='3']`、`[data-columns-md]` |
