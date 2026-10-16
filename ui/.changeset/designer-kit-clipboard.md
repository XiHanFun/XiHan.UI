---
'@xihan-ui/designer-kit': minor
---

`@xihan-ui/designer-kit` 新增剪贴板数据的序列化与解析：`encodeClipboard(product, version, payload)` 把载荷包成带格式标记、产品名与版本的 JSON 文本，`decodeClipboard(text, product)` 只认本产品的包，失败时给出 `invalid-json`、`not-clipboard`、`invalid-envelope` 或 `other-product`；`clipboardMimeType(product)` 给出 `application/x-xihan-<product>+json`。产品名、版本或载荷不合法时抛 `RangeError`。读写剪贴板事件由设计器负责。
