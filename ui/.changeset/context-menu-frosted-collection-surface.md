---
'@xihan-ui/styles': major
---

ContextMenu 迁入与 Menu 同源的 M2 磨砂表面和菜单行布局。content 的背景、前景、描边、
阴影、backdrop 与顶边高光均落到独立的 `--xh-context-menu-*` 覆盖槽；arrow 复用同一背景与描边，
不重复模糊。separator、group label、正文和说明文字采用同一套磨砂语义值。

条目保留 flex 主行和作者的真实节点顺序：任意图标、`item-text`、快捷键节点与子菜单箭头可以同排，
`item-text` 占剩余空间并截断，只有 `item-description` 独占第二行。没有统一预留的 leading 列，
也不会因为别的条目带 indicator 而移动当前条目。hover/highlight 与 open path 均使用中性淡底，
pressed 加深一档；展开二级菜单没有始端色条、品牌蓝底或字重变化，disabled 使用不可用游标。

浮层改用 `xh-overlay-slide-in` / `xh-overlay-slide-out`：首帧落位后按物理 placement 从锚点一侧淡入
短移，退出沿原方向收回，不再缩放整张菜单。每层 positioner 会先清零四个方向变量，再激活本层
唯一方向，避免 Web Components 的嵌套子菜单继承父方向后斜移。右键、长按、键盘与坐标定位逻辑未改。

新增的稳定覆盖槽包括 `--xh-context-menu-backdrop`、`--xh-context-menu-highlight`、
`--xh-context-menu-item-bg-pressed`、`--xh-context-menu-submenu-indicator-fg` 与
`--xh-context-menu-separator-radius`。

打开路径不再改变字重，既有 `--xh-context-menu-item-active-font-weight` 覆盖槽随之删除。请改用
`--xh-context-menu-item-bg-active` 控制中性路径底色；这是公开 CSS 槽删除，因此 Styles 按 major 记录。

皮肤体积（去注释、压空白）从 9775 增至 11873 字节；增量来自 M2 材质、四向短移动效与状态反馈。
