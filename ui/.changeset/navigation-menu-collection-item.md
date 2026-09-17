---
"@xihan-ui/headless": minor
"@xihan-ui/styles": minor
---

**NavigationMenu 接入 Collection Item 配方：面板链接由家族给悬停 / 按下面，当前页改 strong 档品牌字色，展开着的入口改中性面并只换面不缩放。**

- 面板里的链接投影 `data-xh-collection-item` / `-size` / `-context='overlay'`（面板是锚定浮层），悬停 100（`--xh-bg-subtle`）与按下 200（`--xh-bg-subtle-hover`）由家族按 `:hover` / `:focus-visible` / `:active` 给出，此前按下零反馈也没有过渡；新增 `--xh-navigation-menu-link-bg-pressed`。链接不报 `aria-selected`，浮层选中面永不命中。
- 当前页链接的字色缺省由 `--xh-fg-brand` 改为 `--xh-fg-brand-strong`，字重保持 medium，不再随 `tone` 换色；`--xh-navigation-menu-link-fg-current` 槽名不变。
- 展开着的入口由「品牌淡底」改为与悬停同档的中性面（`--xh-bg-subtle`），不再随 `tone` 换色；按下由缩放改为只换面到 200，新增 `--xh-navigation-menu-trigger-bg-pressed`；私有槽 `--xh-_navigation-menu-active-bg` / `--xh-_navigation-menu-current-fg` 删除。
- 根上 `--xh-icon-size` 缺省由随文字形改为 `--xh-glyph-size-md` 并随 `size` 换档。
