---
'@xihan-ui/styles': patch
---

Steps 自绘的状态字形改按指示符档取尺，不再读只管作者图标的 `--xh-steps-icon-size`（§6.5）：走过的步里皮肤画的兜底对号此前读 root 的 `--xh-icon-size`（sm 16px，不随密度）；序号圆点现在在自己身上把 `--xh-icon-size` 改接到新增公开槽 `--xh-steps-indicator-mark-size`（缺省 `--xh-control-indicator-size`，comfortable 16px / compact 14px），兜底对号继续读它——comfortable 尺寸不变，compact 从 16px 收到 14px；作者塞进圆点里的 XhIcon 从此与兜底对号同一把尺、随密度换档。圆点本身仍走 space / control-h 的尺（md 32px），不随密度。`--xh-steps-icon-size` 仍只管作者放进标题 / 说明里的图标（sm 16px 不变）。
