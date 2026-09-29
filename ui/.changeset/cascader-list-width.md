---
'@xihan-ui/headless': major
'@xihan-ui/styles': major
'@xihan-ui/vue': patch
'@xihan-ui/react': patch
'@xihan-ui/web-components': patch
---

Cascader 的浮层按面板型浮层定宽：每一列（含一级列）按条目的自然宽度、以 `--xh-overlay-menu-min-w` 托底（不再是字面量 7rem），不随字段盒拉伸，长选项撑到条目上限为止、余下的在条目里截断；搜索框不参与定宽，铺满列撑出的宽度；面板随列数伸展，宽过可用区时收成可用宽度。浮层改锚在字段盒（control）上，面板起始缘与盒对齐；焦点归还仍回触发按钮，`CascaderRefs` 新增 `getTriggerEl`。`--xh-cascader-content-max-w` 缺省改为不封顶，新增 `--xh-cascader-content-min-w` 定面板的下界（缺省 `--xh-overlay-menu-min-w`）。

面板含多列，材质由 frosted 改为 floating（实体底 + `--xh-border-default` 描边 + `--xh-elevation-floating` 投影，不透景），与时间选择同档：content 不再投影 `data-xh-material`，列间分隔改取 `--xh-material-solid-separator`，条目、分组标题与占位文字改取 `--xh-fg-default` / `--xh-fg-muted`。破坏性：移除 `--xh-cascader-content-backdrop`、`--xh-cascader-content-highlight` 与 `--xh-cascader-loading-min-w`（占位铺满面板宽度，下界改由 `--xh-cascader-content-min-w` 统一给）。
