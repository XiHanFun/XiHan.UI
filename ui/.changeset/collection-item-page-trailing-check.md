---
'@xihan-ui/styles': minor
---

Collection Item 家族 page 语境的选中对号从行首移到行尾，与 overlay 语境同列：Listbox 的选中项现在是品牌淡底 + 行尾对号。

对号一律落在行尾（`prefix | text | shortcut | suffix | indicator`），行首一格留给前导图标、展开箭头、拖拽把手与勾选框。配方 `markers.page.glyph` 由 `leading` 改为 `trailing`，生成器按它决定 page 语境是否另排一套行首网格；改回 `leading` 仍能生成旧的排法，但当前没有语境使用。

行面、字色与悬停 / 按下阶梯不变，只动对号的位置。
