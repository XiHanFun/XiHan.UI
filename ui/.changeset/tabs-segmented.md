---
'@xihan-ui/headless': major
'@xihan-ui/vue': major
'@xihan-ui/react': major
'@xihan-ui/web-components': major
'@xihan-ui/styles': major
---

**破坏性** Tabs 的形态值 `segment` 改叫 `segmented`，与 RadioGroup 那一档同一种外观同一个词（轨道里滑动的滑块标出当前段）。

| 旧写法 | 新写法 |
| --- | --- |
| `variant="segment"` | `variant="segmented"` |
| 自写样式里的 `[data-scope='tabs'][data-variant='segment']` | `[data-scope='tabs'][data-variant='segmented']` |
