---
'@xihan-ui/styles': patch
---

TreeSelect 面板里自绘的状态字形改按指示符档取尺，不再读只管作者图标的 `--xh-tree-select-icon-size`（§6.5）：展开箭头把手 / 方向指示符的 chevron 与行尾的对号、半选杠此前读家族按档下发到行的 `--xh-icon-size`（md 20px），落在早已按 `--xh-control-indicator-size`（comfortable 16px / compact 14px）取尺的盒里比盒还大，把手盒也被字形撑到 20px；`branch-trigger`、`branch-indicator`、`item-indicator` 三个部件在自己身上把 `--xh-icon-size` 改接到盒的尺（`--xh-tree-select-branch-indicator-size` / `--xh-tree-select-item-indicator-size`，缺省 `--xh-control-indicator-size`）——兜底字形与盒同边长，作者塞进这三个盒里的 XhIcon 从此与兜底字形同一把尺。不新增公开槽；触发器上的箭头、清除钮的叉与 `--xh-tree-select-icon-size`（作者放进行里的图标，md 20px）不变。
