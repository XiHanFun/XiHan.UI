---
'@xihan-ui/styles': patch
---

Cascader 自绘的状态字形改按指示符档取尺，不再读只管作者图标的 `--xh-icon-size`（§6.5）：分支条目行尾的展开 chevron `::after` 的缺省从 `--xh-icon-size` 改为 `--xh-control-indicator-size`（公开槽 `--xh-cascader-branch-arrow-size` 不变，comfortable 16px / compact 14px；此前恒 20px，比同一行 16px 的标记盒大一圈）；标记盒 `item-indicator` 在自己身上把 `--xh-icon-size` 改接到盒的尺（`--xh-cascader-item-indicator-size`，缺省 `--xh-control-indicator-size`）——空标记盒里皮肤画的兜底勾与半选杠、作者塞进标记盒的 XhIcon 从此都与盒同边长、随密度换档，与搜索候选行尾的勾同尺（此前勾与杠恒 20px，落在 16 / 14 的盒里比盒还大）。条目上由家族下发的 `--xh-icon-size`（桥自 `--xh-cascader-icon-size`，md 20px）仍只管作者直接放进条目里的图标。
