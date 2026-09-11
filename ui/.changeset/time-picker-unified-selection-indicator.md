---
'@xihan-ui/styles': major
---

TimePicker 的快捷选项与时、分、秒列统一使用对号表示当前值。默认选中项不再使用品牌实底、反白正文或加粗；
悬停、键盘高亮和可见焦点使用中性实体底，选中与临时高亮可以同时辨认。

对号由组件皮肤在恒定轨中绘制。preset 固定在逻辑末端；数字格两侧保留等宽空间，确保选中状态和 RTL
不会改变数字的数学中心。forced-colors 使用系统前景，禁用选中项使用 GrayText。

新增 `--xh-time-picker-preset-fg`、`--xh-time-picker-preset-check-size`、
`--xh-time-picker-preset-check-fg`、`--xh-time-picker-item-check-size` 与
`--xh-time-picker-item-check-fg` 覆盖槽。

移除不再承载选中语义的 `--xh-time-picker-preset-bg-checked`、
`--xh-time-picker-preset-bg-checked-hover`、`--xh-time-picker-item-bg-checked` 与
`--xh-time-picker-item-bg-checked-hover`。不保留品牌选中面的兼容分支。

皮肤体积（去注释、压空白）：前一提交源码 19195 字节，当前 20894 字节；登记基线 19195 → 20894，只更新本组件，10% 容差保持不变。
