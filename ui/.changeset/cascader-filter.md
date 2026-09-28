---
'@xihan-ui/headless': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
'@xihan-ui/web-components': minor
---

Cascader 新增 `filter`，接管搜索的匹配规则：候选是一条可落值的完整路径（`path` 与逐段的 `labels`），检索词已 trim，空串不调用；缺省仍是整条路径的显示名连缀后大小写不敏感包含。新增类型 `CascaderFilter`，`cascaderFilterCandidates` 多收一个可选的 `filter` 参数。Web Components 经 `filter` property 设置。
