---
'@xihan-ui/styles': patch
---

Menu 自绘的状态字形改按指示符档取尺，不再读只管作者图标的 `--xh-icon-size`（§6.5）：带子菜单条目行尾的展开 chevron `::after` 取新增公开槽 `--xh-menu-submenu-indicator-size`（缺省 `--xh-control-indicator-size`，comfortable 16px / compact 14px；此前恒 20px，比同一行 16px 的指示符档大一圈，与既有的 `--xh-menu-submenu-indicator-fg` 配对）；标记位 `item-indicator` 的盒改按 `--xh-menu-item-indicator-size`（缺省从 `--xh-icon-size` 改为 `--xh-control-indicator-size`，comfortable 16px / compact 14px；此前随家族按档下发的 20px）取尺，并在自己身上把 `--xh-icon-size` 改接到盒的尺——作者塞进标记位的 XhIcon 从此与盒同尺、随密度换档。条目上由家族下发的 `--xh-icon-size`（md 20px）仍只管作者直接放进条目里的图标。
