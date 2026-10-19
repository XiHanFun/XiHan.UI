---
'@xihan-ui/designer-shell': minor
---

**新增** 设置对话框内建的「帮助」「快捷键」「关于」三页（排在最后）：给了 `help`（几段操作说明与几颗跑命令的钮）、`shortcuts`（快捷键表）、`about`（产品、版本、界面库版本、许可证与扩展的几行）才有。帮助页的钮派发新事件 `settings-command { command }`，由设计器跑命令。

- 只显示、不存值的四种条目 `note`、`action`、`info`、`shortcutTable`，各款与扩展的分区也能用；不写设置、不进 `resolveSettings`。
- `shortcutSettingsSource(命令表, 上下文, { extensionCommands?, keys? })` 从命令表生成快捷键表：内置命令归「通用」、四款共有的编辑命令（`DESIGNER_EDIT_COMMANDS`）归「编辑」、扩展的归「扩展」、其余归「本设计器」，第二快捷键写在同一行；对话框给「通用」补上四款都有的按键 `DESIGNER_COMMON_KEYS`。
- 新增 `designerHelpSettings`、`designerShortcutSettings`、`designerAboutSettings` 与三页的分区 id 常量（`help`、`shortcuts`、`about` 留给内建），版本常量 `DESIGNER_SHELL_VERSION`；扩展新增 `about` 字段。
- 文案十种语言。
- `shortcutSettingsSource` 的选项新增 `commonKeys`：各款换掉「通用」组末尾四款共有的那几行，去掉本设计器没有的、改写说法不同的（`label` 取各款自己的文案），或另加几行；不给时照旧。新增导出类型 `DesignerCommonKey`、`DesignerCommonKeyId`。
