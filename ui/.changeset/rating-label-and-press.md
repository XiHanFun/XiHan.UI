---
'@xihan-ui/styles': minor
---

Rating 按设计真源归位字段标签、星形尺度与按压：标签缺省由 `--xh-fg-muted` / 随档字号改 `--xh-fg-default` / `--xh-text-label-size`（14 / 500），根的 `--xh-rating-gap` 缺省由 `--xh-stack-gap-md` 改贴控件的 `--xh-space-1`，新增 `--xh-rating-label-fg-disabled` 与 `--xh-rating-value-text-fg-disabled`（缺省 `--xh-fg-subtle`）；星形字形改按尺寸档取 `--xh-glyph-size-sm / md / lg`（16 / 20 / 24，此前 18 / 22 / 28）；星按下在 0.97 缩放之外同时换到白底承载的 200 档底（新增 `--xh-rating-item-bg-pressed`，缺省 `--xh-bg-subtle-hover`），高对比档按住画系统高亮环；禁用的整体压暗由 root 移到星带（control），标签与分值改换禁用前景而不再叠 opacity。 皮肤体积基线 6022 → 6675 字节：涨在标签 / 分值禁用前景、星带禁用压暗与按下换底规则及其高对比档补救块。
