---
"@xihan-ui/headless": minor
"@xihan-ui/vue": patch
"@xihan-ui/web-components": patch
---

number-field 新增 `parse` / `format`：千位分隔符、单位后缀这类带格式的数字，现在不用把组件拆开自己拼了。

`parse` 把显示串读成数（默认 `Number()`，`'12abc'` 判为非法），`format` 把数写回显示串（默认 `String()`）。
两个方向必须互逆——`format` 出来的串要能被 `parse` 读回同一个数，否则按一下加号值就会漂。

落点分得很清楚：

- **`parse` 管所有"读"**：步进、取端点、失焦规范化、`aria-valuenow`、`valueAsNumber`、贴边判定，
  全都从它拿数。读屏念的因此是数，不是那串带逗号的显示文本。
- **`format` 只管组件自己改写显示的那三处**：步进、取端点、失焦规范化。
  用户正在打字时一律不碰——中途补格式会打断光标位置。

界仍按数比而不按串比，越界时先夹回区间再补格式。作者的 `parse` 返回了非数按 `NaN` 处理、
`format` 返回了非串退回 `String(value)`，坏的返回值不会顺着流进后续计算。
