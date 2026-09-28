---
'@xihan-ui/headless': minor
'@xihan-ui/styles': minor
---

Pagination 行里的两个字段对齐字段规则：
- 每页条数控制器（库内 Select）此前取字段缺省宽 16rem，在分页行里过宽；改为按内容定宽，新增 `--xh-pagination-page-size-select-w`（缺省 `max-content`），地板一并放开。
- 跳页框此前是手绘字段：静息 surface 底 + `--xh-border-default`，悬停 `--xh-border-strong`，没有聚焦换边与校验失败态。改接字段家族：连接层投影 `data-xh-field-chrome`、`data-xh-field-size`、`data-variant="outline"` 与 `data-disabled`，静息透明底 + `--xh-border-control`、悬停升控件悬停边、聚焦换聚焦边加环、禁用面都由家族给；越界的页码按原生约束判校验失败，换失败边与失败环。新增 `--xh-pagination-jumper-bg-disabled`、`-jumper-border-focus`、`-jumper-border-invalid` 覆盖槽。
