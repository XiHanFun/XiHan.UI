---
'@xihan-ui/designer-shell': minor
---

新增设计器的设置：

- `<xh-designer-settings>` 设置对话框：左边竖排的分区页，右边逐条列出条目；内建编辑方式与属性面板同一套字段，别的种类经 `editors` 接入。宿主经 `policy` 隐藏或锁定条目，改一条派发 `settings-change { key, value, settings }`，`show(section?)` 打开。
- 设置模型：分区 `{ id, label, order?, items }`，条目就是属性描述，值是以 `<分区 id>.<条目 id>` 为键的扁平键值；`collectSettingsSections` 合起各来源的分区，重名抛 `DesignerExtensionError`（名字空间 `settings-section`）。扩展新增 `settings` 字段。
- 内建「基础」分区：主题（跟随页面、跟随系统、亮色、暗色）、主题色、状态栏与语言，主题色与语言按选项决定有没有。
- `createDesignerSettingsHost`：把主题与主题色写到设计器根的 `data-theme`、`data-brand` 上，只作用于设计器；自定义主题色经传入的 `registerBrand` 注册；设置读写 localStorage，标了 `secret` 的条目不存。
- 设置对话框的文案 `xh-designer-settings`，十种语言都有。
