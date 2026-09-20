---
"@xihan-ui/headless": patch
"@xihan-ui/vue": patch
"@xihan-ui/react": patch
"@xihan-ui/web-components": patch
---

**Menubar：浮层里的条目失焦到菜单栏外，三端一并收起。** `MENUBAR.BLUR` 的意思一直是「焦点离开整条菜单栏（含浮层里的菜单）即收起」，但上报只挂在根的 `focusout` 上：浮层被搬去了 portal 落点，条目的 `focusout` 走 DOM 树到不了根——Vue 与 Web Components 在 Alt+Tab、程序化 `blur()` 或进 iframe 时菜单留在原地，React 却因合成事件沿组件树穿过 Portal 而收起，三端行为不一致。

现在 `content` 自己也接 `focusout`：离开的节点在它子树里、落点（`relatedTarget`）既不在根、不在任何一张浮层、也不在子菜单里，就发 `MENUBAR.BLUR`；`relatedTarget` 为 `null` 按 DOM 语义一律算离场。一次离场只由一个部件上报——根只认自己子树里、且不在任何浮层里的节点——所以 React 合成事件把同一次 `focusout` 送到根时不会再报一回，受控宿主只收到一条 `value-change`。子菜单里的条目失焦仍归子层的 Menu 机器，本次不动。
