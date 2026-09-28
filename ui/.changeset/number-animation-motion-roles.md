---
'@xihan-ui/headless': major
---

NumberAnimation 的缺省节奏改按数值角色取令牌，与图表里的数字同一口径：不写 `duration` / `easing` 时，首次滚动（挂载、换起点之后的那一轮）按入场档走（`--xh-motion-duration-reveal`、`enter-strong`），换目标按更新档走（`--xh-motion-duration-morph`、`continuous`）；此前缺省是线性 1000ms，同页的 KPI 匀速滚、环形图合计却减速。屏幕外不再空转：首次滚动时根节点不在视口里就停在起点，进了视口再从头滚；换目标时不在视口里直接落到终值。

破坏性：删除导出 `NUMBER_ANIMATION_DURATION` 与 `resolveNumberAnimationDuration`（缺省时长不再是一个常量）。要固定时长照旧写 `duration`。
