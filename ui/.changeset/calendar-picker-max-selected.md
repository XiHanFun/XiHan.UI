---
'@xihan-ui/headless': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
'@xihan-ui/web-components': minor
---

CalendarPicker 新增 `maxSelected`（只在 `selectionMode="multiple"` 下生效）：选满后没选中的格子转 `aria-disabled`（仍可聚焦），点击、确认键与公开的 `select` 都加不进去；已选的照旧可以点掉，点掉一个即腾出名额。`setValue` 与受控 `value` 原样收下。非整数向下取整，小于 1 或不是有限数时不设上限。api 新增 `maxSelected`（实际生效的上限，没有时为 `null`）。Web Components 的 attribute 是 `max-selected`。
