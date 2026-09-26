---
'@xihan-ui/headless': minor
---

Tabs 标签带的平移补间从标签带节点读 `--xh-motion-duration-move` 与 `--xh-motion-ease-continuous`（此前写死 motion 的 `durations.normal` 与 `standard` 曲线），与指示条滑动同源；减弱动效按标签带所在的作用域判断，容器上的 `data-motion="reduce"` 同样一步到位。
