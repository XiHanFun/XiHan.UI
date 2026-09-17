---
'@xihan-ui/styles': minor
---

**ImageCropper 把手悬停改中性面，圆形裁切框圆角走语义档。** 把手静息是白面（`--xh-bg-surface`），悬停
由品牌淡底 `--xh-bg-brand-subtle-hover` 改为从同一语义面派生的 `--xh-bg-subtle`（拖动中仍是品牌实心
`--xh-bg-brand`）；`data-shape="round"` 的裁切框 `border-radius` 由字面 50% 改为
`var(--xh-image-cropper-crop-area-radius, var(--xh-shape-circle))`，新增公开槽
`--xh-image-cropper-crop-area-radius`。
