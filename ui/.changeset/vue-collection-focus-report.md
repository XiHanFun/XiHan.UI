---
"@xihan-ui/vue": patch
---

**修 `message-feed` 与 `menubar` 的离场焦点上报从来不发。**

持有焦点的条目被移出 DOM 时浏览器不派 `focusout`，焦点无声地掉到 body 上，而机器那一侧仍记着一个已经不存在的锚点。`message-feed` 的容器按「`focusedId == null` 才兜底进 Tab 序列」判自己的 tabindex，于是那个 Tab 位没人认领，**整份消息流键盘再进不来**；`menubar` 的触发器同理。

同仓的 `tree` / `table` / `transfer` / `select` 早就有这条上报，这两个是漏的。现在照它们的形状补齐：`watch` 到身份变更时若本节点正持有焦点就重报锚点，`onBeforeUnmount` 时若本节点正持有焦点就发离场事件。

这是铺 React 适配器时对照出来的——React 侧补上之后回头看 Vue，才发现这两个一直缺。
