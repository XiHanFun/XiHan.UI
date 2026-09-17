---
'@xihan-ui/styles': minor
---

Slider 按设计真源归位字段标签、拇指描边与禁用面：标签缺省由 `--xh-fg-muted` 改 `--xh-fg-default`，根的 `--xh-slider-gap` 缺省由 `--xh-stack-gap-md` 改贴控件的 `--xh-space-1`，新增 `--xh-slider-label-fg-disabled`（缺省 `--xh-fg-subtle`）；拇指是 raised 面，描边缺省由 `--xh-bg-surface` 白边改 `--xh-border-default`（`--xh-slider-thumb-border` 覆盖槽不变）；刻度点是正方盒，圆角由 pill 改 circle；禁用不再整体压暗，改为前景与表面各自降级——新增 `--xh-slider-track-bg-disabled`（`--xh-bg-subtle`）、`--xh-slider-range-bg-disabled`（`--xh-fg-disabled`）、`--xh-slider-thumb-bg-disabled`（`--xh-bg-surface`）、`--xh-slider-thumb-shadow-disabled`（none）、`--xh-slider-tick-bg-disabled`、`--xh-slider-tick-bg-active-disabled`、`--xh-slider-tick-label-fg-disabled`，禁用的轨道与拇指改 `not-allowed` 手型。 皮肤体积基线 7646 → 8757 字节：涨在标签、轨道、区间、拇指、刻度与刻度文案各自的禁用规则。
