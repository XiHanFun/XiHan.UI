---
'@xihan-ui/headless': major
'@xihan-ui/styles': major
'@xihan-ui/vue': patch
'@xihan-ui/react': patch
'@xihan-ui/web-components': patch
---

Cascader 的浮层按列表型浮层定宽：一级列与字段盒等宽（只有一级列时整块面板恰好与盒齐宽），长选项在条目里截断；后续列按条目的自然宽度、以 `--xh-overlay-menu-min-w` 托底（不再是字面量 7rem），面板随列数伸展，宽过可用区时收成可用宽度。浮层改锚在字段盒（control）上，面板起始缘与盒对齐；焦点归还仍回触发按钮，`CascaderRefs` 新增 `getTriggerEl`。`--xh-cascader-content-max-w` 缺省改为不封顶，`--xh-cascader-content-min-w` 可抬高一级列的下界。

面板含多列，材质由 frosted 改为 floating（实体底 + `--xh-border-default` 描边 + `--xh-elevation-floating` 投影，不透景），与时间选择同档：content 不再投影 `data-xh-material`，列间分隔改取 `--xh-material-solid-separator`，条目、分组标题与占位文字改取 `--xh-fg-default` / `--xh-fg-muted`。破坏性：移除 `--xh-cascader-content-backdrop`、`--xh-cascader-content-highlight` 与 `--xh-cascader-loading-min-w`（占位铺满面板宽度，不再单独定下界）。
