---
'@xihan-ui/styles': major
---

Collection Item 配方 `page` 语境的当前项（SideNav 当前页）不再在起始侧画 2px 品牌指示条，只由 `--xh-bg-brand-subtle` 行面与 `--xh-fg-on-brand-subtle` 字色表达；配方新增 `markers.page.current` 开关（`none` / `bar`），生成器按它决定是否产出那条 `::before`。
