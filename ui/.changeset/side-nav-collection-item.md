---
"@xihan-ui/headless": minor
"@xihan-ui/styles": minor
---

**SideNav 接入 Collection Item 配方：当前项改品牌淡底 + 2px 指示条，展开路径改中性面，行补按下面。**

- 链接与分支按钮投影 `data-xh-collection-item` / `-size` / `-context='page'`，文字落 `text` 槽、箭头落 `suffix` 槽；分支按钮在原生 `disabled` 之外同报 `aria-disabled`。
- 当前项由「品牌淡底 + 品牌深字」改为 `--xh-bg-brand-subtle` 行面 + `--xh-fg-on-brand-subtle` 前景 + 起始侧 2px `--xh-fg-brand` 指示条，字重保持 medium；current + hover 20%、+ pressed 28%。通往当前项的展开分支由「品牌字色」改为与悬停同档的中性面（`--xh-bg-subtle`），字色与字重不变。悬停 100、按下 200 只换面（此前按下零反馈，也没有过渡）。公开槽名不变，`--xh-side-nav-row-fg-active` / `--xh-side-nav-row-fg-in-path` 缺省值随之改变；新增 `--xh-side-nav-row-bg-pressed` / `--xh-side-nav-row-bg-in-path` / `--xh-side-nav-row-fg` / `--xh-side-nav-link-font-size` / `--xh-side-nav-indicator-color`。选中行与在途行不再随 `tone` 换色。
- 折叠态弹出面板的滚动面补 `overscroll-behavior: contain`（锚定浮层里的滚动面）。
- 根与定位层上 `--xh-icon-size` 缺省由随文字形改为 `--xh-glyph-size-md` 并随 `size` 换档。
