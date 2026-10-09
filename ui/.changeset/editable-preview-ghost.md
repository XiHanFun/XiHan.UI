---
'@xihan-ui/headless': major
'@xihan-ui/styles': major
---

Editable 预览态的盒改为无壳：

- control 的 `data-variant` 在预览态恒为 `ghost`（读起来就是一段文字，悬停才浮出描边），进编辑态才换成 root 的形态（缺省 `outline`）；root 的 `data-variant` 不变
- 编辑、确认、取消三颗钮的字形取次要前景 `--xh-fg-muted`；视觉盒仍按字段内钮尺寸表随档（sm / md / lg 取 24 / 28 / 32px，compact 20 / 24 / 28px），确认与取消之间新隔 4px（`--xh-space-1`），紧凑 sm 档两钮中心距不低于 24px
- 删除动作组与内容段之间的分隔线及覆盖槽 `--xh-editable-trigger-divider`、`--xh-editable-trigger-divider-h`
