---
'@xihan-ui/tokens': major
---

**调整** 浅色主题的模态遮罩 `--xh-bg-overlay` 由正文深灰（neutral-900）兑 60% 改为兑 40%：Dialog、Drawer 等模态压暗页面但背后仍认得出是哪一页。深色主题仍是纯黑 60%（深底上 40% 压不出层次）。要回到原来的浓度，在主题里把 `--xh-bg-overlay` 写回 `color-mix(in oklab, var(--xh-color-neutral-900) 60%, transparent)`。
