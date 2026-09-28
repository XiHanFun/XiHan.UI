---
'@xihan-ui/headless': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
'@xihan-ui/web-components': minor
---

MarkdownStream 接上行内引用与行内公式：

- `MarkdownBlock` 新增 `inlines`（与 `@xihan-ui/markdown` 的 `RenderedInline` 同形）；新增 `MARKDOWN_INLINE_ATTR`、`queryMarkdownInlines`、`sameMarkdownInlines` 与类型 `MarkdownInline`、`MarkdownInlineMount`。
- Vue `XhMarkdownStreamContent` 新增 `citation` / `math` 插槽，React 新增 `renderCitation` / `renderMath`，把引用角标与公式引擎的产物渲进 html 里的占位节点；不接管时占位节点显示降级内容。
- Web Components `xh-markdown-stream` 每新铺出一个占位节点派发一次 `inline-mount`（detail 为 `{ key, element, block, index, inline }`）；块内容只在与上一轮铺的不同时才重铺，作者挂进占位节点的节点不再被冲掉。
- Web Components 的角色子树认领：嵌套 `xh-*` 里显式声明 `data-xh-part-owner="<组件>"` 的角色节点由离它最近的那一台同类宿主认领并接线，流式正文里的引用角标因此能接到外层 `xh-citation` 上。
- React `XhMarkdownStreamContent` 不再每次重渲都重铺 html：内容没变的块沿用上一轮的 `dangerouslySetInnerHTML` 对象，选区不再被冲掉。
- Citation 的 `text` 与 `trigger` 不再是必需部件：正文里的引用常随流式正文到达，首帧一个引用都没有是真实首帧；只列来源时也可以没有 `text`。
