---
'@xihan-ui/styles': patch
---

ButtonGroup 现在把组内按压反馈限制在颜色与光照上，不再缩放单个 Button 段。相邻段仍按一像素共边
连接，横排、竖排和 RTL 下按住中段时都不会从两侧裂开；组外 Button 保留原有缩放反馈，焦点段的
层级与 disabled/loading 守卫不变。

outline 组只给没有 `data-variant` 的 Button 段补组描边。子段显式声明 `solid`、`subtle`、`outline`
或 `ghost` 时由自身形态决定边界，Vue/React 的直接子节点结构与 Web Components 的一层行为宿主
结构采用相同规则。组件说明同步补回可选 `separator`，不再误称 ButtonGroup 只有 root 一个部件。
