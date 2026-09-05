---
"@xihan-ui/styles": minor
---

**新增** `--xh-field-label-gap-block`：竖排字段里标签与控件之间那一段距离的覆盖槽。

从前竖排下这段距离没有自己的槽。字段根是一列 flex，标签→控件、控件→说明、说明→错误文案三段共用 `--xh-field-gap`，要把标签那一段单独放宽就只能连着另外两段一起改。已有的 `--xh-field-label-gap` 只在标签左置那一档当列间距用，竖排下它一寸也不管。

新槽落在标签的 `margin-block-end` 上，按差值补在容器 gap 之上：**不设它时差值算成 0，各段距离逐值不变**（实测 4px → 4px）；设成 `16px` 则标签→控件量到 16px，控件→说明仍是 4px。表单的 `vertical` 与 `inline` 两档字段根都是竖排，同一支槽一起管；`horizontal` 那一档标签与控件是左右两列，这段补白在那儿清零，列间距照旧归 `--xh-field-label-gap`。

`--xh-field-gap` 与 `--xh-field-label-gap` 两个槽名与取值都没动。
