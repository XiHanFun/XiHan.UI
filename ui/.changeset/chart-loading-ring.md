---
'@xihan-ui/headless': minor
'@xihan-ui/styles': minor
---

图表取数中、还没有可画数据时空态部件里那枚环改接加载环家族配方，不再由 Chart 家族配方另画一份：CartesianChart、PieChart、FunnelChart、RadarChart、GraphChart、HierarchyChart、SankeyChart 的 `empty` 部件在取数时投影 `data-xh-loading-ring` 与 `data-loading`，环的画法、减弱动效与打印下的静止点线环、强制色都由配方给；Chart 家族配方只留环占的那一格（配方源 `loading` 段只剩 `ringSize`）。FunnelChart、RadarChart、GraphChart、HierarchyChart、SankeyChart 的皮肤补上 `family/motion.css` 的引入：此前单独引入这几份皮肤时，空态的转圈与入场淡入没有关键帧可用。
