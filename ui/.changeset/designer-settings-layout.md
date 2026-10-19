---
'@xihan-ui/designer-shell': minor
---

**新增** 设置对话框的「布局」页：`<xh-designer-settings>` 给了 `frame`（设计器的外框）时，「基础」后面多一页面板表，逐块面板列出显示、位置（左栏、右栏、下栏、浮动）、上移下移与收成标题条，表下一颗「恢复默认布局」；改动直接经外框的方法改布局，由外框派发 `layout-change`。宿主用 `settingsPolicy` 的 `layout.panels` 藏掉或锁定这一页。新增 `designerLayoutSettings`、`DESIGNER_LAYOUT_SETTINGS`、`PANEL_LAYOUT_CONTROL` 与类型 `DesignerSettingsFrame`；分区 id `layout` 留给内建。外框 `panelEntries()` 每项多出 `movable`、`floatable`、`minimizable`。
