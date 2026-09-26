---
'@xihan-ui/tokens': minor
---

新增图表数据色与度量令牌（`--xh-chart-*`，51 支）。分类色板 `--xh-chart-categorical-1…8` 由 `build/emit-chart-palette.mjs` 在基础色板上确定性搜索得出，亮暗两套各自满足：明度带、彩度下限、对承载面 ≥ 3:1，相邻与前 3 色两两正常视觉 ΔE ≥ 15、红色弱 / 绿色弱模拟下 ΔE ≥ 8，任意两色 ΔE ≥ 10，任意 45° 扇区至多 2 个色槽，与 danger 语气每一档 ΔE ≥ 10（red 与发红的 orange 因此不进色板），色槽 1 为品牌色相；yellow 整族不取。颜色按浏览器在 sRGB 显示器上的画法换算（出界通道逐个截断）。色块内文字 `--xh-chart-on-categorical-N` 对色块 ≥ 4.5:1。另有「其他」与淡出两支中性色、有序色阶 `ordinal-1…6`、顺序色阶 `sequential-start / -mid / -end`（暗色下锚点翻转）、发散色阶 `diverging-negative / -center / -positive`（amber ↔ blue 同档两臂，暖臂同样离开告警色）、涨跌 `rise / fall`（缺省绿涨红跌），图表家具 `surface / grid / axis / label / crosshair / band-highlight`（网格与轴线在高对比档随边界加重），以及视口高度、柱厚上限、间隙、线宽、点径、命中尺寸、刻度与淡洗、淡出、重取中不透明度等度量（compact 档收紧刻度标签间距）。
