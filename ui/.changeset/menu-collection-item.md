---
"@xihan-ui/headless": minor
"@xihan-ui/styles": minor
"@xihan-ui/vue": minor
"@xihan-ui/react": minor
"@xihan-ui/web-components": minor
---

**Menu 接入 Collection Item 配方：条目按下面由 300 改 200，展开着的触发器改中性面，浮层条子走 4px 档并补 overscroll 隔离。**

- 条目与子菜单触发项投影 `data-xh-collection-item` / `-size` / `-context='overlay'`，`item-text` 落 `text` 槽、`item-indicator` 落 `prefix` 槽（常显前导图标，不是选中对号）、`item-description` 落 `description` 槽，分隔线投影 `data-xh-collection-separator`；子层开着时子菜单触发项同报 `data-in-path`，打开路径的面由家族按它给。
- 悬停 / 键盘锚点 100（`--xh-bg-subtle`）、按下 200（`--xh-bg-subtle-hover`，此前是 `--xh-bg-subtle-active` 300）、打开路径与 hover 同档、禁用面都由家族给，皮肤只映射公开槽；`--xh-menu-item-bg-pressed` 缺省随之改变。
- 展开着的触发器由「品牌淡底、随 tone 换色」改为与家族 hover 同档的 `--xh-bg-subtle`；`--xh-menu-trigger-bg-active` 槽名不变，私有槽 `--xh-_menu-active-bg` 删除。
- 标记位盒尺改随家族按档下发的 `--xh-icon-size`（md 20px）；content 上 `--xh-icon-size` 缺省由随文字形改为 `--xh-glyph-size-md` 并随 `size` 换档。
- content 补 `overscroll-behavior: contain`；三端自绘条改传 `size: 'sm'`（浮层里的条子走 4px 档）。
