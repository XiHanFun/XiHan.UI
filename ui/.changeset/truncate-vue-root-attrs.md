---
'@xihan-ui/vue': patch
---

`XhTruncate` 上作者写的属性改为与连接层逐条合并：`style` 与行数 `--xh-_truncate-lines` 并存，`class` 与监听器一并合上，同名的其余属性以作者的为准，与 React 一致。此前组件把连接层的属性平铺在作者的之后，作者写的 `style`（如 `max-inline-size: 20rem`）整个被盖掉。
