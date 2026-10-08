---
'@xihan-ui/tokens': minor
'@xihan-ui/styles': major
---

字段外壳改为淡底填充、聚焦不画环：

- 新增语义令牌 `--xh-bg-field`（淡底兑一半），描边档字段静息铺这层底；悬停底不变、描边升 `--xh-border-strong`
- 聚焦时换成承载面 `--xh-bg-surface` + 聚焦描边，不再画聚焦环；强制色档仍补一圈 Highlight 环
- 校验失败铺一层 4% 失效色淡底，聚焦时让位给聚焦态
- 删除字段家族的 `--xh-field-ring-focus` / `--xh-field-ring-invalid` 桥接槽（配方不再读取）
