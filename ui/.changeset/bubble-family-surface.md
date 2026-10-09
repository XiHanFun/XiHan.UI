---
'@xihan-ui/tokens': minor
'@xihan-ui/styles': major
---

气泡族（Popover、Popconfirm、HoverCard）改排版：

- 内衬由四边等宽改为纵 12 横 16（`sm` 纵 8 横 12、`lg` 纵 16 横 20），横向比纵向高一档；新增语义令牌 `--xh-surface-pad-xl`（20px，紧凑 16px）
- 标题字重由 semibold 改为 medium（14px / 500 / 正文色）；说明改为气泡正文，取正文字号 14px、次级色
- 面内行距由 8px 收到 4px；Popconfirm 两颗钮之间仍隔 8px，并与上面的文字隔开 16px（新增使用者槽 `--xh-popconfirm-column-gap`、`--xh-popconfirm-action-mt`；列距没单独写时先回落到 `--xh-popconfirm-gap`，只写 gap 槽仍是行列一起改）
