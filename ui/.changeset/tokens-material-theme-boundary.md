---
'@xihan-ui/tokens': patch
---

材质里指向主题语义的别名（`--xh-material-solid-*`、`--xh-material-*-fg` / `-fg-muted` / `-focus-surface`、`--xh-material-soft-border` / `-separator` 等）此前只写在 `:root` 上；自定义属性里的 `var()` 在声明处求值，嵌套的 `[data-theme]` 边界只继承到根主题的冻结值，局部深色区里的材质前景与边框仍是浅色取值。生成器改为把这组别名同时挂在每个主题边界上，引用在该边界自己的主题里解析。
