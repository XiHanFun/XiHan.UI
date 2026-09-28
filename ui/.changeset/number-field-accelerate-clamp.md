---
'@xihan-ui/headless': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
'@xihan-ui/web-components': minor
---

NumberField 长按连发加速，新增失焦夹取开关 `clampValueOnBlur`。

- 长按加减按钮按住越久越快：从 `changeInterval`（50ms）一拍起，每连发一次间隔缩到上一拍的 0.85，收到新属性 `minChangeInterval`（默认 10ms，Web Components 属性 `min-change-interval`）为止；写成与 `changeInterval` 相同即按固定节奏连发。只缩短间隔、不放大步长。headless 导出 `NUMBER_FIELD_MIN_CHANGE_INTERVAL` 与 `NUMBER_FIELD_CHANGE_ACCELERATION`。
- 新增 `clampValueOnBlur`（默认 `true`，Web Components 属性 `clamp-value-on-blur`，写 `"false"` 关掉）：关掉后失焦只补格式、不把越界值夹回区间，步进照旧不越界。
- API 与插槽载荷新增 `outOfRange`（合法数字落在 `[min, max]` 之外），根投影 `data-out-of-range`；Web Components 元素新增只读的 `outOfRange`。
