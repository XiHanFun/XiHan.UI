---
'@xihan-ui/headless': major
'@xihan-ui/styles': major
'@xihan-ui/vue': patch
'@xihan-ui/react': patch
'@xihan-ui/web-components': patch
---

**改名** Statistic 的涨跌段把 `data-direction` 改为 `data-trend`（取值照旧 `up` / `down` / `flat`），与它的 prop `trend` 同名；`data-direction` 只留给 Marquee 的滚动方向，两件事不再共用一个属性名。自己写了 `[data-direction]` 涨跌样式的皮肤要改成 `[data-trend]`。

**改名** FilterBuilder 条件取值区的 `data-shape` 改为 `data-operand`（取值照旧 `none` / `single` / `range` / `list`）：`data-shape` 只留给 Skeleton 与 ImageCropper 的几何形状。
