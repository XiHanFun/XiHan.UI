---
'@xihan-ui/headless': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
'@xihan-ui/web-components': minor
'@xihan-ui/styles': patch
---

**调整** 菜单栏（Menubar）的下拉与它的子菜单只按落定那一侧的可用高度封顶（留出与视口边缘的间距），和桌面应用的菜单栏一样：可用高度够时整张菜单一次铺开、不出滚动条，不再叠 20rem 的固定上限；要收矮写 `--xh-menubar-max-h`。Menu 与 ContextMenu 照旧以 20rem 一档封顶，`--xh-menu-max-h`、`--xh-context-menu-max-h` 可改。

- **新增** Menu 的 `fitAvailableHeight`（Web Components 为 `fit-available-height`）：内容只按可用高度封顶，content 带 `data-fit-available-height`。菜单栏的子菜单由菜单栏自动带上；`XhMenuSub` 与嵌套的 `<xh-menu submenu>` 没写时跟着上一层。

三家菜单的固定上限都改经私有槽 `--xh-_<组件>-max-h` 承接（菜单与右键菜单取 20rem 一档，菜单栏取可用高度），公开槽不变。`menu.css` 比上一版基线涨 11%（对号排到行尾时普通条目的留位规则，与这一条的上限），皮肤体积基线随之重落。
