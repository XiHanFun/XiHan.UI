---
"@xihan-ui/pointer": minor
"@xihan-ui/headless": minor
"@xihan-ui/vue": minor
"@xihan-ui/web-components": minor
"@xihan-ui/styles": minor
---

**新增** `table` 的列宽拖拽：列上标了 `resizable` 就产出改宽把手，拖动与方向键都能调。

把手是可聚焦的分隔条，报出当前列宽与上下限；拖出表头仍跟手，系统收走指针时宽度退回按下那一刻。方向键一次 8px、按住 Shift 一次 40px，rtl 下左右两键对调而语义恒是「加宽 / 收窄」。列宽落在列偏好里，可以直接存起来下次还原。

列宽写成百分比这类算不出 px 的写法时不认可改宽——读屏要一个数值，给不出就不该声称自己是可调控件，键盘本来也动不了它。

**新增** `@xihan-ui/pointer` 的尺寸调整几何层：八向边推动加约束（上下限 / 宽高比 / 吸附步进 / 容器夹取），纯函数。`floating-panel` 的 `resizeFloatingPanel` 与 `clampFloatingPanelSize` 保留签名、内部改走它，行为不变。
