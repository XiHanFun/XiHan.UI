---
"@xihan-ui/headless": minor
"@xihan-ui/styles": minor
"@xihan-ui/vue": minor
"@xihan-ui/react": minor
"@xihan-ui/web-components": minor
---

Scrollbar 新增 `anchor` 属性（`shell` | `layer`，默认 `shell`）：`layer` 时根节点仍挂在定位壳里，
但按滚动层在壳内的偏移盒（offsetLeft / offsetTop / offsetWidth / offsetHeight）由连接层写成内联几何
贴在该层的盒子上，根带 `data-anchor="layer"`，皮肤放开壳边的 inset；层与并排兄弟的伸缩、增减都会
重新测量。多个滚动层并排共用一个壳（级联的列、时间列）时每层各自一套滚动条。三端 `useScrollbars`
/ `ScrollbarsController` 同步接收 `anchor`，Web Components 的 `ScrollbarsController` 另支持
`scrollables` 多路形态（按当前在场的层逐层建一套、离场即拆），并提供 `dispose()`。
