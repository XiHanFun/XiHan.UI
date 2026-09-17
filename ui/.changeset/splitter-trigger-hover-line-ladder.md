---
'@xihan-ui/styles': minor
---

**Splitter 分隔条悬停改按线取描边梯度。** `resize-trigger` 是一根线不是一块面，悬停不再落面阶梯的 300 档：
`--xh-splitter-trigger-bg-hover` 的缺省由 `--xh-bg-subtle-active` 改为 `--xh-border-control`（与静息
`--xh-border-default` 同向加深一档，和字段描边 rest → hover 同一梯度）；拖动中 `--xh-bg-brand`、禁用
`--xh-border-subtle` 不变。使用者槽仍优先于缺省。
