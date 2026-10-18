---
"@xihan-ui/headless": minor
"@xihan-ui/vue": minor
"@xihan-ui/react": minor
"@xihan-ui/web-components": minor
---

**新增** popover 的 `anchor`：把外部的一颗按钮交给它，浮层就贴着这颗按钮定位、收起时焦点归还给它，不再取触发器。用于由别处的按钮受控打开浮层，比如工具栏里的命令，此时可以不写触发器。Vue、React 用 `anchor` prop，Web Components 用 `anchor` property（不是 attribute）。

- 展开期间这颗按钮带 `aria-haspopup="dialog"`、`aria-expanded="true"` 与指向浮层的 `aria-controls`，收起或换锚点时还原成原先的值。
- 点它算浮层内的交互，不会先被当成层外点击关掉，开合交给打开它的那条命令。
- 展开中换锚点，浮层跟着挪过去。
- 触发器不再是必需部件；既没有 `anchor` 也没有触发器时，展开那一刻报 `overlay.missing-anchor` 诊断。
- 写了 `anchor`（哪怕暂时是 `null`，比如回调 ref 的第一帧）时，浮层落点的视觉环境改从 positioner 所在的位置取，不再找触发器。
