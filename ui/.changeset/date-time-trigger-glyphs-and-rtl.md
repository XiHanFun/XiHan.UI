---
"@xihan-ui/tokens": minor
"@xihan-ui/styles": minor
---

**日期与时间两家的展开钮换成日历与时钟字形，日历的翻页箭头在 RTL 下对调，时刻段补上触屏手势与内衬槽。**

**`date-picker` / `time-picker` 的 `trigger` 此前不写内容画的都是向下的尖角**，与 `select` / `combobox` / `cascader` 的展开钮长得一模一样——一排表单控件摆在一起，哪个开出来的是日历、哪个开出来的是时刻列表，只能靠盒里的文字猜。现在两家各画各的：日期那颗是日历，时刻那颗是表盘。新增字形令牌 `--xh-glyph-mark-calendar` / `--xh-glyph-mark-clock`，在任意子树上重声明即可换图，置 `none` 就是「这里我自己放节点」；作者往部件里塞了自己的图形照旧让位。

**`calendar` 的四颗翻页钮此前在 `dir="rtl"` 下指错方向**：月份从右往左排，箭头却仍按从左往右的页序画。现在四颗按 `dir` 分支对调 —— 单步的 `prev-trigger` / `next-trigger` 与大步的 `prev-year-trigger` / `next-year-trigger` 都跟着行进方向走。只在不写内容时命中，作者自己放的图形不受影响。

**`time-field` 的 `segment` 补两条与 `date-field` 对齐的声明**：`touch-action: manipulation`（此前触屏上连点两段会被当成缩放手势），以及内衬槽 `--xh-time-field-segment-py`（此前竖向内衬写死为 0，改不动；默认值仍是 0，不写就与现在一模一样）。
