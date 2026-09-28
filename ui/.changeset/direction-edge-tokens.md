---
'@xihan-ui/tokens': minor
'@xihan-ui/styles': patch
---

新增 `--xh-direction-start` / `--xh-direction-end`：行内起始缘与末尾缘在水平方向上的位置（ltr 为 0% / 100%，rtl 反过来），与 `--xh-direction-sign` 同一个就近的 `dir`。Popover、HoverCard、Popconfirm 的缩放原点按它换算起止两端，不再用 `:dir()`（Chrome 120 / Safari 16.4 起才认，高于浏览器底线）；Spinner 三点档的 RTL 扫向改为按书写方向符号水平翻转；Truncate 的中间省略后一半改用末端对齐露出结尾，不再分书写方向各写一版。
