---
'@xihan-ui/styles': patch
---

**修复** 集合行里的说明（第 2 行）与快捷键随尺寸档取字号，比同档主文字低一级：sm / md / lg 取 12 / 13 / 14px。此前一律钉在 13px，sm 行的说明与正文一样大、lg 行又差得太远。由 Collection Item 配方按条目的尺寸档给，Menu、ContextMenu、Menubar 与 GridList 的说明一并跟上；`--xh-<c>-item-description-font-size` 等槽照旧可改。
