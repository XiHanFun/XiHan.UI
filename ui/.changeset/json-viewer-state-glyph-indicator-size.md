---
'@xihan-ui/styles': patch
---

JsonViewer 自绘的状态字形改按指示符档取尺，不再读只管作者图标的 `--xh-json-viewer-icon-size`（§6.5）：分支行首展开箭头把手 `branch-trigger` 在自己身上把 `--xh-icon-size` 改接到盒的尺 `--xh-json-viewer-indicator-size`（缺省 `--xh-control-indicator-size`，comfortable 16px / compact 14px），盒里的 `branch-indicator` 兜底 chevron 从此与把手盒同边长——此前它读 root 按档下发的 `--xh-icon-size`（md 20px），20 的箭头装在 16 的把手里两侧各溢出 2px、compact 下盒收到 14 时它仍是 20。公开槽不新增，`--xh-json-viewer-indicator-size` 只是多管一处；`--xh-json-viewer-icon-size` 仍只管作者放进空态格里的图标（md 20px 不变）。
