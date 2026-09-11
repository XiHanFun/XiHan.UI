---
'@xihan-ui/headless': patch
'@xihan-ui/styles': major
---

Combobox 的无候选与加载相位改为共用 `content` 的唯一浮层表面，不再在空 listbox 下方各画一张独立卡片。
`empty` 与 `loading` 仍是 listbox 的同级 `role=status`，以同格文字层覆盖 content；候选、状态和 Presence
因此共享同一套尺寸、边界、圆角、背景、阴影与退场动画。

content 新增 `--xh-combobox-content-min-h` 覆盖槽，空列表关闭时也保留完整退场高度。只有零候选时才显示
loading 状态层；已有候选时列表保持可见、可操作，仅由 `aria-busy` 报后台刷新，避免输入框指向或提交不可见旧项。
自由文本的 Enter 提交逻辑不变。

自动结构未收到状态文案时不绘制无文字空框；组件不虚构通用空态文案。提供文案后仍使用同一个 content 表面。

移除已经不再拥有表面的 `--xh-combobox-empty-bg`、`--xh-combobox-empty-border`、
`--xh-combobox-empty-radius`、`--xh-combobox-empty-shadow`、`--xh-combobox-loading-bg`、
`--xh-combobox-loading-border`、`--xh-combobox-loading-radius` 与 `--xh-combobox-loading-shadow`。
不保留可重新画出双层空态卡片的兼容分支。

皮肤体积（去注释、压空白）：前一提交源码 19073 字节，当前 19182 字节；登记基线 19073 → 19182，只更新本组件，10% 容差保持不变。
