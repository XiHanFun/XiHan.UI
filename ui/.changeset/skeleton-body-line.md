---
'@xihan-ui/tokens': minor
'@xihan-ui/styles': major
---

Skeleton 文本条改为一行正文的方条：

- 新增语义令牌 `--xh-text-body-line-h`（正文字号 × 正文行高，21px）：一行正文的行框高；Sparkline 的缺省高改读它（取值不变）
- 文本条高由说明字号 12px 改为 `--xh-text-body-line-h`，圆角由胶囊改为 `--xh-shape-inset`（2px），条间距 12px → 16px
- 扫光 `--xh-skeleton-sheen` 缺省改为 `--xh-bg-subtle`：浅色下是一道比条底深的暗带，深色下仍是亮带
