---
'@xihan-ui/web-components': major
---

`<xh-date-picker>`、`<xh-time-picker>`、`<xh-mention>` 与 `<xh-color-picker>` 展开及真实退场期间会把
`positioner` 搬到宿主当前 Document 的配置 Portal 容器；关闭退场完成或宿主断开时精确恢复作者位置。

四组件复用 Web Components 的共享 `AnchoredPortalController` 与 Core `createPortalLease`，不各自复制
占位、搬迁、视觉桥或恢复逻辑。iframe adopt/reconnect 后只使用新所属 Document；展开期间消费方
不能再假定 `positioner` 是宿主的 DOM 后代。
