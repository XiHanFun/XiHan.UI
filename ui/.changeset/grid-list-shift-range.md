---
'@xihan-ui/headless': minor
---

GridList 多选支持 Shift 范围选：Shift + 方向键 / Home / End 移动焦点并把锚点到新焦点行那一段并进选中，Shift + Space 与 Shift + 点击扩到那一行。每一次扩选都从扩选开始前的选中集重算，往回扩即收回；禁用行占着位置但不被收进去；没有锚点时扩选退化成切换这一行。键盘规格表新增 `grid-list.kbd.extend` 与 `grid-list.kbd.extend-select` 两条。
