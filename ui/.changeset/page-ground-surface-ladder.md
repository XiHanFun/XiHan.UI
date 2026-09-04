---
"@xihan-ui/tokens": minor
"@xihan-ui/styles": patch
---

**页面底与控件盒底分家，面的层次重新拉开。**

**新增 `--xh-bg-page`。** 从前页面底与控件盒底共用 `--xh-bg-canvas`：浅色档它与 `--xh-bg-surface`、`--xh-bg-surface-raised` 三支同值，页面、面、抬起的面在一块白上分不出前后。`--xh-bg-page` 只管铺满视口的那一层，浅色档取 `neutral.50`、深色档取 `neutral.950`；`--xh-bg-canvas` 保持原值，全库三十余份皮肤的输入盒底色一处不动。布局根从 `--xh-bg-canvas` 改读 `--xh-bg-page`，它是全库唯一一处页面底的消费点。

**深色档 `--xh-bg-surface-raised` 从 `neutral.800` 改到新增的半档 `neutral.750`。** 它原先与 `--xh-bg-subtle` 同值，抬起的面上那些底色取淡底的部件——通知卡里的动作钮、日志面板上的滚动钮——静态时明度差为 0，只有悬停才浮出来。新档的取值上界由深色档语气前景定：`neutral.750` 之上中性语气的字对这块面掉到 4.5 以下。

`--xh-color-neutral-750` 与 `--xh-bg-page` 都是新增名字，既有令牌名一个没动。
