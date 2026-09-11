---
'@xihan-ui/styles': major
---

ContextMenu 迁入与 Menu 同源的 M2 磨砂表面和 Collection Item 布局。content 的背景、前景、描边、
阴影、backdrop 与顶边高光均落到独立的 `--xh-context-menu-*` 覆盖槽；arrow 复用同一背景与描边，
不重复模糊。separator、group label、正文和说明文字采用同一套磨砂语义值。

条目改用稳定网格列：当前层出现 `item-indicator` 时，直属条目和组标题统一留出 leading 列，正文与
说明从同一起点截断，子菜单箭头固定在末列；嵌套层不会参与父层列宽判断。hover/highlight、pressed、
open path 分成三档实体反馈，打开路径以始端色线表达且不改变字重，disabled 使用不可用游标。

浮层改用 `xh-overlay-slide-in` / `xh-overlay-slide-out`：首帧落位后按物理 placement 从锚点一侧淡入
短移，退出沿原方向收回，不再缩放整张菜单。每层 positioner 会先清零四个方向变量，再激活本层
唯一方向，避免 Web Components 的嵌套子菜单继承父方向后斜移。右键、长按、键盘与坐标定位逻辑未改。

新增的稳定覆盖槽包括 `--xh-context-menu-backdrop`、`--xh-context-menu-highlight`、
`--xh-context-menu-item-bg-pressed`、`--xh-context-menu-item-path-indicator`、
`--xh-context-menu-item-leading-size`、`--xh-context-menu-group-label-leading-size`、
`--xh-context-menu-group-label-leading-gap`、`--xh-context-menu-submenu-indicator-fg` 与
`--xh-context-menu-separator-radius`。

打开路径不再改变字重，既有 `--xh-context-menu-item-active-font-weight` 覆盖槽随之删除。请改用
`--xh-context-menu-item-bg-active` 控制路径底色，并用新增的 `--xh-context-menu-item-path-indicator`
控制始端色线；这是公开 CSS 槽删除，因此 Styles 按 major 记录。

皮肤体积（去注释、压空白）从 9775 增至 16648 字节；增量为材质、稳定列布局与状态反馈，仅登记本组件，10% 容差保持不变。
