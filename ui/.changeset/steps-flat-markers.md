---
'@xihan-ui/tokens': minor
'@xihan-ui/styles': major
---

Steps 改为平面状态圆：

- 新增语义令牌 `--xh-marker-size-sm/md/lg`（宽松 24 / 28 / 32px，紧凑 20 / 24 / 28px），序号圆点按它取直径，圆里的序号 16px（sm 14px）
- 三态都无边无影：没走到的中性淡底配次级字色，当前步品牌实心配反白字（去掉顶部高光），走过的步品牌淡底配品牌对号（悬停 20%、按下 28%）；标了语气又没走到的步改为语气实心配反白字
- 标题取区块标题档 `--xh-text-heading-3-size`（sm 取正文字号），当前步取 `--xh-text-heading-3-weight`、正文色，走过的步标题正文色，标了语气的步标题不再染色；说明改为 12px 弱化色
- 连接线由 2px 收为 1px
- 点状形态的点 8px、当前步放大一档到 10px（sm 6 / 8px、lg 10 / 12px），不再画当前步那圈环；每个点按当前步的直径占位，换步不挪版面
- 新增覆盖槽 `--xh-steps-indicator-bg-completed-pressed`、`--xh-steps-title-font-weight-current`
