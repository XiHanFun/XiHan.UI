---
'@xihan-ui/web-components': major
---

`<xh-menu>`、`<xh-context-menu>` 与 `<xh-menubar>` 的根定位层现在与 React、Vue 一样，
在展开及真实退场期间物理搬到宿主当前 Document 的配置 Portal 容器。Menubar 为每个可见或
退场中的 content/positioner 对持有独立租约；多级菜单仍由 Headless 逻辑树维护父子所有权、
跨 Portal 悬停分支与叶到根关闭顺序。

这是破坏性 DOM 位置变化：展开与退场期间不能再假定 positioner 是菜单宿主的 DOM 后代，
应保存部件引用或从其 `ownerDocument` 查询。Core `createPortalLease` 继续唯一负责占位、物理搬迁、
视觉环境桥接、事务回滚与精确归位；关闭退场完成、断连或 iframe realm 换代后不会遗留壳。
