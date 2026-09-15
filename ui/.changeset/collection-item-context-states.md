---
'@xihan-ui/headless': minor
'@xihan-ui/styles': minor
---

Collection Item 家族配方升级到 version 2：新增 `data-xh-collection-context='overlay' | 'page'` 上下文轴、pressed 与 current 状态。overlay 选中保持透明底 + 行尾对号；page 选中为 `--xh-bg-brand-subtle` 行面 + `--xh-fg-on-brand-subtle` + 前导对号，current 另画起始侧 2px 品牌指示条，selected/current 叠加 hover、按下分别取 `--xh-bg-brand-subtle-hover`、`--xh-bg-brand-subtle-active`；open-path 改为与 hover 同档的 `--xh-bg-subtle`；每类标记附 forced-colors 映射（Highlight / HighlightText / ButtonText）。

Select 条目投影 `data-xh-collection-context='overlay'`。默认外观变化：条目按下面由 `--xh-bg-subtle-active` 改为 `--xh-bg-subtle-hover`（白底阶梯 hover 100 → pressed 200）并由家族统一提供；对号盒随尺寸档 16 / 20 / 24px（Chromium 会把跨两行的对号盒分一半高度给空的说明行，md / lg 条目因此各高 2px / 4px）；公开槽名与三端 API 不变。
