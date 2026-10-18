---
'@xihan-ui/headless': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
'@xihan-ui/web-components': minor
'@xihan-ui/styles': minor
---

**新增** 菜单、右键菜单与菜单栏的条目可以带图标：`collection` 的条目加 `icon`（图标记录），三个组件都多一个部件 `item-icon`，排在条目文字之前，装饰态，读屏从条目文字取意。勾选与单选条目的勾仍在 `item-indicator`，两者各占一格。Vue / React 新增 `XhMenuItemIcon`、`XhContextMenuItemIcon`、`XhMenubarItemIcon`，手写条目时也可以用；集合条目族多一个 `icon` 槽位。

**新增** 工具条的 `itemIcons`：按条目的 `value` 给图标记录，放不下收进「更多」菜单的条目带着各自的图标，三端同一种写法。

**新增** Web Components 的 `<xh-icon>` 一个部件都不写时，自己生成 `<svg>` 根与 glyph 空壳，只给 `icon` 即可画出；只写一个空的 `root` 时在里面生成 glyph 空壳，以前这种写法什么都不画、只报一条缺 glyph 的 warn；在 `root` 里写了几何而没写 `glyph` 时照旧不改作者的几何。
