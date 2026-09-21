---
'@xihan-ui/styles': patch
---

Listbox 自绘的状态字形改按指示符档取尺，不再读只管作者图标的 `--xh-icon-size`（§6.5）：page 语境下前导对号所在的标记盒 `item-indicator` 的缺省从 `--xh-icon-size` 改为 `--xh-control-indicator-size`（公开槽 `--xh-listbox-item-indicator-size` 不变，comfortable 16px / compact 14px；此前恒 20px，比指示符档大一圈），并在自己身上把 `--xh-icon-size` 改接到盒的尺——空标记盒里皮肤画的兜底勾、作者塞进标记盒的 XhIcon 从此都与盒同边长、随密度换档（前导对号不是勾选格，不取 × 0.75，与 Menu 族同口径；此前勾恒 20px）。条目上由家族下发的 `--xh-icon-size`（桥自 `--xh-listbox-icon-size`，md 20px）仍只管作者直接放进条目里的图标。
