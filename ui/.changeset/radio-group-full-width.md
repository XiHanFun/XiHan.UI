---
'@xihan-ui/headless': major
'@xihan-ui/vue': major
'@xihan-ui/react': major
'@xihan-ui/web-components': major
'@xihan-ui/styles': major
---

**破坏性** RadioGroup segmented 形态撑满行宽的开关从 `block` 改叫 `fullWidth`，与 Button、ButtonGroup、Toggle、ToggleGroup 同一个名字；投影的 `data-block` 随之改成 `data-full-width`。

| 旧名 | 新名 |
| --- | --- |
| `block`（Vue / React） | `fullWidth`（Vue 模板 `full-width`） |
| Web Components attribute `block` | `full-width` |
| 自写样式里的 `[data-scope='radio-group'][data-block]` | `[data-scope='radio-group'][data-full-width]` |
