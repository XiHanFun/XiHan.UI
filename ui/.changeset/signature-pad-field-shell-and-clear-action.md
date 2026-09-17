---
'@xihan-ui/headless': minor
'@xihan-ui/styles': minor
---

**SignaturePad 画布改按字段外壳规则取值，清空按钮接入 Action Control text 档与按压通道。**
连接层的 clear-trigger 新增稳定属性 `data-xh-action-control` / `data-xh-action-profile="text"` /
`data-xh-action-display="always"` / `data-xh-action-size="sm"` / `data-xh-action-variant="outline"`；
机器新增按压通道，Space / Enter 与触屏按住期间 clear-trigger 投影 `data-pressed`（禁用或只读不进入，
按住途中转禁用 / 只读由机器收面），键盘表新增 `signature-pad.kbd.press`。

视觉默认变化：画布 `control` 的圆角由 `--xh-shape-surface` 8px 改为字段身份的 `--xh-shape-control` 4px，
静息底由 `--xh-bg-surface` 改为字段用的 `--xh-bg-canvas`（亮色同为 neutral-0，暗色 900 → 950），
禁用面由只换 `--xh-bg-muted` 底改为 `--xh-border-default` 描边 + `--xh-bg-subtle` 底 + `not-allowed` 手型，
只读新增 `--xh-bg-subtle` 底（描边不动）；新增公开槽 `--xh-signature-pad-bg-readonly` /
`--xh-signature-pad-border-disabled`。标签由 `--xh-fg-muted` 改为字段标签档 `--xh-fg-default`，禁用标签
`--xh-fg-subtle`（新增 `--xh-signature-pad-label-fg-disabled`）；根的 gap 由 `--xh-stack-gap-md` 16px 改为
`--xh-space-2` 8px（画布到清空按钮与状态句），标签到画布收成 `--xh-space-1` 4px（新增
`--xh-signature-pad-label-gap`）。状态句改说明角色：字号 `--xh-text-secondary-size` 13px、行高
`--xh-leading-normal`。

清空按钮：皮肤删除自写的盒型、高度、内距、描边、底、前景、字号、手型、过渡、hover 抬影
（`--xh-elevation-raised`）、active 与 `:disabled` 面，改由家族配方按 outline 列给出——白底承载阶梯悬停
`--xh-bg-subtle`（100）→ 按下 `--xh-bg-subtle-hover`（200），此前是 200 → 300 并悬停抬影；各态无影。
公开槽 `--xh-signature-pad-clear-bg / -bg-hover / -bg-active / -bg-disabled / -fg / -border / -border-hover /
-h / -px / -gap / -radius / -shadow-hover` 改为桥接到配方之前（`-shadow-hover` 缺省 none），新增
`--xh-signature-pad-clear-font-size` / `-clear-icon-size` / `-clear-fg-empty`。皮肤体积基线随桥接槽一并重落。
