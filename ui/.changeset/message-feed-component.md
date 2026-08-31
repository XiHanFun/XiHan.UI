---
"@xihan-ui/headless": minor
"@xihan-ui/vue": minor
"@xihan-ui/web-components": minor
"@xihan-ui/styles": minor
---

**新增** `message-feed` 组件：一段会话的消息序列，Vue 与 Web Components 两侧同时可用。

它把「粘底跟随」和「消息集合语义」合成一件。粘底那一半是内容增高时自动到底、用户上滚即解除、滚回底部阈值内自动恢复，并在往上插入历史消息时补偿滚动位置；集合那一半是 `role=feed` 配 `role=article`，带 `aria-posinset` 与 `aria-setsize`。

**总数由 `count` 声明，不从 DOM 数**：分页加载或截断历史时，DOM 里的条数不等于会话长度；不给 `count` 就报 `-1`，那是 ARIA 规定的「总数未知」。

**整份消息列表只占一个 Tab 停靠位。** `PageDown` / `PageUp` 在消息之间走，`Ctrl+End` / `Ctrl+Home` 一步走到消息流之外（会话界面里前者通常就是输入框），方向键一概不接管、留给浏览器滚动。这是对 APG Feed 示例的一处刻意偏离：示例给每个 article 都写 `tabindex="0"`，两百条消息就是两百个 Tab 停靠位。

「回到底部」只看在不在底、不看粘附意图——粘着但内容还没追上时按钮不该冒出来。

播报走一个独立的原子活区：一份会话只该有一个，每条消息各开一个会互相打断。消息流本身**不发 `aria-busy`**，它会压住同一棵子树内播报区的播报。

消息内容全部由作者写：气泡、头像、时间、动作条都不是本组件的部件，按条目上的 `data-role` 出样式即可。
