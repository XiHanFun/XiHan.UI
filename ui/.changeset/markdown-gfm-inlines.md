---
'@xihan-ui/markdown': minor
---

流式 Markdown 渲染器补齐流式容错、GFM 扩展与行内挂点：

- 生长块不露原始符号：还在生长的最后一块做行内容错，没写完的加粗、斜体、删除线与行内代码先按闭合显示，开符号后面还没有字时先不显示；写到一半的链接只显示文字，图片、行内引用与脚注写到一半时整段先不显示。块定型或流结束后按原文严格解析。
- GFM 任务列表（只读勾选框，`li` 带 `data-task`）、脚注（角标按首次引用编号，定义渲成带回链的脚注列表）与裸地址自动成链（`http(s)://`、`www.`，末尾标点与全角标点不算进地址）。
- 行内引用 `[@来源]` / `[@甲; @乙]` 与行内公式 `$…$`（行内写的 `$$…$$` 记 display）渲成带 `data-md-inline` 的占位节点，`RenderedBlock` 新增 `inlines` 按出现先后给出挂点内容；金额里的美元符号不成公式。
- `createStreamRenderer` 新增选项：`idPrefix`（脚注锚点前缀，缺省 `md-`）与 `bareLinks`（裸地址成链，缺省开；要严格按 CommonMark 渲染时关掉）。
- 新增导出类型 `RenderedInline`、`StreamRendererOptions`。
