---
"@xihan-ui/styles": minor
---

**Popover 改用 M2 Frosted Surface，成为磨砂材质的首个锚定浮层使用者。**

内容面统一消费 M2 的 tint、边界、顶部高光、两段 floating 投影、不透明正文和 `blur(16px) saturate(108%)` backdrop。滤镜只落在实际打开的 Popover 内容面，不写到 positioner、页面根或内容子树，也不参与进退场动画和 `will-change`；动画仍只有 opacity、短位移与既有轻微 scale。

箭头与内容面读取同一背景和边界。箭头不单独重复 backdrop blur，避免接缝处双重采样。关闭按钮聚焦时会实际铺上 M2 的不透明 `focus-surface`，品牌焦点环先与这块稳定隔离底比较，而不是只声明一支无人消费的令牌。

新增 `--xh-popover-backdrop`、`--xh-popover-close-bg-focus` 与 `--xh-popover-close-fg-focus` 覆写口。减少透明、高对比、forced-colors 和打印均由同名 M2 令牌原位替换；Popover 不建立辅助模式专用结构。
