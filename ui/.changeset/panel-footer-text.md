---
'@xihan-ui/styles': patch
---

**修复** 列表型候选面板的底栏统一取说明档 13px 与所在面的次要字色：Cascader 的底栏此前随尺寸档取控件字号（md 14px），与条目一样大；Command 的底栏此前取 12px，比别家小一档。Select 与 TreeSelect 本就如此。`--xh-cascader-footer-font-size`、`--xh-command-footer-font-size` 照旧可改。
