---
"@xihan-ui/kernel": minor
"@xihan-ui/position": minor
"@xihan-ui/headless": minor
---

RTL 下浮层的 `start` / `end` 第一次真的翻过来了。

皮肤层一直是干净的（108 份皮肤零物理方向属性），坏的是运行时那一半：定位引擎对文字方向完全无感，
`alignOn` 把 `start` 直接算成物理左缘。于是 RTL 页面里 `placement="bottom-start"` 的浮层仍然贴着
锚点左缘——而 `start` 在 RTL 里应当是右缘。15 个吃引擎坐标的浮层组件全受影响。

- `PositionOptions` 与计算层新增 `dir`，缺省 `ltr`。
- **只改写行内轴**：`top` / `bottom` 两侧的横向对齐随方向翻转；`left` / `right` 两侧的纵向对齐是块轴，
  与文字方向无关，一个像素都不动。这条有单独的判据钉着。
- 15 个浮层组件把自己的 `dir` 接到引擎；其中 combobox、date-picker、mention、popover、time-picker、
  tooltip、tour 这 7 个此前连 `dir` 接口都没有，一并补上（可选 prop，纯增量）。

不传 `dir` 与传 `'ltr'` 的结果逐字相同，所以既有用法一个像素都不变。

仍未做完、如实记账：`Placement` 仍是物理的（`Side = 'top' | 'right' | 'bottom' | 'left'`），
没有 `inline-start` 这类逻辑关键字；`RuntimeConfig.dir` 仍是死字段，方向还得逐组件传。
这两件都是加法，不阻塞现在这一版。
