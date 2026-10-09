---
'@xihan-ui/headless': major
'@xihan-ui/styles': major
---

Editable 预览态的盒改为无壳：

- control 的 `data-variant` 在预览态恒为 `ghost`（读起来就是一段文字，悬停才浮出描边），进编辑态才换成 root 的形态（缺省 `outline`）；root 的 `data-variant` 不变
- 编辑、确认、取消三颗钮的视觉盒三档都取 `--xh-control-action-size`（24px，compact 20px），字形取次要前景 `--xh-fg-muted`
- 删除动作组与内容段之间的分隔线及覆盖槽 `--xh-editable-trigger-divider`、`--xh-editable-trigger-divider-h`
