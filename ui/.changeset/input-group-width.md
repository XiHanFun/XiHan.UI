---
'@xihan-ui/styles': minor
---

InputGroup 不传尺寸时整组与单个字段同宽（新增覆盖槽 `--xh-input-group-w`，回退 `--xh-control-w`），组里带字段外壳的控件占满前后缀与动作之外的剩余宽度；此前整组宽 = 字段缺省宽再加前后缀，比同一列的字段宽一截。
