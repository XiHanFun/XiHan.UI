---
'@xihan-ui/headless': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
'@xihan-ui/web-components': minor
'@xihan-ui/styles': minor
---

表格（Table）新增单元格级导航 `navigation="cell"`（Web Components 写 `navigation` 属性），照 WAI-ARIA treegrid 的键盘，缺省 `row` 仍是行级焦点。

- 焦点在行上：左右键照旧展开 / 收起；已展开或不可展开的行按右键进到首格，已收起的行或叶子行按左键回到父行；Ctrl + Home / End 到首末行。
- 焦点在格子上：左右键在格子之间走，首格再按左键回到行；上下键在可见数据行之间走同一列，禁用行跳过；Home / End 到本行首末格，Ctrl + Home / End 到本列首末行。
- Enter 或 F2 进到格内第一个可聚焦的控件，之后按键都归控件；Esc 或 F2 退回格子，控件自己用掉了 Esc 的不退。格内没有控件时 Enter 触发行主操作 `onAction`，`column` 报这一格的列 id。
- 整张表只有一个 Tab 位，落在锚点所在的行或格子上；格子落焦画一圈内收的聚焦环。表体格子里的控件平时退出 Tab 序列（表格替它们写 `tabindex="-1"`，记下原值），进到哪一格的控件里才放开那一格，后来插入的控件同样管到；编辑中 Tab / Shift + Tab 只在这一格的控件之间回绕。选中（Space）、Alt + 方向键换位与改层级、拖动照常可用，换位之后焦点仍在原来那一格。

同时修复：键盘换位（Alt + 上下键、Alt + 左右键）之后，宿主写回时若挪动了持有焦点的行节点（Web Components 下把行节点按新次序排回表体就是这样），焦点掉回页面，连着再按一次就没有反应；现在焦点回到搬走的那一行，行级导航下同样如此。
