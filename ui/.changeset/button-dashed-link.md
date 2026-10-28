---
'@xihan-ui/core': minor
'@xihan-ui/headless': minor
'@xihan-ui/styles': minor
'@xihan-ui/web-components': minor
---

**新增** Button 多两档形态：`variant="dashed"` 与 outline 同一套底、字与阶梯，描边改虚线，用于「添加一项」一类入口；`variant="link"` 是不铺面、不画边的文字钮，字取 `--xh-fg-brand`（写了 `tone` 取语气前景），悬停与按下换 `--xh-fg-brand-strong` 并加下划线（`text-underline-offset` 取 `--xh-space-1`），禁用取 `--xh-fg-disabled`、不画下划线，盒的高度与内衬照按钮档、与同排按钮对齐。新增类型 `ButtonVariant = ActionVariant | 'dashed' | 'link'`，Button 的 `variant` 改取它；ButtonGroup、Toggle 等其余按钮形触发器仍取 `ActionVariant`。两档的面由 Action Control 配方给（形态矩阵由四档扩到六档）。
