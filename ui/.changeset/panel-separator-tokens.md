---
'@xihan-ui/styles': patch
---

**调整** 面内分隔线改取分隔令牌，不再取描边档：Command 的搜索框下划线与底栏上沿取 `--xh-material-elevated-separator`，Cascader 的搜索框下划线与底栏上沿取 `--xh-material-solid-separator`，List 开了 `split` 时条目之间的分隔线取 `--xh-border-subtle`。与对话框、抽屉、树选择、穿梭框、侧边导航的同类分隔线同一档，线比原先浅一档；`--xh-command-input-border`、`--xh-command-footer-border`、`--xh-cascader-search-divider`、`--xh-cascader-footer-border`、`--xh-list-divider` 照旧可覆盖。
