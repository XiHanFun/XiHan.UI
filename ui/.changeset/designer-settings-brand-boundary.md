---
'@xihan-ui/designer-shell': patch
---

`createDesignerSettingsHost` 在主题跟随页面时选了主题色，品牌换不动：`data-brand` 要与 `data-theme` 在同一个元素上才换得动品牌。现在根上照抄外层的 `data-theme`（外层没写就是亮色）；根上新写了主题时一并照抄外层的 `data-contrast`，外层这两个属性变了跟着改。`dispose()` 把三个属性都还原成接手前的样子。
