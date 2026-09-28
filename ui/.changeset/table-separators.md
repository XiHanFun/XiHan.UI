---
'@xihan-ui/styles': minor
---

Table 表头下沿与表尾上沿是内部分隔，改取 `--xh-border-subtle`（新增覆盖槽 `--xh-table-header-border` / `--xh-table-footer-border`），与行间横线同档，外边才取 default；subtle 档补上透明占位边，与 outline 档同盒尺寸，换档不跳 1px。
