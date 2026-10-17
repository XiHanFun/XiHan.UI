---
'@xihan-ui/expression': minor
---

新增类型 `ValueFormatter`：签名与 `formatValue` 相同（`(value, spec, options) => string`）。设计器把格式化作为注入项时用它声明，宿主直接传 `formatValue`，各设计器不再各自定义一份。
