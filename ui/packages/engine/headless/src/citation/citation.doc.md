# 引用来源

把回答中的行内引用、可展开的来源预览和文末来源列表连成同一套可访问关系。`@xihan-ui/chat-stream` 的 `SourcePart[]` 与 `sources` 结构兼容，可以直接传入。

## 何时使用

- AI 回答、研究摘要或知识库结果需要标出结论依据，并允许用户核对原文。
- 同一来源既要在正文中以短编号出现，也要在文末列表中保留完整标题与类型。

## 何时不用

- 只是普通脚注、无需展开预览或来源交互：使用语义化链接和有序列表即可。
- 内容是导航目录而非证据来源：使用[锚点导航](./anchor)。

## 特性

- 行内 trigger 用 `aria-controls` / `aria-expanded` 指向唯一 preview region；预览再以 `aria-labelledby` 指回打开入口。
- 来源列表只占一个 Tab 位，支持 ↑ / ↓、Home、End 与 Enter / Space；`Escape` 收起预览并按需归还焦点。
- URL 来源保留原生链接导航；文档来源通过 `source-open` 把 `SourcePart` 与当前 anchor 交回宿主。
- `activeSourceId` 与 `open` 可分别受控，受控时只有宿主写回才改变可见状态。

## 最佳实践

- `sourceId` 在一组来源中保持稳定且唯一；同一来源的多次行内引用用不同 `citationId`。
- `anchors` 中保存足以核验的短引文，完整文档仍由来源链接或宿主查看器承担。
- 不要让引用编号代替正文：读屏名称会组合来源顺序与标题，但正文应在去掉引用后仍然可读。
