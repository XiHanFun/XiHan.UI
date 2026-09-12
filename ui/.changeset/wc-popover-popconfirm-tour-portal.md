---
'@xihan-ui/web-components': major
---

`<xh-popover>`、`<xh-popconfirm>` 与 `<xh-tour>` 展开及真实退场期间会把浮层根物理搬到
宿主当前 Document 的 Portal 容器。Popover 与 Popconfirm 搬迁 `positioner`；Tour 以同一租约
原子搬迁 `backdrop`、`spotlight` 与 `positioner`（缺省 positioner 时为 `content`），锚定步骤和
居中步骤使用同一视口落点。

这是 Web Components 的运行期 DOM 位置变化：不要再用宿主后代选择器查找这些部件，应保存节点引用
或从其 `ownerDocument` 查询。关闭退场完成后各根会精确恢复作者位置；iframe/adopt 重连只使用新
Document 的 Portal，Popover 的动态模态策略与 Popconfirm 的非模态策略不改变物理 Portal 合同。
