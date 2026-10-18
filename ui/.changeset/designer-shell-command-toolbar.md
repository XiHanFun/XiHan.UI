---
'@xihan-ui/designer-shell': minor
---

**新增** 命令工具栏的三种显示方式：`createCommandToolbar(document, { display })` 的 `display` 是 `icon`（缺省）、`text` 或 `both`，没有图标的命令在 `icon` 档照样显示文字；`setDisplay` 换显示方式不重铺按钮，「更多」里的条目按新的宽度重新收放。

**新增** 工具栏按钮带命令的图标，收进「更多」的条目也带着；名字写在按钮的 `aria-label` 上，快捷键按 `platform` 写成规范的 `aria-keyshortcuts`（macOS 是 `Meta+…`，其余平台是 `Control+…`）。整条工具栏由一个委托模式的 `<xh-tooltip>` 包着，悬停或键盘聚焦到按钮时显示命令的文字与快捷键，禁用的按钮悬停照样显示。`element` 现在是这层外壳，布局上不占盒子，里面那条工具栏是新增的 `toolbar`。

**新增** `renderCommandMenu` 给带图标的命令铺 `item-icon`，带快捷键的条目写 `aria-keyshortcuts`。

**新增** 四款共用的命令文案收进语言包的 `xh-designer-commands` 一桶，十种语言各一份：通用编辑、对齐与分布、层级、缩放、设计与预览，以及命令工具栏的名字；英文缺省导出为 `DESIGNER_COMMANDS_EN_US`。
