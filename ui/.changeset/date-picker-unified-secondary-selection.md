---
'@xihan-ui/styles': major
---

DatePicker 的快捷项与内嵌时间项改用末端对号表示持久选值。选中正文恢复普通颜色和字重，静止态不再铺品牌底；悬停与键盘焦点使用中性底，Calendar 日期格、范围连片和预览视觉保持原样。

时间数字使用双侧等宽标记轨，确保对号出现前后及 RTL 下都保持数学居中。禁用正文与对号统一进入失效态，forced-colors 下使用系统 `CanvasText` / `GrayText` 并保留公共选中轮廓。

手机复合面板把时间项的默认对号改用 `--xh-control-indicator-sm`（comfortable 12px、compact 10px），使日历与时 / 分两列在 375px 内继续同排；平板、桌面与快捷项保持 16px。公开 `*-check-size` 覆盖始终优先。

删除 `--xh-date-picker-preset-bg-selected` 与 `--xh-date-picker-time-item-bg-selected`。迁移自定义主题时，选中标记分别改用新增的 `--xh-date-picker-preset-check-size` / `--xh-date-picker-preset-check-fg` 和 `--xh-date-picker-time-item-check-size` / `--xh-date-picker-time-item-check-fg`；既有两项 `*-fg-selected` 仍只控制正文。

日期值、时间写回、快捷项选择、范围与 Calendar 机器逻辑均未改变。

归一化后的 `date-picker.css` 从 19929 B 增至 23665 B，新增内容集中在两类末端标记轨、状态反馈与高对比补救。

皮肤体积（去注释、压空白）：前一提交源码 23179 字节，当前 23662 字节；登记基线 23179 → 23662，只更新本组件，10% 容差保持不变。
