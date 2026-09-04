---
"@xihan-ui/tokens": minor
"@xihan-ui/styles": minor
---

**面板外壳的内衬与角落关闭钮收进共享语义档。**

令牌 `surface` 一族补齐两件事。原先 `py-md` 指着 `{section.py}`、`px-md` 指着 `{control.px-lg}`，而 `py-sm` / `px-sm` 是直写原语加 compact 表里逐档覆盖——同一族两条密度跟随路径。现在四档一律直写原语，compact 覆盖写在 compact 表里，两档同源。取值一个没变（comfortable 20/16，compact 16/12）。

新增四边等宽的面板内衬档 `--xh-surface-pad-xs|sm|md|lg`（4 / 8 / 12 / 16）与角落钮贴边档 `--xh-surface-action-inset`（12）。`pad-*` 三档在 compact 下逐档收窄（6 / 8 / 12）。

皮肤侧：

- 气泡、悬浮卡、确认气泡三份各写一遍的三档内衬（每份 6 条声明、纵横两把尺）收成一个私有槽读 `--xh-surface-pad-*`，18 条声明变 9 条。纵向内缩原先取不随密度动的原语，现在与横向同尺，compact 下一起收窄。
- 菜单、菜单栏、右键菜单、导航菜单四份外壳内衬改读 `--xh-surface-pad-xs`；通知卡片读 `--xh-surface-pad-lg`；提示条读 `--xh-surface-py-sm` / `--xh-surface-px-sm`。comfortable 取值不变，compact 下随密度收窄。
- 四份角落关闭钮的贴边与标题让位量改读 `--xh-surface-action-inset`：漫游导览从 8px 挪到 12px，与对话框、抽屉、通知同档（它的面板内衬本就与对话框同为 20 / 16）；通知的标题让位量原先按 8px 让、钮却钉在 12px 处，现在两处取同一个值。气泡的贴边仍是 8px：它的面板内衬只有 12px，28px 的钮按 12px 贴边会伸出面板自己的盒子、被 `overflow` 裁掉。
- 对话框、抽屉、气泡、漫游导览四份关闭钮的过渡属性表补上 `color`：这四颗叉悬停时换前景色，属性表里没有它，颜色是硬切的。九颗关闭钮的属性表现在统一为 `background` / `color` / `scale`（看图器那颗前景恒随外层继承、自己不定色，仍是两项）。

覆盖槽名、部件名与 `data-*` 取值一个没删也没改名。
