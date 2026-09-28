---
'@xihan-ui/headless': minor
'@xihan-ui/styles': minor
---

Command 的占位态按设计真源的占位态一节补齐：
- 首次加载时 `loading` 部件在文案前转一枚加载环（连接层投影 `data-xh-loading-ring` 与 `data-loading`，环走加载环家族配方）。
- 在途占位只接管首次加载：清单里已有看得见的命令时列表原样留着、按 `micro` 淡到 `--xh-state-disabled-opacity`（此前是硬切），在途占位让位（此前与列表同屏）；没给清单时库判不出有没有候选，在途即露面，与此前一致。
- 空态与在途占位的上下内距由 `--xh-space-6` 收到与其它集合同档的 `--xh-space-3`，文字与分组标题由 `--xh-fg-subtle` 改为次要文字 `--xh-fg-muted`。
