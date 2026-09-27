---
"@xihan-ui/core": minor
"@xihan-ui/headless": minor
"@xihan-ui/vue": minor
"@xihan-ui/react": minor
"@xihan-ui/web-components": minor
"@xihan-ui/styles": minor
---

新增 `radar-chart` 雷达图：比较少数几个实体在多个指标上的画像。

- 每行数据一个实体（`nameField` 取实体名），`indicators` 列出 3–10 个指标，自 12 点方向顺时针排开；量程缺省每个指标自己的（`scale: 'independent'`，下限 0、上限取整），`shared` 全部指标共用，指标上可写 `min` / `max` 固定量程。量程按全部实体算，图例隐藏一个实体时其余形状不变。
- 网格 `shape` 取 `polygon` / `circle`；轮廓 `curve` 取 `linear` / `catmull-rom`；`area` 控制系列色淡洗。缺失的值落在圆心、不画顶点。
- 悬停按角度落到最近的指标轴并加粗成准线，提示框列出全部实体在这个指标上的值；键盘左右键沿顺时针走指标、上下键换实体。每个实体是 `graphics-object` 分组，每个顶点是带可及名的 `graphics-symbol`；摘要写每个实体最高与最低的指标，数据表每个实体一行、每个指标一列。
- 入场从圆心张开，数据变化与图例切换在形状之间插值；强制色、打印与纹理模式下淡洗换纹理、轮廓换线型。
- 新诊断码 `chart.indicator-count`（给了指标但个数不在 3–10 之间；还没给指标时按空态处理，自定义元素在脚本赋值之前连上也不误报）与 `chart.radar-overlap`（多于 3 个实体时按提醒报）。
