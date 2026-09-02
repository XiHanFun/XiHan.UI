---
"@xihan-ui/headless": major
"@xihan-ui/vue": major
"@xihan-ui/web-components": major
"@xihan-ui/styles": major
---

**新增** `log` 的 `scroll-button` 与 `live-region` 两个部件：内置的「回到底部」和一块视觉隐藏的播报区，两个适配器同时可用。

`log` 此前只有 `root` / `viewport` / `content` / `line` 四层：粘底状态透出来了，但离底之后没有归位的入口——每个用它的人都得自己画一颗按钮、自己判断什么时候露出来；而它整块内容会不会被读屏念、什么时候念，作者一点都插不上手。补上这两个部件之后，「任意内容的粘底滚动 + 视口自己是 Tab 停靠点 + 内置回到底部 + 播报区」这一组能力在 `log` 上齐了。

- `scroll-button`：只按「在不在底」判定露面，不看粘附意图；收起走 `hidden` 不卸载节点，冒出来时带一段淡入缩放。留空则由皮肤画一枚向下的字形，往按钮里塞节点即换成自己的图形。可访问名走 `translations.scrollToBottom`。
- `live-region`：`role=status` + `aria-live=polite` + `aria-atomic`，宿主往里写整句要念的话。

**行为变更**：视口现在显式发 `aria-live="off"`。`role=log` 隐含 polite 活区，一行来一句地念会把连成串的输出变成读屏里的噪声；播报改由 `live-region` 承担，宿主决定念哪一句、什么时候念。要保留播报的，渲上 `live-region` 部件并在一段输出收尾时写进整句结论；把每一行原样写进去等于把逐行播报又打开一遍。

`rows` / `loading` / `threshold` / `onStickChange`、四个原有部件的属性形状，以及 `atBottom` / `sticking` 的语义都不动。
