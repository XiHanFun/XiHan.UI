---
'@xihan-ui/web-components': major
---

`<xh-select>`、`<xh-cascader>`、`<xh-combobox>` 与 `<xh-tree-select>` 展开及真实退场期间会把
`positioner` 搬到宿主当前 Document 的配置 Portal 容器，以脱离作者祖先的 `transform`、`contain`
与 `overflow`；关闭退场完成或宿主断开时精确恢复原作者位置。

这是 Web Components 的运行期 DOM 位置变化：展开期间不能再假定 `positioner` 是宿主的 DOM 后代，
应保存部件引用或从其 `ownerDocument` 查询。物理租约、占位恢复与视觉环境桥接由 Core 统一实现；
iframe adopt/reconnect 后只使用新的所属 Document，不跨 realm 搬迁。
