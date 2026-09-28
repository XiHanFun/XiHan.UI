---
'@xihan-ui/headless': minor
'@xihan-ui/styles': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
'@xihan-ui/web-components': minor
---

Descriptions 新增列表之前的头部：`header`（一行）、`title`（左侧标题）、`extra`（右侧操作或状态）三个部件。头部排在根之外——根常写成 `dl`，里面只能放成对的 `dt` / `dd`：Vue 写进 `XhDescriptionsRoot` 的 `header` 插槽，React 经 `header` 传入，Web Components 写成 `root` 的前一个兄弟。标题缺省渲染为 `div`，按页面层级用 `as` 换成 `h2` / `h3`；样式为 Surface 内标题（正文字号、半粗），头部与列表的间距随尺寸档。新增公开槽 `--xh-descriptions-header-gap`、`--xh-descriptions-header-mb`、`--xh-descriptions-extra-gap`、`--xh-descriptions-title-fg`、`--xh-descriptions-title-font-size`、`--xh-descriptions-title-font-weight`。皮肤涨在头部三条规则上。Vue 的 `XhDescriptionsRoot` 写了头部时渲染为片段，作者写在根上的 class 与属性仍落在 `dl` 上。
