---
"@xihan-ui/pointer": minor
"@xihan-ui/headless": minor
"@xihan-ui/vue": minor
"@xihan-ui/web-components": minor
---

**新增** `@xihan-ui/pointer` 指针会话：一根指针从按下到抬起的跟手、过滤与收尾收在一处，自研，零依赖，压缩后 316 B。

七个需要跟手的组件（`slider` · `splitter` · `scrollbar` · `color-picker` · `image-cropper` · `floating-panel` · `signature-pad`）此前各自手写了一遍同样的文档监听循环，四个必须一次都不漏的点（监听挂文档、收 `pointercancel`、认 `pointerId`、拆卸摘干净）分散在七处，改一处不会带上另外六处。现在统一走会话，行为不变。
