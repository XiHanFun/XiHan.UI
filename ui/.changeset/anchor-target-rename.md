---
'@xihan-ui/headless': major
'@xihan-ui/vue': major
'@xihan-ui/react': major
'@xihan-ui/web-components': major
---

Anchor 的滚动容器 `scrollElement` 改名为 `target`，与 Affix、BackTop 用同一个名字表达同一件事，不保留旧名。三端取值不变：Vue 传元素（`:target="el"`），React 传取值器（`target={() => ref.current}`），Web Components 走 property（`anchor.target = el`）；不给即挂在窗口上。headless 的 `AnchorSchema` refs `getScrollEl` 同步改为 `getTargetEl`。

迁移：把 `scrollElement` / `:scroll-element` / `el.scrollElement` 全部换成 `target` / `:target` / `el.target`。
