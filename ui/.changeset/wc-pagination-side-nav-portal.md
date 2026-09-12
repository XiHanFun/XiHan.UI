---
'@xihan-ui/web-components': major
---

将 Pagination 的省略位/每页条数面板和 SideNav 的折叠分支弹层物理搬迁到 Portal 容器。

每个独立浮层都有自己的 Core Portal 租约并与对应 Presence 生命周期同步；非折叠 SideNav
分支继续留在行内布局。依赖宿主后代选择器定位这些 positioner 的样式或脚本需要改为按
当前 Document 查询公开部件。
