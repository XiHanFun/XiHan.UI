---
'@xihan-ui/styles': patch
---

SideNav 自绘的状态字形改按指示符档取尺，不再读只管作者图标的 `--xh-side-nav-icon-size`（§6.5）：分支行尾展开方向指示符的 chevron 此前读家族按档下发到行的 `--xh-icon-size`（md 20px），指示符盒又没有自己的尺、被字形撑到 20×20，比同一栏里 16px 的指示符档大一圈，compact 下指示符档收到 14 时它仍是 20；`branch-indicator` 改为定尺盒并在自己身上把 `--xh-icon-size` 改接到新增公开槽 `--xh-side-nav-branch-indicator-size`（缺省 `--xh-control-indicator-size`，comfortable 16px / compact 14px，与 Tree / TreeSelect 的 branch-indicator 同款定尺盒）——兜底 chevron 与盒同边长，盒自己定尺、转 90° 时不再因随字形撑开而抖，作者塞进盒里的 XhIcon 从此与兜底字形同一把尺。`--xh-side-nav-icon-size` 仍只管作者放进行里的图标（随 size 档 sm / md / lg，缺省 md 20px 不变）。
