---
'@xihan-ui/styles': patch
---

Combobox 自绘的状态字形改按指示符档取尺，不再读只管作者图标的 `--xh-icon-size`（§6.5）：浮层条目里勾选标记所在的标记盒 `item-indicator` 在自己身上把 `--xh-icon-size` 改接到盒的尺（公开槽 `--xh-combobox-item-indicator-size` 不变，缺省 `--xh-control-indicator-size`，comfortable 16px / compact 14px）——空标记盒里皮肤画的兜底勾、作者塞进标记盒的 XhIcon 从此都与盒同边长、随密度换档（勾选标记不是勾选格，不取 × 0.75，与 Select / Listbox / Menu 族同口径；此前勾恒 20px，比 16 / 14 的盒大一圈）。root / positioner 按档下发的 `--xh-icon-size`（桥自 `--xh-combobox-icon-size`，md 20px）仍只管作者直接放进条目里的图标。
