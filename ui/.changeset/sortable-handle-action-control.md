---
'@xihan-ui/headless': minor
'@xihan-ui/styles': minor
---

Sortable 把手接入 Action Control 家族并按设计真源归位拖起海拔：`item-drag-trigger` 投影 `data-xh-action-control` / `profile=icon` / `variant=ghost` / `display=always` / `size=xs`（24px 正方盒，与此前尺寸相同），盒、悬停 / 按下与 0.97 按压、粗指针热区、焦点环、禁用面由家族配方给，悬停由 `--xh-bg-subtle-hover` 改白底承载的 `--xh-bg-subtle`（100），新增按下面 `--xh-sortable-drag-bg-active`（缺省 `--xh-bg-subtle-hover`，200）与 `--xh-sortable-drag-icon-size`；既有 `--xh-sortable-drag-*` 覆盖槽保留，手型仍为 grab / grabbing；拖起的条目 `--xh-sortable-item-shadow-dragging` 缺省由 `--xh-elevation-raised` 改 `--xh-elevation-lifted`。 皮肤体积基线 3666 → 4255 字节：涨在把手映射到 Action Control 桥接槽的一组声明与拖动中的手型槽。
