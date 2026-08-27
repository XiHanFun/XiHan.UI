---
"@xihan-ui/headless": patch
---

**修复** 按住切换类的键不放时会来回翻转：按住 <kbd>Ctrl</kbd>/<kbd>Cmd</kbd> + <kbd>A</kbd> 会在全选与全不选之间一直闪，按住空格会反复拾起放下。

浏览器在按住键时会连着发 `keydown`，此前全仓没有一处挡过它。12 处切换类的按键分支补上了守卫：`table` 全选（表体与全选把手两处）、`listbox` 全选与切换、`transfer` 整侧切换与勾选、`sortable` 拾起与放下、`json-viewer` 展开切换、`menubar` 开合、`combobox` / `color-picker` / `tags-input` / `editable` 的提交。

守卫一律加在 `preventDefault` 之后：键照样吞掉，不让默认行为漏出去，只是不重复执行。

**步进类的按键不挡**——方向键移动焦点、调尺寸、调列宽，按住连发正是它们的用法。新增门禁 `check-key-repeat` 守住这条界线。
