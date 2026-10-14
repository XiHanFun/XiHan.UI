---
'@xihan-ui/tokens': minor
'@xihan-ui/styles': patch
---

Table 单元格与列头的行内内衬随尺寸档换档：sm 8px / md 12px / lg 16px，与行高同一把档位。此前三档都是 16px，缺省与紧凑表格里左对齐、右对齐的字离分隔线空出一大截。新增语义令牌 `--xh-table-cell-px-sm` / `-md` / `-lg`（与既有的 `--xh-table-cell-py-*` 成对）；开着竖分隔线时末端照旧让出线宽；展开详情行的内衬（`--xh-table-detail-px` 缺省值）跟着同一档，详情里的字与上面数据格的字对齐。公开槽 `--xh-table-cell-px` 仍可统一定值。
