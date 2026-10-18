---
'@xihan-ui/headless': minor
'@xihan-ui/styles': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
'@xihan-ui/web-components': minor
---

FieldArray 表格排布的列新增 `minWidth`：给了之后这一列不再随容器压窄到它以下，轨道写成 `minmax(minWidth, width)`（数字按 px，不写 `width` 时上限是 1fr）。各列下限之和超过容器时，表格本体横向滚动，表头与各行一起滚；行号（`item-label`）钉在起始侧、把手（`item-action`）钉在末端侧，紧挨滚动区的一侧只在确有内容被压住时画分隔线，与 Table 的冻结列一致。表格本体新增 `data-at-min-horizontal` / `data-at-max-horizontal`，报它离两端的远近；表格本体换成表面底（`--xh-field-array-table-bg`），钉住的格子靠它压住滑过去的内容。新增覆盖槽 `--xh-field-array-table-bg`、`--xh-field-array-frozen-bg`、`--xh-field-array-frozen-header-bg`、`--xh-field-array-frozen-edge`、`--xh-field-array-sticky-column-layer`。
