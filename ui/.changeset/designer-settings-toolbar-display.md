---
'@xihan-ui/designer-shell': minor
---

**新增** 设置对话框内建的「工具栏」页：按钮显示方式 `toolbar.display`（图标、文字、图标和文字，缺省图标）、显示工具栏 `toolbar.visible`（缺省开），以及给了 `toolbar` 时的按钮表 `toolbar.layout`。按钮表一组一块，组头三态勾选、命令逐条勾选显隐，组与命令都能拖，命令能跨组挪，表下「恢复默认」；值是 `DesignerToolbarCustomization` `{ groups, hidden? }`，宿主用 `settingsPolicy` 的 `toolbar.layout` 锁定或藏掉这张表。只管顶部工具栏，顶栏插入钮、右键菜单与选中工具条不进用户定制。

- 各款排工具栏：`arrangeCommands` 之后套 `applyToolbarCustomization(分组, toolbarCustomizationOf(settings))`；显示方式用 `toolbarDisplayOf(settings)`，显示工具栏用 `toolbarVisibleOf(settings)`；交给对话框的数据用 `toolbarSettingsSource(缺省排列, 命令表, 上下文)` 现算。
- 新增 `designerToolbarSettings`、`DESIGNER_TOOLBAR_SETTINGS`、`TOOLBAR_LAYOUT_CONTROL`、`mergeToolbarCustomization` 与类型 `DesignerToolbarSettingsSource`、`DesignerToolbarCommandInfo`、`DesignerToolbarSettingsOptions`；`DESIGNER_SETTING_KEYS` 有 `toolbarDisplay`、`toolbarVisible`、`toolbarLayout`。分区 id `toolbar` 留给内建。
- 文案十种语言。
