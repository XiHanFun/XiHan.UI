---
'@xihan-ui/tokens': patch
---

`data-motion="default"` 恢复完整动效。

系统开启减弱动效、而产品设置（视觉环境的 `motion: 'default'`）或某个局部容器选择完整动效时，CSS 此前仍停在减弱档，只有 JS 动画恢复。现在 `tokens.css` 为 `data-motion="default"` 输出一块基线取值，排在减弱块之后，该子树的 CSS 与 JS 动效一致；与 `data-motion="reduce"` 嵌套时最近的一层生效。
