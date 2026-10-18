---
"@xihan-ui/headless": minor
"@xihan-ui/vue": minor
"@xihan-ui/react": minor
"@xihan-ui/web-components": minor
---

**新增** menu 的 `anchor`，与 popover 的同名同义：把外部的一颗按钮交给它，菜单就贴着这颗按钮定位、收起时焦点归还给它，不再取触发器。用于由别处的按钮受控打开菜单，比如工具栏里的命令。Vue、React 用 `anchor` prop，Web Components 用 `anchor` property（不是 attribute）。只用于根菜单。

- 展开期间这颗按钮带 `aria-haspopup="menu"`、`aria-expanded="true"` 与指向菜单的 `aria-controls`，收起或换锚点时还原成原先的值；点它算菜单内的交互，开合交给打开它的那条命令；展开中换锚点，菜单跟着挪过去。
- 只给 `collection` 按数据铺设时，写了 `anchor` 就不再铺触发按钮。
- 没有触发器替菜单命名：写了 `anchor` 时 content 不再写指向触发器的 `aria-labelledby`，名字写在 `translations.content` 上。
- 触发器不再是必需部件；既没有 `anchor` 也没有触发器时，展开那一刻报 `overlay.missing-anchor` 诊断。Web Components 展开时只要求有 positioner。
