---
'@xihan-ui/headless': patch
---

**修复** 时间列打开时停到选中格的位置改按排布距离（`offsetTop`）计算。浮层入场时整面从 `--xh-motion-scale-enter` 放大，按 `getBoundingClientRect` 量出的距离比布局距离短一截，列会停在选中格上方。受影响的是 TimePicker、TimeRangePicker 以及 DatePicker / DateRangePicker 的时间列。
