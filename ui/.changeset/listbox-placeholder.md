---
'@xihan-ui/headless': minor
'@xihan-ui/styles': minor
---

Listbox 的占位态按设计真源的占位态一节补齐：首次加载时 `loading` 部件在文案前转一枚加载环（连接层投影 `data-xh-loading-ring` 与 `data-loading`，环走加载环家族配方），此前只是一行静态文字；已有选项时后台刷新保留上一帧，条目与分组标题按 `micro` 淡到 `--xh-state-disabled-opacity`。空态、加载与分组标题的文字由 `--xh-fg-subtle` 改为次要文字 `--xh-fg-muted`，与浮层里的同类占位同档。皮肤补上 `family/motion.css` 的引入，单独引入时加载环照样转。
