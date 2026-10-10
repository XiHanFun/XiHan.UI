---
'@xihan-ui/tokens': major
'@xihan-ui/styles': major
---

浮层圆角 `--xh-shape-overlay` 改为引用承载面圆角 `--xh-shape-surface`（缺省仍是 4px）：只改承载面圆角时，下拉、弹出面、对话框、通知卡片与抽屉跟着一起变，不再出现卡片已经调圆、浮层还钉在 4px 的情况。仍要两者分开的，单独覆写 `--xh-shape-overlay`。

抽屉朝向页面的两个角缺省取浮层圆角，与别的浮层同一把尺；贴住视口的两个角仍不取圆角。要恢复直角的，写 `--xh-drawer-radius: 0`。
