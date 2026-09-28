---
'@xihan-ui/headless': minor
'@xihan-ui/styles': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
'@xihan-ui/web-components': minor
---

Virtualizer 新增三种滚动形态：

- `scrollContainer: 'window'`：列表铺在页面里、随整页滚动。视口不再是滚动框（皮肤撤掉 overflow 与定高）、不占 Tab 位，投影 `data-scroll-container="window"`；列表在页面里的起点由内核现量，不必再算 `scrollMargin`。
- 条目增删时钉住视口：视口里第一条按 `getItemKey` 给出的身份放回原处，往前插入条目时视口不跳。`anchor: 'end'` 另外从最新一条看起、贴底时内容再长也继续贴底，用户翻离底部就不再拽回；视口投影 `data-anchor="end"`，不足一屏时条目贴着底部排。写回滚动量时若内容层还没长高、被浏览器夹住，等内容层长高再补上。
- `stickyIndices`：登记要钉在视口起点的条目（分组标题），滚过之后一直钉着、由下一个接替；条目外壳投影 `data-fixed`，按 `position: sticky` 留在文档流里，新增槽 `--xh-virtualizer-sticky-bg`。快照条目新增 `sticky` 字段。
- 新增导出类型 `VirtualizerScrollContainer`、`VirtualizerAnchor`。
