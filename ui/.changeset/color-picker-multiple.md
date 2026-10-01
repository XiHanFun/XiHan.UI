---
'@xihan-ui/headless': major
'@xihan-ui/vue': major
'@xihan-ui/react': major
'@xihan-ui/web-components': major
'@xihan-ui/styles': minor
---

ColorPicker 的值改为恒为颜色串数组，并支持多选。

- **破坏**：`onValueChange` / `value-change` 的 `value`、Vue `update:value`、`api.value` 由字符串改为 `string[]`：单选恒为一项；`setValue` 接收数组。宿主写入的 `value` / `defaultValue` 仍可写裸串，按一项处理。工作色（触发钮色块与值文字显示的那个）改由新增的 `api.color` 读出。迁移：读值处取 `value[0]`，写值处包一层数组。
- 新增 `selectionMode="multiple"`：浮层里调出的工作色是草稿，按新部件 `confirm-trigger`（`XhColorPickerConfirmTrigger`，文字由作者写）收进值，浮层不收；预设色板点一下切换选中；`maxSelected` 限制个数；同一个颜色按颜色比较只收一份。
- 多选的选中值在输入行里排成标签：新增 `tag-list` 部件与 `XhColorPickerTagList` / `XhColorPickerTag` / `XhColorPickerTagLabel` / `XhColorPickerOverflowTag` / `XhColorPickerItemDeleteTrigger`，与 Select 多选同一套库内标签，每枚前一个该颜色的色点；值文字收起，触发钮只留色块并成为键盘入口（退格摘掉最后一个）；标签不截短、放不下折行，超过 `maxTagCount`（默认 3）折进 +N；`translations` 新增 `deleteItem` / `overflowTag`；表单一个选中值一份同名隐藏输入。
