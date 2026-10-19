---
'@xihan-ui/designer-kit': minor
---

长度单位新增 `LENGTH_UNIT_SYMBOLS`（每种单位的符号）、`formatLength(value, { fractionDigits?, locale? })`（按 locale 写小数点、不分组、负零写成 0）与 `stepLength(value, delta, { min?, max?, fractionDigits? })`（步进后按小数位取整再夹在上下限里，避开浮点尾差），供尺寸徽标、标尺这类显示与微调长度的地方使用。
