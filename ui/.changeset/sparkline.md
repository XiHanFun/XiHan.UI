---
"@xihan-ui/core": minor
"@xihan-ui/headless": minor
"@xihan-ui/vue": minor
"@xihan-ui/react": minor
"@xihan-ui/web-components": minor
"@xihan-ui/styles": minor
---

**新增** `sparkline` 组件（迷你图），Vue、React 与 Web Components 三端可用：在文字、表格单元格或指标卡里一眼看到一组数的趋势形状。

- 根是 `<svg role="img">`，可及名写在根上的 `aria-label`，`aria-describedby` 指向自动生成的摘要（点数、范围、末值、首末变化率）；不可聚焦，没有坐标轴、图例与提示框。
- 形态 `variant`：line（缺省）/ area / bar / win-loss；win-loss 只看正负、柱等高，取涨跌色。
- 标记点 `markers`：last（缺省）/ extremes / none；参考带 `band` 画出正常区间；`curve="monotone"` 平滑。
- 缺省中性：线取弱化色、末点取品牌色相的分类色 1；写了 `tone` 整条取语气色。
- 尺寸走组件槽 `--xh-sparkline-width`（缺省 6rem）与 `--xh-sparkline-height`（缺省一行字高）。
- 首次出现描线、柱从基线长出，数据变化时插值；`animated` 可关，减弱动效下只淡入。
- 诊断码新增 `chart.invalid-range`：区间两端不是有限数，或下界大于上界。
