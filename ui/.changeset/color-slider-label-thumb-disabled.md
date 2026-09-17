---
'@xihan-ui/styles': minor
'@xihan-ui/headless': patch
---

ColorSlider 按设计真源归位字段标签、拇指描边与禁用面：标签缺省由 `--xh-fg-muted` 改 `--xh-fg-default`，根的 `--xh-color-slider-gap` 缺省由 `--xh-stack-gap-md` 改贴控件的 `--xh-space-1`，新增 `--xh-color-slider-label-fg-disabled`（缺省 `--xh-fg-subtle`）；拇指是 raised 面，描边缺省由 `--xh-bg-surface` 白边改 `--xh-border-default`（`--xh-color-slider-thumb-border` 覆盖槽不变）；禁用不再整体压暗，改为标签换禁用前景、颜色带与拇指在 control 上压暗一次、拇指收掉抬升（新增 `--xh-color-slider-thumb-shadow-disabled`，缺省 none），禁用的轨道与拇指改 `not-allowed` 手型；组件文档的禁用描述随之更新。
