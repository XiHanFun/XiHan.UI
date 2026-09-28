---
'@xihan-ui/headless': minor
'@xihan-ui/styles': minor
---

Transfer 的占位态按设计真源的占位态一节补齐：
- 首次加载时 `loading` 部件在文案前转一枚加载环（连接层投影 `data-xh-loading-ring` 与 `data-loading`，环走加载环家族配方）。
- 在途占位只接管这一侧的首次加载：这一侧已有看得见的条目时列表原样留着、按 `micro` 淡到 `--xh-state-disabled-opacity`，在途占位让位（此前不看有没有条目，一律与列表同屏）。
- 空态、加载与分组标题的文字由 `--xh-fg-subtle` 改为次要文字 `--xh-fg-muted`。皮肤补上 `family/motion.css` 的引入，单独引入时加载环照样转。
