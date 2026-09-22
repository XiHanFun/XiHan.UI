---
'@xihan-ui/web-components': patch
---

Web Components 的元素不再为每一次 `prop()` 重走一遍祖先链找 `<xh-config>`。`MachineController` 把配置解析包在 props 取值器里，而状态机每读一个 prop 都会经过那里：解析一次要从元素逐层往上判「这一层是不是配置作用域」，页面嵌得深一点，这条链比取值器本身还贵。

解析结果改为按配置代号缓存。代号在既有的 `notifyXhConfigChange()` 里自增——全局那份改了、任一 `<xh-config>` 改了或进出文档都会走到它，也就是配置内容与作用域位置变化的完整信号；元素自己搬家不改代号，那条路径由 `hostConnected` 作废缓存接住（断开再接上必然经过它）。语义没有任何放宽：切语言、局部覆盖、把元素搬进另一棵 `<xh-config>` 子树，读到的都还是当下那一份。

实测 Chromium，祖先链 15 层：单次 `prop()` 从 0.99µs 降到 0.10µs（`xh-button`）、0.96µs 降到 0.035µs（`xh-pagination`）；挂载 100 个 `xh-pagination` 从 111.7–115.3ms 降到 23.8–24.8ms，挂载 200 个 `xh-button` 从 8.9–9.6ms 降到 8.1–8.5ms。
