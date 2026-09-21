---
'@xihan-ui/styles': patch
---

Tree 自绘的状态字形改按指示符档取尺，不再读只管作者图标的 `--xh-tree-icon-size`（§6.5）：展开箭头把手 / 方向指示符的盒、叶子的对号盒与没摆 `item-indicator` 的叶子由行盒补出的首格占位共用的 `--xh-tree-indicator-size` 缺省从家族按档下发的 `--xh-icon-size`（md 20px）改为 `--xh-control-indicator-size`（comfortable 16px / compact 14px；此前 20px 的 chevron 与对号比同一行里 16px 的勾选把手大一圈，compact 下勾选把手收到 14px 时它们仍是 20px）；`branch-trigger`、`branch-indicator`、`item-indicator` 三个部件在自己身上把 `--xh-icon-size` 改接到盒的尺——兜底 chevron 与对号与盒同边长，作者塞进这三个盒里的 XhIcon 从此与兜底字形同一把尺。勾选把手里的勾与半选杠仍按方盒 × 0.75（12px / 10.5px）、`node-drag-trigger` 不变；`--xh-tree-icon-size` 仍只管作者放进行里的图标（md 20px 不变）。
