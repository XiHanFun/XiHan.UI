---
"@xihan-ui/core": patch
"@xihan-ui/web-components": patch
---

**Portal 租约搬迁前显式松开放不回去的焦点。** 物理搬迁把焦点元素摘下再插回，落在浮层里的焦点会先丢回 body；归位常发生在浮层已收起之后，藏起来的元素接不住 `focus()`，这份焦点本就放不回去。此前它随节点摘下时静默丢失：摘下时派不派 `blur` / `focusout` 各家不一（Chromium 派，按规范的 focus fixup 与 jsdom 不派），靠 `focusout` 上报「焦点离开浮层」的部件——菜单栏收起后清 roving 锚点、把 Tab 位退回根——在后两者里漏掉这一程，Web Components 的菜单栏按 Tab 收起后仍把 Tab 位留在上一个 trigger 上，与 Vue / React 分叉。

现在租约建立与释放两条路都在搬迁前检查：落在 roots 里、且此刻已不可见（`hidden` / `display: none` / `visibility: hidden`）的焦点显式 `blur()`，`focusout` 在每个运行时都派出一次、`relatedTarget` 为 `null`，与 Chromium 摘下时派的那一枚同型；可见的焦点仍照旧搬迁后放回原元素，不多派事件。
