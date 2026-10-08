---
'@xihan-ui/tokens': minor
'@xihan-ui/styles': major
---

Card 改为头部条 + 正文的版式：

- 根不再留内衬与段间距（`--xh-card-gap` 缺省改为 0，`--xh-card-p` 改为各部件四边同值的内衬），直接放进根的媒体贴边铺满
- 根下的 header 是一条头部条：一行标题时最小高 46px（紧凑密度 40px），横向内距 16px，底边一道 1px `--xh-border-subtle` 内部分隔线；标题取区块标题档 `--xh-text-heading-3-size` / `-weight`、正文色
- content 四边内距 16px（紧凑密度纵向 12px）、14px 次级色；根下的 footer 与正文同起点、底边留同档内距
- 新增语义令牌 `--xh-surface-header-h`（46px，紧凑 40px），新增覆盖槽 `--xh-card-header-h`、`--xh-card-header-py`、`--xh-card-header-border`、`--xh-card-content-fg`、`--xh-card-content-font-size`
- 皮肤体积因头部条与各部件内衬增长约 12%，已重落 card.css 的体积基线
