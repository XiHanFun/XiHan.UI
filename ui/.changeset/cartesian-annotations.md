---
"@xihan-ui/core": minor
"@xihan-ui/headless": minor
"@xihan-ui/vue": minor
"@xihan-ui/react": minor
"@xihan-ui/web-components": minor
"@xihan-ui/styles": minor
---

`cartesian-chart` 新增注释 `annotations`：画在数据之外、帮读者读数的参照。

- `line` 参考线、`band` 参考带：`axis` 取 `x`（自变量轴）或 `y`（数值轴），与屏幕方向无关；值计入所在轴的定义域，数据之外的目标值也看得到。参考带垫在数据之下，参考线是结构色的虚线。
- `point` 标出某个系列的最大、最小、最后一个或指定 x 上的数据（一圈环加值）；`average` 是系列均值处的平均线；`trend` 是最小二乘直线（虚线）或尾随窗口的移动平均（点线，`window` 缺省 3）。它们取所属系列的颜色，随系列淡出与隐藏。
- 标签缺省写值，与数据标签一起按重要性落位且注释优先；贴着绘图区边缘时翻到线或点的另一侧。
- 新部件 `annotation`、`annotation-label`，带 `data-kind`（趋势线另带 `data-method`），都 `aria-hidden`；摘要末尾写出参考线、参考带与平均线，新增文案 `referenceLabel`、`averageLabel` 与模板 `annotationSummary`（缺省导出 `defaultCartesianAnnotationSummary`）。
- 诊断码新增 `chart.annotation-target`：注释指向不存在的系列、不在轴上的类目时按提醒报出，只少画这一条。
