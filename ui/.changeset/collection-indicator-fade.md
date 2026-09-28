---
'@xihan-ui/styles': patch
---

集合行尾的已选对号（Select、Listbox、Combobox、Cascader、TreeSelect、Tree）改为常驻在 indicator 列、按选中态以 opacity 淡变（`--xh-motion-duration-micro`），不再用 `visibility` 瞬切，与时间 / 日期面板里预设与时间格的对号同一种做法。Cascader、TreeSelect、Tree 的勾与半选杠叠成两层遮罩按状态换尺寸：离开半选淡出的那一段里横杠留着，淡出播完才换回勾。Cascader 搜索候选行尾的对号同样淡变。
