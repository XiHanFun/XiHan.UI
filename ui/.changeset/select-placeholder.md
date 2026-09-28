---
'@xihan-ui/headless': minor
'@xihan-ui/styles': minor
---

Select 的占位态按设计真源的占位态一节补齐：首次加载时 `loading` 部件在文案前转一枚加载环（连接层投影 `data-xh-loading-ring` 与 `data-loading`，环走加载环家族配方，直径取所在尺寸档的图标档），此前只是一行静态文字；已有选项时后台刷新保留上一帧，`list` 按 `micro` 淡到 `--xh-state-disabled-opacity`，数据到了再淡回。
