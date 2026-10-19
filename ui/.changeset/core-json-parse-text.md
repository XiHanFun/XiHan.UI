---
'@xihan-ui/core': minor
---

`@xihan-ui/core/json` 新增 `parseJsonText(text)`：按 RFC 8259 严格解析 JSON 文本，接受的写法与 `JSON.parse` 相同，失败时不抛异常，而是返回原因码（`unexpected-end`、`unexpected-token`、`invalid-string`、`invalid-number`）与出错处的下标、行号和列号，便于在编辑框里标出第几行第几列出了什么错、按语言生成提示。
