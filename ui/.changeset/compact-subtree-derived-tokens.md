---
'@xihan-ui/tokens': patch
---

紧凑密度写在局部容器上（`<div data-density="compact">`）时，引用了收紧尺寸的派生令牌也跟着收紧：`--xh-overlay-calendar-column-h`、`--xh-overlay-column-item-h`、`--xh-section-py` 与 `--xh-control-indicator-size` 在 compact 边界上重新声明，按子树自己的控件高与留白解析，不再继承文档根上按宽松档算好的值。带时刻的日期选择器挂在局部 compact 子树里时，时间列底边不再比日历网格低 28px。只有引用链落到 compact 覆盖项的令牌会在 compact 边界上重新声明，祖先容器上对其余令牌的覆盖照常继承。
