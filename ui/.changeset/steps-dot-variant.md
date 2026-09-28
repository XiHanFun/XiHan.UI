---
'@xihan-ui/headless': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
'@xihan-ui/web-components': minor
'@xihan-ui/styles': minor
---

Steps 新增标记形态轴 `variant`：`number`（缺省，盛内容的序号圆点）与 `dot`（不盛内容的小圆点，只标位置，适合步数多或横向空间紧的流程）。点状形态的圆点是纯位置标记，直径走空间尺 sm / md / lg = 8 / 10 / 12px，不随密度换档；三态由形状区分：没走到的空心粗圈、走过的实心标记色、当前步实心品牌外加一圈同色环，四周留出环的位置、换步不挪版面，竖排连接线仍落在圆点中轴上。root 与 indicator 投影 `data-variant`，新增类型 `StepsVariant` 与覆盖槽 `--xh-steps-indicator-ring-bg` / `-ring-bg-disabled`；强制色下实心点与环改取系统色，打印时照原色印出。点状形态的 indicator 留空，走过的步不再画兜底对号。
