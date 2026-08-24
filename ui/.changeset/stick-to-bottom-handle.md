---
"@xihan-ui/vue": minor
---

`useStickToBottom` 交出整个句柄，并在节点到位后自动重绑。

原先只返回状态 ref，句柄上的 `scrollToBottom` / `retarget` 被吞掉。丢的不只是便利：
原语在建好那一刻就绑一次，而 setup 阶段模板 ref 还是 null——包装既不重绑、
又不把 `retarget` 交出来，这个 use 在最常见的用法（两个 getter 读模板 ref）下
根本没挂上，状态永远停在初值。

返回值改为 `{ state, scrollToBottom, retarget }`，并 watch 两个 getter，
节点变了就重绑（写法同 `useThread`）。「回到底部」按钮现在直接 `scrollToBottom()` 即可。

**破坏性**：原来的 `const state = useStickToBottom(...)` 要改成 `const { state } = ...`。
