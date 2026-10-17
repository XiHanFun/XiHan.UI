---
'@xihan-ui/core': minor
---

新增子入口 `@xihan-ui/core/rich-text` 与 `@xihan-ui/core/rich-text-dom`：结构化的富文本模型，整份是 JSON，不含 HTML。

- 模型：块有段落、标题（1–3 级）、列表（有序或无序，最多嵌套三层）与分隔线；行内有文字、行内字段与换行；行内样式有粗体、斜体、下划线、删除线、颜色、底色、字号（pt）、字体、上下标与链接。
- `parseRichTextHtml(html)`：不依赖 DOM，按白名单把 HTML 换成模型，标签写法按浏览器的宽松规则读；不认识的标签去掉标签、保留文字，script、style、iframe、img 等连同内容去掉，没过 `toSafeLinkHref` 的链接只留文字，丢掉的东西按类别与名字计数记在 `dropped` 里。
- `checkRichTextDocument(value)`：不抛异常，返回全部问题 `{ code, path }`；不认识的块、行内类型、样式键与多余的键都报出来。
- `serializeRichTextHtml(document)` 写出转义后的 HTML，读回得到同一份模型；`richTextPlainText(document)` 给出纯文字。
- `renderRichText(doc, document, { field? })`（`rich-text-dom`）按模型生成 `DocumentFragment`，只用 `createElement`、文字节点与 `setAttribute`，样式只写合法的值。
