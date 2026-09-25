---
'@xihan-ui/tokens': minor
---

新增 M5 液态材质配方 `--xh-material-liquid-*`：在材质四档共有的九项之外另有 `tint`、`alpha-clear`、`alpha-floor`、`rim-far`、`bezel` 五项。静态形态按主题极性、取可读下限（浅 0.48 / 深 0.61 不透明度，8px 模糊 + 140% 饱和度），标签在任何下层上至少 4.5:1；下层均匀且色调已知时可换通透档（浅 0.24 / 深 0.34）。边界由墨色细线承担，另有朝光源一侧的 1px 亮边与背光一侧的弱亮边，折射带宽 18px。高对比、减少透明、强制色与打印各有原位替代。

修复减少透明在墨色域里失效：墨色域与局部主题边界会在自身重新声明主题取值，`prefers-reduced-transparency` 与 `data-transparency="reduce"` 现在同时命中子树里的 `[data-theme]` 与 `[data-xh-ink]`，实体替代不再在那一层被盖回透明。
