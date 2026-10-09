---
'@xihan-ui/styles': major
---

InputGroup 组壳改为与字段外壳同形：

- 静息铺字段淡底 `--xh-bg-field` + `--xh-border-control`；悬停底不变、描边升 `--xh-border-strong`
- 聚焦换承载面 `--xh-bg-surface` + `--xh-border-control-focus`，不再画聚焦环；强制色档补一圈 Highlight 环；悬停与聚焦同时成立时聚焦面优先
- 组里的字段校验失败时铺 4% 失效色淡底；只读换淡底；禁用换淡底 + `--xh-border-default`
- 删除覆盖槽 `--xh-input-group-ring-focus` / `--xh-input-group-ring-invalid`；新增 `--xh-input-group-bg-focus`、`-bg-invalid`、`-bg-read-only`、`-bg-disabled`、`-border-disabled`
- 皮肤体积基线随新增的状态规则上调
