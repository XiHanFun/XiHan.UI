---
'@xihan-ui/tokens': minor
'@xihan-ui/styles': major
---

RadioGroup segmented 形态改为字段同款轨道与品牌淡底选中段：

- 轨道取最浅一档淡底 + 1px 字段描边、圆角由 surface 收为 control（2px），内衬 2px（加描边段离外沿 3px）
- 选中段由白色抬起滑块改为平面的品牌淡底滑块，无边无影；选中段字取品牌色、medium，悬停升一档、禁用退到 8% 淡底与浅品牌字；写了 `tone` 换语气淡底与语气字
- 新增语义令牌 `--xh-bg-segment-selected` / `-hover` / `-disabled`（浅色 12% / 18% / 8%，深色 20% / 28% / 8%）与 `--xh-fg-segment-selected` / `-disabled`（浅色取 brand 700，压两档选中面都过 4.5:1；深色取 brand 300）
- 未选中段悬停 / 按下改按白底承载阶梯 100 → 200
- 段间新增 1px × 14px 分隔线（长为段高一半减 2px），与选中段、悬停段相邻的收起；新增覆盖槽 `--xh-radio-group-segment-separator`、`--xh-radio-group-segment-font-weight-checked`
- 粗指针下段的命中区外扩加到一格 space-4，紧凑 sm 档也到 44px
