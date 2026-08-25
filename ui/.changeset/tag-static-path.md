---
"@xihan-ui/headless": minor
"@xihan-ui/vue": patch
---

不可关闭的标签不再建状态机，挂载开销减半。

标签的事件只有 OPEN / CLOSE 两个，都从关闭钮或 `setOpen` 来。不给关闭钮时这两条路
都走不到，状态恒等于 `open ?? defaultOpen ?? true`——一台机器在这里纯属开销，
而表格一页几十行、每行几个状态药丸就是几百台。

量过：400 枚标签从 39.1ms 降到 18.3ms，每枚 0.095ms → 0.043ms。

连接层主体抽成一份，`connectTag`（机器路）与新增的 `connectStaticTag`（快路）
各调它一次，语义不会漂。受控/非受控两态与机器路逐条一致，包括「受控期间的
`setOpen` 不许偷偷落进内部值」——那一条只有在宿主把 `open` 撤回 `undefined`
转非受控的那一刻才看得出来。
