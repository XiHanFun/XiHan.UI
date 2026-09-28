---
'@xihan-ui/headless': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
'@xihan-ui/web-components': minor
'@xihan-ui/styles': minor
---

Grid 的每一格新增 `rowSpan`（Web Components 写在 item 节点的 `row-span` 属性上）：1 至 12 的整数，越界与非整数按没写算；与跨列一样接受断点对象 `{ base, sm, md, lg, xl }` 逐档书写，落 `data-row-span` 及逐档的 `data-row-span-<档>`。皮肤经私有槽 `--xh-_grid-row-span` 写 `grid-row-end: span N`，跨几行就占几条行轨道（连同中间的行间距）。Headless 新增 `GridRowSpan`、`GridRowSpanByBreakpoint`。grid.css 的体积基线随逐档规则上调。
