---
'@xihan-ui/headless': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
'@xihan-ui/web-components': minor
'@xihan-ui/styles': minor
---

Log 新增 ANSI 着色、级别过滤与虚拟滚动接线：

- ANSI 着色：行新增 `ansi`（Vue / React 传原文；Web Components 在行上写 `ansi` 属性、文字就是原文），按 SGR 拆成新部件 `segment`（Vue / React `XhLogSegment`）。八种前景色映射到语义色、可经 `--xh-log-ansi-<颜色>` 覆盖，粗体、暗淡、斜体、下划线各自生效；背景色、256 色的高位与真彩色不着色，其余转义去掉。新增导出 `parseAnsi`、`stripAnsi` 与类型 `LogAnsiColor`、`LogAnsiSegment`；API 新增 `getSegmentProps`。
- 级别过滤：新增 `levels`，只显示所选级别的行，没写级别的行不受影响；API 新增 `isLevelVisible`。
- 虚拟滚动：新增 `virtualizer`，接 Virtualizer 的 `collectionVirtualizer`；粘底改跟 Virtualizer 的视口与内容层，日志视口只定高、带 `data-virtualized`、不占 Tab 位。`content` 不再是必需部件（接虚拟滚动时行在 Virtualizer 的条目里）。
- Virtualizer 的 `CollectionVirtualizer` 新增可选的 `getContentElement`，Virtualizer 交出的桥总带着它。
