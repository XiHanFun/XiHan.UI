---
'@xihan-ui/headless': minor
'@xihan-ui/styles': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
'@xihan-ui/web-components': minor
---

JsonViewer 原文档按类别着色，与树档同一套颜色：原文切成新部件 `token`（`data-kind` 为 `key` / `string` / `number` / `boolean` / `null` / `punctuation`），键名、四种标量与标点取树档同一组覆盖槽（`--xh-json-viewer-key-fg`、`-string-fg`、`-number-fg`、`-boolean-fg`、`-null-fg`、`-punctuation-fg`）与语法令牌，键名同字重；相邻标点并成一段，空白按纯文本铺。原文解析不了（不是 JSON，如一段 User-Agent）时整段不着色，不按半截猜出来的类别上色。headless API 新增 `textSegments`（只在原文档切分，树档为空）与 `getTokenProps()`，并导出切段函数 `tokenizeJsonText`；Web Components 元素原文没变时不重铺，框选着的文字不会被无关的重绘冲掉。皮肤涨在六条着色规则上。
