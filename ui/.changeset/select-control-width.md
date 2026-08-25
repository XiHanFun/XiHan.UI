---
"@xihan-ui/styles": major
---

Select 的盒不再自带宽度上限，框宽交回布局；视觉行为变更。

`[data-part='control']` 上原有一条 `max-inline-size`，兜底取 `--xh-overlay-max-w`（20rem / 320px）。
浮层的宽度预算被搬到了在流内排布的表单控件上：格子一旦宽过 320px，select 就停在 320px 不再跟着长——
两列栅格的弹窗里，左边的 select 比右边的数字输入框窄一截。硬上限也不是必需的：`value-text` 与
`trigger` 各有 `min-inline-size: 0` 配省略号，长值撑不破盒。

同族的 cascader / tree-select / popselect / color-picker，以及 text-field / number-field，
control 上都没有上限，select 是唯一一家。这条删掉之后全族同形。

破坏性变更：**覆盖槽 `--xh-select-control-max-w` 随之移除**。此前写过
`--xh-select-control-max-w: 24rem` 的，改在自己的布局层给 select 的根或所在格子写宽度
（`inline-size` / `max-inline-size`），效果一致且对同族其余控件通用。

`check-family-parity` 的下拉族 control 名单补上 `max-inline-size`：往后任何一家单独给盒封顶都会被拦下。
公开面基线（`tooling/public-surface.json`）需随本次改动跑一次 `pnpm surface:update`。
