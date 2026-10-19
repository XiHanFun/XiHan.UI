---
'@xihan-ui/headless': patch
---

字段数组（FieldArray）表格排布横向放不下、表格本体在框里横向滚动时，表格本体带 `tabindex="0"` 进 Tab 序列：一行都没有、或行里没有能聚焦的控件时，键盘用户也能停在上面用方向键横向滚动，读屏念出表格的名字。放得下时照旧不占 Tab 位。Vue、React 与 Web Components 一样。
