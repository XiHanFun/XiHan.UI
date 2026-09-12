---
'@xihan-ui/web-components': major
---

将 HoverCard 与 Tooltip 的锚定浮层物理搬迁到当前运行时的 Portal 容器。

展开与真实退场期间由共享 `AnchoredPortalController` 持有 Core Portal 租约；局部视觉环境、
跨 Document 重建和关闭后的精确归位与其他锚定浮层一致。依赖宿主后代选择器定位 positioner
的样式或脚本需要改为按当前 Document 查询公开部件。
