---
'@xihan-ui/core': minor
---

`@xihan-ui/core/url` 新增 `toSafeLinkHref(value)`：把一个值收成可以当链接地址用的串，放行 http、https、`mailto:`、`tel:` 与不带协议的相对地址（含 `#锚点` 与 `?查询`），`javascript:`、`data:`、`blob:`、`file:` 等其余协议、非字符串与空串返回 `undefined`。去掉首尾空白与控制字符、删去串中制表与换行的规则与 `toSafeImageSource` 相同，返回处理后的串。
